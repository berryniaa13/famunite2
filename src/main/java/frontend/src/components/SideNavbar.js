import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, firestore } from "../context/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import famUniteLogo from "../assets/FAMUniteLogoGreen.png";

const SideNavbar = () => {
    const [role, setRole] = useState("");

    useEffect(() => {
        const fetchUserRole = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(firestore, "User", user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setRole(data.role);
                }
            }
        };

        fetchUserRole();
    }, []);

    const getDashboardRoute = () => {
        switch (role) {
            case "Admin":
                return "/admin-dashboard";
            case "Student":
                return "/student-dashboard";
            case "Organization Liaison":
                return "/organization-liason-dashboard";
            case "Event Moderator":
                return "/event-moderator-dashboard";
            default:
                return "/login";
        }
    };
    const getMessagesRoute = () => {
        switch (role) {
            case "Organization Liaison":
                return "/chat-select-student";
            default:
                return "/chat-select";
        }
    };


    return (
        <div style={styles.sidebar}>
            <div style={styles.logoContainer}>
                <img src={famUniteLogo} alt="FAMUnite Logo" style={styles.logo} />
            </div>

            <nav style={styles.nav}>
                <Link to={getDashboardRoute()} style={styles.navLink}>Dashboard</Link>
                <Link to="/events" style={styles.navLink}>Events</Link>
                <Link to="/profile" style={styles.navLink}>Profile</Link>
                <Link to={getMessagesRoute()} style={styles.navLink}>Messages</Link>
                <Link to="/login" style={styles.logout}>Logout</Link>
            </nav>
        </div>
    );
};


// ✅ Styles for the sidebar
const styles = {
    sidebar: {
        width: "250px",
        height: "100vh",
        backgroundColor: "#12491B",
        color: "white",
        position: "fixed",
        top: "0",
        left: "0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "20px",
    },
    logoContainer: {
        marginBottom: "20px",
    },
    logo: {
        width: "80px",
        height: "80px",
    },
    nav: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        alignItems: "center",
    },
    navLink: {
        color: "white",
        textDecoration: "none",
        padding: "15px",
        width: "100%",
        textAlign: "center",
        transition: "background 0.3s",
    },
    logout: {
        marginTop: "auto",
        color: "white",
        textDecoration: "none",
        padding: "15px",
        width: "100%",
        textAlign: "center",
        backgroundColor: "#BF6319",
        fontWeight: "bold",
        transition: "background 0.3s",
    }
};

export default SideNavbar;
