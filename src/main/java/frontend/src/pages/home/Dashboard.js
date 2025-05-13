import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    addDoc,           // ← new
    serverTimestamp,  // ← new
    deleteDoc, orderBy, query, where         // ← new
} from 'firebase/firestore';
import {auth, firestore} from '../../context/firebaseConfig';
import SideNavbar from "../../components/SideNavbar";
import famUniteLogo from "../../assets/FAMUniteLogoNude.png";
import Header from "../../components/Header";
import EventCard from "../../components/EventCard";
import AnnouncementCard from "../../components/AnnouncementCard";
import AnnouncementsList from "../../components/AnnouncementsList";

function DashboardPage() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [role, setRole] = useState(null);
    const [users, setUsers] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [newAnnouncement, setNewAnnouncement] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState(null);
    const [approvalEvents, setApprovalEvents] = useState([]);

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

        fetchAnnouncements();
        fetchApprovalEvents();
    }, [navigate]);

    // ——— Fetch users  ———
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

    const fetchApprovalEvents = async () => {
        try {
            const eventsRef = collection(firestore, "Event");
            const q = query(eventsRef, orderBy("date", "asc"));
            const snapshot = await getDocs(q);
            const unapproved = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(event => event.status === "Pending");
            // Step 2: Get all EventRequests
            const requestsRef = collection(firestore, "EventRequest");
            const requestsSnap = await getDocs(requestsRef);

            // Step 3: Match EventRequests where eventId is in the pending events
            // and the approval includes Event Moderator with status "Pending"
            const filteredEvents = unapproved.filter(event => {
                const correspondingRequest = requestsSnap.docs.find(req =>
                    req.data().event?.id === event.id &&
                    req.data().approvals?.some(
                        approval =>
                            approval.role === "Admin" &&
                            approval.status === "Pending Approval"
                    )
                );
                return !!correspondingRequest;
            });
            setApprovalEvents(filteredEvents);
        } catch (error) {
            console.error("Error fetching approval events:", error);
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
            const user = auth.currentUser;
            await addDoc(collection(firestore, 'Announcements'), {
                text: newAnnouncement.trim(),
                postedAt: serverTimestamp(),
                postedBy: user.uid

            });
            setNewAnnouncement('');
            fetchAnnouncements();
        } catch (err) {
            console.error(err);
            setError("Failed to post announcement.");
        }
    };


    // ——— User management ———
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


    if (loading) return <div>Loading...</div>;

    return (
        <div className={"container"}>
            <SideNavbar />
            <div style={{ marginLeft: "250px" }}>
                <Header pageTitle="Admin Home" />
                {error && <div style={styles.errorNotification}>{error}</div>}
                <div className={"dashboard-container"}>
                    <div className={"left-column"}>
                        <h3 className={"subHeader"}>Approval Needed</h3>
                        <div className={"horizontalContainer"}>
                            <ul className={"horizontalList"}>
                                {approvalEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        onDone={fetchApprovalEvents}
                                    />
                                ))}

                            </ul>
                        </div>

                        {/* ——— User-management UI (unchanged) ——— */}
                        {role === 'Admin' ? (
                            <>
                                <h3 className={"subHeader"}>Users</h3>
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
                    </div>
                    <div className={"right-column"}>
                        <h3 className={"subHeader"}>Announcements</h3>
                            {/* ——— Announcements List (all users) ——— */}
                            <AnnouncementsList/>

                            {/* ——— New Announcement Form (Admins only) ——— */}
                            {role === 'Admin' && (
                                <div>
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

                        <h3 className={"subHeader"}>Messages</h3>
                    </div>
                </div>
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
        padding: "5px 10px", backgroundColor: "var(--primary-green)",
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
