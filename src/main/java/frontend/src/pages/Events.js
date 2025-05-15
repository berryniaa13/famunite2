
import React, { useState, useEffect } from "react";
import {
    collection, getDocs, addDoc, serverTimestamp, deleteDoc,
    doc, getDoc, updateDoc, query, where, orderBy
} from "firebase/firestore";
import { auth, firestore } from "../context/firebaseConfig";
import SideNavbar from "../components/SideNavbar";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import EventCard from "../components/EventCard";

const EVENTS_PER_PAGE = 10;

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
    const [selectedCategory, setSelectedCategory] = useState("");


    useEffect(() => {
        fetchEvents();
        const storedRole = localStorage.getItem("userRole");
        setRole(storedRole);
    }, []);

    useEffect(() => {
        const filtered = events.filter(event => {
            const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesOrg = !selectedOrganization || event.organizationId === selectedOrganization;
            const matchesCat = !selectedCategory || event.category === selectedCategory;
            return matchesSearch && matchesOrg && matchesCat;
        });

        setFilteredEvents(filtered);
        setCurrentPage(1); // Reset pagination on filter change
    }, [searchTerm, selectedOrganization, selectedCategory, events]);


    const fetchEvents = async () => {
        try {
            const ref = collection(firestore, "Event");
            const q = query(ref, orderBy("date", "asc"));
            const snap = await getDocs(q);
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            // data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setEvents(data);
            setFilteredEvents(data);
            const orgs = [...new Set(data.map((e) => e.organizationId).filter(Boolean))];
            const orgSnaps = await Promise.all(
                orgs.map((id) => getDoc(doc(firestore, "Organizations", id)))
            );
            const orgOptions = orgSnaps
                .filter(snap => snap.exists())        // drop any non-existent docs
                .map(snap => ({
                    id:   snap.id,                      // snapshot.id is the doc ID
                    name: snap.data().name              // grab the `name` field
                }));

            setOrganizationOptions(orgOptions);
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
                <SearchBar
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    selectedOrganization={selectedOrganization}
                    onOrganizationChange={setSelectedOrganization}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    organizationOptions={organizationOptions}
                    categoryOptions={[...new Set(events.map(e => e.category).filter(Boolean))]}
                />


                {role !== "Admin" && savedEvents.length > 0 && (
                    <>
                        <h2>Saved Events</h2>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {savedEvents.map((event) => (
                                <EventCard event={event} key={event.id}  layout={"rectangular"} onDone={()=>fetchEvents()}/>
                            ))}
                        </ul>
                    </>
                )}

                <h2 className={"subHeader"}>All Events</h2>
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {paginatedEvents.map((event) => (
                        <EventCard event={event} key={event.id} layout={"rectangular"} onDone={()=>fetchEvents()}/>
                    ))}
                </ul>

                {totalPages > 1 && (
                    <div className={"page-num-container"}>
                        {Array.from({ length: totalPages }).map((_, idx) => (
                            <button
                                key={idx + 1}
                                onClick={() => setCurrentPage(idx + 1)}
                                style={{
                                    ...styles.viewButton,
                                    backgroundColor: currentPage === idx + 1 ? "var(--primary-green)" : "#CDE0CA",
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
        backgroundColor: "var(--primary-green)",
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


