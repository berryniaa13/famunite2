package com.example.famunite.services;

import com.example.famunite.models.users.User;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.WriteResult;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;
// Service classes actually interacts with Firestore to perform operation

@Service
@AllArgsConstructor
// annotation that allows to log errors
@Slf4j
public class UserService {

    private Firestore firestore;

    // CREATE
    public String createUser(User user) throws ExecutionException, InterruptedException {
        try {
            ApiFuture<DocumentReference> users = firestore.collection("User").add(user);
            return "Document saved: userId id " + users.get().getId();
        } catch (InterruptedException | ExecutionException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    // READ
    public User getUser(String id) {
        try {
            ApiFuture<DocumentSnapshot> users = firestore.collection("User").document(id).get();
            return users.get().toObject(User.class);
        } catch (InterruptedException | ExecutionException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }


    //DELETE
    public String deleteUser(String id) {
        try {
            ApiFuture<WriteResult> users = firestore.collection("User").document(id).delete();
            return "User deleted at : " + users.get().getUpdateTime();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }
}
