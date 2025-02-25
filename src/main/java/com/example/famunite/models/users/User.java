package com.example.famunite.models.users;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.annotation.DocumentId;
import com.google.cloud.firestore.annotation.ServerTimestamp;
import lombok.Data;
import java.util.List;

@Data

public class User {
    @DocumentId
    private String id;
    private String name;
    private String email;
    private String contact_info;
    private List<String> role;
    private String status;
    @ServerTimestamp
    private Timestamp updated_at;
}
