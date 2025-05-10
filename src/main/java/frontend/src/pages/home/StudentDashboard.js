import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnnouncementsList from "../../components/AnnouncementsList";
import { signOut } from "firebase/auth";
import {
    deleteDoc,
    where,
    query,
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    doc,
    getDoc,
} from "firebase/firestore";
import { auth, firestore } from "../../context/firebaseConfig";
import SideNavbar from "../../components/SideNavbar";
import famUniteLogo from "../../assets/FAMUniteLogoNude.png";
import EventCard from "../../components/EventCard";
import EventCardRectangular from "../../components/EventCardRectangular";
import Header from "../../components/Header";


import EventReviewForm from "../../components/EventReviewForm";
import EventReviewsList from "../../components/EventReviewsList";
import AnnouncementCard from "../../components/AnnouncementCard";

function StudentDashboard() {
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);

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
            const eventsSnapshot = await getDocs(eventsRef);
            const eventsList = eventsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            const recommendedEvents = eventsList.filter(
                (event) =>
                    event.category && likedCategories.includes(event.category)
            );

            setFilteredEvents(recommendedEvents);

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
