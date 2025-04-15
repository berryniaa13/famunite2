/*
import React from "react";
import { Link } from "react-router-dom";
import famUniteLogo from "../assets/FAMUniteLogoGreen.png"; // ✅ Import logo

const SideNavbar = () => {
    return (
        <div style={styles.sidebar}>

            <div style={styles.logoContainer}>
                <img src={famUniteLogo} alt="FAMUnite Logo" style={styles.logo} />
            </div>


            <nav style={styles.nav}>
                <Link to="/student-dashboard" style={styles.navLink}>Dashboard</Link>
                <Link to="/events" style={styles.navLink}>Events</Link>
                <Link to="/profile" style={styles.navLink}>Profile</Link>
                <Link to="/messages" style={styles.navLink}>Messages</Link>
                <Link to="/login" style={styles.logout}>Logout</Link>
            </nav>
        </div>
    );
};


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
*/
import React from "react";
import { Link } from "react-router-dom";
import famUniteLogo from "../assets/FAMUniteLogoGreen.png";

const SideNavbar = () => {
    const userRole = localStorage.getItem("userRole");

    return (
        <div style={styles.sidebar}>
            {/* ✅ Logo at the top */}
            <div style={styles.logoContainer}>
                <img src={famUniteLogo} alt="FAMUnite Logo" style={styles.logo} />
            </div>

            {/* ✅ Navigation Links */}
            <nav style={styles.nav}>
                {userRole === "Admin" && (
                    <>
                        <Link to="/admin-dashboard" style={styles.navLink}>Admin Home</Link>
                        <Link to="/events" style={styles.navLink}>Events</Link>
                        <Link to="/profile" style={styles.navLink}>Profile</Link>
                    </>
                )}

                {/* Optional: Student/Other roles */}
                {userRole !== "Admin" && (
                    <>
                        <Link to="/student-dashboard" style={styles.navLink}>Dashboard</Link>
                        <Link to="/events" style={styles.navLink}>Events</Link>
                        <Link to="/profile" style={styles.navLink}>Profile</Link>
                        <Link to="/messages" style={styles.navLink}>Messages</Link>
                    </>
                )}

                <Link to="/login" style={styles.logout}>Logout</Link>
            </nav>
        </div>
    );
};

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

