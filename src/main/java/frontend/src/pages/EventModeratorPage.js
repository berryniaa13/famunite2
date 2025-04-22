import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
    collection,
    getDocs,
    updateDoc,
    doc
} from "firebase/firestore";
import { auth, firestore } from '../context/firebaseConfig';
import SideNavbar from "../components/SideNavbar";
import famUniteLogo from "../assets/FAMUniteLogoNude.png";
import EventCardRectangular from "../components/EventCardRectangular";
import Header from "../components/Header";


function EventModeratorPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const eventsRef = collection(firestore, "Event");
            const snapshot = await getDocs(eventsRef);
            const eventsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEvents(eventsList);
            setFilteredEvents(eventsList);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = events.filter(event =>
            event.title?.toLowerCase().includes(term)
        );
        setFilteredEvents(filtered);
    };

    const handleVerifyToggle = async (eventId, currentStatus) => {
        try {
            const eventRef = doc(firestore, "Event", eventId);
            await updateDoc(eventRef, {
                verified: !currentStatus
            });

            const updated = events.map(event =>
                event.id === eventId ? { ...event, verified: !currentStatus } : event
            );
            setEvents(updated);
            setFilteredEvents(updated);
        } catch (error) {
            console.error("Error updating verification status:", error);
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
                <Header pageTitle="Home" />

                <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={handleSearch}
                style={styles.searchBar}
            />
                <ul style={styles.list}>
                    {filteredEvents.map((event) => (
                        <EventCardRectangular
                            key={event.id}
                            event={event}
                        />
                    ))}
                </ul>

                <button onClick={handleLogout} style={styles.button}>Logout</button>
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
};

export default EventModeratorPage;
