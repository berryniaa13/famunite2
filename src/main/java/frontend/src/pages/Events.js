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
import EventCardRectangular from "../components/EventCardRectangular";

function Events() {
    const [searchTerm, setSearchTerm] = useState("");
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [savedEvents, setSavedEvents] = useState([]);
    const [recommendedEvents, setRecommendedEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
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

            // Populate organization filter
            const orgs = [...new Set(eventsList.map((e) => e.organizationName).filter(Boolean))];
            setOrganizationOptions(orgs);

            // Example placeholder: first 3 events as "recommended"
            setRecommendedEvents(eventsList.slice(0, 3));
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const fetchSavedEvents = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const savedQuery = query(
                collection(firestore, "SavedEvents"),
                where("userId", "==", user.uid)
            );
            const snapshot = await getDocs(savedQuery);
            const ids = snapshot.docs.map((d) => d.data().eventId);

            const details = await Promise.all(
                ids.map(async (id) => {
                    const ref = doc(firestore, "Event", id);
                    const snap = await getDoc(ref);
                    return snap.exists() ? { id, ...snap.data() } : null;
                })
            );

            setSavedEvents(details.filter((e) => e));
        } catch (error) {
            console.error("Error fetching saved events:", error);
        }
    };

    const updateEventStatus = async (eventId, newStatus) => {
        if (role !== "Admin") return;
        try {
            const ref = doc(firestore, "Event", eventId);
            await updateDoc(ref, { status: newStatus });
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

    const handleViewDetails = (event) => setSelectedEvent(event);

    const handleRegister = async (eventId) => {
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to register.");
            return;
        }
        try {
            const ref = doc(firestore, "Event", eventId);
            const snap = await getDoc(ref);
            const data = snap.data();
            if (!data?.verified) return alert("This event is not verified yet.");
            if (data.status === "Suspended") return alert("This event is suspended.");
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

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div className="container">
            <SideNavbar />
            <div style={{ marginLeft: "250px" }}>
                <Header pageTitle="Events" />

                <SearchBar
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Enter event title..."
                />
                <select
                    value={selectedOrganization}
                    onChange={handleOrgFilterChange}
                    style={styles.searchBar}
                >
                    <option value="">Filter by Organization</option>
                    {organizationOptions.map((org, i) => (
                        <option key={i} value={org}>{org}</option>
                    ))}
                </select>

                {/* Saved Events */}
                {role !== "Admin" && (
                    <>
                        <h2 style={styles.header}>Saved Events</h2>
                        {savedEvents.length > 0 ? (
                            savedEvents.map((ev) => (
                                <EventCardRectangular
                                    key={ev.id}
                                    event={ev}
                                    currentUser={{ uid: auth.currentUser.uid, role }}
                                    onRegister={handleRegister}
                                />
                            ))
                        ) : <p>No saved events.</p>}
                    </>
                )}

                {/* Recommended Events */}
                <h2 style={styles.header}>Recommended Events</h2>
                {recommendedEvents.length > 0 ? (
                    recommendedEvents.map((ev) => (
                        <EventCardRectangular
                            key={ev.id}
                            event={ev}
                            currentUser={{ uid: auth.currentUser.uid, role }}
                            onRegister={handleRegister}
                        />
                    ))
                ) : <p>No recommended events.</p>}

                {/* Regular Events */}
                <h2 style={styles.header}>Events</h2>
                {filteredEvents.map((ev) => (
                    <EventCardRectangular
                        key={ev.id}
                        event={ev}
                        currentUser={{ uid: auth.currentUser.uid, role }}
                        onRegister={handleRegister}
                    />
                ))}

                {selectedEvent && (
                    <div style={styles.detailsContainer}>
                        <h3>Event Details</h3>
                        <p><strong>Organization:</strong> {selectedEvent.organizationName || "N/A"}</p>
                        <p><strong>Category:</strong> {selectedEvent.category || "N/A"}</p>
                        <p><strong>Description:</strong> {selectedEvent.description || "No description."}</p>
                        <p><strong>Location:</strong> {selectedEvent.location || "TBD"}</p>
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
    header: { fontSize: "24px", fontWeight: "bold" },
    detailsContainer: {
        marginTop: "20px",
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        backgroundColor: "#e9ecef"
    }
};

export default Events;

