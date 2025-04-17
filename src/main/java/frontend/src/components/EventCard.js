import React, { useState } from "react";
import sampleEventImage from "../assets/sampleEventImage.jpg";
import EventDetailOverlay from "./EventDetailOverlay";

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

const EventCard = ({ event, onRegister }) => {
    const tagColor = categoryColors[event.category] || "#9e9e9e";
    const [showDetails, setShowDetails] = useState(false);

    return (
        <>
            <li style={styles.card} className="event-card">
                <div style={{ position: "relative" }}>
                    <img
                        src={event.imageURL || placeholderImage}
                        alt={event.title || "Event"}
                        style={styles.image}
                    />
                    {event.category && (
                        <span style={{ ...styles.tag, backgroundColor: tagColor }}>
                            {event.category}
                        </span>
                    )}
                </div>
                <div style={styles.body}>
                    <h3 style={styles.title}>{event.title || "Untitled Event"}</h3>
                    <p style={styles.meta}><strong>Location:</strong> {event.location || "TBD"}</p>
                    <p style={styles.meta}><strong>Date:</strong> {event.date || "TBD"}</p>
                </div>
                <div style={styles.actions}>
                    <button onClick={() => setShowDetails(true)} style={styles.viewBtn}>
                        View Details
                    </button>

                    {onRegister && event.verified ? (
                        event.suspended ? (
                            <span style={styles.awaiting}>Event Suspended</span>
                        ) : (
                            <button
                                onClick={() => {
                                    if (event.suspended) {
                                        alert("This event is currently suspended and cannot accept registrations.");
                                        return;
                                    }
                                    onRegister(event.id);
                                }}
                                style={styles.registerBtn}
                            >
                                Register
                            </button>
                        )
                    ) : onRegister ? (
                        <span style={styles.awaiting}>Awaiting Verification</span>
                    ) : null}
                </div>
            </li>

            {showDetails && (
                <EventDetailOverlay event={event} onClose={() => setShowDetails(false)} />
            )}
        </>
    );
};

// ✅ Move styles outside the component
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

export default EventCard;

