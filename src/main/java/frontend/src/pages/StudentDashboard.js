import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
    deleteDoc,
    where,
    query,
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    doc,
    getDoc,
} from "firebase/firestore";
import { auth, firestore } from "../context/firebaseConfig";
import SideNavbar from "../components/SideNavbar";
import famUniteLogo from "../assets/FAMUniteLogoNude.png";
import EventCard from "../components/EventCard";
import EventCardRectangular from "../components/EventCardRectangular";

function StudentDashboard() {
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
            const likedCategories = userSnap.exists()
                ? userSnap.data().interests || []
                : [];

            const eventsRef = collection(firestore, "Event");
            const eventsSnapshot = await getDocs(eventsRef);
            const eventsList = eventsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            const recommendedEvents = eventsList.filter(
                (event) =>
                    event.category && likedCategories.includes(event.category)
            );

            setFilteredEvents(recommendedEvents);

            const registrationsRef = collection(firestore, "Registrations");
            const registrationsSnapshot = await getDocs(registrationsRef);

            const userRegistrations = registrationsSnapshot.docs
                .filter((doc) => doc.data().userId === user.uid)
                .map((doc) => doc.data().eventId);

            const registered = eventsList.filter((event) =>
                userRegistrations.includes(event.id)
            );
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

            if (!eventSnap.exists()) {
                alert("Event does not exist.");
                return;
            }

            const eventData = eventSnap.data();

            if (!eventData.verified) {
                alert("This event is not verified yet.");
                return;
            }

            if (eventData.suspended) {
                alert("This event is currently suspended and cannot accept registrations.");
                return;
            }

            await addDoc(collection(firestore, "Registrations"), {
                userId: user.uid,
                eventId: eventId,
                timestamp: serverTimestamp(),
            });

            alert("You have successfully registered for the event!");
            fetchEvents(); // Refresh events after registration
        } catch (error) {
            console.error("Registration failed:", error);
            alert("Failed to register.");
        }
    };


    const handleUnregister = async (eventId) => {
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to unregister.");
            return;
        }

        try {
            const registrationsRef = collection(firestore, "Registrations");
            const q = query(
                registrationsRef,
                where("userId", "==", user.uid),
                where("eventId", "==", eventId)
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                alert("You are not registered for this event.");
                return;
            }

            // Assuming one registration per user per event
            const registrationDoc = querySnapshot.docs[0];
            await deleteDoc(registrationDoc.ref);

            alert("You have successfully unregistered from the event!");
            fetchEvents(); // Refresh events after unregistration
        } catch (error) {
            console.error("Unregistration failed:", error);
            alert("Failed to unregister.");
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    // Helper function to check if the user is registered for an event
    const isUserRegistered = (eventId) => {
        return registeredEvents.some((event) => event.id === eventId);
    };

    return (
        <div style={styles.container}>
            <SideNavbar />
            <div style={{ marginLeft: "250px" }}>
                <div style={styles.headerContainer}>
                    <img
                        src={famUniteLogo}
                        alt="FAMUnite Logo"
                        style={styles.logo}
                    />
                    <h2 style={styles.header}>Home</h2>
                </div>
                <h2 style={styles.subHeader}>Upcoming Events</h2>
                <ul style={styles.horizontalList}>
                    {registeredEvents.map((event) => (
                        <EventCardRectangular
                            key={event.id}
                            event={event}
                            onUnregister={() => handleUnregister(event.id)}
                        />
                    ))}
                </ul>

                <h2 style={styles.subHeader}>Recommended Events</h2>
                <ul style={styles.horizontalList}>
                    {filteredEvents.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            onRegister={
                                !isUserRegistered(event.id)
                                    ? () => handleRegister(event.id)
                                    : null
                            }
                            onUnregister={
                                isUserRegistered(event.id)
                                    ? () => handleUnregister(event.id)
                                    : null
                            }
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
