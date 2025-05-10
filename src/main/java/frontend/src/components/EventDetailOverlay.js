import React, { useState } from "react";
import sampleEventImage from "../assets/sampleEventImage.jpg";
import { doc, getDoc, updateDoc, getFirestore } from "firebase/firestore";
import EventReviewForm from "./EventReviewForm";
import EventReviewsList from "./EventReviewsList";

const EventDetailOverlay = ({ event, onClose, handleRegister, isRegistered }) => {
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
                <div style={styles.scrollContainer}>
                    <div style={styles.outer}>
                        <div style={styles.imageContainer}>
                            <img
                                src={event.imageURL || sampleEventImage}
                                alt={event.title}
                                style={styles.image}
                            />
                        </div>
                        <div style={styles.body}>
                            <h2 style={styles.title}>{event.title}</h2>
                            <p><strong>Category:</strong> {event.category || "N/A"}</p>
                            <p><strong>Date:</strong> {event.date || "TBD"}</p>
                            <p><strong>Location:</strong> {event.location || "TBD"}</p>
                            <p><strong>Description:</strong> {event.description || "No description available."}</p>
                            <p><strong>Organization:</strong> {event.organizationName || "No organization available."}</p>
                        </div>
                        <div style={styles.reviews}>
                            <p className={"subHeader"}>Reviews</p>
                            <EventReviewsList eventId={event.id}/>
                        </div>
                        <div style={styles.comment}>
                            <p className={"subHeader"}>Leave a Review:</p>
                            <EventReviewForm eventId={event.id}/>
                        </div>
                    </div>
                    <div style={styles.footer}>
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
        </div>
    );
};

const styles = {
    overlay: {
        position: "fixed",
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    card: {
        backgroundColor: "#fff",
        padding: "24px",
        borderRadius: "10px",
        width: "90%",
        maxWidth: "800px",       // wider card
        position: "relative",
        boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
        maxHeight: "90vh",       // support scroll
        overflow: "hidden"
    },
    scrollContainer: {
        overflowY: "auto",       // make content scrollable
        maxHeight: "65vh",       // control scroll height
        paddingRight: "10px"
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
    outer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1.3fr',
        gridTemplateRows: 'auto auto',
        gap: '20px',
        padding: '20px',
    },
    body: {
        textAlign: 'left',
        height: 'auto',
    },
    title: {
        marginTop: "0px",
        marginBottom: "16px",
        fontSize: "20px",
        fontWeight: "600",
        textAlign: "center"
    },
    image: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        borderRadius: '8px'
    },
    imageContainer: {
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: '8px',
    },
    flagButton: {
        marginTop: "16px",
        padding: "10px 16px",
        backgroundColor: "#dc3545",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        width: "180px",
    },
    registerBtn: {
        marginTop: "16px",
        padding: "10px 16px",
        backgroundColor: "#12491B",
        color: "#fff",
        width: "180px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    },
    flaggedNote: {
        marginTop: "16px",
        padding: "10px",
        color: "#721c24",
        backgroundColor: "#f8d7da",
        border: "none",
        borderRadius: "6px"
    },
    reviews: {
        padding: "0px",
    },
    comment: {
        padding: "0px",
    },
    footer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
        marginTop: "16px"
    }
};

export default EventDetailOverlay;
