import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    collection,
    getDocs,
    updateDoc,
    doc,
    getDoc
} from "firebase/firestore";
import { auth, firestore } from '../../context/firebaseConfig';
import SideNavbar from "../../components/SideNavbar";
import Header from "../../components/Header";
import SearchBar from "../../components/SearchBar";
import EventCard from "../../components/EventCard";
import AnnouncementCard from "../../components/AnnouncementCard";
import AnnouncementsList from "../../components/AnnouncementsList";


function EventModeratorPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);

    const [reviews, setReviews] = useState([]);

    const [flaggedEvents, setFlaggedEvents] = useState([]);
    const [approvalEvents, setApprovalEvents] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [error, setError] = useState(null);



    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();

        fetchReviews();

        fetchFlaggedEvents();
        fetchApprovalEvents();

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

    const fetchFlaggedEvents = async () => {
        try {
            const eventsRef = collection(firestore, "Event");
            const snapshot = await getDocs(eventsRef);
            const flagged = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(event => event.status === "Flagged");
            setFlaggedEvents(flagged);
        } catch (error) {
            console.error("Error fetching flagged events:", error);
        }
    };


    const fetchApprovalEvents = async () => {
        try {
            const eventsRef = collection(firestore, "Event");
            const snapshot = await getDocs(eventsRef);
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
                            approval.role === "Event Moderator" &&
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
            <div style={{marginLeft: "250px"}}>
                <Header pageTitle="Home"/>
                <div className={"dashboard-container"}>
                    <div className={"left-column"}>
                        <h3 className={"subHeader"}>Resolve Flagged Content</h3>
                        <div className={"horizontalContainer"}>
                            <ul className={"horizontalList"}>
                                {flaggedEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        onDone={()=>fetchFlaggedEvents()}
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
                                        onDone={()=>fetchApprovalEvents()}
                                    />
                                ))}
                            </ul>
                        </div>

                        <div>
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

const styles = {};

export default EventModeratorPage;
