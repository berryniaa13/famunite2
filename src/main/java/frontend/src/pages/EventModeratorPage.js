import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
    collection,
    getDocs,
    updateDoc,
    doc
} from "firebase/firestore";
import { auth, firestore } from '../context/firebaseConfig';
import SideNavbar from "../components/SideNavbar";
import famUniteLogo from "../assets/FAMUniteLogoNude.png";
import EventCardRectangular from "../components/EventCardRectangular";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import EventCard from "../components/EventCard";
import AnnouncementCard from "../components/AnnouncementCard";


function EventModeratorPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [flaggedEvents, setFlaggedEvents] = useState([]);
    const [approvalEvents, setApprovalEvents] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [error, setError] = useState(null);


    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
        fetchFlaggedEvents();
        fetchApprovalEvents();
        fetchAnnouncements();
    }, []);

    const fetchEvents = async () => {
        try {
            const eventsRef = collection(firestore, "Event");
            const snapshot = await getDocs(eventsRef);
            const eventsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEvents(eventsList);
            setFilteredEvents(eventsList);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const fetchFlaggedEvents = async () => {
        try {
            const eventsRef = collection(firestore, "Event");
            const snapshot = await getDocs(eventsRef);
            const flagged = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(event => event.flagged === true);
            setFlaggedEvents(flagged);
        } catch (error) {
            console.error("Error fetching flagged events:", error);
        }
    };
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

    const fetchApprovalEvents = async () => {
        try {
            const eventsRef = collection(firestore, "Event");
            const snapshot = await getDocs(eventsRef);
            const unapproved = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(event => event.verified === false);
            setApprovalEvents(unapproved);
        } catch (error) {
            console.error("Error fetching approval events:", error);
        }
    };




    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = events.filter(event =>
            event.title?.toLowerCase().includes(term)
        );
        setFilteredEvents(filtered);
    };

    const handleVerifyToggle = async (eventId, currentStatus) => {
        try {
            const eventRef = doc(firestore, "Event", eventId);
            await updateDoc(eventRef, {
                verified: !currentStatus
            });

            const updated = events.map(event =>
                event.id === eventId ? { ...event, verified: !currentStatus } : event
            );
            setEvents(updated);
            setFilteredEvents(updated);
        } catch (error) {
            console.error("Error updating verification status:", error);
        }
    };


    return (
        <div className={"container"}>
            <SideNavbar />
            <div style={{ marginLeft: "250px" }}>
                <Header pageTitle="Home" />
                <SearchBar
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Enter event title..."
                />
                <div className={"dashboard-container"}>
                    <div className={"left-column"}>
                        <h3 className={"subHeader"}>Resolve Flagged Content</h3>
                        <div className={"horizontalContainer"}>
                            <ul className={"horizontalList"}>
                                {flaggedEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                    />
                                ))}

                            </ul>
                        </div>
                        <h3 className={"subHeader"}>Approval Needed</h3>
                        <div className={"horizontalContainer"}>
                            <ul className={"horizontalList"}>
                                {approvalEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                    />
                                ))}

                            </ul>
                        </div>

                    </div>

                    <div className={"right-column"}>
                        <h3 className={"subHeader"}>Announcements</h3>
                        {announcements.length > 0 ? (
                            announcements.map((a) => (
                                <AnnouncementCard
                                    key={a.id}
                                    id={a.id}
                                    text={a.text}
                                    editable={false}
                                    editingText={""}
                                    onChangeText={() => {}}
                                    onSaveEdit={() => {}}
                                    onCancelEdit={() => {}}
                                    onEditClick={() => {}}
                                    onDelete={() => {}}
                                    canEdit={false}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500">No announcements yet.</p>
                        )}
                        <h3 className={"subHeader"}>Messages</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {

};

export default EventModeratorPage;
