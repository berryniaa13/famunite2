
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    collection, getDocs, addDoc, serverTimestamp, deleteDoc,
    doc, getDoc, updateDoc, query, where
} from "firebase/firestore";
import { auth, firestore } from "../context/firebaseConfig";
import SideNavbar from "../components/SideNavbar";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";

const EVENTS_PER_PAGE = 5;

const Events = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [savedEvents, setSavedEvents] = useState([]);
    const [selectedOrganization, setSelectedOrganization] = useState("");
    const [organizationOptions, setOrganizationOptions] = useState([]);
    const [role, setRole] = useState(null);
    const [eventRegistrations, setEventRegistrations] = useState([]);
    const [eventFeedbacks, setEventFeedbacks] = useState([]);
    const [ratingFilter, setRatingFilter] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchEvents();
        fetchSavedEvents();
        const storedRole = localStorage.getItem("userRole");
        setRole(storedRole);
    }, []);

    const fetchEvents = async () => {
        try {
            const ref = collection(firestore, "Event");
            const snap = await getDocs(ref);
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setEvents(data);
            setFilteredEvents(data);
            const orgs = [...new Set(data.map((e) => e.organizationName).filter(Boolean))];
            setOrganizationOptions(orgs);
        } catch (err) {
            console.error("Error loading events", err);
        }
    };

    const fetchSavedEvents = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;
            const q = query(collection(firestore, "SavedEvents"), where("userId", "==", user.uid));
            const snap = await getDocs(q);
            const ids = snap.docs.map((d) => d.data().eventId);
            const full = await Promise.all(ids.map(async (id) => {
                const ref = doc(firestore, "Event", id);
                const snap = await getDoc(ref);
                return snap.exists() ? { id, ...snap.data() } : null;
            }));
            setSavedEvents(full.filter(Boolean));
        } catch (err) {
            console.error("Failed to fetch saved events", err);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = events.filter(event =>
            event.title?.toLowerCase().includes(term) &&
            (!selectedOrganization || event.organizationName === selectedOrganization)
        );
        setFilteredEvents(filtered);
        setCurrentPage(1);
    };

    const handleOrgChange = (e) => {
        const org = e.target.value;
        setSelectedOrganization(org);
        const filtered = events.filter(event =>
            (!org || event.organizationName === org) &&
            event.title?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredEvents(filtered);
        setCurrentPage(1);
    };

    const paginatedEvents = filteredEvents.slice(
        (currentPage - 1) * EVENTS_PER_PAGE,
        currentPage * EVENTS_PER_PAGE
    );

    const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);

    const handleRegister = async (eventId) => {
        const user = auth.currentUser;
        if (!user) return alert("Login required");
        try {
            await addDoc(collection(firestore, "Registrations"), {
                userId: user.uid,
                eventId,
                timestamp: serverTimestamp()
            });
            alert("Registered successfully");
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = async (eventId) => {
        const user = auth.currentUser;
        if (!user) return alert("Login required");
        try {
            await addDoc(collection(firestore, "SavedEvents"), {
                userId: user.uid,
                eventId,
                savedAt: serverTimestamp()
            });
            alert("Event saved");
            fetchSavedEvents();
        } catch (e) {
            console.error(e);
        }
    };

    const handleUnsave = async (eventId) => {
        const user = auth.currentUser;
        if (!user) return;
        const q = query(collection(firestore, "SavedEvents"), where("userId", "==", user.uid), where("eventId", "==", eventId));
        const snap = await getDocs(q);
        const promises = snap.docs.map(d => deleteDoc(d.ref));
        await Promise.all(promises);
        fetchSavedEvents();
    };

    const handleViewDetails = async (event) => {
        setSelectedEvent(event);
        if (role === "Admin") {
            const regQ = query(collection(firestore, "Registrations"), where("eventId", "==", event.id));
            const regSnap = await getDocs(regQ);
            setEventRegistrations(regSnap.docs.map(d => d.data()));

            const revQ = query(collection(firestore, "Reviews"), where("eventId", "==", event.id));
            const revSnap = await getDocs(revQ);
            setEventFeedbacks(revSnap.docs.map(d => d.data()));
        }
    };

    const updateEventStatus = async (eventId, newStatus) => {
        await updateDoc(doc(firestore, "Event", eventId), { status: newStatus });
        fetchEvents();
    };

    const renderStars = (rating) => {
        return <span style={{ color: '#f5b301' }}>{'★'.repeat(rating)}</span>;
    };

    return (
        <div className="container">
            <SideNavbar />
            <div style={{ marginLeft: "250px" }}>
                <Header pageTitle="Events" />
                <SearchBar value={searchTerm} onChange={handleSearch} placeholder="Enter event title..." />
                <select value={selectedOrganization} onChange={handleOrgChange} style={{ margin: 10, padding: 8 }}>
                    <option value="">Filter by Organization</option>
                    {organizationOptions.map((org, i) => (
                        <option key={i} value={org}>{org}</option>
                    ))}
                </select>

                {role !== "Admin" && savedEvents.length > 0 && (
                    <>
                        <h2>Saved Events</h2>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {savedEvents.map((event) => (
                                <li key={event.id} style={styles.card}>
                                    <h3>{event.title}</h3>
                                    <p>{event.date}</p>
                                    <div style={{ display: "flex", gap: 10 }}>
                                        <button onClick={() => handleViewDetails(event)} style={styles.viewButton}>View</button>
                                        <button onClick={() => handleUnsave(event.id)} style={styles.suspendButton}>Unsave</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                <h2>All Events</h2>
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {paginatedEvents.map((event) => (
                        <li key={event.id} style={styles.card}>
                            <h3>{event.title}</h3>
                            <p>{event.date}</p>
                            <div style={{ display: "flex", gap: 10 }}>
                                <button onClick={() => handleViewDetails(event)} style={styles.viewButton}>Details</button>
                                {role === "Admin" ? (
                                    <button onClick={() => updateEventStatus(event.id, event.status === "Suspended" ? "Active" : "Suspended")}
                                            style={event.status === "Suspended" ? styles.unsuspendButton : styles.suspendButton}>
                                        {event.status === "Suspended" ? "Unsuspend" : "Suspend"}
                                    </button>
                                ) : event.verified ? (
                                    <>
                                        <button onClick={() => handleRegister(event.id)} style={styles.viewButton}>Register</button>
                                        <button onClick={() => handleSave(event.id)} style={styles.unsuspendButton}>Save</button>
                                    </>
                                ) : <span style={{ color: "gray" }}>Awaiting Verification</span>}
                            </div>
                        </li>
                    ))}
                </ul>

                {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
                        {Array.from({ length: totalPages }).map((_, idx) => (
                            <button
                                key={idx + 1}
                                onClick={() => setCurrentPage(idx + 1)}
                                style={{
                                    ...styles.viewButton,
                                    backgroundColor: currentPage === idx + 1 ? "#12491B" : "#CDE0CA",
                                    color: currentPage === idx + 1 ? "white" : "black"
                                }}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                )}

                {selectedEvent && (
                    <div style={styles.modalOverlay} onClick={() => setSelectedEvent(null)}>
                        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <h3>Event Details</h3>
                            <p><strong>Organization:</strong> {selectedEvent.organizationName}</p>
                            <p><strong>Category:</strong> {selectedEvent.category}</p>
                            <p><strong>Description:</strong> {selectedEvent.description}</p>
                            <p><strong>Location:</strong> {selectedEvent.location}</p>
                            <p><strong>Date:</strong> {selectedEvent.date}</p>
                            {role === "Admin" && (
                                <>
                                    <h4>Registrations</h4>
                                    <p>Total: {eventRegistrations.length}</p>
                                    {eventRegistrations.map((r, i) => <p key={i}>User: {r.userId}</p>)}

                                    <h4>Feedback</h4>
                                    <label>Filter by Rating:</label>
                                    <select value={ratingFilter} onChange={(e) => setRatingFilter(parseInt(e.target.value))}>
                                        <option value={0}>All</option>
                                        {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} Stars</option>)}
                                    </select>
                                    {eventFeedbacks
                                        .filter(f => ratingFilter === 0 || f.rating === ratingFilter)
                                        .map((f, i) => (
                                            <div key={i}>
                                                <p>Rating: {renderStars(f.rating)}</p>
                                                <p>Comment: {f.comment}</p>
                                            </div>
                                        ))}
                                </>
                            )}
                            <button onClick={() => setSelectedEvent(null)} style={styles.closeButton}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    card: {
        backgroundColor: "#f9f9f9",
        borderRadius: "12px",
        padding: "20px",
        margin: "10px 0",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
    },
    viewButton: {
        backgroundColor: "#12491B",
        color: "white",
        border: "none",
        borderRadius: "5px",
        padding: "8px 12px",
        cursor: "pointer"
    },
    suspendButton: {
        backgroundColor: "#dc3545",
        color: "white",
        border: "none",
        borderRadius: "5px",
        padding: "8px 12px",
        cursor: "pointer"
    },
    unsuspendButton: {
        backgroundColor: "#28a745",
        color: "white",
        border: "none",
        borderRadius: "5px",
        padding: "8px 12px",
        cursor: "pointer"
    },
    closeButton: {
        marginTop: 15,
        backgroundColor: "#6c757d",
        color: "white",
        border: "none",
        borderRadius: "5px",
        padding: "8px 14px",
        cursor: "pointer"
    },
    modalOverlay: {
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
        justifyContent: "center", alignItems: "center", zIndex: 1000
    },
    modalContent: {
        backgroundColor: "white", padding: 20, borderRadius: 10,
        width: "80%", maxWidth: 600, maxHeight: "80vh", overflowY: "auto"
    }
};

export default Events;


