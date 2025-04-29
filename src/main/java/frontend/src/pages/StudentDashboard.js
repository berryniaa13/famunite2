import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { auth, firestore } from "../context/firebaseConfig";
import SideNavbar from "../components/SideNavbar";
import famUniteLogo from "../assets/FAMUniteLogoNude.png";
import EventCard from "../components/EventCard";
import EventCardRectangular from "../components/EventCardRectangular";
import Header from "../components/Header";


import EventReviewForm from "../components/EventReviewForm";
import EventReviewsList from "../components/EventReviewsList";

function StudentDashboard() {
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const navigate = useNavigate();

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

    const handleRegister = async (eventId) => {
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to register.");
            return;
        }

        try {
            const eventRef = doc(firestore, "Event", eventId);
            const eventSnap = await getDoc(eventRef);

            if (!eventSnap.exists()) {
                alert("Event does not exist.");
                return;
            }

            const eventData = eventSnap.data();

            if (!eventData.verified) {
                alert("This event is not verified yet.");
                return;
            }

            if (eventData.suspended) {
                alert("This event is currently suspended and cannot accept registrations.");
                return;
            }

            await addDoc(collection(firestore, "Registrations"), {
                userId: user.uid,
                eventId: eventId,
                timestamp: serverTimestamp(),
            });

            alert("You have successfully registered for the event!");
            fetchEvents(); // Refresh events after registration
        } catch (error) {
            console.error("Registration failed:", error);
            alert("Failed to register.");
        }
    };


    const handleUnregister = async (eventId) => {
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to unregister.");
            return;
        }

        try {
            const registrationsRef = collection(firestore, "Registrations");
            const q = query(
                registrationsRef,
                where("userId", "==", user.uid),
                where("eventId", "==", eventId)
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                alert("You are not registered for this event.");
                return;
            }

            // Assuming one registration per user per event
            const registrationDoc = querySnapshot.docs[0];
            await deleteDoc(registrationDoc.ref);

            alert("You have successfully unregistered from the event!");
            fetchEvents(); // Refresh events after unregistration
        } catch (error) {
            console.error("Unregistration failed:", error);
            alert("Failed to unregister.");
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
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
                                            onUnregister={() => handleUnregister(event.id)}
                                        />
                                        <div style={{
                                            padding: "10px",
                                            backgroundColor: "#f0f0f0",
                                            borderRadius: "8px",
                                            marginTop: "8px"
                                        }}>
                                            <h4 style={{textAlign: "left"}}>Leave a Review</h4>
                                            <EventReviewForm eventId={event.id}/>
                                            <EventReviewsList eventId={event.id}/> {/* <-- NEW */}
                                        </div>
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
                                        onRegister={
                                            !isUserRegistered(event.id)
                                                ? () => handleRegister(event.id)
                                                : null
                                        }
                                        onUnregister={
                                            isUserRegistered(event.id)
                                                ? () => handleUnregister(event.id)
                                                : null
                                        }
                                    />
                                ))}
                            </ul>
                        </div>
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

export default StudentDashboard;
