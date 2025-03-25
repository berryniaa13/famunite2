import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../context/firebaseConfig';
import SideNavbar from "../components/SideNavbar";
import famUniteLogo from "../assets/FAMUniteLogoNude.png";


function DashboardPage() {
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole');
        if (!storedRole) {
            navigate('/login');
        } else {
            setRole(storedRole);
            if (storedRole === 'Admin') {
                fetchUsers();
            }
        }
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const usersRef = collection(firestore, 'User');
            const snapshot = await getDocs(usersRef);
            const usersList = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(user => user.role !== 'Admin');
            setUsers(usersList);
        } catch (error) {
            console.error("Error fetching users from Firestore:", error);
            setError("You do not have permission to access this data.");
        } finally {
            setLoading(false);
        }
    };

    const toggleActivation = async (userId) => {
        try {
            const user = users.find(u => u.id === userId);
            const newStatus = user.Status === "Active" ? "Inactive" : "Active";

            const userDocRef = doc(firestore, 'User', userId);
            await updateDoc(userDocRef, { Status: newStatus });

            const updatedUsers = users.map(u =>
                u.id === userId ? { ...u, Status: newStatus } : u
            );
            setUsers(updatedUsers);
            if (selectedUser?.id === userId) {
                setSelectedUser({ ...user, Status: newStatus });
            }
        } catch (err) {
            console.error("Failed to update user status:", err);
            setError("Failed to update user status.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading...</div>;

    return (
        <div style={styles.container}>
            <SideNavbar/>
            <div style={{marginLeft: "250px"}}>
            <div style={styles.headerContainer}>
                <img src={famUniteLogo} alt="FAMUnite Logo" style={styles.logo} />
                <h2 style={styles.header}> Admin Home </h2>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            {role === 'Admin' ? (
                <>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={handleSearch}
                        style={styles.searchBar}
                    />

                    <ul style={styles.list}>
                        {filteredUsers.map((user) => {
                            const isActive = user.Status === "Active";
                            return (
                                <li key={user.id} style={styles.listItem}>
                                    <div style={{ flex: 1 }}>
                                        <h3>{user.name || "Unnamed User"}</h3>
                                        <p>{user.email}</p>
                                    </div>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button
                                            onClick={() => handleViewDetails(user)}
                                            style={styles.button}
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => toggleActivation(user.id)}
                                            style={{
                                                ...styles.button,
                                                backgroundColor: isActive ? '#dc3545' : '#28a745'
                                            }}
                                        >
                                            {isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </>
            ) : (
                <p>You do not have access to the admin dashboard.</p>
            )}

            {selectedUser && (
                <div style={styles.detailsContainer}>
                    <h3>User Details</h3>
                    <p><strong>ID:</strong> {selectedUser.id}</p>
                    <p><strong>Name:</strong> {selectedUser.name || "No name provided"}</p>
                    <p><strong>Email:</strong> {selectedUser.email || "No email available"}</p>
                    <p><strong>Role:</strong> {selectedUser.role || "N/A"}</p>
                    <p><strong>Status:</strong> {selectedUser.Status || "Inactive"}</p>
                </div>
            )}

            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </div>
        </div>
    );
}

const styles = {
    container: { textAlign: "center", padding: "20px", backgroundColor: "#F2EBE9" },
    searchBar: { padding: "8px", width: "80%", margin: "10px auto", display: "block" },
    list: { listStyle: "none", padding: "0" },
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
    listItem: {
        padding: "10px", border: "1px solid #ddd", margin: "10px",
        borderRadius: "5px", backgroundColor: "#f9f9f9", display: "flex",
        justifyContent: "space-between", alignItems: "center"
    },
    button: {
        padding: "5px 10px",
        backgroundColor: "#12491B",
        color: "white",
        border: "none",
        cursor: "pointer",
        borderRadius: "5px"
    },
    detailsContainer: {
        marginTop: "20px",
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        backgroundColor: "#e9ecef"
    },
    logoutButton: {
        padding: "10px",
        backgroundColor: "#BF6319",
        color: "white",
        border: "none",
        cursor: "pointer",
        marginTop: "10px",
        borderRadius: "5px",
    },
    error: {
        color: "red",
        margin: "10px 0",
        fontSize: "14px"
    }
};

export default DashboardPage;



