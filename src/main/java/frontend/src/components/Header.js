import React from "react";
import famUniteLogo from "../assets/FAMUniteLogoNude.png";

const Header = ({ pageTitle }) => {
    return (
        <div style={styles.headerContainer}>
            <h2 style={styles.header}>{pageTitle}</h2>
            <img style={styles.image} src={famUniteLogo} alt="FAMUnite Logo" className="logoSmall" />
        </div>
    );
};

const styles = {
    headerContainer: {
        position: "relative",
        height: "75px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px",
    },
    header: {
        fontSize: "24px",
        fontWeight: "bold",
        margin: 0,
    },
    image: {
        position: "absolute",
        right: 0,
    }
};

export default Header;
