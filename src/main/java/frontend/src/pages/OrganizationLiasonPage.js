import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc
} from "firebase/firestore";
import { auth, firestore } from "../context/firebaseConfig";
import SideNavbar from "../components/SideNavbar";
import famUniteLogo from "../assets/FAMUniteLogoNude.png";

function OrganizationLiaisonDashboard() {
    const [searchTerm, setSearchTerm] = useState("");
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [newEvent, setNewEvent] = useState({
        title: "",
        category: "",
        description: "",
        location: "",
        date: ""
    });
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
        setSelectedEvent(null);
    };

    const handleCreateEvent = async () => {
        if (!newEvent.title || !newEvent.date) {
            alert("Title and Date are required.");
            return;
        }

        try {
            const user = auth.currentUser;

            console.log("Current user UID:", user?.uid); // ✅ Debug UID here

            const eventToCreate = {
                ...newEvent,
                createdBy: user?.uid || null,
                createdAt: new Date().toISOString()
            };

            const docRef = await addDoc(collection(firestore, "Event"), eventToCreate);
            const createdEvent = { id: docRef.id, ...eventToCreate };
            const updated = [...events, createdEvent];
            setEvents(updated);
            setFilteredEvents(updated);
            setNewEvent({ title: "", category: "", description: "", location: "", date: "" });
        } catch (error) {
            console.error("Error creating event:", error);
            alert("You do not have permission to create events.");
        }
    };

    const handleEditEvent = async () => {
        if (!selectedEvent?.id) return;

        try {
            const eventRef = doc(firestore, "Event", selectedEvent.id);
            await updateDoc(eventRef, selectedEvent);

            const updated = events.map(event =>
                event.id === selectedEvent.id ? selectedEvent : event
            );
            setEvents(updated);
            setFilteredEvents(updated);
            setSelectedEvent(null);
        } catch (error) {
            console.error("Error updating event:", error);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await deleteDoc(doc(firestore, "Event", eventId));
            const updated = events.filter(event => event.id !== eventId);
            setEvents(updated);
            setFilteredEvents(updated);
            setSelectedEvent(null);
        } catch (error) {
            console.error("Error deleting event:", error);
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

            <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={handleSearch}
                style={styles.searchBar}
            />

            <div style={styles.section}>
                <h3>Create New Event</h3>
                {['title', 'category', 'description', 'location'].map(field => (
                    <input
                        key={field}
                        type="text"
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={newEvent[field]}
                        onChange={(e) => setNewEvent({ ...newEvent, [field]: e.target.value })}
                        style={styles.input}
                    />
                ))}
                <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    style={styles.input}
                />
                <button onClick={handleCreateEvent} style={styles.button}>
                    Create Event
                </button>
            </div>

            <ul style={styles.list}>
                {filteredEvents.map((event) => (
                    <li key={event.id} style={styles.listItem}>
                        <div>
                            <h4>{event.title}</h4>
                            <p>{event.date}</p>
                        </div>
                        <div>
                            <button onClick={() => setSelectedEvent(event)} style={styles.smallButton}>
                                Edit
                            </button>
                            <button onClick={() => handleDeleteEvent(event.id)} style={styles.smallButtonRed}>
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {selectedEvent && (
                <div style={styles.section}>
                    <h3>Edit Event</h3>
                    {['title', 'category', 'description', 'location'].map(field => (
                        <input
                            key={field}
                            type="text"
                            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                            value={selectedEvent[field]}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, [field]: e.target.value })}
                            style={styles.input}
                        />
                    ))}
                    <input
                        type="date"
                        value={selectedEvent.date}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, date: e.target.value })}
                        style={styles.input}
                    />
                    <button onClick={handleEditEvent} style={styles.button}>
                        Update Event
                    </button>
                </div>
            )}

            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
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
    searchBar: { padding: "8px", width: "90%", marginBottom: "20px" },
    section: { marginBottom: "30px" },
    input: { padding: "8px", margin: "5px", width: "90%" },
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
        padding: "10px 20px",
        backgroundColor: "#CDE0CA",
        color: "black",
        border: "none",
        cursor: "pointer",
        borderRadius: "5px",
        marginTop: "10px"
    },
    smallButton: {
        padding: "5px 10px",
        marginLeft: "5px",
        backgroundColor: "#12491B",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    },
    smallButtonRed: {
        padding: "5px 10px",
        marginLeft: "5px",
        backgroundColor: "#dc3545",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    },
    list: { listStyle: "none", padding: "0" },
    listItem: {
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        backgroundColor: "#f9f9f9",
        marginBottom: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    logoutButton: {
        padding: "10px",
        backgroundColor: "#BF6319",
        color: "white",
        border: "none",
        cursor: "pointer",
        marginTop: "30px"
    }
};

export default OrganizationLiaisonDashboard;
