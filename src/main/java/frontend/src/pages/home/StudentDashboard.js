import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnnouncementsList from "../../components/AnnouncementsList";
import {
    deleteDoc,
    where,
    query,
    collection,
    addDoc,
    serverTimestamp,
    orderBy,
    doc,
    getDoc,
} from "firebase/firestore";
import {getDocs } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { auth, firestore } from "../../context/firebaseConfig";
import SideNavbar from "../../components/SideNavbar";
import EventCard from "../../components/EventCard";
import Header from "../../components/Header";
import {all} from "axios";


function StudentDashboard() {
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const userDocRef = doc(firestore, "User", user.uid);
            const userSnap = await getDoc(userDocRef);
            const likedCategories = userSnap.exists()
                ? userSnap.data().interests || []
                : [];

            const eventsRef = collection(firestore, "Event");
            const todayStr = new Date().toISOString().slice(0,10); // "2025-05-15"
            const q = query(
                eventsRef,
                where("date", ">=", todayStr),
                where("status", "==", "Approved"),
                orderBy("date", "asc")
            );
            const eventsSnapshot = await getDocs(q);
            const eventsList = eventsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            const recommendedEvents = eventsList.filter(
                (event) =>
                    event.category && likedCategories.includes(event.category)
            );
            const today = new Date();
            const upcoming = recommendedEvents.filter(e => new Date(e.date) >= today);

            setFilteredEvents(upcoming);
            console.log(filteredEvents);

            const registrationsRef = collection(firestore, "Registrations");
            const registrationsSnapshot = await getDocs(registrationsRef);

            const userRegistrations = registrationsSnapshot.docs
                .filter((doc) => doc.data().userId === user.uid)
                .map((doc) => doc.data().eventId);

            const registered = eventsList.filter((event) =>
                userRegistrations.includes(event.id)
            );
            setRegisteredEvents(registered);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    // Helper function to check if the user is registered for an event
    const isUserRegistered = (eventId) => {
        return registeredEvents.some((event) => event.id === eventId);
    };

    return (
        <div className={"container"}>
            <SideNavbar />
            <div style={{marginLeft: "250px"}}>
                <Header pageTitle="Home" />
                <div className={"dashboard-container"}>
                    <div className={"left-column"}>
                        <h2 className={"subHeader"}>Upcoming Events</h2>
                        <div className={"horizontalContainer"}>
                            <ul className={"horizontalList"}>
                                {registeredEvents.map((event) => (
                                    <li key={event.id} style={{listStyle: "none", width: "100%"}}>
                                        <EventCard
                                            event={event}
                                            onDone={()=>fetchEvents()}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <h2 className={"subHeader"}>Recommended Events</h2>
                        <div className={"horizontalContainer"}>
                            <ul className={"horizontalList"}>
                                {filteredEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        onDone={()=>fetchEvents()}
                                    />
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className={"right-column"}>
                        <h3 className={"subHeader"}>Announcements</h3>
                        <AnnouncementsList/>
                        <h3 className={"subHeader"}>Messages</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}
const styles = {

};

export default StudentDashboard;
