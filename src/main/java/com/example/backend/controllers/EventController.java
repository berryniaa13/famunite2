
package com.example.backend.controllers;

import com.example.backend.models.Event;
import com.example.backend.services.EventService;
import com.example.backend.util.ApiResponseFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;




import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/events")
//@AllArgsConstructor
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService){
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<ApiResponseFormat<List<Event>>> getAllEvents(@RequestParam(required=false) String search) throws ExecutionException, InterruptedException {
        try {
            List<Event> eventList = (search != null && !search.isEmpty())
                    ? eventService.searchEvents(search)
                    : eventService.getAllEvents();

            if (eventList.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT)
                        .body(new ApiResponseFormat<>(true, "No events found",
                                eventList, null));
            }

            return ResponseEntity.ok(new ApiResponseFormat<>(true, "Events retrieved successfully", eventList, null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponseFormat<>(false, "Error retrieving events", null, e.getMessage()));
        }
    }


    @PostMapping
    public ResponseEntity<String> createEvent(@RequestBody Event event) throws ExecutionException, InterruptedException {
        try {
            String response = eventService.createEvent(event);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create event: " + e.getMessage());
        }
    }




    @GetMapping("/{id}")
    public ResponseEntity<Event> getEvent(@PathVariable("id") String id) throws ExecutionException, InterruptedException{
        try {
            Event event = eventService.getEvent(id);
            if (event != null) {
                return ResponseEntity.ok(event);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }



    // UPDATE endpoint
    @PutMapping("/{id}")
    public ResponseEntity<String> updateEvent(@PathVariable String id, @RequestBody Event updatedEvent) throws ExecutionException, InterruptedException {
        try {
            String result = eventService.updateEvent(id, updatedEvent);
                return ResponseEntity.ok(result);
            } catch (RuntimeException e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update event: " + e.getMessage());
        }

    }



    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEvent(@PathVariable("id") String id) throws ExecutionException, InterruptedException {
     try {
         String result = eventService.deleteEvent(id);
         return ResponseEntity.ok(result);
     } catch (RuntimeException e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                 .body("Failed to delete user: " + e.getMessage());
     }

    }



}



