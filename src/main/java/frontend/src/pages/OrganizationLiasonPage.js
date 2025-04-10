/*
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
*/
/*
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, updateProfile } from "firebase/auth"; // Added updateProfile
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    setDoc // Added setDoc for upserting a document
} from "firebase/firestore";
import { auth, firestore } from "../context/firebaseConfig";

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
    const [profileEdit, setProfileEdit] = useState({ displayName: "" });

    const navigate = useNavigate();

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            const displayName = user.displayName || "No name set";
            setUserData({
                uid: user.uid,
                email: user.email,
                displayName
            });
            setProfileEdit({ displayName });
        }
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

    // New function to update the user's profile information in Firestore and Firebase Auth.
    const handleProfileUpdate = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            // Update or create the user document in the "Users" collection
            const userDocRef = doc(firestore, "Users", user.uid);
            await setDoc(userDocRef, { displayName: profileEdit.displayName }, { merge: true });

            // Optionally update the Firebase Auth profile as well
            await updateProfile(user, { displayName: profileEdit.displayName });
            setUserData({ ...userData, displayName: profileEdit.displayName });

            alert("Profile updated successfully.");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("There was an error updating your profile.");
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.sidebar}>
                <h3 style={styles.sidebarHeader}>FAMUnite</h3>
                <button style={styles.navButton} onClick={() => setView("dashboard")}>Dashboard</button>
                <button style={styles.navButton} onClick={() => setView("profile")}>Profile</button>
                <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
            </div>

            <div style={styles.mainContent}>
                {view === "dashboard" && (
                    <>
                        <h2>Organization Liaison Dashboard</h2>

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
                    </>
                )}

                {view === "profile" && userData && (
                    <div style={styles.section}>
                        <h2>My Profile</h2>
                        <label>
                            <strong>Name:</strong>
                            <input
                                type="text"
                                value={profileEdit.displayName}
                                onChange={(e) =>
                                    setProfileEdit({ ...profileEdit, displayName: e.target.value })
                                }
                                style={styles.input}
                            />
                        </label>
                        <p><strong>Email:</strong> {userData.email}</p>
                        <p><strong>UID:</strong> {userData.uid}</p>
                        <button onClick={handleProfileUpdate} style={styles.button}>
                            Update Profile
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrganizationLiaisonDashboard;
*/

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { getDoc } from "firebase/firestore"; // Add this import
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

    // Extend profile state to include organizationName.
    const [profileEdit, setProfileEdit] = useState({
        displayName: "",
        organizationName: ""
    });

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
                            displayName: data.name || "No name set",
                            organizationName: data.organizationName || "No organization set"
                        });

                        setProfileEdit({
                            displayName: data.name || "",
                            organizationName: data.organizationName || ""
                        });
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

            const userDocRef = doc(firestore, "User", user.uid);
            const userSnap = await getDoc(userDocRef);
            const userData = userSnap.exists() ? userSnap.data() : {};

            const eventToCreate = {
                ...newEvent,
                createdBy: user.uid,
                createdAt: new Date().toISOString(),
                organizationName: userData.organizationName || "Unknown"
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

    // Update profile to save both displayName and organizationName.
    const handleProfileUpdate = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const userDocRef = doc(firestore, "User", user.uid);
            await setDoc(
                userDocRef,
                {
                    displayName: profileEdit.displayName,
                    organizationName: profileEdit.organizationName
                },
                { merge: true }
            );

            setUserData({
                ...userData,
                displayName: profileEdit.displayName,
                organizationName: profileEdit.organizationName || userData.organizationName
            });

            alert("Profile updated successfully.");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("There was an error updating your profile.");
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.sidebar}>
                <h3 style={styles.sidebarHeader}>FAMUnite</h3>
                <button style={styles.navButton} onClick={() => setView("dashboard")}>Dashboard</button>
                <button style={styles.navButton} onClick={() => setView("profile")}>Profile</button>
                <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
            </div>

            <div style={styles.mainContent}>
                {view === "dashboard" && (
                    <>
                        <h2>Organization Liaison Dashboard</h2>

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
                    </>
                )}

                {view === "profile" && userData && (
                    <div style={styles.section}>
                        <h2>My Profile</h2>
                        <p><strong>Name:</strong> {userData.displayName}</p>
                        <p><strong>Email:</strong> {userData.email}</p>
                        <p><strong>Organization Name:</strong> {userData.organizationName}</p>
                        <hr style={{ margin: "20px 0" }} />
                        <h3>Update Your Profile</h3>
                        <label>
                            <strong>Name:</strong>
                            <input
                                type="text"
                                value={profileEdit.displayName}
                                onChange={(e) =>
                                    setProfileEdit({ ...profileEdit, displayName: e.target.value })
                                }
                                style={styles.input}
                            />
                        </label>
                        <label>
                            <strong>Organization Name:</strong>
                            <input
                                type="text"
                                value={profileEdit.organizationName}
                                onChange={(e) =>
                                    setProfileEdit({ ...profileEdit, organizationName: e.target.value })
                                }
                                style={styles.input}
                            />
                        </label>
                        <button onClick={handleProfileUpdate} style={styles.button}>
                            Update Profile
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    pageWrapper: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F2EBE9',
    },
    sidebar: {
        width: '220px',
        backgroundColor: '#12491B',
        padding: '30px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        color: 'white',
        gap: '15px',
    },
    sidebarHeader: {
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: 'white'
    },
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
    logoutButton: {
        padding: "10px",
        backgroundColor: "#BF6319",
        color: "white",
        border: "none",
        cursor: "pointer",
        marginTop: "auto",
        borderRadius: "5px",
        width: "100%"
    },
    mainContent: {
        flex: 1,
        padding: "30px",
        maxWidth: "800px",
        margin: "0 auto",
        textAlign: "center",
    },
    searchBar: {
        padding: "8px",
        width: "90%",
        marginBottom: "20px",
        borderRadius: "8px",
        border: "1px solid #ccc"
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

