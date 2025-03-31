import React, { useState, useEffect } from "react";
import SideNavbar from "../components/SideNavbar";
import famUniteLogo from "../assets/FAMUniteLogoNude.png";



function template() {


    return (
        <div style={styles.container}>
            <SideNavbar/>
            <div style={{marginLeft: "250px"}}>
                <div style={styles.headerContainer}>
                    <img src={famUniteLogo} alt="FAMUnite Logo" style={styles.logo} />
                    <h2 style={styles.header}>Insert Page Name</h2>



                </div>
            </div>
        </div>
    )
}

const styles = {
    container: {
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#F2EBE9"
    },
    searchBar: {
        padding: "8px",
        width: "90%",
        margin: "10px auto",
        display: "block",
        borderRadius: "8px"
    },
    list: {
        listStyle: "none",
        padding: "0"
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
    button: {
        padding: "8px 12px",
        backgroundColor: "#CDE0CA",
        fontSize: "12px",
        color: "black",
        border: "none",
        cursor: "pointer",
        borderRadius: "5px"
    },
    logoutButton: {
        padding: "10px",
        backgroundColor: "#BF6319",
        color: "white",
        border: "none",
        cursor: "pointer",
        borderRadius: "5px",
        marginTop: "10px"
    }
};

export default template;