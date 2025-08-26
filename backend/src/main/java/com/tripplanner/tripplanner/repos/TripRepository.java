package com.tripplanner.tripplanner.repos;

import com.tripplanner.tripplanner.domain.Trip;
import org.springframework.data.jpa.repository.JpaRepository;


public interface TripRepository extends JpaRepository<Trip, Long> {
}
