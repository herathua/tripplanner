package com.example.tripplanner.controller;

import com.example.tripplanner.model.User;
import com.example.tripplanner.repository.UserRepository;
import com.example.tripplanner.repository.TripRepository;
import com.example.tripplanner.repository.BlogPostRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/admin")
@Tag(name = "Admin Management", description = "APIs for admin operations")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private BlogPostRepository blogPostRepository;


    @GetMapping("/stats")
    @Operation(summary = "Get admin dashboard statistics")
    public ResponseEntity<Map<String, Object>> getAdminStats(Authentication authentication) {
        Map<String, Object> stats = new HashMap<>();
        
        // Basic stats
        stats.put("totalUsers", userRepository.count());
        stats.put("activeUsers", userRepository.countByActiveTrue());
        stats.put("totalTrips", tripRepository.count());
        stats.put("totalBlogPosts", blogPostRepository.count());
        
        // User role distribution
        Map<String, Long> roleDistribution = new HashMap<>();
        roleDistribution.put("USER", userRepository.countByRole(User.UserRole.USER));
        roleDistribution.put("ADMIN", userRepository.countByRole(User.UserRole.ADMIN));
        roleDistribution.put("PREMIUM", userRepository.countByRole(User.UserRole.PREMIUM));
        stats.put("userRoleDistribution", roleDistribution);
        
        // Recent registrations (last 7 days)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        stats.put("recentRegistrations", userRepository.countByCreatedAtAfter(weekAgo));
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    @Operation(summary = "Get all users (admin only)")
    public ResponseEntity<List<User>> getAllUsers(Authentication authentication) {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/role")
    @Operation(summary = "Update user role")
    public ResponseEntity<User> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        String roleStr = request.get("role");
        try {
            User.UserRole role = User.UserRole.valueOf(roleStr);
            user.setRole(role);
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "Toggle user active status")
    public ResponseEntity<User> toggleUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request,
            Authentication authentication) {
        
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        user.setActive(request.get("active"));
        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete user (admin only)")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            Authentication authentication) {
        
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/logs")
    @Operation(summary = "Get system logs")
    public ResponseEntity<List<Map<String, Object>>> getSystemLogs(
            @RequestParam(defaultValue = "100") int limit,
            Authentication authentication) {
        
        // This is a simplified implementation
        // In a real application, you'd want to use a proper logging framework
        List<Map<String, Object>> logs = List.of(
            Map.of(
                "id", "1",
                "level", "INFO",
                "message", "Admin dashboard accessed",
                "timestamp", LocalDateTime.now().toString(),
                "userId", authentication.getName()
            )
        );
        
        return ResponseEntity.ok(logs);
    }


    @GetMapping("/export/users")
    @Operation(summary = "Export user data")
    public ResponseEntity<byte[]> exportUserData(Authentication authentication) {
        try {
            List<User> users = userRepository.findAll();
            
            // Create CSV content
            StringBuilder csvContent = new StringBuilder();
            csvContent.append("ID,Email,Display Name,Role,Active,Created At,Updated At\n");
            
            for (User user : users) {
                csvContent.append(String.format("%d,%s,%s,%s,%s,%s,%s\n",
                    user.getId(),
                    user.getEmail() != null ? user.getEmail() : "",
                    user.getDisplayName() != null ? user.getDisplayName() : "",
                    user.getRole() != null ? user.getRole().toString() : "USER",
                    user.isActive() ? "true" : "false",
                    user.getCreatedAt() != null ? user.getCreatedAt().toString() : "",
                    user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : ""
                ));
            }
            
            byte[] csvBytes = csvContent.toString().getBytes("UTF-8");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", 
                "users-export-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HH-mm-ss")) + ".csv");
            headers.setContentLength(csvBytes.length);
            
            // Log the export for audit purposes
            System.out.println(String.format("Admin %s exported user data (%d users)", 
                authentication.getName(), users.size()));
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(csvBytes);
                
        } catch (Exception e) {
            System.err.println("Error exporting user data: " + e.getMessage());
            return ResponseEntity.status(500).body(new byte[0]);
        }
    }
}
