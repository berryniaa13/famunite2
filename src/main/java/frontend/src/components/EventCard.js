import React, { useState, useEffect } from "react";
import sampleEventImage from "../assets/sampleEventImage.jpg";
import EventDetailOverlay from "./EventDetailOverlay";
import EventVerifyCard from "./EventVerifyCard";
import { auth, firestore } from "../context/firebaseConfig";
import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, where} from "firebase/firestore";

const placeholderImage = sampleEventImage;

const categoryColors = {
    "Academic": "#6a1b9a",
    "Career / Professional Development": "#1565c0",
    "Workshops": "#4527a0",
    "Social": "#d81b60",
    "Cultural": "#00897b",
    "Performing Arts / Entertainment": "#ef6c00",
    "Community Service": "#2e7d32",
    "Health & Wellness": "#c62828",
    "Sports / Recreation": "#0277bd",
    "Religious / Spiritual": "#6d4c41",
    "Club / Organization Meetings": "#5d4037",
    "Fundraisers": "#ad1457",
    "Networking Events": "#00838f",
    "Student Government": "#283593",
    "Study Groups / Tutoring": "#3949ab",
    "Housing & Campus Life": "#4e342e",
    "Competitions / Hackathons": "#1e88e5",
    "Tech / Innovation": "#0097a7",
    "Political": "#c62828",
    "Alumni Events": "#8e24aa"
};

const EventCard = ({ event,  layout = "default"  }) => {
    const [isRegistered, setIsRegistered] = useState(false);
    const [isLiaisonOfOrg, setIsLiaisonOfOrg] = useState(false);
    const [organization, setOrganization] = useState(null);
    const tagColor = categoryColors[event.category] || "#9e9e9e";
    const [showDetails, setShowDetails] = useState(false);
    const [userRole, setUserRole] = useState("");
    const [userId, setUserId] = useState("");
    const layoutStyles = layout === "rectangular" ? rectangularStyles : styles;
    useEffect(() => {
        const fetchUserRole = async () => {
            const user = auth.currentUser;
            if (!user) return;
            setUserId(user.uid);
            const userRef = doc(firestore, "User", user.uid);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
                setUserRole(snap.data().role);
            }

            // CHeck if user is registered for event
            const q = query(
                collection(firestore, "Registrations"),
                where("userId", "==", user.uid),
                where("eventId", "==", event.id)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                setIsRegistered(true);
            }

            // Check if this user is the liaison of the organization that created this event
            if (event.organizationId) {
                const orgRef = doc(firestore, "Organizations", event.organizationId);
                const orgSnap = await getDoc(orgRef);
                if (orgSnap.exists()) {
                    const orgData = orgSnap.data();
                    setOrganization(orgData);
                    console.log("Organization Data: ", organization);
                    if (orgData.liaisonId === user.uid) {
                        setIsLiaisonOfOrg(true);
                    }
                }
            }
        };

        fetchUserRole();
    }, []);

    const isPrivileged =
        userRole === "Admin" ||
        userRole === "Event Moderator" ||
        (userRole === "Organization Liaison" && isLiaisonOfOrg);

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
                alert("Event does not exist.");
                return;
            }

            const eventData = eventSnap.data();

            if (!eventData.verified) {
                alert("This event is not verified yet.");
                return;
            }

            if (eventData.suspended) {
                alert("This event is currently suspended and cannot accept registrations.");
                return;
            }

            await addDoc(collection(firestore, "Registrations"), {
                userId: user.uid,
                eventId: eventId,
                timestamp: serverTimestamp(),
            });

            alert("You have successfully registered for the event!");
        } catch (error) {
            console.error("Registration failed:", error);
            alert("Failed to register.");
        }
    };

    const handleUnregister = async (eventId) => {
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to unregister.");
            return;
        }

        try {
            const registrationsRef = collection(firestore, "Registrations");
            const q = query(
                registrationsRef,
                where("userId", "==", user.uid),
                where("eventId", "==", eventId)
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                alert("You are not registered for this event.");
                return;
            }

            // Assuming one registration per user per event
            const registrationDoc = querySnapshot.docs[0];
            await deleteDoc(registrationDoc.ref);

            alert("You have successfully unregistered from the event!");
        } catch (error) {
            console.error("Unregistration failed:", error);
            alert("Failed to unregister.");
        }
    };

    return (
        <>
            <li style={layoutStyles.card} className="event-card">
                <div style={layoutStyles.imageContainer}>
                    <img
                        src={event.imageURL || placeholderImage}
                        alt={event.title || "Event"}
                        style={layoutStyles.image}
                    />
                    {event.category && (
                        <span style={{ ...styles.tag, backgroundColor: tagColor }}>
                {event.category}
            </span>
                    )}
                </div>
                <div style={layoutStyles.body}>
                    <h3 style={styles.title}>{event.title || "Untitled Event"}</h3>
                    <p style={styles.meta}><strong>Location:</strong> {event.location || "TBD"}</p>
                    <p style={styles.meta}><strong>Date:</strong> {event.date || "TBD"}</p>
                    <div style={layoutStyles.actions}>
                        <button onClick={() => setShowDetails(true)} style={styles.viewBtn}>
                            View Details
                        </button>

                        {event.verified ? (
                            event.suspended ? (
                                <span style={styles.awaiting}>Event Suspended</span>
                            ) : isRegistered ? (
                                <span style={styles.awaiting}>Registered</span>
                            ) : (
                                <button
                                    onClick={() => handleRegister(event.id)}
                                    style={styles.registerBtn}
                                >
                                    Register
                                </button>
                            )
                        ) : (
                            <span style={styles.awaiting}>Awaiting Verification</span>
                        )}
                    </div>
                </div>
            </li>


            {showDetails && (
                isPrivileged ? (
                    <EventVerifyCard event={event}
                                     currentUserRole={userRole}
                                     onClose={() =>
                                         setShowDetails(false)
                                     }
                                    organization={organization}/>
                ) : (
                    <EventDetailOverlay event={event}
                                        onClose={() => setShowDetails(false)}
                                        handleRegister={()=>handleRegister(event.id)}
                                        isRegistered={isRegistered} />
                )
            )}
        </>
    );
};

