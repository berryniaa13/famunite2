import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore'; // Firestore imports
import { firestore } from '../context/firebaseConfig';

function DashboardPage() {
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch user role from localStorage
    useEffect(() => {
        const storedRole = localStorage.getItem('userRole');

        if (!storedRole) {
            navigate('/login'); // Redirect to login if no role is found
        } else {
            setRole(storedRole);
            if (storedRole === 'Admin') {
                fetchUsers(); // Fetch users if the logged-in user is an admin
            }
        }
    }, [navigate]);

    // Fetch users from Firestore
    const fetchUsers = async () => {
        try {
            const usersRef = collection(firestore, 'User');
            const snapshot = await getDocs(usersRef);
            const usersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setUsers(usersList);
        } catch (error) {
            console.error("Error fetching users from Firestore:", error);
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div style={styles.container}>
            <h1>Admin Dashboard</h1>

            {role === 'Admin' && (
                <>
                    <h2>User Management</h2>
                    <button onClick={fetchUsers} style={styles.button}>Refresh User List</button>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </>
            )}

            <button onClick={handleLogout} style={styles.button}>Logout</button>
        </div>
    );
}

// Inline CSS styles
const styles = {
    container: {
        margin: '0 auto',
        width: '600px',
        textAlign: 'center',
        border: '1px solid #ddd',
        padding: '20px',
        borderRadius: '5px',
        marginTop: '50px',
    },
    button: {
        width: '100%',
        height: '40px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginBottom: '10px',
    },
    table: {
        width: '100%',
        marginTop: '20px',
        borderCollapse: 'collapse',
    },
    tableCell: {
        padding: '10px',
        border: '1px solid #ddd',
        color: 'black',
    },
    tableHeader: {
        backgroundColor: '#f2f2f2',
        color: 'black',
    },
};

export default DashboardPage;
