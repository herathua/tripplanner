package com.example.tripplanner.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

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
    
    @Column(name = "photo_url", columnDefinition = "TEXT", length = 65535)
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
    
    @Column(name = "preferred_currency", length = 3)
    private String preferredCurrency = "USD";
    
    @CreationTimestamp
    @Column(name = "date_created", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "last_updated")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnore
    private Set<Trip> trips = new HashSet<>();
    
    @OneToMany(mappedBy = "sharedWith", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnore
    private Set<TripShare> sharedTrips = new HashSet<>();
    
    public enum UserRole {
        USER, ADMIN, PREMIUM
    }
    
    // Helper methods
    @JsonIgnore
    public void addTrip(Trip trip) {
        trips.add(trip);
        trip.setUser(this);
    }
    
    @JsonIgnore
    public void removeTrip(Trip trip) {
        trips.remove(trip);
        trip.setUser(null);
    }
    
    // Override toString to prevent circular reference issues
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", firebaseUid='" + firebaseUid + '\'' +
                ", email='" + email + '\'' +
                ", displayName='" + displayName + '\'' +
                ", role=" + role +
                ", emailVerified=" + emailVerified +
                ", active=" + active +
                '}';
    }
    
    // Override equals and hashCode to prevent issues with collections
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return id != null && id.equals(user.getId());
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
