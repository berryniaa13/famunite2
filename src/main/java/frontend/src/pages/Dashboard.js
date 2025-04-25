import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    addDoc,           // ← new
    serverTimestamp,  // ← new
    deleteDoc         // ← new
} from 'firebase/firestore';
import { firestore } from '../context/firebaseConfig';
import SideNavbar from "../components/SideNavbar";
import famUniteLogo from "../assets/FAMUniteLogoNude.png";

function DashboardPage() {
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [users, setUsers] = useState([]);
    const [announcements, setAnnouncements] = useState([]);         // ← new
    const [newAnnouncement, setNewAnnouncement] = useState('');     // ← new
    const [editingId, setEditingId] = useState(null);               // ← new
    const [editingText, setEditingText] = useState('');             // ← new
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole');
        if (!storedRole) {
            navigate('/login');
            return;
        }
        setRole(storedRole);

        if (storedRole === 'Admin') {
            fetchUsers();
        } else {
            setError('You are not authorized to access the admin dashboard.');
            setLoading(false);
        }

        fetchAnnouncements();  // ← new
    }, [navigate]);

    // ——— Fetch users (unchanged) ———
    const fetchUsers = async () => {
        try {
            const usersRef = collection(firestore, 'User');
            const snap = await getDocs(usersRef);
            const list = snap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(u => u.role !== 'Admin');
            setUsers(list);
        } catch (err) {
            console.error(err);
            setError("Failed to load users.");
        } finally {
            setLoading(false);
        }
    };

    // ——— Fetch announcements ———
    const fetchAnnouncements = async () => {
        try {
            const annRef = collection(firestore, 'Announcements');
            const snap = await getDocs(annRef);
            const list = snap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
            setAnnouncements(list);
        } catch (err) {
            console.error(err);
            setError("Failed to load announcements.");
        }
    };

    // ——— Create ———
    const handleCreateAnnouncement = async () => {
        if (!newAnnouncement.trim()) return;
        try {
            await addDoc(collection(firestore, 'Announcements'), {
                text: newAnnouncement.trim(),
                createdAt: serverTimestamp()
            });
            setNewAnnouncement('');
            fetchAnnouncements();
        } catch (err) {
            console.error(err);
            setError("Failed to post announcement.");
        }
    };

    // ——— Edit & Delete ———
    const handleEditClick = (id, text) => {
        setEditingId(id);
        setEditingText(text);
    };
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingText('');
    };
    const handleSaveEdit = async () => {
        if (!editingText.trim()) return;
        try {
            await updateDoc(doc(firestore, 'Announcements', editingId), {
                text: editingText.trim()
            });
            setEditingId(null);
            setEditingText('');
            fetchAnnouncements();
        } catch (err) {
            console.error(err);
            setError("Failed to update announcement.");
        }
    };
    const handleDeleteAnnouncement = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await deleteDoc(doc(firestore, 'Announcements', id));
            fetchAnnouncements();
        } catch (err) {
            console.error(err);
            setError("Failed to delete announcement.");
        }
    };
    // ————————————————————

    // ——— User management (unchanged) ———
    const updateUserStatus = async (userId, newStatus) => { /* … */ };
    const handleActivate   = id => updateUserStatus(id, "Active");
    const handleDeactivate = id => updateUserStatus(id, "Inactive");
    const handleBan        = (id, status) =>
        updateUserStatus(id, status === "Banned" ? "Active" : "Banned");
    const handleLogout = () => {
        localStorage.removeItem('userRole');
        navigate('/login');
    };
    const handleSearch = e => setSearchTerm(e.target.value);
    const handleViewDetails = u => setSelectedUser(u);
    const filteredUsers = users.filter(u =>
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email|| '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    // —————————————————————————

    if (loading) return <div>Loading...</div>;

    return (
        <div style={styles.container}>
            <SideNavbar />
            <div style={{ marginLeft: "250px" }}>
                <div style={styles.headerContainer}>
                    <img src={famUniteLogo} alt="Logo" style={styles.logo} />
                    <h2 style={styles.header}> Admin Home </h2>
                </div>

                {error && <div style={styles.errorNotification}>{error}</div>}

                {/* ——— Announcements List (all users) ——— */}
                <div style={styles.announcementsList}>
                    <h3>Announcements</h3>
                    {announcements.length ? announcements.map(a => (
                        <div key={a.id} style={styles.announcementItem}>
                            {editingId === a.id ? (
                                <>
                  <textarea
                      rows={2}
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                      style={styles.textarea}
                  />
                                    <button onClick={handleSaveEdit} style={styles.button}>Save</button>
                                    <button
                                        onClick={handleCancelEdit}
                                        style={{ ...styles.button, backgroundColor: '#6c757d', marginLeft: 8 }}
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span>{a.text}</span>
                                    {role === 'Admin' && (
                                        <span style={{ marginLeft: 10 }}>
                      <button
                          onClick={() => handleEditClick(a.id, a.text)}
                          style={styles.button}
                      >
                        Edit
                      </button>
                      <button
                          onClick={() => handleDeleteAnnouncement(a.id)}
                          style={{ ...styles.button, backgroundColor: '#dc3545', marginLeft: 4 }}
                      >
                        Delete
                      </button>
                    </span>
                                    )}
                                </>
                            )}
                        </div>
                    )) : (
                        <p>No announcements yet.</p>
                    )}
                </div>

                {/* ——— New Announcement Form (Admins only) ——— */}
                {role === 'Admin' && (
                    <div style={styles.announcementContainer}>
                        <h3>Post New Announcement</h3>
                        <textarea
                            rows={3}
                            placeholder="Your announcement…"
                            value={newAnnouncement}
                            onChange={e => setNewAnnouncement(e.target.value)}
                            style={styles.textarea}
                        />
                        <button
                            onClick={handleCreateAnnouncement}
                            style={{ ...styles.button, marginTop: 8 }}
                        >
                            Publish
                        </button>
                    </div>
                )}

                {/* ——— User-management UI (unchanged) ——— */}
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
                            {filteredUsers.map(u => {
                                const status = u.status || "Inactive";
                                return (
                                    <li key={u.id} style={styles.listItem}>
                                        <div style={{ flex: 1 }}>
                                            <h3>{u.name || "Unnamed User"}</h3>
                                            <p>{u.email}</p>
                                            <p><strong>Status:</strong> {status}</p>
                                        </div>
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <button onClick={() => handleViewDetails(u)} style={styles.button}>
                                                View Details
                                            </button>
                                            {status === "Active" && (
                                                <button
                                                    onClick={() => handleDeactivate(u.id)}
                                                    style={{ ...styles.button, backgroundColor: '#dc3545' }}
                                                >
                                                    Deactivate
                                                </button>
                                            )}
                                            {status === "Inactive" && (
                                                <button
                                                    onClick={() => handleActivate(u.id)}
                                                    style={{ ...styles.button, backgroundColor: '#28a745' }}
                                                >
                                                    Activate
                                                </button>
                                            )}
                                            {status !== "Banned" ? (
                                                <button
                                                    onClick={() => handleBan(u.id, status)}
                                                    style={{ ...styles.button, backgroundColor: '#6c757d' }}
                                                >
                                                    Ban
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleBan(u.id, status)}
                                                    style={{ ...styles.button, backgroundColor: '#28a745' }}
                                                >
                                                    Unban
                                                </button>
                                            )}
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
                        <p><strong>Status:</strong> {selectedUser.status || "Inactive"}</p>
                    </div>
                )}

                <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
            </div>
        </div>
    );
}

const styles = {
    container: { textAlign: "center", padding: 20, backgroundColor: "#F2EBE9" },
    headerContainer: {
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20
    },
    logo: { width: 50, height: 50 },
    header: { fontSize: 24, fontWeight: "bold" },
    errorNotification: { color: "red", margin: "10px 0", fontWeight: "bold" },

    announcementsList: {
        textAlign: "left", margin: "20px auto", width: "80%"
    },
    announcementItem: {
        padding: 10, borderBottom: "1px solid #ccc", display: "flex", alignItems: "center", justifyContent: "space-between"
    },
    announcementContainer: {
        margin: "20px auto", width: "80%", padding: 15,
        border: "1px solid #ddd", borderRadius: 5, backgroundColor: "#fff"
    },
    textarea: { width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" },

    searchBar: { padding: 8, width: "80%", margin: "10px auto", display: "block" },
    list: { listStyle: "none", padding: 0 },
    listItem: {
        padding: 10, border: "1px solid #ddd", margin: "10px",
        borderRadius: 5, backgroundColor: "#f9f9f9", display: "flex", alignItems: "center"
    },
    button: {
        padding: "5px 10px", backgroundColor: "#12491B",
        color: "white", border: "none", cursor: "pointer", borderRadius: 5
    },
    detailsContainer: {
        marginTop: 20, padding: 15, border: "1px solid #ddd",
        borderRadius: 5, backgroundColor: "#e9ecef", textAlign: "left", width: "80%", margin: "20px auto"
    },
    logoutButton: {
        padding: 10, backgroundColor: "#BF6319",
        color: "white", border: "none", cursor: "pointer",
        marginTop: 10, borderRadius: 5
    }
};

export default DashboardPage;
