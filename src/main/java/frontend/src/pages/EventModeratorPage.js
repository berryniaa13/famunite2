import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
    collection,
    getDocs,
    updateDoc,
    doc,
    getDoc
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
    const [reviews, setReviews] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
        fetchReviews();
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

    const fetchReviews = async () => {
        try {
            const reviewsRef = collection(firestore, "Reviews");
            const snapshot = await getDocs(reviewsRef);

            const reviewList = await Promise.all(snapshot.docs.map(async (docSnap) => {
                const reviewData = docSnap.data();
                const eventRef = doc(firestore, "Event", reviewData.eventId);
                const eventSnap = await getDoc(eventRef);
                const eventTitle = eventSnap.exists() ? eventSnap.data().title : "Unknown Event";

                return {
                    id: docSnap.id,
                    ...reviewData,
                    eventTitle,
                };
            }));

            // Sort newest first
            const sortedReviews = reviewList.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);

            setReviews(sortedReviews);
        } catch (error) {
            console.error("Error fetching reviews:", error);
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

    const handleToggleFlagReview = async (reviewId, currentStatus) => {
        try {
            const reviewRef = doc(firestore, "Reviews", reviewId);
            await updateDoc(reviewRef, { flagged: !currentStatus });
            fetchReviews(); // Refresh flagged status
        } catch (error) {
            console.error("Error toggling flag status:", error);
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
                        <div className={"feedbackContainer"}>
                            {reviews.map((review) => (
                                <div
                                    key={review.id}
                                    style={{
                                        backgroundColor: review.flagged ? "#ffe6e6" : "#f9f9f9",
                                        padding: "10px",
                                        borderRadius: "8px",
                                        marginBottom: "10px",
                                        border: review.flagged ? "1px solid red" : "1px solid #ccc"
                                    }}
                                >
                                    <p><strong>Event:</strong> {review.eventTitle}</p>
                                    <p><strong>Rating:</strong> ⭐ {review.rating}</p>
                                    <p><strong>Comment:</strong> {review.comment}</p>
                                    <button
                                        style={{
                                            backgroundColor: review.flagged ? "#ffc4c4" : "#d1e7dd",
                                            border: "none",
                                            borderRadius: "4px",
                                            padding: "5px 10px",
                                            cursor: "pointer"
                                        }}
                                        onClick={() => handleToggleFlagReview(review.id, review.flagged)}
                                    >
                                        {review.flagged ? "✅ Unflag" : "🚩 Flag"}
                                    </button>
                                </div>
                            ))}
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

const styles = {};

export default EventModeratorPage;
