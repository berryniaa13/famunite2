import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, firestore } from '../context/firebaseConfig';

function StudentDashboard() {
    const [searchTerm, setSearchTerm] = useState("");
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
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
        setSearchTerm(e.target.value);
        setSelectedEvent(null); // Reset selected event when searching
        const filtered = events.filter(event =>
            event.title && event.title.toLowerCase().includes(e.target.value.toLowerCase())
        );
        setFilteredEvents(filtered);
    };

    const handleViewDetails = (event) => {
        setSelectedEvent(event);
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div style={styles.container}>
            <h2>Student Dashboard</h2>
            <input
                type="text"
                placeholder="Enter event title..."
                value={searchTerm}
                onChange={handleSearch}
                style={styles.searchBar}
            />
            <ul style={styles.list}>
                {filteredEvents.map((event) => (
                    <li key={event.id} style={styles.listItem}>
                        <h3>{event.title || "Untitled Event"}</h3>
                        <button onClick={() => handleViewDetails(event)} style={styles.button}>
                            View Details
                        </button>
                    </li>
                ))}
            </ul>

            {selectedEvent && (
                <div style={styles.detailsContainer}>
                    <h3>Event Details</h3>
                    <p><strong>Category:</strong> {selectedEvent.category || "N/A"}</p>
                    <p><strong>Description:</strong> {selectedEvent.description || "No description available."}</p>
                    <p><strong>Location:</strong> {selectedEvent.location || "Unknown"}</p>
                    <p><strong>Date:</strong> {selectedEvent.date || "TBD"}</p>
                </div>
            )}

            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </div>
    );
}

const styles = {
    container: { textAlign: "center", padding: "20px" },
    searchBar: { padding: "8px", width: "80%", margin: "10px auto", display: "block" },
    list: { listStyle: "none", padding: "0" },
    listItem: { padding: "10px", border: "1px solid #ddd", margin: "10px", borderRadius: "5px", backgroundColor: "#f9f9f9", display: "flex", justifyContent: "space-between", alignItems: "center" },
    button: { padding: "5px 10px", backgroundColor: "#28a745", color: "white", border: "none", cursor: "pointer", borderRadius: "5px" },
    detailsContainer: { marginTop: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "5px", backgroundColor: "#e9ecef" },
    logoutButton: { padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer", marginTop: "10px" },
};

export default StudentDashboard;
