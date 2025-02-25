package com.example.famunite.config;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
// This class configures the connection between Firebase and our project
public class FirebaseConfig {
    @Bean
    public Firestore firestore() {
        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp();
            System.out.println("Credentials Path: " + System.getenv("GOOGLE_APPLICATION_CREDENTIALS"));

        }
        return FirestoreClient.getFirestore();


    }

}


