package com.example.tripplanner.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "places")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Place {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Place name is required")
    @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    @Column(nullable = false)
    private String name;
    
    @NotBlank(message = "Location is required")
    @Size(min = 1, max = 255, message = "Location must be between 1 and 255 characters")
    @Column(nullable = false)
    private String location;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @NotNull(message = "Category is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlaceCategory category;
    
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    @Column(nullable = false)
    private Integer rating = 5;
    
    @DecimalMin(value = "0.0", inclusive = true, message = "Cost must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Cost must have at most 10 digits and 2 decimal places")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cost = BigDecimal.ZERO;
    
    @DecimalMin(value = "0.0", inclusive = true, message = "Duration must be non-negative")
    @Digits(integer = 3, fraction = 1, message = "Duration must have at most 3 digits and 1 decimal place")
    @Column(nullable = false, precision = 4, scale = 1)
    private BigDecimal duration = BigDecimal.valueOf(2.0);
    
    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    @Digits(integer = 3, fraction = 6, message = "Latitude must have at most 3 digits and 6 decimal places")
    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal latitude;
    
    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    @Digits(integer = 3, fraction = 6, message = "Longitude must have at most 3 digits and 6 decimal places")
    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal longitude;
    
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "place_photos", joinColumns = @JoinColumn(name = "place_id"))
    @Column(name = "photo_url", columnDefinition = "TEXT")
    private List<String> photos = new ArrayList<>();
    
    @Column
    private String website;
    
    @Column
    private String phoneNumber;
    
    @Column
    private String openingHours;
    
    @Column
    private String address;
    
    @Column
    private String city;
    
    @Column
    private String country;
    
    @Column
    private String postalCode;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;
    
    @OneToMany(mappedBy = "place", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Activity> activities = new ArrayList<>();
    
    // Enums
    public enum PlaceCategory {
        ATTRACTION, RESTAURANT, HOTEL, TRANSPORT, SHOPPING, ENTERTAINMENT, 
        CULTURAL, NATURE, SPORTS, RELIGIOUS, HISTORICAL, OTHER
    }
    
    // Helper methods
    public void addPhoto(String photoUrl) {
        photos.add(photoUrl);
    }
    
    public void removePhoto(String photoUrl) {
        photos.remove(photoUrl);
    }
    
    public void addActivity(Activity activity) {
        activities.add(activity);
        activity.setPlace(this);
    }
    
    public void removeActivity(Activity activity) {
        activities.remove(activity);
        activity.setPlace(null);
    }
    
    // Coordinate helper methods
    public boolean hasValidCoordinates() {
        return latitude != null && longitude != null;
    }
    
    public double getLatitudeAsDouble() {
        return latitude != null ? latitude.doubleValue() : 0.0;
    }
    
    public double getLongitudeAsDouble() {
        return longitude != null ? longitude.doubleValue() : 0.0;
    }
    
    public void setCoordinates(double lat, double lng) {
        this.latitude = BigDecimal.valueOf(lat);
        this.longitude = BigDecimal.valueOf(lng);
    }
}
