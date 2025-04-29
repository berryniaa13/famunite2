import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {getDoc, query, where} from "firebase/firestore"; // Add this import
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    setDoc
} from "firebase/firestore";
import { auth, firestore } from "../context/firebaseConfig";
import SearchBar from "../components/SearchBar";
import SideNavbar from "../components/SideNavbar";
import Header from "../components/Header";
import EventCardRectangular from "../components/EventCardRectangular";

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
    const [view, setView] = useState("dashboard"); // 'dashboard' or 'profile'
    const [userData, setUserData] = useState(null);
    const [registrations, setRegistrations] = useState([]);



    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const userDocRef = doc(firestore, "User", user.uid); // use the correct collection name here!
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const data = userDocSnap.data();
                        setUserData({
                            uid: user.uid,
                            email: user.email,
                            role: user.role,
                            displayName: data.name || "No name set",
                            organizationName: data.organizationName || "No organization set"
                        });
                        console.log(userDocSnap.data());

                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };

        fetchUserData();
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const eventsRef = collection(firestore, "Event");
            const snapshot = await getDocs(eventsRef);

            // Only show events created by the current user
            const userEvents = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(event => event.createdBy === user.uid);

            setEvents(userEvents);
            setFilteredEvents(userEvents);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };
        const fetchEventRegistrations = async (eventId) => {
            try {
                const q = query(collection(firestore, "Registrations"), where("eventId", "==", eventId));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRegistrations(data);
            } catch (error) {
                console.error("Error fetching registrations:", error);
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
            if (!user) return;

            // Step 1: Fetch the user's data
            const userDocRef = doc(firestore, "User", user.uid);
            const userSnap = await getDoc(userDocRef);
            const userData = userSnap.exists() ? userSnap.data() : {};

            // Step 2: Create the event document
            const eventToCreate = {
                ...newEvent,
                createdBy: user.uid,
                createdAt: new Date().toISOString(),
                organizationName: userData.organizationName || "Unknown",
                verified: false,
            };

            const eventDocRef = await addDoc(collection(firestore, "Event"), eventToCreate);
            const createdEvent = { id: eventDocRef.id, ...eventToCreate };

            // Step 3: Create a related EventRequest document
            const eventRequestToCreate = {
                event: eventDocRef, // Firestore document reference
                submittedBy: user.uid,
                role: userData.role || "Organization Liaison",
                note: "",
                status: "Pending",
                approvals: [
                    { role: "Organization Liaison", status: "Pending Approval" },
                    { role: "Event Moderator", status: "Pending Approval" },
                    { role: "Admin", status: "Pending Approval" }
                ],
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(firestore, "EventRequest"), eventRequestToCreate);

            // Step 4: Update local state
            const updated = [...events, createdEvent];
            setEvents(updated);
            setFilteredEvents(updated);
            setNewEvent({ title: "", category: "", description: "", location: "", date: "" });

            alert("Event and request submitted successfully!");
        } catch (error) {
            console.error("Error creating event or request:", error);
            alert("You do not have permission to create events.");
        }
    };



    const handleEventClick = async (event) => {
        setSelectedEvent(event);
        await fetchEventRegistrations(event.id);
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

    return (
        <div className={"container"}>
            <SideNavbar/>

            <div style={{ marginLeft: "250px" }}>

                <Header pageTitle={"Organization Liason Dashboard"}/>
                <SearchBar/>
                <div className={"dashboard-container"}>
                    <div className={"left-column"}>
                        <div style={styles.section}>
                            <h3 className={"subHeader"}>Create New Event</h3>

                            {/* Dropdown for Category */}
                            <select
                                value={newEvent.category}
                                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                                style={{ ...styles.input, padding: "10px" }}
                            >
                                <option value="">Select Category</option>
                                {[
                                    "Academic",
                                    "Career / Professional Development",
                                    "Workshops",
                                    "Social",
                                    "Cultural",
                                    "Performing Arts / Entertainment",
                                    "Community Service",
                                    "Health & Wellness",
                                    "Sports / Recreation",
                                    "Religious / Spiritual",
                                    "Club / Organization Meetings",
                                    "Fundraisers",
                                    "Networking Events",
                                    "Student Government",
                                    "Study Groups / Tutoring",
                                    "Housing & Campus Life",
                                    "Competitions / Hackathons",
                                    "Tech / Innovation",
                                    "Political",
                                    "Alumni Events"
                                ].map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>

                            {['title', 'description', 'location'].map((field) => (
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
                                    <EventCardRectangular event={event} currentUser={userData} />
                                    {/*<div>*/}
                                    {/*    <h4>{event.title}</h4>*/}
                                    {/*    <p>{event.date}</p>*/}
                                    {/*</div>*/}
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
                                <div style={styles.analytics}>
                                    <h3>Event Statistics for: {selectedEvent.title}</h3>
                                    <p><strong>Total Registrations:</strong> {registrations.length}</p>
                                    {registrations.map((reg, index) => (
                                        <div key={index} style={{
                                            padding: "10px",
                                            border: "1px solid #ccc",
                                            marginTop: "10px",
                                            borderRadius: "8px"
                                        }}>
                                            <p><strong>User ID:</strong> {reg.userId}</p>
                                            <p><strong>Registered At:</strong> {new Date(reg.timestamp?.toDate?.() || reg.timestamp).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                                <div>
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
                            </div>
                        )}
                    </div>
                    <div className={"right-column"}>
                        <h3 className={"subHeader"}>Announcements</h3>

                        <h3 className={"subHeader"}>Messages</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {

    navButton: {
        background: 'transparent',
        border: 'none',
        color: 'white',
        fontSize: '16px',
        padding: '10px 0',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
    },
    section: {
        marginBottom: "30px"
    },
    input: {
        padding: "8px",
        margin: "5px",
        width: "90%",
        borderRadius: "6px",
        border: "1px solid #ccc"
    },
    button: {
        padding: "10px 20px",
        backgroundColor: "#12491B",
        color: "white",
        border: "none",
        cursor: "pointer",
        borderRadius: "5px",
        marginTop: "10px"
    },
    smallButton: {
        padding: "6px 12px",
        marginLeft: "5px",
        backgroundColor: "#CDE0CA",
        color: "black",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "12px"
    },
    smallButtonRed: {
        padding: "6px 12px",
        marginLeft: "5px",
        backgroundColor: "#dc3545",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "12px"
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
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    }
};

export default OrganizationLiaisonDashboard;

