import React from "react";
import famUniteLogo from "../assets/FAMUniteLogoNude.png";

const Header = ({ pageTitle }) => {
    return (
        <div style={styles.headerContainer}>
            <img src={famUniteLogo} alt="FAMUnite Logo" className="logoSmall" />
            <h2 style={styles.header}>{pageTitle}</h2>
        </div>
    );
};

const styles = {
    headerContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        marginBottom: "20px"
    },
    header: {
        fontSize: "24px",
        fontWeight: "bold",
    }
};

export default Header;
