import React, {useEffect, useState,} from "react";
import sampleEventImage from "../assets/sampleEventImage.jpg";
import {doc, updateDoc, getFirestore, collection, query, where, getDocs, deleteDoc} from "firebase/firestore";
import {firestore} from "../context/firebaseConfig";


const EventVerifyCard = ({ event, currentUserRole, onClose , organization}) => {
    const [comment, setComment] = useState("");
    const [verifyData, setVerifyData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editedEvent, setEditedEvent] = useState(event); // local editable copy
    const db = getFirestore();

    useEffect(() => {
        const retrieveVerifyData = async () => {
            try {
                const eventRef = doc(db, "Event", event.id);

                // Fetch EventRequest document matching this event
                const q = query(collection(db, "EventRequest"), where("event", "==", eventRef));
                const requestSnapshot = await getDocs(q);

                let requestData = {};
                if (!requestSnapshot.empty) {
                    const requestDoc = requestSnapshot.docs[0];
                    requestData = {
                        id: requestDoc.id,
                        ...requestDoc.data()
                    };
                } else {
                    console.log("No matching request found.");
                }

                // Fetch Registrations
                const regQuery = query(collection(db, "Registrations"), where("eventId", "==", event.id));
                const regSnapshot = await getDocs(regQuery);
                const registrations = regSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

                // Set both request + registrations into verifyData state
                setVerifyData(prev => ({
                    ...prev,
                    ...requestData,
                    registrations,
                }));

            } catch (error) {
                if (error.code === "unavailable") {
                    alert("You're offline. Connect to the internet to load verification data.");
                } else {
                    console.error("Error retrieving event request or registrations:", error);
                }
            }
        };

        if (event?.id) {
            retrieveVerifyData();
        }
    }, [event?.id, db]);


    const handleSubmit = async () => {
        try {
            if (!verifyData.id) {
                console.error("No verifyData ID found.");
                return;
            }
            // 1. Update current user's approval to "Approved"
            const updatedApprovals = verifyData.approvals.map((approval) => {
                if (approval.role === currentUserRole) {
                    return { ...approval, status: "Approved", comments: comment };
                }
                return approval;
            });
            // 2. Check if all approvals are now Approved
            const allApproved = updatedApprovals.every(
                (approval) => approval.status === "Approved"
            );
            // 3. Prepare fields to update
            const fieldsToUpdate = {
                approvals: updatedApprovals,
            };
            if (allApproved) {
                fieldsToUpdate.status = "Approved"; // Mark the event as approved
            }
            // 4. Update Firestore
            const requestRef = doc(db, "EventRequest", verifyData.id);
            await updateDoc(requestRef, fieldsToUpdate);
            console.log("Approval submitted!");
            alert(allApproved ? "All approvals complete! Event Approved!" : "Verification submitted!");
            onClose();
        } catch (error) {
            console.error("Error submitting approval:", error);
        }
    };

    const handleToggleSuspend = async () => {
        try {
            const eventRef = doc(db, "Event", event.id);
            const newStatus = event.status === "Suspended" ? "Active" : "Suspended";

            await updateDoc(eventRef, { status: newStatus });

            alert(`Event has been ${newStatus === "Suspended" ? "suspended" : "unsuspended"}.`);
            onClose(); // Optionally refresh or close
        } catch (error) {
            console.error("Error toggling event status:", error);
        }
    };

    const handleResolveFlag = async () => {
        try {
            const eventRef = doc(db, "Event", event.id);
            await updateDoc(eventRef, { flagged: false });
            alert("Event has been unflagged.");
            onClose(); // Refresh or close modal
        } catch (error) {
            console.error("Error resolving flagged content:", error);
        }
    };


    const handleDeny = async () => {
        try {
            if (!verifyData.id) {
                console.error("No verifyData ID found.");
                return;
            }

            // 1. Update current user's approval to "Denied"
            const updatedApprovals = verifyData.approvals.map((approval) => {
                if (approval.role === currentUserRole) {
                    return { ...approval, status: "Denied", comments: comment };
                }
                return approval;
            });

            // 2. Set event request status to Denied
            const fieldsToUpdate = {
                approvals: updatedApprovals,
                status: "Denied",
            };

            const requestRef = doc(db, "EventRequest", verifyData.id);
            await updateDoc(requestRef, fieldsToUpdate);

            console.log("Approval denied!");
            alert("Approval denied! Event has been denied.");
            onClose();
        } catch (error) {
            console.error("Error denying approval:", error);
        }
    };

    const handleEditEvent = async () => {
        try {
            const eventRef = doc(firestore, "Event", event.id);
            await updateDoc(eventRef, event);
        } catch (error) {
            console.error("Error updating event:", error);
        }
    };

    const handleDeleteEvent = async () => {
        try {
            const eventRef = doc(firestore, "Event", event.id);

            // Step 1: Find associated EventRequest
            const requestQuery = query(
                collection(firestore, "EventRequest"),
                where("event", "==", eventRef) // Firestore DocumentReference match
            );

            const requestSnapshot = await getDocs(requestQuery);
            if (!requestSnapshot.empty) {
                // Assuming one matching request per event
                const requestDoc = requestSnapshot.docs[0];
                await deleteDoc(requestDoc.ref);
                console.log("Associated EventRequest deleted.");
            } else {
                console.log("No EventRequest found for this event.");
            }

            // Step 2: Delete the event itself
            await deleteDoc(eventRef);
            console.log("Event deleted successfully.");

            onClose();
        } catch (error) {
            console.error("Error deleting event and request:", error);
        }
    };



    return (
        <div style={styles.overlay}>
            <div style={styles.card}>
                <button onClick={onClose} style={styles.closeBtn}>×</button>
                <div style={styles.scrollContainer}>
                    {event.flagged && (
                        <div style={styles.flagBanner}>
                            ⚠️ This event has been <strong>flagged for violating community guidelines</strong>.
                        </div>
                    )}
                    <div style={styles.outer}>
                        <div style={styles.imageContainer}>
                            <img
                                src={event.imageURL || sampleEventImage}
                                alt={event.title}
                                style={styles.image}
                            />
                        </div>
                        {isEditing ? (
                            <div style={styles.body}>
                                <h2 style={styles.title}>Edit Event</h2>
                                {['title', 'category', 'description', 'location'].map(field => (
                                    <>
                                        <label htmlFor={field} style={styles.text}>
                                            {field.charAt(0).toUpperCase() + field.slice(1)}
                                        </label>
                                        <input
                                            key={field}
                                            type="text"
                                            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                            value={editedEvent[field]}
                                            onChange={(e) => setEditedEvent({ ...editedEvent, [field]: e.target.value })}
                                            style={styles.textareaEdit}
                                        />
                                    </>
                                ))}
                                <label htmlFor={"Date"} style={styles.text}>
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={editedEvent.date}
                                    onChange={(e) => setEditedEvent({ ...editedEvent, date: e.target.value })}
                                    style={styles.textareaEdit}
                                />
                                <button onClick={async () => {
                                    try {
                                        const ref = doc(firestore, "Event", event.id);
                                        await updateDoc(ref, editedEvent);
                                        alert("Event updated!");
                                        setIsEditing(false);
                                        onClose(); // refresh parent
                                    } catch (err) {
                                        console.error("Update failed:", err);
                                    }
                                }} style={styles.submitBtn}>Save Changes</button>
                            </div>
                        ) : (
                            <div style={styles.body}>
                                <h2 style={styles.title}>{event.title}</h2>
                                <p><strong>Category:</strong> {event.category || "N/A"}</p>
                                <p><strong>Date:</strong> {event.date || "TBD"}</p>
                                <p><strong>Location:</strong> {event.location || "TBD"}</p>
                                <p><strong>Description:</strong> {event.description || "No description available."}</p>
                                <p><strong>Organization:</strong> {organization?.name || "No organization available."}</p>
                                <p><strong>Event Status:</strong> {verifyData.status || "No status available."}</p>
                                <p><strong>Total Registrations:</strong> {verifyData?.registrations?.length || 0}</p>
                                {verifyData?.registrations?.map((reg, i) => (
                                    <div key={i} style={{ fontSize: "12px", marginTop: "4px" }}>
                                        • {reg.userId} – {new Date(reg.timestamp?.toDate?.() || reg.timestamp).toLocaleString()}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={styles.approvals}>
                            <p className={"subHeader"}>Approvals Needed:</p>
                            {verifyData.approvals && verifyData.approvals.length > 0 ? (
                                <div style={styles.approvalsList}>
                                    {verifyData.approvals.map((approval, index) => {
                                        // Determine circle color based on approval status
                                        let circleColor = "#ccc"; // default gray
                                        if (approval.status === "Approved") circleColor = "#28a745"; // green
                                        else if (approval.status === "Pending Approval") circleColor = "#6c757d"; // gray
                                        else if (approval.status === "Denied") circleColor = "#dc3545"; // red

                                        return (
                                            <div key={index} style={styles.approvalItem}>
                                                <div style={{ ...styles.circle, backgroundColor: circleColor }}></div>
                                                <p style={styles.roleText}>{approval.role}</p>
                                                <p style={styles.statusText}>{approval.status}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p>No approvals found.</p>
                            )}
                        </div>
                        <div style={styles.comment}>
                            <p className={"subHeader"}>Comments:</p>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder={verifyData.comments || "Leave a note or reason for verification..."}
                                style={styles.textarea}
                            />
                        </div>
                    </div>
                </div>
                <div style={styles.footer}>
                    {["Admin", "Event Moderator"].includes(currentUserRole) ? (
                        <>
                            <button onClick={handleSubmit} style={styles.submitBtn}>Approve</button>
                            <button onClick={handleDeny} style={styles.denyBtn}>Deny</button>
                            <button
                                onClick={handleToggleSuspend}
                                style={{
                                    marginTop: "16px",
                                    padding: "10px 16px",
                                    backgroundColor: event.status === "Suspended" ? "#dc3545" : "#6c757d",
                                    color: "#fff",
                                    width: "150px",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                {event.status === "Suspended" ? "Unsuspend" : "Suspend"}
                            </button>
                        </>
                    ) : currentUserRole === "Organization Liaison" ? (
                        <>
                        <button onClick={() => setIsEditing(prev => !prev)} style={styles.denyBtn}>
                            {isEditing ? "Cancel Edit" : "Edit"}
                        </button>
                        {!isEditing && (
                            <button onClick={handleDeleteEvent} style={styles.deleteBtn}>
                                Delete
                            </button>)}
                        </>
                    ) : null}

                    {event.flagged && currentUserRole === "Event Moderator" && (
                        <button onClick={handleResolveFlag} style={styles.resolveBtn}>
                            Resolve Content
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
    outer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1.3fr',
        gridTemplateRows: 'auto auto',
        gap: '20px',
        padding: '20px',
    },
    imageContainer: {
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: '8px',
    },
    flagBanner: {
        backgroundColor: "#f8d7da",
        color: "#721c24",
        padding: "12px",
        border: "1px solid #f5c6cb",
        borderRadius: "6px",
        marginBottom: "16px",
        textAlign: "center",
        fontWeight: "500",
    },
    resolveBtn: {
        marginTop: "16px",
        padding: "10px 16px",
        backgroundColor: "#c82333", // bold red
        color: "#fff",
        width: "180px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    },
    image: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        borderRadius: '8px'
    },
    body: {
        textAlign: 'left',
        height: 'auto',
    },
    approvals: {
        padding: "0px",
    },
    comment: {
       padding: "0px",
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
    deleteBtn: {
        marginTop: "16px",
        padding: "10px 16px",
        backgroundColor: "#c82333",
        color: "#fff",
        width: "150px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
    },
    title: {
        marginTop: "0px",
        marginBottom: "16px",
        fontSize: "20px",
        fontWeight: "600",
        textAlign: "center"
    },
    text: {
        fontSize: "12px",
        fontWeight: "600",
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
    textareaEdit: {
        width: "100%",
        maxHeight: "80px",
        marginTop: "5px",
        marginBottom: "6px",
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
        width: "150px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    },
    denyBtn: {
        marginTop: "16px",
        padding: "10px 16px",
        backgroundColor: "#BF6319",
        color: "#fff",
        width: "150px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    },

    approvalsList: {
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        marginTop: "10px",
    },

    approvalItem: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        minWidth: "100px",
    },

    circle: {
        width: "20px",
        height: "20px",
        backgroundColor: "#12491B", // Dark green or any color you want
        borderRadius: "50%",
        marginBottom: "8px",
    },

    roleText: {
        fontWeight: "bold",
        fontSize: "14px",
        marginBottom: "4px",
        textAlign: "center",
    },

    statusText: {
        fontSize: "12px",
        color: "#666",
        textAlign: "center",
    },

    footer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
        marginTop: "16px"
    }


};

export default EventVerifyCard;
