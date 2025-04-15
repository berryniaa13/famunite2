import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../context/firebaseConfig';
import SideNavbar from '../components/SideNavbar';
import famUniteLogo from '../assets/FAMUniteLogoNude.png';

function DashboardPage() {
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = 'Admin Dashboard';

        const storedRole = localStorage.getItem('userRole');
        if (!storedRole) {
            navigate('/login');
        } else {
            setRole(storedRole);
            if (storedRole === 'Admin') {
                fetchEvents();
            } else {
                setError('You are not authorized to access the admin dashboard.');
                setLoading(false);
            }
        }
    }, [navigate]);

    const fetchEvents = async () => {
        try {
            const eventsRef = collection(firestore, 'Event');
            const snapshot = await getDocs(eventsRef);
            const eventsList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setEvents(eventsList);
        } catch (error) {
            console.error('Error fetching events:', error);
            setError('Failed to load events.');
        } finally {
            setLoading(false);
        }
    };

    const updateEventStatus = async (eventId, newStatus) => {
        try {
            const eventDocRef = doc(firestore, 'Event', eventId);
            await updateDoc(eventDocRef, { status: newStatus });

            // Update local state
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event.id === eventId ? { ...event, status: newStatus } : event
                )
            );
        } catch (error) {
            console.error('Error updating event status:', error);
            setError('Failed to update event status.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={styles.container}>
            <SideNavbar />
            <div style={{ marginLeft: '250px' }}>
                <div style={styles.headerContainer}>
                    <img src={famUniteLogo} alt="FAMUnite Logo" style={styles.logo} />
                    <h2 style={styles.header}>Admin Dashboard</h2>
                </div>

                {error && <div style={styles.errorNotification}>{error}</div>}

                {role === 'Admin' ? (
                    <ul style={styles.list}>
                        {events.map((event) => {
                            const currentStatus = event.status || 'Active';
                            return (
                                <li key={event.id} style={styles.listItem}>
                                    <div style={{ flex: 1 }}>
                                        <h3>{event.title || 'Untitled Event'}</h3>
                                        <p>{event.description}</p>
                                        <p>
                                            <strong>Status:</strong> {currentStatus}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {currentStatus === 'Suspended' ? (
                                            <button
                                                onClick={() => updateEventStatus(event.id, 'Active')}
                                                style={{ ...styles.button, backgroundColor: '#28a745' }}
                                            >
                                                Unsuspend
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => updateEventStatus(event.id, 'Suspended')}
                                                style={{ ...styles.button, backgroundColor: '#dc3545' }}
                                            >
                                                Suspend
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p>You do not have access to the admin dashboard.</p>
                )}

                <button onClick={handleLogout} style={styles.logoutButton}>
                    Logout
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: { textAlign: 'center', padding: '20px', backgroundColor: '#F2EBE9' },
    headerContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '20px',
    },
    logo: { width: '50px', height: '50px' },
    header: { fontSize: '24px', fontWeight: 'bold' },
    list: { listStyle: 'none', padding: '0' },
    listItem: {
        padding: '10px',
        border: '1px solid #ddd',
        margin: '10px',
        borderRadius: '5px',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    button: {
        padding: '5px 10px',
        backgroundColor: '#12491B',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '5px',
    },
    logoutButton: {
        padding: '10px',
        backgroundColor: '#BF6319',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        marginTop: '10px',
        borderRadius: '5px',
    },
    errorNotification: {
        color: 'red',
        margin: '10px 0',
        fontSize: '14px',
        fontWeight: 'bold',
    },
};

export default DashboardPage;
