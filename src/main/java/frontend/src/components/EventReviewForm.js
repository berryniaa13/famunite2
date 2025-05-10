import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '../context/firebaseConfig';

function EventReviewForm({ eventId }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return alert("You must be logged in to submit a review.");

        try {
            await addDoc(collection(firestore, "Reviews"), {
                eventId,
                userId: user.uid,
                rating,
                comment,
                timestamp: serverTimestamp()
            });
            alert("Review submitted!");
            setRating(0);
            setComment("");
        } catch (err) {
            console.error("Error submitting review:", err);
            alert("Failed to submit review.");
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
            <label>Rating:
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                    <option value={0}>Select</option>
                    {[1, 2, 3, 4, 5].map(star => (
                        <option key={star} value={star}>{star} Star{star > 1 ? "s" : ""}</option>
                    ))}
                </select>
            </label>
            <br />
            <textarea
                placeholder="Leave your comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="3"
                style={styles.textarea}
            />
            <br />
            <button type="submit" style={{ marginTop: "5px" }}>Submit Review</button>
        </form>
    );
}

const styles = {
    textarea: {
        width: "100%",
        minHeight: "80px",
        marginTop: "12px",
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        fontSize: "14px"
    },
}

export default EventReviewForm;