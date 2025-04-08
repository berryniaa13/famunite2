 /*
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    doc,
    getDoc
} from "firebase/firestore";
import { auth, firestore } from '../context/firebaseConfig';
import SideNavbar from "../components/SideNavbar";
import famUniteLogo from "../assets/FAMUniteLogoNude.png";

function StudentDashboard() {
    const [searchTerm, setSearchTerm] = useState("");
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEventsWithRegistrationCounts();
    }, []);

    const fetchEventsWithRegistrationCounts = async () => {
        try {
            const eventsSnapshot = await getDocs(collection(firestore, "Event"));
            const registrationsSnapshot = await getDocs(collection(firestore, "Registrations"));

            const registrationsMap = {};
            registrationsSnapshot.docs.forEach((doc) => {
                const { eventId } = doc.data();
                registrationsMap[eventId] = (registrationsMap[eventId] || 0) + 1;
            });

            const enrichedEvents = eventsSnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    registrationCount: registrationsMap[doc.id] || 0
                };
            });

            setEvents(enrichedEvents);
            setFilteredEvents(enrichedEvents);
        } catch (error) {
            console.error("Error fetching events and registrations:", error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setSelectedEvent(null);
        const filtered = events.filter(event =>
            event.title && event.title.toLowerCase().includes(e.target.value.toLowerCase())
        );
        setFilteredEvents(filtered);
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

            if (!eventSnap.exists() || !eventSnap.data().verified) {
                alert("This event is not verified yet.");
                return;
            }

            await addDoc(collection(firestore, "Registrations"), {
                userId: user.uid,
                eventId: eventId,
                timestamp: serverTimestamp()
            });

            alert("You have successfully registered for the event!");
            fetchEventsWithRegistrationCounts();
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
        <div style={styles.container}>
            <SideNavbar/>
            <div style={{marginLeft: "250px"}}>
            <div style={styles.headerContainer}>
                <img src={famUniteLogo} alt="FAMUnite Logo" style={styles.logo} />
                <h2 style={styles.header}>Home</h2>
            </div>
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
                        <div style={{ flex: 1 }}>
                            <h3>{event.title || "Untitled Event"}</h3>
                            <p><strong>Registrations:</strong> {event.registrationCount}</p>
                            {!event.verified && (
                                <p style={{ color: "red", fontSize: "12px" }}>
                                    This event is not yet verified.
                                </p>
                            )}
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={() => handleViewDetails(event)} style={styles.button}>
                                View Details
                            </button>
                            {event.verified ? (
                                <button
                                    onClick={() => handleRegister(event.id)}
                                    style={{ ...styles.button, backgroundColor: "#007bff" }}
                                >
                                    Register
                                </button>
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
                    <p><strong>Category:</strong> {selectedEvent.category || "N/A"}</p>
                    <p><strong>Description:</strong> {selectedEvent.description || "No description available."}</p>
                    <p><strong>Location:</strong> {selectedEvent.location || "Unknown"}</p>
                    <p><strong>Date:</strong> {selectedEvent.date || "TBD"}</p>
                </div>
            )}

            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
            </div>
        </div>
    );
}

const styles = {
    container: { textAlign: "center", padding: "20px" },
    searchBar: { padding: "8px", width: "80%", margin: "10px auto", display: "block" },
    list: { listStyle: "none", padding: "0" },
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
    listItem: {
        padding: "10px",
        border: "1px solid #ddd",
        margin: "10px",
        borderRadius: "5px",
        backgroundColor: "#f9f9f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    button: {
        padding: "5px 10px",
        backgroundColor: "#28a745",
        color: "white",
        border: "none",
        cursor: "pointer",
        borderRadius: "5px"
    },
    detailsContainer: {
        marginTop: "20px",
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        backgroundColor: "#e9ecef"
    },
    logoutButton: {
        padding: "10px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        cursor: "pointer",
        marginTop: "10px"
    },
};

export default StudentDashboard;
*/

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, getDocs, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { auth, firestore } from '../context/firebaseConfig';
import SideNavbar from "../components/SideNavbar";
import famUniteLogo from "../assets/FAMUniteLogoNude.png";


function Events() {
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
        setSelectedEvent(null);
        const filtered = events.filter(event =>
            event.title && event.title.toLowerCase().includes(e.target.value.toLowerCase())
        );
        setFilteredEvents(filtered);
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

            if (!eventSnap.exists() || !eventSnap.data().verified) {
                alert("This event is not verified yet.");
                return;
            }

            await addDoc(collection(firestore, "Registrations"), {
                userId: user.uid,
                eventId: eventId,
                timestamp: serverTimestamp()
            });
            alert("You have successfully registered for the event!");
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
        <div style={styles.container}>
            <SideNavbar/>
            <div style={{marginLeft: "250px"}}>
                <div style={styles.headerContainer}>
                    <img src={famUniteLogo} alt="FAMUnite Logo" style={styles.logo} />
                    <h2 style={styles.header}>Events</h2>
                </div>
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
                            <div style={{ flex: 1 }}>
                                <h3>{event.title || "Untitled Event"}</h3>
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button onClick={() => handleViewDetails(event)} style={styles.button}>
                                    View Details
                                </button>
                                {event.verified ? (
                                    <button
                                        onClick={() => handleRegister(event.id)}
                                        style={{ ...styles.button, backgroundColor: "#12491B", color: "white" }}
                                    >
                                        Register
                                    </button>
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
    container: {
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#F2EBE9"
    },
    searchBar: {
        padding: "8px",
        width: "90%",
        margin: "10px auto",
        display: "block",
        borderRadius: "8px"
    },
    list: {
        listStyle: "none",
        padding: "0"
    },
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
    listItem: {
        padding: "10px",
        border: "1px solid #ddd",
        margin: "10px",
        borderRadius: "5px",
        backgroundColor: "#f9f9f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
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
    logoutButton: {
        padding: "10px",
        backgroundColor: "#BF6319",
        color: "white",
        border: "none",
        cursor: "pointer",
        borderRadius: "5px",
        marginTop: "10px"
    }
};

export default Events;

