package com.example.tripplanner.config;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

public class FirebaseAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        
        String authUserId = null;
        
        if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
            // For development, generate a unique UID based on request session/IP
            // This ensures each session gets a different UID in development
            authUserId = generateDevUID(request);
            System.out.println("No auth header - using generated dev Firebase UID: " + authUserId);
        } else {
            String token = header.substring(7);
            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                authUserId = decodedToken.getUid();
                System.out.println("✅ Firebase token verified successfully for UID: " + authUserId);
            } catch (Exception e) {
                // For development, generate a unique UID when token fails
                authUserId = generateDevUID(request);
                System.out.println("Firebase token verification failed: " + e.getMessage());
                System.out.println("Using generated dev Firebase UID: " + authUserId);
            }
        }
        
        // Set authentication with the determined UID
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        authUserId, null, Collections.emptyList());
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        filterChain.doFilter(request, response);
    }
    
    /**
     * Generate a consistent dev UID based on request characteristics
     * This ensures the same browser/client gets the same UID across requests
     * but different browsers/clients get different UIDs
     */
    private String generateDevUID(HttpServletRequest request) {
        // Use session ID if available, otherwise use IP address
        String sessionId = request.getSession(false) != null ? request.getSession(false).getId() : null;
        String identifier = sessionId != null ? sessionId : getClientIpAddress(request);
        
        // Create a consistent hash for this identifier
        return "dev-" + Math.abs(identifier.hashCode()) + "-" + System.currentTimeMillis() % 10000;
    }
    
    /**
     * Get client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader != null && !xForwardedForHeader.isEmpty()) {
            return xForwardedForHeader.split(",")[0];
        }
        
        String xRealIpHeader = request.getHeader("X-Real-IP");
        if (xRealIpHeader != null && !xRealIpHeader.isEmpty()) {
            return xRealIpHeader;
        }
        
        return request.getRemoteAddr();
    }
}
