import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../context/firebaseConfig';

function EventReviewsList({ eventId }) {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const reviewsRef = collection(firestore, "Reviews");
                const q = query(reviewsRef, where("eventId", "==", eventId));
                const querySnapshot = await getDocs(q);
                const reviewsData = querySnapshot.docs.map(doc => doc.data());
                setReviews(reviewsData);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }
        };

        fetchReviews();
    }, [eventId]);

    return (
        <div style={{ marginTop: "10px", backgroundColor: "#f8f9fa", padding: "10px", borderRadius: "8px" }}>
            <h5 style={{ marginBottom: "8px" }}>Reviews:</h5>
            {reviews.length === 0 ? (
                <p>No reviews yet.</p>
            ) : (
                <ul style={{ listStyle: "none", paddingLeft: "0" }}>
                    {reviews.map((review, index) => (
                        <li key={index} style={{ marginBottom: "8px" }}>
                            ⭐ {review.rating} — {review.comment}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default EventReviewsList;