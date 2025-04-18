package com.example.backend.services;

import com.example.backend.models.User;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import jakarta.servlet.Registration;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
// Service classes actually interacts with Firestore to perform operation

@Service
@AllArgsConstructor
// annotation that allows to log errors
@Slf4j
public class RegistrationService {

    private Firestore firestore;

    // CREATE
    public String createUser(Registration user) throws ExecutionException, InterruptedException {
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

    // UPDATE
    public String updateUser(String id, User updatedUser) {
        try {
            // Reference the document to update
            DocumentReference userDoc = firestore.collection("User").document(id);

            // Check if the document exists
            ApiFuture<DocumentSnapshot> future = userDoc.get();
            DocumentSnapshot document = future.get();
            if (!document.exists()) {
                return "User with ID " + id + " does not exist.";
            }

            // Update the document with the new user data
            ApiFuture<WriteResult> writeResult = userDoc.set(updatedUser);
            return "User successfully updated at: " + writeResult.get().getUpdateTime();
        } catch (InterruptedException | ExecutionException e) {
            log.error(e.getMessage(), e);
            throw new RuntimeException("Failed to update user: " + e.getMessage());
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

    private User documentSnapshotToUser(DocumentSnapshot document) {
        return document.toObject(User.class); // Converts Firestore document to User object
    }

    public List<User> getAllUsers() {
        List<User> userList = new ArrayList<>();

        try {
            CollectionReference userCollection = firestore.collection("User");
            ApiFuture<QuerySnapshot> future = userCollection.get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();

            for (DocumentSnapshot document : documents) {
                User user = documentSnapshotToUser(document);
                if (user != null) {
                    userList.add(user);
                }
            }
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error retrieving users: ", e);
            throw new RuntimeException("Failed to fetch users", e);
        }

        return userList;
    }





}

