import React from "react";
import sampleEventImage from "../assets/sampleEventImage.jpg";

const EventDetailOverlay = ({ event, onClose }) => {
    if (!event) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.card}>
                <button onClick={onClose} style={styles.closeBtn}>×</button>
                <img
                    src={event.imageURL || sampleEventImage}
                    alt={event.title}
                    style={styles.image}
                />
                <div style={styles.body}>
                    <h2 style={styles.title}>{event.title}</h2>
                    <p><strong>Category:</strong> {event.category || "N/A"}</p>
                    <p><strong>Date:</strong> {event.date || "TBD"}</p>
                    <p><strong>Location:</strong> {event.location || "TBD"}</p>
                    <p><strong>Description:</strong> {event.description || "No description available."}</p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 999,
        display: "flex",
        justifyContent: "center",
        alignItems: "start",
        paddingTop: "50px"
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: "12px",
        width: "80%",
        maxWidth: "700px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        overflow: "hidden",
        position: "relative"
    },
    image: {
        width: "100%",
        height: "200px",
        objectFit: "cover"
    },
    closeBtn: {
        position: "absolute",
        top: "10px",
        right: "16px",
        fontSize: "24px",
        background: "none",
        border: "none",
        color: "#333",
        cursor: "pointer"
    },
    body: {
        padding: "20px"
    },
    title: {
        fontSize: "24px",
        marginBottom: "10px"
    }
};

export default EventDetailOverlay;
