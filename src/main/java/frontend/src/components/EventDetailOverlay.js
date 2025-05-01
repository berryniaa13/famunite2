import React, { useState } from "react";
import sampleEventImage from "../assets/sampleEventImage.jpg";
import { doc, getDoc, updateDoc, getFirestore } from "firebase/firestore";

const EventDetailOverlay = ({ event, onClose }) => {
    const db = getFirestore();
    const [flagging, setFlagging] = useState(false);
    const [alreadyFlagged, setAlreadyFlagged] = useState(event.flagged);

    const handleFlagEvent = async () => {
        setFlagging(true);
        try {
            const eventRef = doc(db, "Event", event.id);
            const eventSnap = await getDoc(eventRef);

            if (!eventSnap.exists()) {
                alert("Event no longer exists.");
                return;
            }

            const eventData = eventSnap.data();
            if (eventData.flagged) {
                alert("This event has already been flagged.");
                setAlreadyFlagged(true);
            } else {
                await updateDoc(eventRef, { flagged: true });
                alert("Event has been flagged for review.");
                setAlreadyFlagged(true);
                onClose(); // Optional: close after flag
            }
        } catch (error) {
            console.error("Error flagging event:", error);
            alert("Something went wrong while flagging this event.");
        } finally {
            setFlagging(false);
        }
    };

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

                    {/* Flagging UI */}
                    {alreadyFlagged ? (
                        <p style={styles.flaggedNote}>
                            ⚠️ This event has already been flagged.
                        </p>
                    ) : (
                        <button
                            onClick={handleFlagEvent}
                            style={{
                                ...styles.flagButton,
                                opacity: flagging ? 0.6 : 1,
                                cursor: flagging ? "not-allowed" : "pointer"
                            }}
                            disabled={flagging}
                        >
                            {flagging ? "Flagging..." : "Report Event"}
                        </button>
                    )}
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
    },
    flagButton: {
        marginTop: "16px",
        padding: "10px 16px",
        backgroundColor: "#dc3545",
        color: "#fff",
        border: "none",
        borderRadius: "6px"
    },
    flaggedNote: {
        marginTop: "16px",
        padding: "10px",
        color: "#721c24",
        backgroundColor: "#f8d7da",
        border: "1px solid #f5c6cb",
        borderRadius: "6px"
    }
};

export default EventDetailOverlay;
