package com.example.tripplanner.controller;

import com.example.tripplanner.model.User;
import com.example.tripplanner.repository.UserRepository;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@Tag(name = "File Upload", description = "File upload operations")
@CrossOrigin(origins = "*")
public class FileUploadController {

    @Autowired
    private UserRepository userRepository;

    @Value("${firebase.project-id}")
    private String projectId;

    @Value("${firebase.bucket-name:chatbot-3be85.firebasestorage.app}")
    private String bucketName;

    @PostMapping("/upload-profile-photo")
    @Operation(summary = "Upload profile photo", description = "Upload a profile photo for the authenticated user")
    public ResponseEntity<String> uploadProfilePhoto(
            @Parameter(description = "Profile photo file") 
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }
            
            if (!file.getContentType().startsWith("image/")) {
                return ResponseEntity.badRequest().body("File must be an image");
            }
            
            if (file.getSize() > 5 * 1024 * 1024) { // 5MB limit
                return ResponseEntity.badRequest().body("File size must be less than 5MB");
            }

            // Get user ID from authentication
            String userId = null;
            if (authentication != null && authentication.getPrincipal() != null) {
                Object principal = authentication.getPrincipal();
                if (principal instanceof String) {
                    userId = (String) principal;
                }
            }
            
            if (userId == null) {
                return ResponseEntity.badRequest().body("User not authenticated");
            }

            // Find user in database
            Optional<User> userOpt = userRepository.findByFirebaseUid(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }

            // Generate unique filename
            String fileName = "profile-photos/" + userId + "/" + UUID.randomUUID().toString() + "-" + file.getOriginalFilename();
            
            // Upload to Firebase Storage using Admin SDK
            String photoUrl = uploadToFirebaseStorage(file, fileName);
            
            if (photoUrl == null) {
                return ResponseEntity.status(500).body("Failed to upload to Firebase Storage");
            }

            // Update user profile in database
            User user = userOpt.get();
            user.setPhotoUrl(photoUrl);
            userRepository.save(user);

            return ResponseEntity.ok(photoUrl);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    private String uploadToFirebaseStorage(MultipartFile file, String fileName) {
        try {
            // Initialize Firebase Storage
            Storage storage = StorageOptions.newBuilder()
                    .setProjectId(projectId)
                    .build()
                    .getService();

            // Create blob info
            BlobId blobId = BlobId.of(bucketName, fileName);
            BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                    .setContentType(file.getContentType())
                    .build();

            // Upload file
            storage.create(blobInfo, file.getBytes());

            // Return public URL
            return String.format("https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media", 
                    bucketName, fileName.replace("/", "%2F"));

        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    @DeleteMapping("/delete-profile-photo")
    @Operation(summary = "Delete profile photo", description = "Delete the profile photo for the authenticated user")
    public ResponseEntity<String> deleteProfilePhoto(Authentication authentication) {
        try {
            // Get user ID from authentication
            String userId = null;
            if (authentication != null && authentication.getPrincipal() != null) {
                Object principal = authentication.getPrincipal();
                if (principal instanceof String) {
                    userId = (String) principal;
                }
            }
            
            if (userId == null) {
                return ResponseEntity.badRequest().body("User not authenticated");
            }

            // Find user in database
            Optional<User> userOpt = userRepository.findByFirebaseUid(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }

            // Update user profile in database
            User user = userOpt.get();
            user.setPhotoUrl(null);
            userRepository.save(user);

            return ResponseEntity.ok("Profile photo deleted successfully");
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Delete failed: " + e.getMessage());
        }
    }
}
