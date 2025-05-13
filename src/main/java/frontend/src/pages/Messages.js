import React, { useState, useEffect, useRef } from "react";
import SideNavbar from "../components/SideNavbar";
import famUniteLogo from "../assets/FAMUniteLogoNude.png";
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';
import { auth, firestore } from '../context/firebaseConfig';
import { useParams } from "react-router-dom";

function Messages() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const { receiver_id } = useParams();
    const bottomRef = useRef(null);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user || !receiver_id) return;

        const q = query(
            collection(firestore, "Messages"),
            where("chatParticipants", "array-contains", user.uid),
            orderBy("created_at", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(msg => msg.chatParticipants.includes(receiver_id));
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [receiver_id]);


    const sendMessage = async () => {
        const user = auth.currentUser;
        if (!user || !newMessage.trim()) return;

        await addDoc(collection(firestore, "Messages"), {
            sender_id: user.uid,
            receiver_id: receiver_id,
            chatParticipants: [user.uid, receiver_id],
            content: newMessage.trim(),
            created_at: serverTimestamp()
        });

        setNewMessage("");
    };

    return (
        <div style={styles.container}>
            <SideNavbar />
            <div style={{ marginLeft: "250px", padding: "20px" }}>
                <div style={styles.headerContainer}>
                    <img src={famUniteLogo} alt="FAMUnite Logo" style={styles.logo} />
                    <h2 style={styles.header}>Messages</h2>
                </div>
                <div style={styles.chatBox}>
                    <div style={styles.messageContainer}>
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                style={{
                                    backgroundColor: msg.sender_id === auth.currentUser.uid ? "#DCF8C6" : "#FFFFFF",
                                    alignSelf: msg.sender_id === auth.currentUser.uid ? "flex-end" : "flex-start",
                                    padding: "10px 15px",
                                    margin: "5px 0",
                                    borderRadius: "15px",
                                    maxWidth: "75%",
                                    wordBreak: "break-word"
                                }}
                            >
                                <strong>{msg.sender_id === auth.currentUser.uid ? "Me" : "Them"}</strong>
                                <p style={{ margin: "5px 0 0" }}>{msg.content}</p>
                            </div>
                        ))}
                        <div ref={bottomRef}></div>
                    </div>
                    <div style={styles.inputArea}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            style={styles.input}
                        />
                        <button onClick={sendMessage} style={styles.button}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: "#F2EBE9",
        minHeight: "100vh",
        display: "flex"
    },
    headerContainer: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "20px"
    },
    logo: {
        width: "50px",
        height: "50px",
    },
    header: {
        fontSize: "24px",
        fontWeight: "bold",
    },
    chatBox: {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
        maxWidth: "600px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column"
    },
    messageContainer: {
        maxHeight: "400px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        marginBottom: "15px",
        padding: "10px",
        backgroundColor: "#f9f9f9",
        borderRadius: "5px",
        border: "1px solid #ccc"
    },
    inputArea: {
        display: "flex",
        gap: "10px",
        alignItems: "center"
    },
    input: {
        flex: 1,
        padding: "10px",
        borderRadius: "5px",
        border: "1px solid #ccc"
    },
    button: {
        padding: "10px 20px",
        backgroundColor: "var(--primary-green)",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    }
};

export default Messages;