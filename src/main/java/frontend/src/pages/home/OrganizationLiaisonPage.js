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
import { auth, firestore } from "../../context/firebaseConfig";
import SearchBar from "../../components/SearchBar";
import SideNavbar from "../../components/SideNavbar";
import Header from "../../components/Header";
import EventCreateForm from "../../components/EventCreateForm";
import EventCard from "../../components/EventCard";
import AnnouncementsList from "../../components/AnnouncementsList";

function OrganizationLiaisonDashboard() {
    const [organization, setOrganization] = useState("");

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
                    const userDocRef = doc(firestore, "User", user.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const data = userDocSnap.data();
                        setUserData({
                            uid: user.uid,
                            email: user.email,
                            role: user.role,
                            displayName: data.name || "No name set",
                        });

                        const orgQuery = query(
                            collection(firestore, "Organizations"),
                            where("liaisonId", "==", user.uid)
                        );
                        const orgSnapshot = await getDocs(orgQuery);

                        if (!orgSnapshot.empty) {
                            const orgDoc = orgSnapshot.docs[0];
                            setOrganization({ id: orgDoc.id, ...orgDoc.data() });
                            console.log("Matched organization:", { id: orgDoc.id, ...orgDoc.data() });
                        } else {
                            console.warn("No organization found for this liaison.");
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (organization?.id) {
            console.log("Organization ready:", organization);
            fetchEvents();
            fetchEventRegistrations();
        }
    }, [organization]);


    const fetchEvents = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const eventsRef = collection(firestore, "Event");
            const snapshot = await getDocs(eventsRef);

            // Only show events who match the current user's organization
            const userEvents = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(event => event.organizationId === organization.id);
            console.log("userEvents: ", userEvents);
            setEvents(userEvents);
            setFilteredEvents(userEvents);
            console.log("Filtered Events: ", filteredEvents);
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

                <Header pageTitle={"Organization Liaison Dashboard"}/>
                <div className={"dashboard-container"}>
                    <div className={"left-column"}>
                        <div style={styles.section}>
                            <h3 className={"subHeader"}>Create New Event</h3>
                            {organization?.id &&
                            <EventCreateForm
                                organizationId={organization.id}
                                onEventCreated={fetchEvents}
                                inputStyle={styles.input}
                                buttonStyle={styles.button}
                            />}
                        </div>
                        <ul style={styles.list}>
                            {filteredEvents.map((event) => (
                                <li key={event.id} >
                                    <EventCard event={event} layout={"rectangular"} />
                                </li>
                            ))}
                        </ul>

                    </div>
                    <div className={"right-column"}>
                        <h3 className={"subHeader"}>Announcements</h3>
                        <AnnouncementsList/>
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

