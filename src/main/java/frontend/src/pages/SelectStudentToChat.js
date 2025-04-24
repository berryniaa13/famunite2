import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../context/firebaseConfig";

function SelectStudentToChat() {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            const q = query(
                collection(firestore, "User"),
                where("role", "==", "Student")
            );
            const snapshot = await getDocs(q);
            const users = snapshot.docs
                .map(doc => ({ uid: doc.id, ...doc.data() }))
                .filter(user => user.uid !== currentUser.uid);

            setStudents(users);
        };

        fetchStudents();
    }, []);

    const filteredStudents = students.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startChat = (uid) => {
        navigate(`/messages/${uid}`);
    };

    return (
        <div style={styles.container}>
            <h2>Messages</h2>
            <input
                type="text"
                placeholder="Search students by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchBar}
            />
            <ul style={styles.list}>
                {filteredStudents.map(student => (
                    <li key={student.uid} style={styles.item}>
                        <div>
                            <p><strong>{student.name || "Unnamed Student"}</strong></p>
                            <p style={styles.subText}>{student.email}</p>
                        </div>
                        <button style={styles.button} onClick={() => startChat(student.uid)}>
                            Open Chat
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
        backgroundColor: "#12491B",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    }
};

export default SelectStudentToChat;
