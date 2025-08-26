package com.tripplanner.tripplanner.repos;

import com.tripplanner.tripplanner.domain.ItineraryItem;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ItineraryItemRepository extends JpaRepository<ItineraryItem, Long> {
}
