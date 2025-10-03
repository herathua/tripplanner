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
    private static final String DEV_FIREBASE_UID = "BGCJQjqmIlZvj67EvkewU2BpUK43"; // Use a consistent dev UID
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        
        String authUserId = null;
        
        if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
            // For development, use consistent dev UID when no auth header
            authUserId = DEV_FIREBASE_UID;
            System.out.println("No auth header - using dev Firebase UID: " + DEV_FIREBASE_UID);
        } else {
            String token = header.substring(7);
            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                authUserId = decodedToken.getUid();
                System.out.println("✅ Firebase token verified successfully for UID: " + authUserId);
            } catch (Exception e) {
                // For development, use consistent dev UID when token fails
                authUserId = DEV_FIREBASE_UID;
                System.out.println("Firebase token verification failed: " + e.getMessage());
                System.out.println("Using dev Firebase UID: " + DEV_FIREBASE_UID);
            }
        }
        
        // Set authentication with consistent UID
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        authUserId, null, Collections.emptyList());
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        filterChain.doFilter(request, response);
    }
}
