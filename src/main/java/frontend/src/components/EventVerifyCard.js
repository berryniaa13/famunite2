import React, { useState } from "react";

const EventVerifyCard = ({ event, onClose }) => {
    const [comment, setComment] = useState("");

    const handleSubmit = () => {
        console.log("Moderator comment submitted:", comment);
        alert("Verification submitted!");
        onClose();
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.card}>
                <button onClick={onClose} style={styles.closeBtn}>×</button>
                <h2 style={styles.title}>Review Event for Verification</h2>
                <p><strong>Title:</strong> {event.title}</p>
                <p><strong>Category:</strong> {event.category}</p>
                <p><strong>Date:</strong> {event.date}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Description:</strong> {event.description || "No description provided."}</p>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Leave a note or reason for verification..."
                    style={styles.textarea}
                />
                <button onClick={handleSubmit} style={styles.submitBtn}>Submit Verification</button>
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
        maxWidth: "500px",
        position: "relative",
        boxShadow: "0 6px 20px rgba(0,0,0,0.2)"
    },
    closeBtn: {
        position: "absolute",
        top: "10px",
        right: "16px",
        fontSize: "24px",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#888"
    },
    title: {
        marginBottom: "16px",
        fontSize: "20px",
        fontWeight: "600"
    },
    textarea: {
        width: "100%",
        minHeight: "80px",
        marginTop: "12px",
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        fontSize: "14px"
    },
    submitBtn: {
        marginTop: "16px",
        padding: "10px 16px",
        backgroundColor: "#12491B",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    }
};

export default EventVerifyCard;
