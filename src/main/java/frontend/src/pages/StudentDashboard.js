import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, getDocs, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { auth, firestore } from '../context/firebaseConfig';
import SideNavbar from "../components/SideNavbar";
import famUniteLogo from "../assets/FAMUniteLogoNude.png";
import EventCard from "../components/EventCard";

function StudentDashboard() {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const userDocRef = doc(firestore, "User", user.uid);
            const userSnap = await getDoc(userDocRef);
            const likedCategories = userSnap.exists() ? userSnap.data().interests || [] : [];

            const eventsRef = collection(firestore, "Event");
            const eventsSnapshot = await getDocs(eventsRef);
            const eventsList = eventsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const recommendedEvents = eventsList.filter(event =>
                event.category && likedCategories.includes(event.category)
            );

            setEvents(eventsList);
            setFilteredEvents(recommendedEvents);

            const registrationsRef = collection(firestore, "Registrations");
            const registrationsSnapshot = await getDocs(registrationsRef);

            const userRegistrations = registrationsSnapshot.docs
                .filter(doc => doc.data().userId === user.uid)
                .map(doc => doc.data().eventId);

            const registered = eventsList.filter(event => userRegistrations.includes(event.id));
            setRegisteredEvents(registered);

        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const handleRegister = async (eventId) => {
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to register.");
            return;
        }

        try {
            const eventRef = doc(firestore, "Event", eventId);
            const eventSnap = await getDoc(eventRef);

            if (!eventSnap.exists() || !eventSnap.data().verified) {
                alert("This event is not verified yet.");
                return;
            }

            await addDoc(collection(firestore, "Registrations"), {
                userId: user.uid,
                eventId: eventId,
                timestamp: serverTimestamp()
            });
            alert("You have successfully registered for the event!");
        } catch (error) {
            console.error("Registration failed:", error);
            alert("Failed to register.");
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div style={styles.container}>
            <SideNavbar />
            <div style={{ marginLeft: "250px" }}>
                <div style={styles.headerContainer}>
                    <img src={famUniteLogo} alt="FAMUnite Logo" style={styles.logo} />
                    <h2 style={styles.header}>Home </h2>
                </div>
                <h2 style={styles.subHeader}> Upcoming Events</h2>
                <ul style={styles.horizontalList}>
                    {registeredEvents.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                        />
                    ))}
                </ul>

                <h2 style={styles.subHeader}> Recommended Events</h2>
                <ul style={styles.horizontalList}>
                    {filteredEvents.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            onRegister={handleRegister}
                        />
                    ))}
                </ul>

            </div>
        </div>
    );
}

const styles = {
    container: {
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#F2EBE9"
    },
    horizontalList: {
        display: "flex",
        overflowX: "auto",
        gap: "16px",
        padding: "10px",
        listStyle: "none",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
    },
    headerContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        marginBottom: "20px"
    },
    logo: {
        width: "50px",
        height: "50px",
    },
    header: {
        fontSize: "24px",
        fontWeight: "bold",
    },
    subHeader: {
        fontSize: "18px",
        fontWeight: "bold",
        textAlign: "left",
    },
    button: {
        padding: "8px 12px",
        backgroundColor: "#CDE0CA",
        fontSize: "12px",
        color: "black",
        border: "none",
        cursor: "pointer",
        borderRadius: "5px"
    },
    detailsContainer: {
        marginTop: "20px",
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        backgroundColor: "#e9ecef"
    },
    logoutButton: {
        padding: "10px",
        backgroundColor: "#BF6319",
        color: "white",
        border: "none",
        cursor: "pointer",
        borderRadius: "5px",
        marginTop: "10px"
    }
};

export default StudentDashboard;
