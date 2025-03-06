package com.example.backend.services;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.example.backend.models.Event;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
@AllArgsConstructor
@Slf4j
public class EventService {

    private final Firestore firestore;

    // CREATE
    public String createEvent(Event event) throws ExecutionException, InterruptedException {
        try {
            DocumentReference eventRef = firestore.collection("Event").document();
            event.setId(eventRef.getId());

            ApiFuture<WriteResult> future = eventRef.set(event); // Future for Firestore write
            future.get(); // Ensures we wait for completion and capture any exceptions

            return "Event created successfully with ID: " + eventRef.getId();
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error creating event: {}", e.getMessage());
            throw new RuntimeException("Failed to create event", e);
        }
    }


    // READ
    public Event getEvent(String id) {
        try {
            ApiFuture<DocumentSnapshot> events = firestore.collection("Event").document(id).get();
            return events.get().toObject(Event.class);
        } catch (InterruptedException | ExecutionException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }

    }

    // UPDATE
    public String updateEvent(String id, Event updatedEvent) {
        try {
            DocumentReference eventDoc = firestore.collection("Event").document(id);

            ApiFuture<DocumentSnapshot> future = eventDoc.get();
            DocumentSnapshot document = future.get();

            if (!document.exists()) {
                return "Event with ID " + id + " does not exist.";
            }

            ApiFuture<WriteResult> writeResult = eventDoc.update(
                    "title", updatedEvent.getTitle(),
                    "category", updatedEvent.getCategory(),
                    "description", updatedEvent.getDescription(),
                    "location", updatedEvent.getLocation(),
                    "date", updatedEvent.getDate_time()
            );


            return "Event successfully updated at: " + writeResult.get().getUpdateTime();
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error updating event with ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to update event", e);
        }
    }

    // DELETE
    public String deleteEvent(String id) {
        try {
            ApiFuture<WriteResult> events = firestore.collection("Event").document(id).delete();
            return "Event deleted at : " + events.get().getUpdateTime();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    // GET ALL EVENTS
    public List<Event> getAllEvents() throws ExecutionException, InterruptedException {

        try {
            ApiFuture<QuerySnapshot> querySnapshot = firestore.collection("Event").get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
            List<Event> events = new ArrayList<>();

            for (QueryDocumentSnapshot document : documents) {
                events.add(document.toObject(Event.class));
            }
            return events;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error retrieving events: ", e);
            throw new RuntimeException("Failed to fetch events", e);
        }

    }

    public List<Event> searchEvents(String searchTerm) throws ExecutionException, InterruptedException {
        try {
            CollectionReference eventsRef = firestore.collection("Event");
            Query query = eventsRef.whereEqualTo("title", searchTerm); // Searching by title
            ApiFuture<QuerySnapshot> querySnapshot = query.get();

            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
            List<Event> events = new ArrayList<>();
            for (QueryDocumentSnapshot document : documents) {
                events.add(document.toObject(Event.class));
            }
            return events;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error searching for events: ", e);
            throw new RuntimeException("Failed to search events", e);
        }
    }


    // Convert DocumentSnapshot to Event
    private Event documentSnapshotToEvent(DocumentSnapshot document) {
        return document.toObject(Event.class);
    }
}

