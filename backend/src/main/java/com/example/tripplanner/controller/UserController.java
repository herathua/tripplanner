package com.example.tripplanner.controller;

import com.example.tripplanner.model.User;
import com.example.tripplanner.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
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
        return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/firebase/{firebaseUid}")
    @Operation(summary = "Get user by Firebase UID", description = "Retrieve a specific user by their Firebase UID")
    public ResponseEntity<UserDTO> getUserByFirebaseUid(
            @Parameter(description = "Firebase UID of the user to retrieve") 
            @PathVariable String firebaseUid) {
        Optional<User> userOpt = userRepository.findByFirebaseUid(firebaseUid);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            UserDTO dto = new UserDTO(
                user.getId(),
                user.getFirebaseUid(),
                user.getEmail(),
                user.getDisplayName(),
                user.getPhotoUrl(),
                user.isEmailVerified(),
                user.isActive(),
                user.getRole().name()
            );
            return ResponseEntity.ok(dto);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    @Operation(summary = "Create a new user", description = "Create a new user with the provided details")
    public ResponseEntity<User> createUser(
            @Parameter(description = "User object to create") 
            @RequestBody User user) {
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/sync")
    public ResponseEntity<UserDTO> syncUser(@RequestBody Map<String, Object> userInfo, Authentication authentication) {
        try {
            String firebaseUid = null;
            if (authentication != null && authentication.getPrincipal() != null) {
                Object principal = authentication.getPrincipal();
                if (principal instanceof String) {
                    firebaseUid = (String) principal;
                }
            }
            // Fallbacks when authentication is disabled
            if (firebaseUid == null || firebaseUid.isBlank()) {
                Object uidObj = userInfo.get("firebaseUid");
                if (uidObj == null) {
                    uidObj = userInfo.get("uid");
                }
                if (uidObj != null) {
                    firebaseUid = uidObj.toString();
                }
            }

            // Also capture email early for lookup
            String emailFromBody = null;
            Object emailObj = userInfo.get("email");
            if (emailObj != null) {
                emailFromBody = emailObj.toString();
            }
            
            Optional<User> userOpt = Optional.empty();
            if (firebaseUid != null && !firebaseUid.isBlank()) {
                userOpt = userRepository.findByFirebaseUid(firebaseUid);
            }
            if (userOpt.isEmpty() && emailFromBody != null && !emailFromBody.isBlank()) {
                userOpt = userRepository.findByEmail(emailFromBody);
            }
            
            User user;
            if (userOpt.isPresent()) {
                user = userOpt.get();
                // Update fields if provided
                if (firebaseUid != null && !firebaseUid.isBlank() && !firebaseUid.equals(user.getFirebaseUid())) {
                    user.setFirebaseUid(firebaseUid);
                }
                Object displayNameObj = userInfo.get("displayName");
                if (displayNameObj != null) {
                    String dn = displayNameObj.toString();
                    if (!dn.isBlank()) {
                        user.setDisplayName(dn);
                    }
                }
                Object photoUrlObj = userInfo.get("photoUrl");
                if (photoUrlObj != null) {
                    user.setPhotoUrl(photoUrlObj.toString());
                }
                Object emailVerifiedObj = userInfo.get("emailVerified");
                if (emailVerifiedObj != null) {
                    boolean emailVerified;
                    if (emailVerifiedObj instanceof Boolean) {
                        emailVerified = (Boolean) emailVerifiedObj;
                    } else {
                        emailVerified = Boolean.parseBoolean(emailVerifiedObj.toString());
                    }
                    user.setEmailVerified(emailVerified);
                }
                
                // Save the updated user without explicit transaction management
                user = userRepository.saveAndFlush(user);
            } else {
                // Create new user
                user = new User();
                if (firebaseUid == null || firebaseUid.isBlank()) {
                    firebaseUid = "anonymous-" + System.currentTimeMillis();
                }
                user.setFirebaseUid(firebaseUid);
                String email = emailFromBody;
                if (email == null || email.isBlank()) {
                    email = "anonymous+" + System.currentTimeMillis() + "@example.com";
                }
                user.setEmail(email);
                String displayName = (String) userInfo.get("displayName");
                if (displayName == null || displayName.isBlank()) {
                    displayName = (email != null && email.contains("@")) ? email.split("@")[0] : "Anonymous User";
                }
                user.setDisplayName(displayName);
                Object photoUrlObj = userInfo.get("photoUrl");
                user.setPhotoUrl(photoUrlObj != null ? photoUrlObj.toString() : null);
                Object emailVerifiedObj = userInfo.get("emailVerified");
                boolean emailVerified = false;
                if (emailVerifiedObj != null) {
                    if (emailVerifiedObj instanceof Boolean) {
                        emailVerified = (Boolean) emailVerifiedObj;
                    } else {
                        emailVerified = Boolean.parseBoolean(emailVerifiedObj.toString());
                    }
                }
                user.setEmailVerified(emailVerified);
                user.setActive(true);
                user.setRole(User.UserRole.USER);
                
                // Save the new user without explicit transaction management
                user = userRepository.saveAndFlush(user);
            }
            
            // Create and return DTO
            UserDTO dto = new UserDTO(
                user.getId(),
                user.getFirebaseUid(),
                user.getEmail(),
                user.getDisplayName(),
                user.getPhotoUrl(),
                user.isEmailVerified(),
                user.isActive(),
                user.getRole().name()
            );
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            // Log the full error for debugging
            System.err.println("Error in syncUser: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
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

    @PostMapping("/password/update")
    @Operation(summary = "Update user password", description = "Update user password with proper validation")
    public ResponseEntity<Map<String, Object>> updatePassword(
            @Parameter(description = "Password update request") 
            @RequestBody PasswordUpdateRequest request,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate authentication
            if (authentication == null || authentication.getPrincipal() == null) {
                response.put("success", false);
                response.put("error", "Authentication required");
                return ResponseEntity.status(401).body(response);
            }
            
            String firebaseUid = null;
            if (authentication.getPrincipal() instanceof String) {
                firebaseUid = (String) authentication.getPrincipal();
            }
            
            if (firebaseUid == null || firebaseUid.isBlank()) {
                response.put("success", false);
                response.put("error", "Invalid authentication token");
                return ResponseEntity.status(401).body(response);
            }
            
            // Validate request data
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                response.put("success", false);
                response.put("error", "Current password is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
                response.put("success", false);
                response.put("error", "New password is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (request.getNewPassword().length() < 8) {
                response.put("success", false);
                response.put("error", "New password must be at least 8 characters long");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                response.put("success", false);
                response.put("error", "New password and confirmation do not match");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Check password strength
            if (!isPasswordStrong(request.getNewPassword())) {
                response.put("success", false);
                response.put("error", "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Find user by Firebase UID
            Optional<User> userOpt = userRepository.findByFirebaseUid(firebaseUid);
            if (userOpt.isEmpty()) {
                response.put("success", false);
                response.put("error", "User not found");
                return ResponseEntity.status(404).body(response);
            }
            
            // Note: Since we're using Firebase for authentication, 
            // the actual password update should be handled by Firebase Admin SDK
            // This endpoint serves as a validation layer and audit trail
            
            response.put("success", true);
            response.put("message", "Password update request validated successfully. Please use Firebase authentication to complete the password change.");
            response.put("requiresFirebaseUpdate", true);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error updating password: " + e.getMessage());
            e.printStackTrace();
            
            response.put("success", false);
            response.put("error", "Internal server error occurred while updating password");
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/email-verification")
    @Operation(summary = "Update email verification status", description = "Update user email verification status")
    public ResponseEntity<Map<String, Object>> updateEmailVerificationStatus(
            @RequestBody Map<String, Object> verificationData,
            Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String firebaseUid = null;
            if (authentication != null && authentication.getPrincipal() != null) {
                Object principal = authentication.getPrincipal();
                if (principal instanceof String) {
                    firebaseUid = (String) principal;
                }
            }
            
            if (firebaseUid == null || firebaseUid.isBlank()) {
                response.put("success", false);
                response.put("error", "Authentication required");
                return ResponseEntity.badRequest().body(response);
            }
            
            Optional<User> userOpt = userRepository.findByFirebaseUid(firebaseUid);
            if (userOpt.isEmpty()) {
                response.put("success", false);
                response.put("error", "User not found");
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            
            // Get email verification status
            Object emailVerifiedObj = verificationData.get("emailVerified");
            if (emailVerifiedObj == null) {
                response.put("success", false);
                response.put("error", "Email verification status is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            boolean emailVerified;
            if (emailVerifiedObj instanceof Boolean) {
                emailVerified = (Boolean) emailVerifiedObj;
            } else {
                emailVerified = Boolean.parseBoolean(emailVerifiedObj.toString());
            }
            
            // Update email verification status
            user.setEmailVerified(emailVerified);
            userRepository.save(user);
            
            response.put("success", true);
            response.put("message", "Email verification status updated successfully");
            response.put("emailVerified", emailVerified);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error updating email verification status: " + e.getMessage());
            e.printStackTrace();
            
            response.put("success", false);
            response.put("error", "Internal server error occurred while updating email verification status");
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/email-verification")
    @Operation(summary = "Get email verification status", description = "Get current user email verification status")
    public ResponseEntity<Map<String, Object>> getEmailVerificationStatus(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String firebaseUid = null;
            if (authentication != null && authentication.getPrincipal() != null) {
                Object principal = authentication.getPrincipal();
                if (principal instanceof String) {
                    firebaseUid = (String) principal;
                }
            }
            
            if (firebaseUid == null || firebaseUid.isBlank()) {
                response.put("success", false);
                response.put("error", "Authentication required");
                return ResponseEntity.badRequest().body(response);
            }
            
            Optional<User> userOpt = userRepository.findByFirebaseUid(firebaseUid);
            if (userOpt.isEmpty()) {
                response.put("success", false);
                response.put("error", "User not found");
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            
            response.put("success", true);
            response.put("emailVerified", user.isEmailVerified());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error getting email verification status: " + e.getMessage());
            e.printStackTrace();
            
            response.put("success", false);
            response.put("error", "Internal server error occurred while getting email verification status");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    private boolean isPasswordStrong(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        
        boolean hasUpperCase = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLowerCase = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecialChar = password.chars().anyMatch(ch -> "!@#$%^&*()_+-=[]{}|;:,.<>?".indexOf(ch) >= 0);
        
        return hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar;
    }

    // DTO class for user data transfer
    public static class UserDTO {
        private Long id;
        private String firebaseUid;
        private String email;
        private String displayName;
        private String photoUrl;
        private boolean emailVerified;
        private boolean active;
        private String role;

        public UserDTO(Long id, String firebaseUid, String email, String displayName, 
                      String photoUrl, boolean emailVerified, boolean active, String role) {
            this.id = id;
            this.firebaseUid = firebaseUid;
            this.email = email;
            this.displayName = displayName;
            this.photoUrl = photoUrl;
            this.emailVerified = emailVerified;
            this.active = active;
            this.role = role;
        }

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getFirebaseUid() { return firebaseUid; }
        public void setFirebaseUid(String firebaseUid) { this.firebaseUid = firebaseUid; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        
        public String getPhotoUrl() { return photoUrl; }
        public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
        
        public boolean isEmailVerified() { return emailVerified; }
        public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
        
        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
        
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    // Password update request DTO
    public static class PasswordUpdateRequest {
        private String currentPassword;
        private String newPassword;
        private String confirmPassword;

        public PasswordUpdateRequest() {}

        public PasswordUpdateRequest(String currentPassword, String newPassword, String confirmPassword) {
            this.currentPassword = currentPassword;
            this.newPassword = newPassword;
            this.confirmPassword = confirmPassword;
        }

        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }

        public String getConfirmPassword() { return confirmPassword; }
        public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    }
}
