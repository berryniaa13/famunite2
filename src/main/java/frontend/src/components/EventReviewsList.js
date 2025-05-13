import React, { useEffect, useState } from 'react';
import {collection, query, where, getDocs, getDoc, doc} from 'firebase/firestore';
import { firestore } from '../context/firebaseConfig';
function StarRating( rating ) {
    const stars = [1, 2, 3, 4, 5];
    return (
        <div style={{ display: "flex", gap: 4, fontSize: 24 }}>
            {stars.map((star, i) => (
                <span key={i} style={{ color: i < rating ? "#f5b301" : "#ccc" }}>
                  {i < rating ? "★" : "☆"}
                </span>
                ))}
        </div>
    );
}
function EventReviewsList({ eventId }) {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // 1) load reviews
                const reviewsSnap = await getDocs(
                    query(collection(firestore, "Reviews"), where("eventId", "==", eventId))
                );
                const reviews = reviewsSnap.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(r => !r.flagged);

                // 2) for each review, load the reviewer’s user doc
                const userFetches = reviews.map(r => {
                    const userRef = doc(firestore, "User", r.userId);
                    return getDoc(userRef);
                });
                const userSnaps = await Promise.all(userFetches);

                // 3) merge in the user’s name
                const reviewsWithNames = reviews.map((r, i) => {
                    const userData = userSnaps[i].data() || {};
                    return {
                        ...r,
                        reviewerName: userData.name || "Unknown Reviewer"
                    };
                });

                setReviews(reviewsWithNames);
            } catch (err) {
                console.error("Error fetching reviews:", err);
            }
        };

        fetchReviews();
    }, [eventId]);

    return (
        <div style={styles.container}>
           {reviews.length === 0 ? (
                <p>No reviews yet.</p>
            ) : (
                <>
                    <ul style={styles.review} >
                        {reviews.map((review, index) => (
                            <div style={styles.review}>
                                {StarRating(review.rating)}
                                <li key={index} style={{ marginBottom: "2px", display: "flex", alignItems: "space-between" }}>
                                    <strong>{review.reviewerName}:</strong> {"     "}
                                    {review.comment}
                                </li>
                            </div>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
const styles = {
    container: {
        marginTop: "10px",
        backgroundColor: "#f8f9fa",
        padding: "10px",
        borderRadius: "8px",
        maxHeight: "200px",
        overflowY: "auto",
    },
    review: {
        listStyle: "none",
        paddingLeft: "0",
        fontSize: "12px"
    }
}
export default EventReviewsList;