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


function EventModeratorPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
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
                        <h3 className={"subHeader"}>Needs Action</h3>
                        <div className={"horizontalContainer"}>
                            <ul className={"horizontalList"}>
                                {filteredEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                    />
                                ))}

                            </ul>
                        </div>
                        <h3 className={"subHeader"}>Recent Feedback</h3>
                    </div>

                    <div className={"right-column"}>
                        <h3 className={"subHeader"}>Announcements</h3>

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
