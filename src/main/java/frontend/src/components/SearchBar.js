import React from "react";

const SearchBar = ({ searchTerm, onSearchTermChange, selectedOrganization, onOrganizationChange, selectedCategory, onCategoryChange, organizationOptions, categoryOptions }) => {

    const handleReset = () => {
        onSearchTermChange("");
        onOrganizationChange("");
        onCategoryChange("");
    };

    return (
        <div style={styles.wrapper}>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                placeholder="Search events..."
                style={styles.input}
            />
            <select
                value={selectedOrganization}
                onChange={(e) => onOrganizationChange(e.target.value)}
                style={styles.select}
            >
                <option value="">All Organizations</option>
                {organizationOptions.map((org, i) => (
                    <option key={i} value={org.id}>{org.name}</option>
                ))}
            </select>
            <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                style={styles.select}
            >
                <option value="">All Categories</option>
                {categoryOptions.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                ))}
            </select>
            <button onClick={handleReset} style={styles.resetButton}>
                Reset Filters
            </button>
        </div>
    );
};

const styles = {
    wrapper: {
        display: "flex",
        gap: "10px",
        margin: "10px 0",
        flexWrap: "wrap"
    },
    input: {
        padding: "8px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        flex: "1"
    },
    select: {
        padding: "8px",
        borderRadius: "6px",
        border: "1px solid #ccc"
    },
    resetButton: {
        padding: "8px 12px",
        backgroundColor: "#dc3545",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    }
};

export default SearchBar;
