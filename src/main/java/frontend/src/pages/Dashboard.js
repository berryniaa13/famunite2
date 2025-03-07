// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { collection, getDocs } from 'firebase/firestore';
// import { firestore } from '../context/firebaseConfig';
//
// function DashboardPage() {
//     const navigate = useNavigate();
//     const [role, setRole] = useState(null); // Stores user role (admin, user, etc.)
//     const [users, setUsers] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedUser, setSelectedUser] = useState(null);
//     const [error, setError] = useState(null); // For permission errors
//
//     useEffect(() => {
//         const storedRole = localStorage.getItem('userRole');
//
//         if (!storedRole) {
//             navigate('/login');
//         } else {
//             setRole(storedRole);
//             if (storedRole === 'Admin') {
//                 fetchUsers();
//             }
//         }
//     }, [navigate]);
//
//     const fetchUsers = async () => {
//         try {
//             const usersRef = collection(firestore, 'User');
//             const snapshot = await getDocs(usersRef);
//             const usersList = snapshot.docs
//                 .map(doc => ({
//                     id: doc.id,
//                     ...doc.data()
//                 }))
//                 .filter(user => user.role !== 'Admin'); // Exclude admins
//
//             setUsers(usersList);
//         } catch (error) {
//             console.error("Error fetching users from Firestore:", error);
//             setError("You do not have permission to access this data.");
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     const handleLogout = () => {
//         localStorage.removeItem('userRole');
//         navigate('/login');
//     };
//
//     const handleSearch = (e) => {
//         setSearchTerm(e.target.value);
//     };
//
//     const handleViewDetails = (user) => {
//         setSelectedUser(user);
//     };
//
//     const filteredUsers = users.filter(user =>
//         user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         user.email?.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//
//     if (loading) {
//         return <div>Loading...</div>;
//     }
//
//     return (
//         <div style={styles.container}>
//             <h1>Admin Dashboard</h1>
//
//             {error && <div style={styles.error}>{error}</div>}
//
//             {role === 'Admin' ? (
//                 <>
//                     <input
//                         type="text"
//                         placeholder="Search users..."
//                         value={searchTerm}
//                         onChange={handleSearch}
//                         style={styles.searchBar}
//                     />
//
//                     <ul style={styles.list}>
//                         {filteredUsers.map((user) => (
//                             <li key={user.id} style={styles.listItem}>
//                                 <h3>{user.name}</h3>
//                                 <button onClick={() => handleViewDetails(user)} style={styles.button}>
//                                     View Details
//                                 </button>
//                             </li>
//                         ))}
//                     </ul>
//                 </>
//             ) : (
//                 <p>You do not have access to the admin dashboard.</p>
//             )}
//
//             {selectedUser && (
//                 <div style={styles.detailsContainer}>
//                     <h3>User Details</h3>
//                     <p><strong>ID:</strong> {selectedUser.id}</p>
//                     <p><strong>Name:</strong> {selectedUser.name || "No name provided"}</p>
//                     <p><strong>Email:</strong> {selectedUser.email || "No email available"}</p>
//                     <p><strong>Role:</strong> {selectedUser.role || "N/A"}</p>
//                 </div>
//             )}
//
//             <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
//         </div>
//     );
// }
//
// // Inline styles for layout
// const styles = {
//     container: { textAlign: "center", padding: "20px" },
//     searchBar: { padding: "8px", width: "80%", margin: "10px auto", display: "block" },
//     list: { listStyle: "none", padding: "0" },
//     listItem: {
//         padding: "10px", border: "1px solid #ddd", margin: "10px",
//         borderRadius: "5px", backgroundColor: "#f9f9f9", display: "flex",
//         justifyContent: "space-between", alignItems: "center"
//     },
//     button: { padding: "5px 10px", backgroundColor: "#28a745", color: "white", border: "none", cursor: "pointer", borderRadius: "5px" },
//     detailsContainer: { marginTop: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "5px", backgroundColor: "#e9ecef" },
//     logoutButton: { padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer", marginTop: "10px" },
//     error: { color: "red", margin: "10px 0", fontSize: "14px" }, // Error message style
// };
//
// export default DashboardPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
    const navigate = useNavigate();
    const [role, setRole] = useState('Admin');  // You can change this based on the logged-in user role
    const [users, setUsers] = useState([
        { id: '1', name: 'Gerald Green', email: 'student@example.com', role: ['Student'] },
        { id: '2', name: 'Pierre Jones', email: 'pierre@gmail.com', role: ['Organization Liaison'] },
        { id: '3', name: 'John Doe', email: 'john.doe@example.com', role: ['Event Moderator'] },
        { id: '4', name: 'Robert Beautelus', email: 'rob@gmail.com', role: ['Student'] },
        { id: '5', name: 'Jewels Inc.', email: 'jewels@gmail.com', role: ['Organization']}
    ]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState(null); // For permission errors

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        navigate('/');
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

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div style={styles.container}>
            <h1>Admin Dashboard</h1>

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
                        {filteredUsers.map((user) => (
                            <li key={user.id} style={styles.listItem}>
                                <h3>{user.name}</h3>
                                <p>{user.email}</p>
                                <button onClick={() => handleViewDetails(user)} style={styles.button}>
                                    View Details
                                </button>
                            </li>
                        ))}
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
                    <p><strong>Role:</strong> {selectedUser.role ? selectedUser.role.join(', ') : "N/A"}</p>
                </div>
            )}

            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </div>
    );
}

// Inline styles for layout
const styles = {
    container: { textAlign: "center", padding: "20px" },
    searchBar: { padding: "8px", width: "80%", margin: "10px auto", display: "block" },
    list: { listStyle: "none", padding: "0" },
    listItem: {
        padding: "10px", border: "1px solid #ddd", margin: "10px",
        borderRadius: "5px", backgroundColor: "#f9f9f9", display: "flex",
        justifyContent: "space-between", alignItems: "center"
    },
    button: { padding: "5px 10px", backgroundColor: "#28a745", color: "white", border: "none", cursor: "pointer", borderRadius: "5px" },
    detailsContainer: { marginTop: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "5px", backgroundColor: "#e9ecef" },
    logoutButton: { padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer", marginTop: "10px" },
    error: { color: "red", margin: "10px 0", fontSize: "14px" }, // Error message style
};

export default DashboardPage;




