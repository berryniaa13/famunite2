package com.example.backend.models;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.annotation.DocumentId;
import com.google.cloud.firestore.annotation.ServerTimestamp;
import lombok.Data;

@Data

public class Event {
    @DocumentId
    private String id;
    private int attendees_count;
    private String category;
    private String description;
    private String location;
    private String status;
    private String title;
    private String created_by;
    @ServerTimestamp
    private Timestamp created_at;
    @ServerTimestamp
    private Timestamp updated_at;
    private Timestamp date_time;
}

