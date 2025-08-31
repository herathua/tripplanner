package com.example.tripplanner.controller;

import com.example.tripplanner.model.User;
import com.example.tripplanner.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get all users", description = "Retrieve a list of all users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieve a specific user by their ID")
    public ResponseEntity<User> getUserById(
            @Parameter(description = "ID of the user to retrieve") 
            @PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new user", description = "Create a new user with the provided details")
    public ResponseEntity<User> createUser(
            @Parameter(description = "User object to create") 
            @RequestBody User user) {
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a user", description = "Update an existing user by their ID")
    public ResponseEntity<User> updateUser(
            @Parameter(description = "ID of the user to update") 
            @PathVariable Long id,
            @Parameter(description = "Updated user object") 
            @RequestBody User userDetails) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setEmail(userDetails.getEmail());
            user.setDisplayName(userDetails.getDisplayName());
            user.setPhotoUrl(userDetails.getPhotoUrl());
            user.setPhoneNumber(userDetails.getPhoneNumber());
            user.setRole(userDetails.getRole());
            user.setEmailVerified(userDetails.isEmailVerified());
            user.setActive(userDetails.isActive());
            
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a user", description = "Delete a user by their ID")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "ID of the user to delete") 
            @PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/firebase/{firebaseUid}")
    @Operation(summary = "Get user by Firebase UID", description = "Retrieve a user by their Firebase UID")
    public ResponseEntity<User> getUserByFirebaseUid(
            @Parameter(description = "Firebase UID of the user") 
            @PathVariable String firebaseUid) {
        Optional<User> user = userRepository.findByFirebaseUid(firebaseUid);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Get user by email", description = "Retrieve a user by their email address")
    public ResponseEntity<User> getUserByEmail(
            @Parameter(description = "Email address of the user") 
            @PathVariable String email) {
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
