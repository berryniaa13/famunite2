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
            <h2>Event Moderator Dashboard</h2>
            <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={handleSearch}
                style={styles.searchBar}
            />
            <ul style={styles.list}>
                {filteredEvents.map((event) => (
                    <li key={event.id} style={styles.listItem}>
                        <div style={styles.eventHeader}>
                            <h3 style={{ marginBottom: 5 }}>{event.title}</h3>
                            {event.verified && <span style={styles.verifiedTag}>✔ Verified</span>}
                        </div>
                        <p>{event.description}</p>
                        <p><strong>Date:</strong> {event.date}</p>
                        <label style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={!!event.verified}
                                onChange={() => handleVerifyToggle(event.id, event.verified)}
                            />{" "}
                            Mark as Verified
                        </label>
                    </li>
                ))}
            </ul>
            <button onClick={handleLogout} style={styles.button}>Logout</button>
        </div>
    );
}

const styles = {
    container: {
        textAlign: "center",
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto"
    },
    searchBar: {
        padding: "8px",
        width: "90%",
        marginBottom: "20px"
    },
    list: {
        listStyle: "none",
        padding: "0"
    },
    listItem: {
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        backgroundColor: "#f9f9f9",
        marginBottom: "10px",
        textAlign: "left"
    },
    eventHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    verifiedTag: {
        backgroundColor: "#28a745",
        color: "white",
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: "12px"
    },
    checkboxLabel: {
        marginTop: "10px",
        display: "block"
    },
    button: {
        padding: "10px 20px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginTop: "20px"
    }
};

export default EventModeratorPage;
