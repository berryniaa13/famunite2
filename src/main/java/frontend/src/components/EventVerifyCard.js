import React, {useEffect, useState,} from "react";
import sampleEventImage from "../assets/sampleEventImage.jpg";
import { doc, updateDoc, getFirestore, collection, query, where, getDocs } from "firebase/firestore";


const EventVerifyCard = ({ event, currentUserRole, onClose }) => {
    const [comment, setComment] = useState("");
    const [verifyData, setVerifyData] = useState({});
    const db = getFirestore();

    useEffect(() => {
        const retrieveVerifyData = async () => {
            try {
                // Build document reference for the event
                const eventRef = doc(db, "Event", event.id); // 👈 correct way

                const q = query(
                    collection(db, "EventRequest"),
                    where("event", "==", eventRef) // 👈 match using DocumentReference
                );

                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    setVerifyData({ id: doc.id, ...doc.data() });
                } else {
                    console.log("No matching request found.");
                }
            } catch (error) {
                console.error("Error fetching verifyData:", error);
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
                fieldsToUpdate.status = "Approved"; // ✅ Mark the event as approved
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
                            {verifyData ? (
                                    <>
                                        <p><strong>Submitted By:</strong> {event.createdBy || "N/A"}</p>
                                        <p><strong>Role:</strong> {verifyData.role || "N/A"}</p>
                                        <p><strong>Status:</strong> {verifyData.status || "Pending"}</p>
                                    </>
                                ) : (
                                    <p>Loading request info...</p>
                                )}
                        </div>
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
                    <button onClick={handleSubmit} style={styles.submitBtn}>Approve</button>
                    <button onClick={handleDeny} style={styles.denyBtn}>Deny</button>
                    <button
                        onClick={handleToggleSuspend}
                        style={{
                            marginTop: "16px",
                            padding: "10px 16px",
                            backgroundColor: event.status === "Suspended" ? "#dc3545" : "#6c757d", // 🔴 Red if suspended, Gray if active
                            color: "#fff",
                            width: "150px",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                        }}
                    >
                        {event.status === "Suspended" ? "Unsuspend" : "Suspend"}
                    </button>


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
    title: {
        marginTop: "0px",
        marginBottom: "16px",
        fontSize: "20px",
        fontWeight: "600",
        textAlign: "center"
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
