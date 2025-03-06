import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, firestore } from '../context/firebaseConfig';

function OrganizationLiaisonDashboard() {
    const [searchTerm, setSearchTerm] = useState("");
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState({ title: "", category: "", description: "", location: "", date: "" });
    const [newEvent, setNewEvent] = useState({ title: "", category: "", description: "", location: "", date: "" });
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
        setSelectedEvent({ title: "", category: "", description: "", location: "", date: "" });
        const filtered = events.filter(event =>
            event.title.toLowerCase().includes(e.target.value.toLowerCase())
        );
        setFilteredEvents(filtered);
    };

    const handleCreateEvent = async () => {
        try {
            const docRef = await addDoc(collection(firestore, "Event"), newEvent);
            const createdEvent = { id: docRef.id, ...newEvent };
            setEvents([...events, createdEvent]);
            setFilteredEvents([...filteredEvents, createdEvent]);
            setNewEvent({ title: "", category: "", description: "", location: "", date: "" });
        } catch (error) {
            console.error("Error creating event:", error);
        }
    };

    const handleEditEvent = async () => {
        if (!selectedEvent.id) return;
        try {
            const eventRef = doc(firestore, "Event", selectedEvent.id);
            await updateDoc(eventRef, selectedEvent);
            setEvents(events.map(event => event.id === selectedEvent.id ? selectedEvent : event));
            setFilteredEvents(filteredEvents.map(event => event.id === selectedEvent.id ? selectedEvent : event));
            setSelectedEvent({ title: "", category: "", description: "", location: "", date: "" });
        } catch (error) {
            console.error("Error updating event:", error);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await deleteDoc(doc(firestore, "Event", eventId));
            const updatedEvents = events.filter(event => event.id !== eventId);
            setEvents(updatedEvents);
            setFilteredEvents(updatedEvents);
            setSelectedEvent({ title: "", category: "", description: "", location: "", date: "" });
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
            <h2>Organization Liaison Dashboard</h2>
            <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={handleSearch}
                style={styles.searchBar}
            />

            <div>
                <h3>Create New Event</h3>
                <input type="text" placeholder="Title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                <input type="text" placeholder="Category" value={newEvent.category} onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })} />
                <input type="text" placeholder="Description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
                <input type="text" placeholder="Location" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} />
                <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                <button onClick={handleCreateEvent}>Create Event</button>
            </div>

            <ul style={styles.list}>
                {filteredEvents.map((event) => (
                    <li key={event.id} style={styles.listItem}>
                        <h3>{event.title}</h3>
                        <button onClick={() => setSelectedEvent(event)}>Edit</button>
                        <button onClick={() => handleDeleteEvent(event.id)}>Delete</button>
                    </li>
                ))}
            </ul>

            {selectedEvent.id && (
                <div>
                    <h3>Edit Event</h3>
                    <input type="text" placeholder="Title" value={selectedEvent.title} onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })} />
                    <input type="text" placeholder="Category" value={selectedEvent.category} onChange={(e) => setSelectedEvent({ ...selectedEvent, category: e.target.value })} />
                    <input type="text" placeholder="Description" value={selectedEvent.description} onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })} />
                    <input type="text" placeholder="Location" value={selectedEvent.location} onChange={(e) => setSelectedEvent({ ...selectedEvent, location: e.target.value })} />
                    <input type="date" value={selectedEvent.date} onChange={(e) => setSelectedEvent({ ...selectedEvent, date: e.target.value })} />
                    <button onClick={handleEditEvent}>Update Event</button>
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
    logoutButton: { padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer", marginTop: "10px" },
};

export default OrganizationLiaisonDashboard;
