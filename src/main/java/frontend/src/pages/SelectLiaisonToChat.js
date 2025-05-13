import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../context/firebaseConfig";

function SelectLiaisonToChat() {
    const [liaisons, setLiaisons] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLiaisons = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            const q = query(
                collection(firestore, "User"),
                where("role", "==", "Organization Liaison")
            );
            const snapshot = await getDocs(q);
            const users = snapshot.docs
                .map(doc => ({ uid: doc.id, ...doc.data() }))
                .filter(user => user.uid !== currentUser.uid);

            setLiaisons(users);
        };

        fetchLiaisons();
    }, []);

    const filteredLiaisons = liaisons.filter(liaison =>
        liaison.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        liaison.organizationName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startChat = (uid) => {
        navigate(`/messages/${uid}`);
    };

    return (
        <div style={styles.container}>
            <h2>Message an Organization Liaison</h2>
            <input
                type="text"
                placeholder="Search by name or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchBar}
            />
            <ul style={styles.list}>
                {filteredLiaisons.map(liaison => (
                    <li key={liaison.uid} style={styles.item}>
                        <div>
                            <p><strong>{liaison.name || "Unnamed Liaison"}</strong></p>
                            <p style={styles.subText}>{liaison.organizationName || "No Organization Listed"}</p>
                        </div>
                        <button style={styles.button} onClick={() => startChat(liaison.uid)}>
                            Message
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const styles = {
    container: {
        padding: "30px",
        textAlign: "center"
    },
    searchBar: {
        padding: "10px",
        width: "80%",
        maxWidth: "400px",
        margin: "20px auto",
        borderRadius: "5px",
        border: "1px solid #ccc"
    },
    list: {
        listStyle: "none",
        padding: 0,
        marginTop: "20px"
    },
    item: {
        marginBottom: "10px",
        padding: "15px",
        background: "#f5f5f5",
        borderRadius: "8px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        maxWidth: "500px",
        margin: "10px auto"
    },
    subText: {
        fontSize: "12px",
        color: "#777",
        marginTop: "4px"
    },
    button: {
        padding: "6px 12px",
        backgroundColor: "var(--primary-green)",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    }
};

export default SelectLiaisonToChat;
