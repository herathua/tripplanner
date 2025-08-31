package com.example.tripplanner.repository;

import com.example.tripplanner.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByFirebaseUid(String firebaseUid);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByFirebaseUid(String firebaseUid);
    
    boolean existsByEmail(String email);
    
    List<User> findByRole(User.UserRole role);
    
    List<User> findByActiveTrue();
    
    @Query("SELECT u FROM User u WHERE u.email LIKE %:email% OR u.displayName LIKE %:name%")
    List<User> findByEmailContainingOrDisplayNameContaining(@Param("email") String email, @Param("name") String name);
    
    @Query("SELECT u FROM User u WHERE u.createdAt >= :since")
    List<User> findUsersCreatedSince(@Param("since") java.time.LocalDateTime since);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.active = true")
    long countActiveUsers();
    
    @Query("SELECT u FROM User u WHERE u.emailVerified = true AND u.active = true")
    List<User> findVerifiedActiveUsers();
}
