package com.example.famunite.controllers;

import com.example.famunite.models.users.User;
import com.example.famunite.services.UserService;
import com.example.famunite.util.ApiResponseFormat;
import lombok.AllArgsConstructor;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/users")
//@AllArgsConstructor
public class UserController {

    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    @GetMapping("/")
    public ResponseEntity<ApiResponseFormat<List<User>>> getAllUsers() {
        try {
            List<User> userList = userService.getAllUsers();
            return ResponseEntity.ok(new ApiResponseFormat<>(true, "Users retrieved successfully", userList, null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponseFormat<>(false, "Error retrieving Users", null, e.getMessage()));
        }
    }



    @PostMapping()
    public ResponseEntity<String> createUser(@RequestBody User user) throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(userService.createUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable("id") String id){
        return ResponseEntity.ok(userService.getUser(id));
    }

    // UPDATE endpoint
    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable String id, @RequestBody User updatedUser) {
        try {
            String result = userService.updateUser(id, updatedUser);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body("Failed to update user: " + e.getMessage());
        }
    }

@DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable("id") String id){
        return ResponseEntity.ok(userService.deleteUser(id));
    }

}
