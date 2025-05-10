import {collection, deleteDoc, doc, getDoc, getDocs, updateDoc} from "firebase/firestore";
import {firestore} from "../context/firebaseConfig";
import AnnouncementCard from "./AnnouncementCard";
import React, {useEffect, useState} from "react";
import { auth } from "../context/firebaseConfig";


const AnnouncementsList = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [role, setRole] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAnnouncements();
        fetchUserRole();
    }, []);

    const fetchUserRole = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const userRef = doc(firestore, "User", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
            setRole(snap.data().role || "User");
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const annRef = collection(firestore, "Announcements");
            const snap = await getDocs(annRef);
            const list = snap.docs
                .map((d) => ({ id: d.id, ...d.data() }))
                .sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
            setAnnouncements(list);
        } catch (err) {
            console.error(err);
            setError("Failed to load announcements.");
        }
    };

    // ——— Edit & Delete ———
    const handleEditClick = (id, text) => {
        setEditingId(id);
        setEditingText(text);
    };
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingText('');
    };
    const handleSaveEdit = async () => {
        if (!editingText.trim()) return;
        try {
            await updateDoc(doc(firestore, 'Announcements', editingId), {
                text: editingText.trim()
            });
            setEditingId(null);
            setEditingText('');
            fetchAnnouncements();
        } catch (err) {
            console.error(err);
            setError("Failed to update announcement.");
        }
    };
    const handleDeleteAnnouncement = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await deleteDoc(doc(firestore, 'Announcements', id));
            fetchAnnouncements();
        } catch (err) {
            console.error(err);
            setError("Failed to delete announcement.");
        }
    };
    return (
        <>
            {announcements.length > 0 ? (
                announcements.map((a) =>
                    role === "Admin" ? (
                        <AnnouncementCard
                            key={a.id}
                            id={a.id}
                            text={a.text}
                            editable={editingId === a.id}
                            editingText={editingText}
                            onChangeText={setEditingText}
                            onSaveEdit={handleSaveEdit}
                            onCancelEdit={handleCancelEdit}
                            onEditClick={() => handleEditClick(a.id, a.text)}
                            onDelete={() => handleDeleteAnnouncement(a.id)}
                            canEdit={true}
                        />
                    ) : (
                        <AnnouncementCard
                            key={a.id}
                            id={a.id}
                            text={a.text}
                            editable={false}
                            editingText={""}
                            onChangeText={() => {}}
                            onSaveEdit={() => {}}
                            onCancelEdit={() => {}}
                            onEditClick={() => {}}
                            onDelete={() => {}}
                            canEdit={false}
                        />
                    )
                )
            ) : (
                <p className="text-gray-500">{error || "No announcements yet."}</p>
            )}
        </>
    );

}

export default AnnouncementsList;