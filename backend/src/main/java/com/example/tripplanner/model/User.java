package com.example.tripplanner.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Firebase UID is required")
    @Column(unique = true, nullable = false)
    private String firebaseUid;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column(unique = true, nullable = false)
    private String email;
    
    @NotBlank(message = "Display name is required")
    @Column(nullable = false)
    private String displayName;
    
    @Column
    private String photoUrl;
    
    @Column
    private String phoneNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.USER;
    
    @Column(nullable = false)
    private boolean emailVerified = false;
    
    @Column(nullable = false)
    private boolean active = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Trip> trips = new HashSet<>();
    
    @OneToMany(mappedBy = "sharedWith", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<TripShare> sharedTrips = new HashSet<>();
    
    public enum UserRole {
        USER, ADMIN, PREMIUM
    }
    
    // Helper methods
    public void addTrip(Trip trip) {
        trips.add(trip);
        trip.setUser(this);
    }
    
    public void removeTrip(Trip trip) {
        trips.remove(trip);
        trip.setUser(null);
    }
}
