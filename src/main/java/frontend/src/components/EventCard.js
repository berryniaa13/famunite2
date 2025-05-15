import React, { useState, useEffect } from "react";
import sampleEventImage from "../assets/sampleEventImage.jpg";
import EventDetailOverlay from "./EventDetailOverlay";
import EventVerifyCard from "./EventVerifyCard";
import { auth, firestore } from "../context/firebaseConfig";
import bookmarkSaved from "../assets/bookmarkSaved.png";
import bookmarkUnsaved from "../assets/bookmarkUnsaved.png";
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

const EventCard = ({ event,  layout = "default" , onDone }) => {
    const [isRegistered, setIsRegistered] = useState(false);
    const [isLiaisonOfOrg, setIsLiaisonOfOrg] = useState(false)
    const [isSaved, setIsSaved] = useState(false);
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
        const checkIfSaved = async () => {
            const user = auth.currentUser;
            if (!user) return;
            const q = query(
                collection(firestore, "SavedEvents"),
                where("userId", "==", user.uid),
                where("eventId", "==", event.id)
            );
            const snap = await getDocs(q);
            setIsSaved(!snap.empty);
        };
        fetchUserRole();
        checkIfSaved();
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

            if (eventData.status === "Pending") {
                alert("This event is not approved yet.");
                return;
            }

            if (eventData.status === "Suspended") {
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

    const handleSave = async (eventId) => {
        const user = auth.currentUser;
        if (!user) return alert("Login required");
        try {
            await addDoc(collection(firestore, "SavedEvents"), {
                userId: user.uid,
                eventId,
                savedAt: serverTimestamp()
            });
            setIsSaved(true);
        } catch (e) {
            console.error(e);
        }
    };

    const handleUnsave = async (eventId) => {
        const user = auth.currentUser;
        if (!user) return;
        const q = query(collection(firestore, "SavedEvents"),
            where("userId", "==", user.uid),
            where("eventId", "==", eventId)
        );
        const snap = await getDocs(q);
        const promises = snap.docs.map(d => deleteDoc(d.ref));
        await Promise.all(promises);
        setIsSaved(false);
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
                    <div style={styles.saveBtnWrapper}>
                        <button
                            onClick={() => isSaved ? handleUnsave(event.id) : handleSave(event.id)}
                            style={styles.saveBtn}
                        >
                            <img
                                src={isSaved ? bookmarkSaved : bookmarkUnsaved}
                                alt="Save"
                                style={{ width: "20px", height: "20px" }}
                            />
                        </button>
                    </div>
                    <h3 style={styles.title}>{event.title || "Untitled Event"}</h3>
                    <p style={styles.meta}><strong> {organization?.name || "TBD"}</strong></p>
                    <p style={styles.meta}><strong>Location:</strong> {event.location || "TBD"}</p>
                    <p style={styles.meta}><strong>Date:</strong> {event.date || "TBD"}</p>
                    <div style={layoutStyles.actions}>
                        <button onClick={() => setShowDetails(true)} style={styles.viewBtn}>
                            View Details
                        </button>

                        {event.status === "Approved" ? (
                            isRegistered ? (
                                <button
                                    onClick={() => {handleUnregister(event.id)
                                    onDone()}}
                                    className={"buttonOrange"}
                                >
                                    Unregister
                                </button>
                            ) : (
                                <button
                                    onClick={() => {handleRegister(event.id)
                                    onDone()}}
                                    className={"buttonGreen"}
                                >
                                    Register
                                </button>
                            )
                        ) : event.status === "Suspended" ? (
                            <span style={styles.awaiting}>Event Suspended</span>
                        ) : event.status === "Flagged" ? (
                            <span style={styles.awaiting}>Event Flagged</span>
                        ) : (
                            <span style={styles.awaiting}>Awaiting Approval</span>
                        )}

                    </div>
                </div>
            </li>


            {showDetails && (
                isPrivileged ? (
                    <EventVerifyCard event={event}
                                     currentUserRole={userRole}
                                     onClose={() =>
                                     {setShowDetails(false)
                                         onDone()}
                                     }
                                    organization={organization}/>
                ) : (
                    <EventDetailOverlay event={event}
                                        onClose={() => {setShowDetails(false)
                                        onDone()}
                    }
                                        handleRegister={()=>handleRegister(event.id)}
                                        isRegistered={isRegistered}
                                        organization={organization}/>
                )
            )}
        </>
    );
};

const styles = {
    card: {
        minWidth: "280px",
        maxWidth: "300px",
        borderRadius: "12px",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        background: "rgba(255, 255, 255, 0.8)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
        color: "white",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
    },
    saveBtnWrapper: {
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "1px",
    },
    saveBtn: {
        background: "rgba(255, 255, 255, 0.9)",
        border: "none",
        borderRadius: "50%",
        padding: "6px",
        fontSize: "16px",
        cursor: "pointer",
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
        padding: "4px 12px 12px 12px",
        flex: 1
    },
    title: {
        fontSize: "16px",
        marginBottom: "4px",
        marginTop: "0px",
        color:"var(--primary-green)",
        fontWeight:"bold"
    },
    meta: {
        fontSize: "12px",
        color: "#333",
        margin: "4px",
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
        backgroundColor: "var(--primary-green)",
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
        maxWidth: "100%",
        display: "flex",
        flexDirection: "row",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "10px",
        overflow: "hidden",
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
        marginBottom: "16px",
    },
    imageContainer: {
        width: "240px",
        height: "auto",
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
