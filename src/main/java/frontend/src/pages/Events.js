import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    deleteDoc,
    doc,
    getDoc,
    updateDoc,
    query,
    where
} from "firebase/firestore";
import { auth, firestore } from "../context/firebaseConfig";
import SideNavbar from "../components/SideNavbar";
import famUniteLogo from "../assets/FAMUniteLogoNude.png";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";

function Events() {
    const [searchTerm, setSearchTerm] = useState("");
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [savedEvents, setSavedEvents] = useState([]);
    const [selectedOrganization, setSelectedOrganization] = useState("");
    const [organizationOptions, setOrganizationOptions] = useState([]);
    const [role, setRole] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        fetchEvents();
        fetchSavedEvents();
        const storedRole = localStorage.getItem("userRole");
        setRole(storedRole);
    }, []);

    const fetchEvents = async () => {
        try {
            const eventsRef = collection(firestore, "Event");
            const snapshot = await getDocs(eventsRef);
            const eventsList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setEvents(eventsList);
            setFilteredEvents(eventsList);

            const orgs = [...new Set(eventsList.map((e) => e.organizationName).filter(Boolean))];
            setOrganizationOptions(orgs);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const fetchSavedEvents = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const savedEventsQuery = query(
                collection(firestore, "SavedEvents"),
                where("userId", "==", user.uid)
            );
            const querySnapshot = await getDocs(savedEventsQuery);
            const savedEventIds = querySnapshot.docs.map((doc) => doc.data().eventId);

            const savedEventsDetails = await Promise.all(
                savedEventIds.map(async (id) => {
                    const eventRef = doc(firestore, "Event", id);
                    const eventSnap = await getDoc(eventRef);
                    return eventSnap.exists() ? { id, ...eventSnap.data() } : null;
                })
            );

            setSavedEvents(savedEventsDetails.filter((event) => event !== null));
        } catch (error) {
            console.error("Error fetching saved events:", error);
        }
    };

    const updateEventStatus = async (eventId, newStatus) => {
        if (role !== "Admin") return;

        try {
            const eventDocRef = doc(firestore, "Event", eventId);
            await updateDoc(eventDocRef, { status: newStatus });

            setEvents((prev) =>
                prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e))
            );
            setFilteredEvents((prev) =>
                prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e))
            );
        } catch (error) {
            console.error("Error updating event status:", error);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setSelectedEvent(null);
        filterEvents(term, selectedOrganization);
    };

    const filterEvents = (search, org) => {
        const filtered = events.filter((event) => {
            const matchesSearch = event.title?.toLowerCase().includes(search);
            const matchesOrg = org ? event.organizationName === org : true;
            return matchesSearch && matchesOrg;
        });
        setFilteredEvents(filtered);
    };

    const handleOrgFilterChange = (e) => {
        const selected = e.target.value;
        setSelectedOrganization(selected);
        filterEvents(searchTerm, selected);
    };

    const handleViewDetails = (event) => {
        setSelectedEvent(event);
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
                alert("This event does not exist.");
                return;
            }

            const eventData = eventSnap.data();
            if (!eventData.verified) {
                alert("This event is not verified yet.");
                return;
            }

            if (eventData.status === "Suspended") {
                alert("This event is currently suspended.");
                return;
            }

            await addDoc(collection(firestore, "Registrations"), {
                userId: user.uid,
                eventId,
                timestamp: serverTimestamp()
            });

            alert("Successfully registered!");
        } catch (error) {
            console.error("Registration failed:", error);
            alert("Failed to register.");
        }
    };

    const handleSaveEvent = async (eventId) => {
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to save an event.");
            return;
        }

        try {
            if (savedEvents.find((ev) => ev.id === eventId)) {
                alert("Event already saved.");
                return;
            }

            await addDoc(collection(firestore, "SavedEvents"), {
                userId: user.uid,
                eventId,
                savedAt: serverTimestamp()
            });

            alert("Event saved!");
            fetchSavedEvents();
        } catch (error) {
            console.error("Save failed:", error);
            alert("Failed to save event.");
        }
    };

    const handleUnsaveEvent = async (eventId) => {
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to unsave an event.");
            return;
        }

        try {
            const savedEventsQuery = query(
                collection(firestore, "SavedEvents"),
                where("userId", "==", user.uid),
                where("eventId", "==", eventId)
            );

            const snapshot = await getDocs(savedEventsQuery);

            if (snapshot.empty) {
                alert("Event was not found in saved events.");
                return;
            }

            // ✅ Proper deletion
            const deletions = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
            await Promise.all(deletions);

            // ✅ Update local state to reflect removal
            setSavedEvents((prev) => prev.filter((event) => event.id !== eventId));

            alert("Event unsaved!");
        } catch (error) {
            console.error("Unsave failed:", error);
            alert("Failed to unsave event.");
        }
    };





    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div className={"container"}>
            <SideNavbar />
            <div style={{ marginLeft: "250px" }}>
                <Header pageTitle={"Events"}/>

                <SearchBar
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Enter event title..."
                />
                <select value={selectedOrganization} onChange={handleOrgFilterChange} style={styles.searchBar}>
                    <option value="">Filter by Organization</option>
                    {organizationOptions.map((org, idx) => (
                        <option key={idx} value={org}>{org}</option>
                    ))}
                </select>

                {/* Saved Events */}
                {/* Show saved events only for non-admins */}
                {role !== "Admin" && (
                    <>
                        <h2 style={styles.header}>Saved Events</h2>
                        {savedEvents.length > 0 ? (
                            <ul style={styles.list}>
                                {savedEvents.map((event) => (
                                    <li key={event.id} style={styles.listItem}>
                                        <div style={{flex: 1}}>
                                            <h3>{event.title || "Untitled Event"}</h3>
                                            <p>{event.date}</p>
                                        </div>
                                        <div style={{display: "flex", gap: "10px"}}>
                                            <button onClick={() => handleViewDetails(event)} style={styles.button}>
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => handleUnsaveEvent(event.id)}
                                                style={{...styles.button, backgroundColor: "#BF6319", color: "white"}}
                                            >
                                                Unsave
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : <p>No saved events.</p>}
                    </>
                )}


                {/* Admin Controls */}
                {role === "Admin" && (
                    <>
                        <h2 style={styles.header}>Admin Event Controls</h2>
                        <ul style={styles.list}>
                            {events.map((event) => {
                                const status = event.status || "Active";
                                return (
                                    <li key={event.id} style={styles.listItem}>
                                        <div style={{ flex: 1 }}>
                                            <h3>{event.title}</h3>
                                            <p>{event.description}</p>
                                            <p><strong>Status:</strong> {status}</p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                updateEventStatus(event.id, status === "Suspended" ? "Active" : "Suspended")
                                            }
                                            style={{
                                                ...styles.button,
                                                backgroundColor: status === "Suspended" ? "#28a745" : "#dc3545",
                                                color: "white"
                                            }}
                                        >
                                            {status === "Suspended" ? "Unsuspend" : "Suspend"}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}

                {/* Events */}
                <h2 style={styles.header}>Events</h2>
                <ul style={styles.list}>
                    {filteredEvents.map((event) => (
                        <li key={event.id} style={styles.listItem}>
                            <div style={{ flex: 1 }}>
                                <h3>{event.title || "Untitled Event"}</h3>
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button onClick={() => handleViewDetails(event)} style={styles.button}>
                                    View Details
                                </button>
                                {event.verified ? (
                                    <>
                                        <button
                                            onClick={() => handleRegister(event.id)}
                                            style={{ ...styles.button, backgroundColor: "#12491B", color: "white" }}
                                        >
                                            Register
                                        </button>
                                        <button
                                            onClick={() => handleSaveEvent(event.id)}
                                            style={{ ...styles.button, backgroundColor: "#FFA500", color: "white" }}
                                        >
                                            Save
                                        </button>
                                    </>
                                ) : (
                                    <span style={{ color: "gray", fontSize: "12px", alignSelf: "center" }}>
                    Awaiting Verification
                  </span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>

                {selectedEvent && (
                    <div style={styles.detailsContainer}>
                        <h3>Event Details</h3>
                        <p><strong>Organization:</strong> {selectedEvent.organizationName || "Not specified"}</p>
                        <p><strong>Category:</strong> {selectedEvent.category || "N/A"}</p>
                        <p><strong>Description:</strong> {selectedEvent.description || "No description available."}</p>
                        <p><strong>Location:</strong> {selectedEvent.location || "Unknown"}</p>
                        <p><strong>Date:</strong> {selectedEvent.date || "TBD"}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { textAlign: "center", padding: "20px", backgroundColor: "#F2EBE9" },
    list: { listStyle: "none", padding: "0" },
    headerContainer: {
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "10px", marginBottom: "20px"
    },
    logo: { width: "50px", height: "50px" },
    header: { fontSize: "24px", fontWeight: "bold" },
    listItem: {
        padding: "10px", border: "1px solid #ddd", margin: "10px",
        borderRadius: "5px", backgroundColor: "#f9f9f9",
        display: "flex", justifyContent: "space-between", alignItems: "center"
    },
    button: {
        padding: "8px 12px", backgroundColor: "#CDE0CA", fontSize: "12px",
        color: "black", border: "none", cursor: "pointer", borderRadius: "5px"
    },
    detailsContainer: {
        marginTop: "20px", padding: "15px", border: "1px solid #ddd",
        borderRadius: "10px", backgroundColor: "#e9ecef"
    }
};

export default Events;
