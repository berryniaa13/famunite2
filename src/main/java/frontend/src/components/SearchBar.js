import React from "react";

const SearchBar = ({ value, onChange, placeholder = "Search events..." }) => {

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
        outline: "none",
        transition: "border-color 0.3s ease",
        padding: "8px",
        width: "90%",
        marginBottom: "20px",
        borderRadius: "8px",
        border: "1px solid #ccc"
    },
    focus: {
        borderColor: "#4CAF50",
    }
};

export default SearchBar;
