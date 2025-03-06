package com.example.backend.services;

import com.example.backend.models.User;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
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

    public User getUserByEmail(String email) {
        try {
            CollectionReference usersRef = firestore.collection("User");
            Query query = usersRef.whereEqualTo("email", email);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();

            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
            if (!documents.isEmpty()) {
                return documents.get(0).toObject(User.class);
            } else {
                return null; // User not found
            }
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error retrieving user by email: ", e);
            throw new RuntimeException("Failed to fetch user by email", e);
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


    public List<User> getAllUsers() throws ExecutionException, InterruptedException {
        try {
            ApiFuture<QuerySnapshot> querySnapshot = firestore.collection("User").get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
            List<User> users = new ArrayList<>();
            for (QueryDocumentSnapshot document : documents) {
                users.add(document.toObject(User.class));
            }
            return users;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error fetching all users: ", e);
            throw new RuntimeException("Failed to fetch users", e);
        }
    }

    public List<User> searchUsers(String searchTerm) throws ExecutionException, InterruptedException {
        try {
            CollectionReference usersRef = firestore.collection("User");
            Query query = usersRef.whereEqualTo("email", searchTerm); // Searching by email
            ApiFuture<QuerySnapshot> querySnapshot = query.get();

            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
            List<User> users = new ArrayList<>();
            for (QueryDocumentSnapshot document : documents) {
                users.add(document.toObject(User.class));
            }
            return users;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error searching for users: ", e);
            throw new RuntimeException("Failed to search users", e);
        }
    }




    /*
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
     */





}
