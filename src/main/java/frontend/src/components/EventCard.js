import React from "react";
import sampleEventImage from "../assets/sampleEventImage.jpg"
//import {ImagenImageFormat as ampleEvent} from "@firebase/vertexai";

// Default placeholder image (replace with your asset path or a hosted URL)
const placeholderImage = sampleEventImage;

const EventCard = ({ event, onViewDetails, onRegister }) => {
    return (
        <li style={styles.card} className="event-card">
            <img
                src={event.imageURL || placeholderImage}
                alt={event.title || "Event"}
                style={styles.image}
            />
            <div style={styles.body}>
                <h3 style={styles.title}>{event.title || "Untitled Event"}</h3>
                <p style={styles.category}><strong>Category:</strong> {event.category || "N/A"}</p>
                <p style={styles.meta}><strong>Location:</strong> {event.location || "TBD"}</p>
                <p style={styles.meta}><strong>Date:</strong> {event.date || "TBD"}</p>
            </div>
            <div style={styles.actions}>
                <button onClick={() => onViewDetails(event)} style={styles.viewBtn}>
                    View Details
                </button>
                {onRegister && event.verified ? (
                    <button onClick={() => onRegister(event.id)} style={styles.registerBtn}>
                        Register
                    </button>
                ) : onRegister ? (
                    <span style={styles.awaiting}>Awaiting Verification</span>
                ) : null}
            </div>
            <style>
                {`
                .event-card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .event-card:hover {
                    transform: translateY(-4px) scale(1.02);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
                }
                `}
            </style>
        </li>
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
        overflow: "hidden"
    },
    image: {
        width: "100%",
        height: "150px",
        objectFit: "cover",
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px"
    },
    body: {
        padding: "12px",
        flex: 1
    },
    title: {
        fontSize: "16px",
        fontWeight: "600",
        marginBottom: "6px"
    },
    category: {
        fontSize: "13px",
        color: "#555",
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
