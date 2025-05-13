import React, { useState } from "react";
import { auth, firestore } from "../context/firebaseConfig";
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";

const categories = [
    "Academic",
    "Career / Professional Development",
    "Workshops",
    "Social",
    "Cultural",
    "Performing Arts / Entertainment",
    "Community Service",
    "Health & Wellness",
    "Sports / Recreation",
    "Religious / Spiritual",
    "Club / Organization Meetings",
    "Fundraisers",
    "Networking Events",
    "Student Government",
    "Study Groups / Tutoring",
    "Housing & Campus Life",
    "Competitions / Hackathons",
    "Tech / Innovation",
    "Political",
    "Alumni Events"
];

function EventCreateForm({ organizationId, onEventCreated, inputStyle, buttonStyle }) {
    const [newEvent, setNewEvent] = useState({
        title: "",
        category: "",
        description: "",
        location: "",
        date: ""
    });

    const handleCreateEvent = async () => {
        if (!newEvent.title || !newEvent.date) {
            alert("Title and Date are required.");
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) return;

            const userRef = doc(firestore, "User", user.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.exists() ? userSnap.data() : {};

            const eventToCreate = {
                ...newEvent,
                createdBy: user.uid,
                createdAt: new Date().toISOString(),
                organizationId: organizationId || "Unknown",
                status: "Pending",
            };

            const eventDocRef = await addDoc(collection(firestore, "Event"), eventToCreate);

            const eventRequestToCreate = {
                event: eventDocRef,
                submittedBy: user.uid,
                role: userData.role || "Organization Liaison",
                note: "",
                status: "Pending",
                approvals: [
                    { role: "Organization Liaison", status: "Approved" },
                    { role: "Event Moderator", status: "Pending Approval" },
                    { role: "Admin", status: "Pending Approval" }
                ],
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(firestore, "EventRequest"), eventRequestToCreate);

            alert("Event and request submitted successfully!");
            setNewEvent({ title: "", category: "", description: "", location: "", date: "" });
            if (onEventCreated) onEventCreated();
        } catch (error) {
            console.error("Error creating event:", error);
            alert("You do not have permission to create events.");
        }
    };

    return (
        <div>
            <select
                value={newEvent.category}
                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                style={inputStyle}
            >
                <option value="">Select Category</option>
                {categories.map((category) => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                ))}
            </select>

            {["title", "description", "location"].map((field) => (
                <input
                    key={field}
                    type="text"
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={newEvent[field]}
                    onChange={(e) => setNewEvent({ ...newEvent, [field]: e.target.value })}
                    style={inputStyle}
                />
            ))}

            <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                style={inputStyle}
            />

            <button onClick={handleCreateEvent} style={buttonStyle}>
                Create Event
            </button>
        </div>
    );
}

export default EventCreateForm;