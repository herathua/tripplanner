package com.example.tripplanner.repository;

import com.example.tripplanner.model.Trip;
import com.example.tripplanner.model.TripShare;
import com.example.tripplanner.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripShareRepository extends JpaRepository<TripShare, Long> {
    
    List<TripShare> findByTrip(Trip trip);
    
    List<TripShare> findBySharedWith(User sharedWith);
    
    List<TripShare> findByTripAndStatus(Trip trip, TripShare.ShareStatus status);
    
    List<TripShare> findBySharedWithAndStatus(User sharedWith, TripShare.ShareStatus status);
    
    List<TripShare> findByTripAndPermission(Trip trip, TripShare.SharePermission permission);
    
    List<TripShare> findBySharedWithAndPermission(User sharedWith, TripShare.SharePermission permission);
    
    Optional<TripShare> findByTripAndSharedWith(Trip trip, User sharedWith);
    
    Optional<TripShare> findByShareToken(String shareToken);
    
    @Query("SELECT ts FROM TripShare ts WHERE ts.trip = :trip AND ts.sharedWith = :user AND ts.status = 'ACCEPTED'")
    Optional<TripShare> findAcceptedShare(@Param("trip") Trip trip, @Param("user") User user);
    
    @Query("SELECT ts FROM TripShare ts WHERE ts.trip = :trip AND ts.sharedWith = :user AND (ts.status = 'ACCEPTED' OR ts.status = 'PENDING')")
    Optional<TripShare> findActiveShare(@Param("trip") Trip trip, @Param("user") User user);
    
    @Query("SELECT ts FROM TripShare ts WHERE ts.trip = :trip AND ts.status = 'PENDING'")
    List<TripShare> findPendingShares(@Param("trip") Trip trip);
    
    @Query("SELECT ts FROM TripShare ts WHERE ts.sharedWith = :user AND ts.status = 'PENDING'")
    List<TripShare> findPendingSharesForUser(@Param("user") User user);
    
    @Query("SELECT ts FROM TripShare ts WHERE ts.trip = :trip AND ts.status = 'ACCEPTED'")
    List<TripShare> findAcceptedShares(@Param("trip") Trip trip);
    
    @Query("SELECT ts FROM TripShare ts WHERE ts.sharedWith = :user AND ts.status = 'ACCEPTED'")
    List<TripShare> findAcceptedSharesForUser(@Param("user") User user);
    
    @Query("SELECT ts FROM TripShare ts WHERE ts.expiresAt IS NOT NULL AND ts.expiresAt < :now AND ts.status = 'PENDING'")
    List<TripShare> findExpiredShares(@Param("now") LocalDateTime now);
    
    @Query("SELECT ts FROM TripShare ts WHERE ts.trip = :trip AND ts.status = 'ACCEPTED' AND (ts.permission = 'EDIT' OR ts.permission = 'ADMIN')")
    List<TripShare> findEditShares(@Param("trip") Trip trip);
    
    @Query("SELECT ts FROM TripShare ts WHERE ts.trip = :trip AND ts.status = 'ACCEPTED' AND ts.permission = 'ADMIN'")
    List<TripShare> findAdminShares(@Param("trip") Trip trip);
    
    @Query("SELECT ts FROM TripShare ts WHERE ts.sharedWith = :user AND ts.status = 'ACCEPTED' AND (ts.permission = 'EDIT' OR ts.permission = 'ADMIN')")
    List<TripShare> findEditSharesForUser(@Param("user") User user);
    
    @Query("SELECT ts FROM TripShare ts WHERE ts.sharedWith = :user AND ts.status = 'ACCEPTED' AND ts.permission = 'ADMIN'")
    List<TripShare> findAdminSharesForUser(@Param("user") User user);
    
    // Statistics
    @Query("SELECT COUNT(ts) FROM TripShare ts WHERE ts.trip = :trip")
    long countByTrip(@Param("trip") Trip trip);
    
    @Query("SELECT COUNT(ts) FROM TripShare ts WHERE ts.trip = :trip AND ts.status = :status")
    long countByTripAndStatus(@Param("trip") Trip trip, @Param("status") TripShare.ShareStatus status);
    
    @Query("SELECT COUNT(ts) FROM TripShare ts WHERE ts.sharedWith = :user AND ts.status = :status")
    long countBySharedWithAndStatus(@Param("user") User user, @Param("status") TripShare.ShareStatus status);
    
    @Query("SELECT ts.status, COUNT(ts) FROM TripShare ts WHERE ts.trip = :trip GROUP BY ts.status")
    List<Object[]> findStatusCountsByTrip(@Param("trip") Trip trip);
    
    @Query("SELECT ts.permission, COUNT(ts) FROM TripShare ts WHERE ts.trip = :trip AND ts.status = 'ACCEPTED' GROUP BY ts.permission")
    List<Object[]> findPermissionCountsByTrip(@Param("trip") Trip trip);
    
    // Recent shares
    @Query("SELECT ts FROM TripShare ts WHERE ts.trip = :trip ORDER BY ts.createdAt DESC")
    List<TripShare> findRecentShares(@Param("trip") Trip trip);
    
    @Query("SELECT ts FROM TripShare ts WHERE ts.sharedWith = :user ORDER BY ts.createdAt DESC")
    List<TripShare> findRecentSharesForUser(@Param("user") User user);
    
    // Check if user has access to trip
    @Query("SELECT CASE WHEN COUNT(ts) > 0 THEN true ELSE false END FROM TripShare ts WHERE ts.trip = :trip AND ts.sharedWith = :user AND ts.status = 'ACCEPTED'")
    boolean hasAccess(@Param("trip") Trip trip, @Param("user") User user);
    
    // Check if user has edit access to trip
    @Query("SELECT CASE WHEN COUNT(ts) > 0 THEN true ELSE false END FROM TripShare ts WHERE ts.trip = :trip AND ts.sharedWith = :user AND ts.status = 'ACCEPTED' AND (ts.permission = 'EDIT' OR ts.permission = 'ADMIN')")
    boolean hasEditAccess(@Param("trip") Trip trip, @Param("user") User user);
    
    // Check if user has admin access to trip
    @Query("SELECT CASE WHEN COUNT(ts) > 0 THEN true ELSE false END FROM TripShare ts WHERE ts.trip = :trip AND ts.sharedWith = :user AND ts.status = 'ACCEPTED' AND ts.permission = 'ADMIN'")
    boolean hasAdminAccess(@Param("trip") Trip trip, @Param("user") User user);
}
