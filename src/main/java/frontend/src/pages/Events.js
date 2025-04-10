import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
     collection,
     getDocs,
     addDoc,
     serverTimestamp,
     doc,
     getDoc,
     query,
     where
 } from "firebase/firestore";
 import { auth, firestore } from "../context/firebaseConfig";
 import SideNavbar from "../components/SideNavbar";
 import famUniteLogo from "../assets/FAMUniteLogoNude.png";

 function Events() {
     const [searchTerm, setSearchTerm] = useState("");
     const [events, setEvents] = useState([]);
     const [filteredEvents, setFilteredEvents] = useState([]);
     const [selectedEvent, setSelectedEvent] = useState(null);
     const [savedEvents, setSavedEvents] = useState([]);
     const navigate = useNavigate();
     const [selectedOrganization, setSelectedOrganization] = useState("");
     const [organizationOptions, setOrganizationOptions] = useState([]);


     useEffect(() => {
         fetchEvents();
         fetchSavedEvents();
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

             // Get unique organization names
             const orgs = [...new Set(eventsList.map(e => e.organizationName).filter(Boolean))];
             setOrganizationOptions(orgs);
         } catch (error) {
             console.error("Error fetching events:", error);
         }
     };


     const fetchSavedEvents = async () => {
         try {
             const user = auth.currentUser;
             if (!user) return;

             // Query the SavedEvents collection for documents belonging to the current user.
             const savedEventsQuery = query(
                 collection(firestore, "SavedEvents"),
                 where("userId", "==", user.uid)
             );
             const querySnapshot = await getDocs(savedEventsQuery);
             const savedEventIds = querySnapshot.docs.map(doc => doc.data().eventId);

             // For each saved event ID, fetch its details from the Event collection.
             const savedEventsDetails = await Promise.all(
                 savedEventIds.map(async (id) => {
                     const eventRef = doc(firestore, "Event", id);
                     const eventSnap = await getDoc(eventRef);
                     if (eventSnap.exists()) {
                         return { id, ...eventSnap.data() };
                     } else {
                         return null;
                     }
                 })
             );
             // Filter out any null values (in case an event was deleted)
             setSavedEvents(savedEventsDetails.filter(event => event !== null));
         } catch (error) {
             console.error("Error fetching saved events:", error);
         }
     };

     const handleSearch = (e) => {
         const term = e.target.value.toLowerCase();
         setSearchTerm(term);
         setSelectedEvent(null);

         filterEvents(term, selectedOrganization);
     };

     const filterEvents = (search, org) => {
         const filtered = events.filter(event => {
             const matchesSearch = event.title?.toLowerCase().includes(search);
             const matchesOrg = org ? event.organizationName === org : true;
             return matchesSearch && matchesOrg;
         });

         setFilteredEvents(filtered);
     };

     const handleOrgFilterChange = (e) => {
         const selected = e.target.value;
         setSelectedOrganization(selected);
         filterEvents(searchTerm, selected);
     };



     const handleViewDetails = (event) => {
         setSelectedEvent(event);
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
             if (!eventSnap.exists() || !eventSnap.data().verified) {
                 alert("This event is not verified yet.");
                 return;
             }
             await addDoc(collection(firestore, "Registrations"), {
                 userId: user.uid,
                 eventId: eventId,
                 timestamp: serverTimestamp()
             });
             alert("You have successfully registered for the event!");
         } catch (error) {
             console.error("Registration failed:", error);
             alert("Failed to register.");
         }
     };

     const handleSaveEvent = async (eventId) => {
         const user = auth.currentUser;
         if (!user) {
             alert("You must be logged in to save an event.");
             return;
         }
         try {
             // Prevent duplicate saves by checking current saved events.
             if (savedEvents.find(ev => ev.id === eventId)) {
                 alert("Event already saved.");
                 return;
             }
             await addDoc(collection(firestore, "SavedEvents"), {
                 userId: user.uid,
                 eventId: eventId,
                 savedAt: serverTimestamp()
             });
             alert("Event saved successfully!");
             fetchSavedEvents(); // Refresh the saved events list.
         } catch (error) {
             console.error("Failed to save event:", error);
             alert("Failed to save event.");
         }
     };

     const handleLogout = async () => {
         await signOut(auth);
         navigate("/login");
     };

     return (
         <div style={styles.container}>
             <SideNavbar/>
             <div style={{marginLeft: "250px"}}>
                 <div style={styles.headerContainer}>
                     <img src={famUniteLogo} alt="FAMUnite Logo" style={styles.logo}/>
                     <h2 style={styles.header}>Events</h2>
                 </div>
                 <input
                     type="text"
                     placeholder="Enter event title..."
                     value={searchTerm}
                     onChange={handleSearch}
                     style={styles.searchBar}
                 />
                 <select value={selectedOrganization} onChange={handleOrgFilterChange} style={styles.searchBar}>
                     <option value="">Filter by Organization</option>
                     {organizationOptions.map((org, idx) => (
                         <option key={idx} value={org}>{org}</option>
                     ))}
                 </select>


                 {/* Saved Events Section */}
                 <h2 style={styles.header}>Saved Events</h2>
                 {savedEvents.length > 0 ? (
                     <ul style={styles.list}>
                         {savedEvents.map((event) => (
                             <li key={event.id} style={styles.listItem}>
                                 <div style={{flex: 1}}>
                                     <h3>{event.title || "Untitled Event"}</h3>
                                     <p>{event.date}</p>
                                 </div>
                                 <div>
                                     <button onClick={() => handleViewDetails(event)} style={styles.button}>
                                         View Details
                                     </button>
                                 </div>
                             </li>
                         ))}
                     </ul>
                 ) : (
                     <p>No saved events.</p>
                 )}

                 {/* Recommended Events Section */}
                 <h2 style={styles.header}>Events</h2>
                 <ul style={styles.list}>
                     {filteredEvents.map((event) => (
                         <li key={event.id} style={styles.listItem}>
                             <div style={{flex: 1}}>
                                 <h3>{event.title || "Untitled Event"}</h3>
                             </div>
                             <div style={{display: "flex", gap: "10px"}}>
                                 <button onClick={() => handleViewDetails(event)} style={styles.button}>
                                     View Details
                                 </button>
                                 {event.verified ? (
                                     <>
                                         <button
                                             onClick={() => handleRegister(event.id)}
                                             style={{...styles.button, backgroundColor: "#12491B", color: "white"}}
                                         >
                                             Register
                                         </button>
                                         <button
                                             onClick={() => handleSaveEvent(event.id)}
                                             style={{...styles.button, backgroundColor: "#FFA500", color: "white"}}
                                         >
                                             Save
                                         </button>
                                     </>
                                 ) : (
                                     <span style={{color: "gray", fontSize: "12px", alignSelf: "center"}}>
                    Awaiting Verification
                  </span>
                                 )}
                             </div>
                         </li>
                     ))}
                 </ul>

                 {selectedEvent && (
                     <div style={styles.detailsContainer}>
                         <h3>Event Details</h3>
                         <p><strong>Organization:</strong> {selectedEvent.organizationName || "Not specified"}</p>
                         <p><strong>Category:</strong> {selectedEvent.category || "N/A"}</p>
                         <p><strong>Description:</strong> {selectedEvent.description || "No description available."}</p>
                         <p><strong>Location:</strong> {selectedEvent.location || "Unknown"}</p>
                         <p><strong>Date:</strong> {selectedEvent.date || "TBD"}</p>
                     </div>
                 )}
             </div>
         </div>
     );
 }

