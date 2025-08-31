package com.example.tripplanner.repository;

import com.example.tripplanner.model.BudgetAlert;
import com.example.tripplanner.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BudgetAlertRepository extends JpaRepository<BudgetAlert, Long> {
    
    List<BudgetAlert> findByTrip(Trip trip);
    
    List<BudgetAlert> findByTripOrderByCreatedAtDesc(Trip trip);
    
    List<BudgetAlert> findByTripAndStatus(Trip trip, BudgetAlert.AlertStatus status);
    
    List<BudgetAlert> findByTripAndAlertType(Trip trip, BudgetAlert.AlertType alertType);
    
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.status = 'ACTIVE'")
    List<BudgetAlert> findActiveAlerts(@Param("trip") Trip trip);
    
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.status = 'ACTIVE' AND ba.alertType = :alertType")
    List<BudgetAlert> findActiveAlertsByType(@Param("trip") Trip trip, @Param("alertType") BudgetAlert.AlertType alertType);
    
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.status = 'ACKNOWLEDGED'")
    List<BudgetAlert> findAcknowledgedAlerts(@Param("trip") Trip trip);
    
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.status = 'RESOLVED'")
    List<BudgetAlert> findResolvedAlerts(@Param("trip") Trip trip);
    
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.status = 'DISMISSED'")
    List<BudgetAlert> findDismissedAlerts(@Param("trip") Trip trip);
    
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.triggeredAt >= :since")
    List<BudgetAlert> findRecentAlerts(@Param("trip") Trip trip, @Param("since") LocalDateTime since);
    
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.triggeredAt IS NULL")
    List<BudgetAlert> findUntriggeredAlerts(@Param("trip") Trip trip);
    
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.triggeredAt IS NOT NULL")
    List<BudgetAlert> findTriggeredAlerts(@Param("trip") Trip trip);
    
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.acknowledgedAt IS NOT NULL")
    List<BudgetAlert> findAcknowledgedAlertsWithTimestamp(@Param("trip") Trip trip);
    
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.resolvedAt IS NOT NULL")
    List<BudgetAlert> findResolvedAlertsWithTimestamp(@Param("trip") Trip trip);
    
    // Urgent alerts
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.status = 'ACTIVE' AND (ba.alertType = 'BUDGET_EXCEEDED' OR ba.thresholdPercentage >= 90)")
    List<BudgetAlert> findUrgentAlerts(@Param("trip") Trip trip);
    
    // Alerts by threshold range
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.thresholdPercentage >= :minThreshold AND ba.thresholdPercentage <= :maxThreshold")
    List<BudgetAlert> findByTripAndThresholdRange(@Param("trip") Trip trip, @Param("minThreshold") java.math.BigDecimal minThreshold, @Param("maxThreshold") java.math.BigDecimal maxThreshold);
    
    // Alerts by current amount range
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.currentAmount >= :minAmount AND ba.currentAmount <= :maxAmount")
    List<BudgetAlert> findByTripAndCurrentAmountRange(@Param("trip") Trip trip, @Param("minAmount") java.math.BigDecimal minAmount, @Param("maxAmount") java.math.BigDecimal maxAmount);
    
    // Alerts by budget amount range
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.budgetAmount >= :minBudget AND ba.budgetAmount <= :maxBudget")
    List<BudgetAlert> findByTripAndBudgetAmountRange(@Param("trip") Trip trip, @Param("minBudget") java.math.BigDecimal minBudget, @Param("maxBudget") java.math.BigDecimal maxBudget);
    
    // Over-budget alerts
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.currentAmount > ba.budgetAmount")
    List<BudgetAlert> findOverBudgetAlerts(@Param("trip") Trip trip);
    
    // Near threshold alerts
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.currentAmount >= (ba.budgetAmount * ba.thresholdPercentage / 100)")
    List<BudgetAlert> findNearThresholdAlerts(@Param("trip") Trip trip);
    
    // Statistics
    @Query("SELECT COUNT(ba) FROM BudgetAlert ba WHERE ba.trip = :trip")
    long countByTrip(@Param("trip") Trip trip);
    
    @Query("SELECT COUNT(ba) FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.status = :status")
    long countByTripAndStatus(@Param("trip") Trip trip, @Param("status") BudgetAlert.AlertStatus status);
    
    @Query("SELECT COUNT(ba) FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.alertType = :alertType")
    long countByTripAndAlertType(@Param("trip") Trip trip, @Param("alertType") BudgetAlert.AlertType alertType);
    
    @Query("SELECT ba.status, COUNT(ba) FROM BudgetAlert ba WHERE ba.trip = :trip GROUP BY ba.status")
    List<Object[]> findStatusCountsByTrip(@Param("trip") Trip trip);
    
    @Query("SELECT ba.alertType, COUNT(ba) FROM BudgetAlert ba WHERE ba.trip = :trip GROUP BY ba.alertType")
    List<Object[]> findAlertTypeCountsByTrip(@Param("trip") Trip trip);
    
    @Query("SELECT ba.alertType, COUNT(ba) FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.status = 'ACTIVE' GROUP BY ba.alertType")
    List<Object[]> findActiveAlertTypeCountsByTrip(@Param("trip") Trip trip);
    
    // Recent alerts by type
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.alertType = :alertType ORDER BY ba.createdAt DESC")
    List<BudgetAlert> findRecentAlertsByType(@Param("trip") Trip trip, @Param("alertType") BudgetAlert.AlertType alertType);
    
    // Alerts that need attention (active and urgent)
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.status = 'ACTIVE' AND (ba.alertType = 'BUDGET_EXCEEDED' OR ba.alertType = 'BUDGET_WARNING') ORDER BY ba.createdAt DESC")
    List<BudgetAlert> findAlertsNeedingAttention(@Param("trip") Trip trip);
    
    // Check if trip has active alerts
    @Query("SELECT CASE WHEN COUNT(ba) > 0 THEN true ELSE false END FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.status = 'ACTIVE'")
    boolean hasActiveAlerts(@Param("trip") Trip trip);
    
    // Check if trip has urgent alerts
    @Query("SELECT CASE WHEN COUNT(ba) > 0 THEN true ELSE false END FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.status = 'ACTIVE' AND (ba.alertType = 'BUDGET_EXCEEDED' OR ba.thresholdPercentage >= 90)")
    boolean hasUrgentAlerts(@Param("trip") Trip trip);
    
    // Find alerts created in date range
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.createdAt BETWEEN :startDate AND :endDate")
    List<BudgetAlert> findByTripAndCreatedDateRange(@Param("trip") Trip trip, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Find alerts triggered in date range
    @Query("SELECT ba FROM BudgetAlert ba WHERE ba.trip = :trip AND ba.triggeredAt BETWEEN :startDate AND :endDate")
    List<BudgetAlert> findByTripAndTriggeredDateRange(@Param("trip") Trip trip, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
