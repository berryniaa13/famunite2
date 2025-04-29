import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import SideNavbar from "../components/SideNavbar";
import Header from "../components/Header";
import famUniteLogo from "../assets/FAMUniteLogoNude.png";

const db = getFirestore();
const auth = getAuth();

function Profile() {
    const [profile, setProfile] = useState({
        name: "",
        role: "",
        email: "",
        contact_info: "",
        organizationName: ""
    });
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const user = auth.currentUser;
            if (user) {
                const docRef = doc(db, "User", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const userProfile = docSnap.data();
                    setProfile(userProfile);

                    //  If Organization Liaison, find organization where createdBy == user.uid
                    if (userProfile.role === "Organization Liaison") {
                        const orgQuery = query(
                            collection(db, "Organizations"),
                            where("createdBy", "==", user.uid)
                        );
                        const querySnapshot = await getDocs(orgQuery);
                        if (!querySnapshot.empty) {
                            const orgDoc = querySnapshot.docs[0];
                            setOrganization({ id: orgDoc.id, ...orgDoc.data() });

                            //  Update the organizationName inside the profile
                            setProfile(prev => ({
                                ...prev,
                                organizationName: orgDoc.data().name || ""
                            }));
                        }
                    }
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
            const userRef = doc(db, "User", user.uid);
            await updateDoc(userRef, profile);

            //  Update organization name too if the user is a Liaison
            if (profile.role === "Organization Liaison" && organization) {
                const orgRef = doc(db, "Organizations", organization.id);
                await updateDoc(orgRef, {
                    name: profile.organizationName
                });
            }

            alert("Profile updated successfully!");
        }
    };

    if (loading) return <p>Loading profile...</p>;

    return (
        <div style={styles.container}>
            <SideNavbar />
            <div style={{ marginLeft: "250px" }}>
                <Header pageTitle={"Edit Profile"} />
                {profile.role === "Organization Liaison" && (
                    <div style={styles.section}>
                        <label>
                            <strong>Organization Name:</strong>
                            <input
                                type="text"
                                name="organizationName"
                                value={profile.organizationName}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </label>
                    </div>
                )}
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
    },
    section: {
        padding: "20px",
    }
};

export default Profile;