const styles = {
    container: {
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#F2EBE9"
    },
    searchBar: {
        padding: "8px",
        width: "90%",
        margin: "10px auto",
        display: "block",
         borderRadius: "8px",
         border: "1px solid #ccc"
     },
     list: {
         listStyle: "none",
         padding: "0"
     },
     headerContainer: {
         display: "flex",
         alignItems: "center",
         justifyContent: "center",
         gap: "10px",
         marginBottom: "20px"
     },
     logo: {
         width: "50px",
         height: "50px"
     },
     header: {
         fontSize: "24px",
         fontWeight: "bold"
     },
     listItem: {
         padding: "10px",
         border: "1px solid #ddd",
         margin: "10px",
         borderRadius: "5px",
         backgroundColor: "#f9f9f9",
         display: "flex",
         justifyContent: "space-between",
         alignItems: "center"
     },
     button: {
         padding: "8px 12px",
         backgroundColor: "#CDE0CA",
         fontSize: "12px",
         color: "black",
         border: "none",
         cursor: "pointer",
         borderRadius: "5px"
     },
     detailsContainer: {
         marginTop: "20px",
         padding: "15px",
         border: "1px solid #ddd",
         borderRadius: "10px",
         backgroundColor: "#e9ecef"
     },
     logoutButton: {
         padding: "10px",
         backgroundColor: "#BF6319",
         color: "white",
         border: "none",
         cursor: "pointer",
         borderRadius: "5px",
         marginTop: "10px"
     }
 };

 export default Events;

