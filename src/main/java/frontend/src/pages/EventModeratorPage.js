// StudentDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
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
            const eventsRef = collection(firestore, "Event"); // Firestore collection
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
        setSearchTerm(e.target.value);
        const filtered = events.filter(event =>
            event.name.toLowerCase().includes(e.target.value.toLowerCase())
        );
        setFilteredEvents(filtered);
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
                        <h3>{event.name}</h3>
                        <p>{event.description}</p>
                        <p><strong>Date:</strong> {event.date}</p>
                    </li>
                ))}
            </ul>
            <button onClick={handleLogout} style={styles.button}>Logout</button>
        </div>
    );
}

const styles = {
    container: { textAlign: "center", padding: "20px" },
    searchBar: { padding: "8px", width: "80%", margin: "10px auto", display: "block" },
    list: { listStyle: "none", padding: "0" },
    listItem: { padding: "10px", border: "1px solid #ddd", margin: "10px", borderRadius: "5px" },
    button: { padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer" },
};

export default EventModeratorPage;