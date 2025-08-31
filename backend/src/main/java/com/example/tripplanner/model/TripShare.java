package com.example.tripplanner.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "trip_shares")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripShare {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Trip is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;
    
    @NotNull(message = "Shared with user is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_with_user_id", nullable = false)
    private User sharedWith;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SharePermission permission = SharePermission.VIEW;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShareStatus status = ShareStatus.PENDING;
    
    @Column
    private String message;
    
    @Column
    private String shareToken;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Enums
    public enum SharePermission {
        VIEW, EDIT, ADMIN
    }
    
    public enum ShareStatus {
        PENDING, ACCEPTED, DECLINED, EXPIRED, REVOKED
    }
    
    // Helper methods
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
    
    public boolean isAccepted() {
        return ShareStatus.ACCEPTED.equals(status);
    }
    
    public boolean isPending() {
        return ShareStatus.PENDING.equals(status);
    }
    
    public boolean isDeclined() {
        return ShareStatus.DECLINED.equals(status);
    }
    
    public boolean isRevoked() {
        return ShareStatus.REVOKED.equals(status);
    }
    
    public boolean canEdit() {
        return ShareStatus.ACCEPTED.equals(status) && 
               (SharePermission.EDIT.equals(permission) || SharePermission.ADMIN.equals(permission));
    }
    
    public boolean canAdmin() {
        return ShareStatus.ACCEPTED.equals(status) && SharePermission.ADMIN.equals(permission);
    }
    
    public boolean canView() {
        return ShareStatus.ACCEPTED.equals(status);
    }
    
    public void accept() {
        this.status = ShareStatus.ACCEPTED;
        this.acceptedAt = LocalDateTime.now();
    }
    
    public void decline() {
        this.status = ShareStatus.DECLINED;
    }
    
    public void revoke() {
        this.status = ShareStatus.REVOKED;
    }
    
    public void expire() {
        this.status = ShareStatus.EXPIRED;
    }
}