const styles = {
    card: {
        minWidth: "280px",
        maxWidth: "300px",
        padding: "0",
        borderRadius: "12px",
        border: "1px solid #ccc",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative"
    },
    imageContainer: {
        position: "relative",
    },
    image: {
        width: "100%",
        height: "150px",
        objectFit: "cover",
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px"
    },
    tag: {
        position: "absolute",
        top: "10px",
        right: "10px",
        padding: "4px 8px",
        color: "#fff",
        fontSize: "11px",
        fontWeight: "bold",
        borderRadius: "6px",
        whiteSpace: "nowrap"
    },
    body: {
        padding: "12px",
        flex: 1
    },
    title: {
        fontSize: "16px",
        fontWeight: "600",
        marginBottom: "8px"
    },
    meta: {
        fontSize: "12px",
        color: "#333",
        marginBottom: "4px"
    },
    actions: {
        display: "flex",
        gap: "8px",
        padding: "12px",
        borderTop: "1px solid #eee"
    },
    viewBtn: {
        flex: 1,
        padding: "8px",
        backgroundColor: "#CDE0CA",
        border: "none",
        fontSize: "12px",
        borderRadius: "6px",
        cursor: "pointer"
    },
    registerBtn: {
        flex: 1,
        padding: "8px",
        backgroundColor: "#12491B",
        color: "white",
        border: "none",
        fontSize: "12px",
        borderRadius: "6px",
        cursor: "pointer"
    },
    awaiting: {
        fontSize: "11px",
        color: "gray",
        alignSelf: "center"
    }
};

const rectangularStyles = {
    card: {
        width: "100%",
        maxWidth: "700px",
        display: "flex",
        flexDirection: "row",
        border: "1px solid #ccc",
        borderRadius: "10px",
        overflow: "hidden",
        backgroundColor: "#fff",
        marginBottom: "16px"
    },
    imageContainer: {
        width: "240px",
        height: "200px",
        overflow: "hidden",
        flexShrink: 0,
        position: "relative"
    },
    image: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },
    body: {
        flex: 1,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    },
    actions: {
        display: "flex",
        gap: "10px",
        marginTop: "12px"
    }
};


export default EventCard;
