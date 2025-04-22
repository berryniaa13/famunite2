import React from "react";

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {

    return (
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            style={styles.input}
            onFocus={(e) => e.target.style.borderColor = styles.focus.borderColor}
            onBlur={(e) => e.target.style.borderColor = styles.input.borderColor}
        />
    );
};

const styles = {
    input: {
        padding: "10px 14px",
        border: "2px solid #ccc",
        borderRadius: "8px",
        fontSize: "16px",
        outline: "none",
        transition: "border-color 0.3s ease",
        width: "100%",
        maxWidth: "600px",
    },
    focus: {
        borderColor: "#4CAF50",
    }
};

export default SearchBar;
