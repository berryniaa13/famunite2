import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import SideNavbar from "../components/SideNavbar";
import famUniteLogo from "../assets/FAMUniteLogoNude.png";

const db = getFirestore();
const auth = getAuth();

function Profile() {
    const [profile, setProfile] = useState({
        name: "",
        role: "",
        email: "",
        contact_info: ""
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const user = auth.currentUser;
            if (user) {
                const docRef = doc(db, "User", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfile(docSnap.data());
                }
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const user = auth.currentUser;
        if (user) {
            const docRef = doc(db, "User", user.uid);
            await updateDoc(docRef, profile);
            alert("Profile updated successfully!");
        }
    };

    if (loading) return <p>Loading profile...</p>;

    return (
        <div style={styles.container}>
            <SideNavbar />
            <div style={{ marginLeft: "250px" }}>
                <div style={styles.headerContainer}>
                    <img src={famUniteLogo} alt="FAMUnite Logo" style={styles.logo} />
                    <h2 style={styles.header}>Edit Profile</h2>
                </div>
                <div style={styles.formContainer}>
                    <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        placeholder="Name"
                        style={styles.input}
                    />
                    <select
                        name="role"
                        value={profile.role}
                        onChange={handleChange}
                        style={styles.input}
                    >
                        <option value="">Select Role</option>
                        <option value="Student">Student</option>
                        <option value="Organization Liaison">Organization Liaison</option>
                        <option value="Admin">Admin</option>
                        <option value="Event Moderator">Event Moderator</option>
                    </select>

                    <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                        placeholder="Email"
                        style={styles.input}
                    />
                    <input
                        type="text"
                        name="contact_info"
                        value={profile.contact_info}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        style={styles.input}
                    />
                    <button onClick={handleSave} style={styles.button}>Save</button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#F2EBE9",
        minHeight: "100vh"
    },
    headerContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
    formContainer: {
        maxWidth: "400px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    },
    input: {
        padding: "10px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        fontSize: "14px"
    },
    button: {
        padding: "10px",
        backgroundColor: "#CDE0CA",
        fontSize: "14px",
        color: "black",
        border: "none",
        cursor: "pointer",
        borderRadius: "5px",
        marginTop: "10px"
    }
};

export default Profile;
