import React, { useEffect, useState } from "react";
import sampleEventImage from "../assets/sampleEventImage.jpg";
import EventDetailOverlay from "./EventDetailOverlay";
import {
    deleteDoc,
    doc,
    updateDoc,
    getDoc,
    arrayUnion,
    arrayRemove
} from "firebase/firestore";
import { firestore } from "../context/firebaseConfig";

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

const EventCardRectangular = ({ event, onRegister, onUnregister, currentUser }) => {
    const tagColor = categoryColors[event.category] || "#9e9e9e";
    const [showDetails, setShowDetails] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Fetch saved status for this event
    useEffect(() => {
        if (!currentUser?.uid) return;
        (async () => {
            try {
                const userRef = doc(firestore, "User", currentUser.uid);
                const snap = await getDoc(userRef);
                const saved = snap.data()?.savedEvents || [];
                setIsSaved(saved.includes(event.id));
            } catch (err) {
                console.error("Error fetching saved events:", err);
            }
        })();
    }, [currentUser, event.id]);

    const handleEditEvent = async () => {
        if (!event?.id) return;
        try {
            const eventRef = doc(firestore, "Event", event.id);
            await updateDoc(eventRef, event);
            alert("Event edited successfully!");
        } catch (error) {
            console.error("Error updating event:", error);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await deleteDoc(doc(firestore, "Event", eventId));
            alert("Event deleted.");
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    // Toggle save / unsave
    const handleSaveToggle = async (e) => {
        e.stopPropagation();
        if (!currentUser?.uid) return;
        try {
            const userRef = doc(firestore, "User", currentUser.uid);
            await updateDoc(userRef, {
                savedEvents: isSaved
                    ? arrayRemove(event.id)
                    : arrayUnion(event.id)
            });
            setIsSaved(prev => !prev);
        } catch (err) {
            console.error("Error toggling save:", err);
        }
    };

    return (
        <>
            <li style={styles.card} className="event-card-rect">
                <div className="event-content" style={styles.content}>
                    <div style={styles.imageContainer}>
                        <img
                            src={event.imageURL || placeholderImage}
                            alt={event.title}
                            style={styles.image}
                        />
                    </div>
                    <span style={{ ...styles.tag, backgroundColor: tagColor }}>
            {event.category}
          </span>
                    <div style={styles.right}>
                        <h3 style={styles.title}>{event.title || "Untitled Event"}</h3>
                        <p style={styles.meta}>{event.organizationName || "TBD"}</p>
                        <p style={styles.meta}><strong>Date:</strong> {event.date || "TBD"}</p>
                        <p style={styles.meta}><strong>Location:</strong> {event.location || "TBD"}</p>

                        <div style={styles.actions}>
                            <button
                                onClick={() => setShowDetails(true)}
                                style={styles.viewBtn}
                            >
                                View Details
                            </button>

                            {onRegister && event.verified && !event.suspended ? (
                                <button
                                    onClick={() => onRegister(event.id)}
                                    style={styles.registerBtn}
                                >
                                    Register
                                </button>
                            ) : onRegister && event.suspended ? (
                                <span style={styles.awaiting}>Event Suspended</span>
                            ) : onRegister ? (
                                <span style={styles.awaiting}>Awaiting Verification</span>
                            ) : null}

                            {onUnregister && (
                                <button
                                    onClick={onUnregister}
                                    style={styles.registerBtn}
                                >
                                    Unregister
                                </button>
                            )}

                            {/* Save / Unsave for Students */}
                            {currentUser?.role === "Student" && (
                                <button
                                    onClick={handleSaveToggle}
                                    style={styles.saveBtn}
                                >
                                    {isSaved ? "Unsave" : "Save"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </li>

            {showDetails && (
                <EventDetailOverlay event={event} onClose={() => setShowDetails(false)} />
            )}
        </>
    );
};

const styles = {
    card: {
        width: "100%",
        maxWidth: "700px",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        marginBottom: "16px",
        position: "relative"
    },
    content: {
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch"
    },
    imageContainer: {
        width: "240px",
        height: "200px",
        overflow: "hidden",
        borderRadiusTopLeft: '8px',
        borderRadiusBottomRight: '8px'
    },
    image: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        borderRadiusTopLeft: '8px',
        borderRadiusBottomRight: '8px'
    },
    right: {
        flex: 1,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    },
    tag: {
        position: "absolute",
        top: "10px",
        right: "10px",
        padding: "4px 8px",
        borderRadius: "6px",
        fontSize: "11px",
        color: "#fff",
        fontWeight: "bold",
        zIndex: 10
    },
    title: {
        fontSize: "18px",
        fontWeight: "600",
        marginBottom: "6px",
        textAlign: "left"
    },
    meta: {
        fontSize: "13px",
        color: "#444",
        margin: "4px",
        textAlign: "left"
    },
    actions: {
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        marginTop: "12px"
    },
    viewBtn: {
        padding: "8px 12px",
        backgroundColor: "#CDE0CA",
        border: "none",
        borderRadius: "6px",
        fontSize: "12px",
        cursor: "pointer"
    },
    registerBtn: {
        padding: "8px 12px",
        backgroundColor: "#12491B",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        fontSize: "12px",
        cursor: "pointer"
    },
    saveBtn: {
        padding: "8px 12px",
        backgroundColor: "#ffa726",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        fontSize: "12px",
        cursor: "pointer"
    },
    awaiting: {
        fontSize: "11px",
        color: "gray",
        alignSelf: "center"
    }
};

export default EventCardRectangular;
