package com.example.tripplanner.service;

import com.example.tripplanner.dto.TripDTO;
import com.example.tripplanner.dto.PlaceDTO;
import com.example.tripplanner.dto.ExpenseDTO;
import com.example.tripplanner.dto.ActivityDTO;
import com.example.tripplanner.dto.ItineraryDTO;
import com.example.tripplanner.dto.TripPlanDTO;
import com.example.tripplanner.dto.PagedResponseDTO;
import com.example.tripplanner.model.*;
import com.example.tripplanner.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@Transactional
public class TripService {

    @Autowired
    private TripRepository tripRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PlaceRepository placeRepository;
    
    @Autowired
    private ExpenseRepository expenseRepository;
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private ItineraryRepository itineraryRepository;

    // Trip CRUD Operations
    public TripDTO createTrip(TripDTO tripDTO, String firebaseUid) {
        System.out.println("=== CREATING TRIP ===");
        System.out.println("Trip DTO: " + tripDTO);
        System.out.println("Firebase UID: " + firebaseUid);
        
        // Find user by Firebase UID
        User user = userRepository.findByFirebaseUid(firebaseUid)
            .orElseThrow(() -> new RuntimeException("User not found with Firebase UID: " + firebaseUid));
        
        // Convert DTO to Entity
        Trip trip = new Trip();
        trip.setTitle(tripDTO.getTitle());
        trip.setDestination(tripDTO.getDestination());
        trip.setStartDate(tripDTO.getStartDate());
        trip.setEndDate(tripDTO.getEndDate());
        trip.setBudget(tripDTO.getBudget());
        trip.setDescription(tripDTO.getDescription());
        trip.setStatus(tripDTO.getStatus() != null ? tripDTO.getStatus() : Trip.TripStatus.PLANNING);
        trip.setVisibility(tripDTO.getVisibility() != null ? tripDTO.getVisibility() : Trip.TripVisibility.PRIVATE);
        trip.setUser(user);
        
        // Save trip
        Trip savedTrip = tripRepository.save(trip);
        System.out.println("✅ Trip created with ID: " + savedTrip.getId());
        
        // Create initial itinerary day if provided
        if (tripDTO.getItineraryData() != null && tripDTO.getItineraryData().getDays() != null) {
            for (TripDTO.ItineraryDataDTO.DayDTO dayDTO : tripDTO.getItineraryData().getDays()) {
                Itinerary itinerary = new Itinerary();
                itinerary.setDayNumber(dayDTO.getDayNumber());
                itinerary.setDate(LocalDate.parse(dayDTO.getDate()));
                itinerary.setTrip(savedTrip);
                itineraryRepository.save(itinerary);
            }
        }
        
        return convertToTripDTO(savedTrip);
    }

    public List<TripDTO> getAllTrips() {
        List<Trip> trips = tripRepository.findAll();
        return trips.stream()
            .map(this::convertToTripDTO)
            .collect(Collectors.toList());
    }

    public Optional<TripDTO> getTripById(Long id) {
        return tripRepository.findById(id)
            .map(this::convertToTripDTO);
    }

    public TripDTO updateTrip(Long id, TripDTO tripDTO) {
        System.out.println("=== UPDATING TRIP ===");
        System.out.println("Trip ID: " + id);
        System.out.println("Trip DTO: " + tripDTO);
        
        Trip existingTrip = tripRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + id));
        
        // Update fields
        if (tripDTO.getTitle() != null) existingTrip.setTitle(tripDTO.getTitle());
        if (tripDTO.getDestination() != null) existingTrip.setDestination(tripDTO.getDestination());
        if (tripDTO.getStartDate() != null) existingTrip.setStartDate(tripDTO.getStartDate());
        if (tripDTO.getEndDate() != null) existingTrip.setEndDate(tripDTO.getEndDate());
        if (tripDTO.getBudget() != null) existingTrip.setBudget(tripDTO.getBudget());
        if (tripDTO.getDescription() != null) existingTrip.setDescription(tripDTO.getDescription());
        if (tripDTO.getStatus() != null) existingTrip.setStatus(tripDTO.getStatus());
        if (tripDTO.getVisibility() != null) existingTrip.setVisibility(tripDTO.getVisibility());
        
        Trip updatedTrip = tripRepository.save(existingTrip);
        System.out.println("✅ Trip updated successfully");
        
        return convertToTripDTO(updatedTrip);
    }

    public void deleteTrip(Long id) {
        tripRepository.deleteById(id);
    }

    // Place Operations
    public List<PlaceDTO> getPlacesByTripId(Long tripId) {
        List<Place> places = placeRepository.findByTripId(tripId);
        return places.stream()
            .map(this::convertToPlaceDTO)
            .collect(Collectors.toList());
    }

    public PlaceDTO addPlaceToTrip(Long tripId, PlaceDTO placeDTO) {
        System.out.println("=== ADDING PLACE TO TRIP ===");
        System.out.println("Trip ID: " + tripId);
        System.out.println("Place DTO: " + placeDTO);
        
        Trip trip = tripRepository.findById(tripId)
            .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));
        
        Place place = new Place();
        place.setName(placeDTO.getName());
        place.setLocation(placeDTO.getLocation());
        place.setDescription(placeDTO.getDescription());
        place.setCategory(placeDTO.getCategory());
        place.setRating(placeDTO.getRating());
        place.setCost(placeDTO.getCost());
        place.setDuration(placeDTO.getDuration());
        place.setLatitude(placeDTO.getLatitude());
        place.setLongitude(placeDTO.getLongitude());
        place.setPhotos(placeDTO.getPhotos());
        place.setTrip(trip);
        
        Place savedPlace = placeRepository.save(place);
        System.out.println("✅ Place added with ID: " + savedPlace.getId());
        
        return convertToPlaceDTO(savedPlace);
    }

    public void removePlaceFromTrip(Long tripId, Long placeId) {
        Place place = placeRepository.findById(placeId)
            .orElseThrow(() -> new RuntimeException("Place not found with ID: " + placeId));
        
        if (!place.getTrip().getId().equals(tripId)) {
            throw new RuntimeException("Place does not belong to the specified trip");
        }
        
        placeRepository.delete(place);
    }

    // Expense Operations
    public List<ExpenseDTO> getExpensesByTripId(Long tripId) {
        List<Expense> expenses = expenseRepository.findByTripId(tripId);
        return expenses.stream()
            .map(this::convertToExpenseDTO)
            .collect(Collectors.toList());
    }

    public ExpenseDTO createExpense(ExpenseDTO expenseDTO) {
        Trip trip = tripRepository.findById(expenseDTO.getTripId())
            .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + expenseDTO.getTripId()));
        
        Expense expense = new Expense();
        expense.setDayNumber(expenseDTO.getDayNumber());
        expense.setExpenseDate(LocalDate.parse(expenseDTO.getExpenseDate()));
        expense.setCategory(expenseDTO.getCategory());
        expense.setDescription(expenseDTO.getDescription());
        expense.setAmount(expenseDTO.getAmount());
        expense.setCurrency(expenseDTO.getCurrency());
        expense.setReceiptUrl(expenseDTO.getReceiptUrl());
        expense.setPaymentMethod(expenseDTO.getPaymentMethod());
        expense.setVendor(expenseDTO.getVendor());
        expense.setLocation(expenseDTO.getLocation());
        expense.setNotes(expenseDTO.getNotes());
        expense.setReimbursable(expenseDTO.getReimbursable());
        expense.setReimbursed(expenseDTO.getReimbursed());
        expense.setReimbursementReference(expenseDTO.getReimbursementReference());
        expense.setStatus(expenseDTO.getStatus());
        expense.setTrip(trip);
        
        Expense savedExpense = expenseRepository.save(expense);
        return convertToExpenseDTO(savedExpense);
    }

    // Activity Operations
    public List<ActivityDTO> getActivitiesByTripId(Long tripId) {
        List<Activity> activities = activityRepository.findByTripId(tripId);
        return activities.stream()
            .map(this::convertToActivityDTO)
            .collect(Collectors.toList());
    }

    public ActivityDTO createActivity(ActivityDTO activityDTO) {
        Trip trip = tripRepository.findById(activityDTO.getTripId())
            .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + activityDTO.getTripId()));
        
        // Find itinerary if provided
        Itinerary itinerary = null;
        if (activityDTO.getItineraryId() != null) {
            itinerary = itineraryRepository.findById(activityDTO.getItineraryId())
                .orElseThrow(() -> new RuntimeException("Itinerary not found with ID: " + activityDTO.getItineraryId()));
        }
        
        Activity activity = new Activity();
        activity.setName(activityDTO.getName());
        activity.setDescription(activityDTO.getDescription());
        activity.setStartTime(activityDTO.getStartTime() != null ? 
            java.time.LocalTime.parse(activityDTO.getStartTime()) : null);
        activity.setEndTime(activityDTO.getEndTime() != null ? 
            java.time.LocalTime.parse(activityDTO.getEndTime()) : null);
        activity.setCost(activityDTO.getCost());
        activity.setDurationHours(activityDTO.getDurationHours() != null ? 
            activityDTO.getDurationHours().intValue() : null);
        activity.setType(activityDTO.getType());
        activity.setStatus(activityDTO.getStatus());
        activity.setTrip(trip);
        activity.setItinerary(itinerary);
        
        Activity savedActivity = activityRepository.save(activity);
        return convertToActivityDTO(savedActivity);
    }

    // Additional Activity Operations
    public List<ActivityDTO> getActivitiesByTripAndStatus(Long tripId, Activity.ActivityStatus status) {
        Trip trip = tripRepository.findById(tripId)
            .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));
        return activityRepository.findByTripAndStatus(trip, status).stream()
            .map(this::convertToActivityDTO)
            .collect(Collectors.toList());
    }

    public List<ActivityDTO> getActivitiesByTripAndType(Long tripId, Activity.ActivityType type) {
        Trip trip = tripRepository.findById(tripId)
            .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));
        return activityRepository.findByTripAndType(trip, type).stream()
            .map(this::convertToActivityDTO)
            .collect(Collectors.toList());
    }

    // Itinerary Operations
    public List<ItineraryDTO> getItinerariesByTripId(Long tripId) {
        List<Itinerary> itineraries = itineraryRepository.findByTripId(tripId);
        return itineraries.stream()
            .map(this::convertToItineraryDTO)
            .collect(Collectors.toList());
    }

    public ItineraryDTO createItinerary(ItineraryDTO itineraryDTO) {
        Trip trip = tripRepository.findById(itineraryDTO.getTripId())
            .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + itineraryDTO.getTripId()));
        
        Itinerary itinerary = new Itinerary();
        itinerary.setDayNumber(itineraryDTO.getDayNumber());
        itinerary.setDate(LocalDate.parse(itineraryDTO.getDate()));
        itinerary.setNotes(itineraryDTO.getNotes());
        itinerary.setTrip(trip);
        
        Itinerary savedItinerary = itineraryRepository.save(itinerary);
        return convertToItineraryDTO(savedItinerary);
    }

    // Get upcoming trips by user Firebase UID with pagination
    public PagedResponseDTO<TripDTO> getUpcomingTripsByUser(String firebaseUid, int page, int size) {
        System.out.println("=== GETTING UPCOMING TRIPS FOR USER ===");
        System.out.println("Firebase UID: " + firebaseUid);
        System.out.println("Page: " + page + ", Size: " + size);
        
        User user = userRepository.findByFirebaseUid(firebaseUid)
            .orElseThrow(() -> new RuntimeException("User not found with Firebase UID: " + firebaseUid));
        
        LocalDate today = LocalDate.now();
        List<Trip> upcomingTrips = tripRepository.findUpcomingAndActiveTrips(user, today);
        
        System.out.println("✅ Found " + upcomingTrips.size() + " upcoming and active trips");
        
        // Convert to DTOs
        List<TripDTO> tripDTOs = upcomingTrips.stream()
            .map(this::convertToTripDTO)
            .collect(Collectors.toList());
        
        // Apply pagination manually (since we don't have Spring Data pagination here)
        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, tripDTOs.size());
        
        List<TripDTO> pagedTrips = tripDTOs.subList(startIndex, endIndex);
        
        return new PagedResponseDTO<>(pagedTrips, page, size, tripDTOs.size());
    }

    // Get all trips by user Firebase UID with pagination
    public PagedResponseDTO<TripDTO> getAllTripsByUser(String firebaseUid, int page, int size) {
        System.out.println("=== GETTING ALL TRIPS FOR USER ===");
        System.out.println("Firebase UID: " + firebaseUid);
        System.out.println("Page: " + page + ", Size: " + size);
        
        User user = userRepository.findByFirebaseUid(firebaseUid)
            .orElseThrow(() -> new RuntimeException("User not found with Firebase UID: " + firebaseUid));
        
        List<Trip> allTrips = tripRepository.findByUser(user);
        
        System.out.println("✅ Found " + allTrips.size() + " total trips");
        
        // Convert to DTOs
        List<TripDTO> tripDTOs = allTrips.stream()
            .map(this::convertToTripDTO)
            .collect(Collectors.toList());
        
        // Apply pagination manually (since we don't have Spring Data pagination here)
        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, tripDTOs.size());
        
        List<TripDTO> pagedTrips = tripDTOs.subList(startIndex, endIndex);
        
        return new PagedResponseDTO<>(pagedTrips, page, size, tripDTOs.size());
    }

    // Unified Trip Plan Operations
    public TripPlanDTO saveTripPlan(Long tripId, TripPlanDTO tripPlanDTO) {
        System.out.println("=== SAVING UNIFIED TRIP PLAN ===");
        System.out.println("Trip ID: " + tripId);
        System.out.println("Trip Plan DTO: " + tripPlanDTO);
        
        // Find the trip
        Trip trip = tripRepository.findById(tripId)
            .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));
        
        // Update trip basic information
        if (tripPlanDTO.getTitle() != null) trip.setTitle(tripPlanDTO.getTitle());
        if (tripPlanDTO.getDestination() != null && !tripPlanDTO.getDestination().trim().isEmpty()) {
            trip.setDestination(tripPlanDTO.getDestination());
        }
        if (tripPlanDTO.getStartDate() != null) trip.setStartDate(tripPlanDTO.getStartDate());
        if (tripPlanDTO.getEndDate() != null) trip.setEndDate(tripPlanDTO.getEndDate());
        if (tripPlanDTO.getBudget() != null) trip.setBudget(tripPlanDTO.getBudget());
        if (tripPlanDTO.getDescription() != null) trip.setDescription(tripPlanDTO.getDescription());
        
        tripRepository.save(trip);
        
        // Save places (only if they don't already exist)
        if (tripPlanDTO.getPlaces() != null) {
            for (PlaceDTO placeDTO : tripPlanDTO.getPlaces()) {
                // Check if place already exists for this trip
                List<Place> existingPlaces = placeRepository.findByTripId(tripId);
                boolean placeExists = existingPlaces.stream()
                    .anyMatch(p -> p.getName().equals(placeDTO.getName()) && 
                             p.getLocation().equals(placeDTO.getLocation()));
                
                if (!placeExists) {
                    Place place = new Place();
                    place.setName(placeDTO.getName());
                    place.setLocation(placeDTO.getLocation());
                    place.setDescription(placeDTO.getDescription());
                    place.setCategory(placeDTO.getCategory());
                    place.setRating(placeDTO.getRating());
                    place.setCost(placeDTO.getCost());
                    place.setDuration(placeDTO.getDuration());
                    place.setLatitude(placeDTO.getLatitude());
                    place.setLongitude(placeDTO.getLongitude());
                    place.setPhotos(placeDTO.getPhotos());
                    place.setTrip(trip);
                    placeRepository.save(place);
                }
            }
        }
        
        // Save days with activities
        if (tripPlanDTO.getDays() != null) {
            for (TripPlanDTO.DayPlanDTO dayDTO : tripPlanDTO.getDays()) {
                // Create or update itinerary
                Itinerary itinerary = itineraryRepository.findByTripIdAndDayNumber(tripId, dayDTO.getDayNumber())
                    .orElse(new Itinerary());
                
                itinerary.setDayNumber(dayDTO.getDayNumber());
                itinerary.setDate(dayDTO.getDate());
                itinerary.setNotes(dayDTO.getNotes());
                itinerary.setTrip(trip);
                
                Itinerary savedItinerary = itineraryRepository.save(itinerary);
                
                // Save activities for this day (only if they don't already exist)
                if (dayDTO.getActivities() != null) {
                    for (ActivityDTO activityDTO : dayDTO.getActivities()) {
                        // Check if activity already exists for this itinerary
                        List<Activity> existingActivities = activityRepository.findByItineraryId(savedItinerary.getId());
                        boolean activityExists = existingActivities.stream()
                            .anyMatch(a -> a.getName().equals(activityDTO.getName()) && 
                                     a.getStartTime() != null && activityDTO.getStartTime() != null &&
                                     a.getStartTime().toString().equals(activityDTO.getStartTime()));
                        
                        if (!activityExists) {
                            Activity activity = new Activity();
                            activity.setName(activityDTO.getName());
                            activity.setDescription(activityDTO.getDescription());
                            activity.setStartTime(activityDTO.getStartTime() != null ? 
                                java.time.LocalTime.parse(activityDTO.getStartTime()) : null);
                            activity.setEndTime(activityDTO.getEndTime() != null ? 
                                java.time.LocalTime.parse(activityDTO.getEndTime()) : null);
                            activity.setCost(activityDTO.getCost());
                            activity.setDurationHours(activityDTO.getDurationHours() != null ? 
                                activityDTO.getDurationHours().intValue() : null);
                            activity.setType(activityDTO.getType());
                            activity.setStatus(activityDTO.getStatus());
                            activity.setTrip(trip);
                            activity.setItinerary(savedItinerary);
                            activityRepository.save(activity);
                        }
                    }
                }
            }
        }
        
        // Save expenses (only if they don't already exist)
        if (tripPlanDTO.getExpenses() != null) {
            for (ExpenseDTO expenseDTO : tripPlanDTO.getExpenses()) {
                // Check if expense already exists for this trip
                List<Expense> existingExpenses = expenseRepository.findByTripId(tripId);
                boolean expenseExists = existingExpenses.stream()
                    .anyMatch(e -> e.getDescription().equals(expenseDTO.getDescription()) && 
                             e.getAmount().equals(expenseDTO.getAmount()) &&
                             e.getDayNumber().equals(expenseDTO.getDayNumber()));
                
                if (!expenseExists) {
                    Expense expense = new Expense();
                    expense.setDayNumber(expenseDTO.getDayNumber());
                    expense.setExpenseDate(LocalDate.parse(expenseDTO.getExpenseDate()));
                    expense.setCategory(expenseDTO.getCategory());
                    expense.setDescription(expenseDTO.getDescription());
                    expense.setAmount(expenseDTO.getAmount());
                    expense.setCurrency(expenseDTO.getCurrency());
                    expense.setReceiptUrl(expenseDTO.getReceiptUrl());
                    expense.setPaymentMethod(expenseDTO.getPaymentMethod());
                    expense.setVendor(expenseDTO.getVendor());
                    expense.setLocation(expenseDTO.getLocation());
                    expense.setNotes(expenseDTO.getNotes());
                    expense.setReimbursable(expenseDTO.getReimbursable());
                    expense.setReimbursed(expenseDTO.getReimbursed());
                    expense.setReimbursementReference(expenseDTO.getReimbursementReference());
                    expense.setStatus(expenseDTO.getStatus());
                    expense.setTrip(trip);
                    expenseRepository.save(expense);
                }
            }
        }
        
        System.out.println("✅ Unified trip plan saved successfully");
        return getTripPlan(tripId);
    }
    
    public TripPlanDTO getTripPlan(Long tripId) {
        System.out.println("=== GETTING UNIFIED TRIP PLAN ===");
        System.out.println("Trip ID: " + tripId);
        
        Trip trip = tripRepository.findById(tripId)
            .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));
        
        TripPlanDTO tripPlanDTO = new TripPlanDTO();
        tripPlanDTO.setTripId(tripId);
        tripPlanDTO.setTitle(trip.getTitle());
        tripPlanDTO.setDestination(trip.getDestination());
        tripPlanDTO.setStartDate(trip.getStartDate());
        tripPlanDTO.setEndDate(trip.getEndDate());
        tripPlanDTO.setBudget(trip.getBudget());
        tripPlanDTO.setDescription(trip.getDescription());
        
        // Get places
        List<PlaceDTO> places = getPlacesByTripId(tripId);
        tripPlanDTO.setPlaces(places);
        
        // Get expenses
        List<ExpenseDTO> expenses = getExpensesByTripId(tripId);
        tripPlanDTO.setExpenses(expenses);
        
        // Get days with activities
        List<ItineraryDTO> itineraries = getItinerariesByTripId(tripId);
        List<TripPlanDTO.DayPlanDTO> days = new ArrayList<>();
        
        for (ItineraryDTO itineraryDTO : itineraries) {
            TripPlanDTO.DayPlanDTO dayDTO = new TripPlanDTO.DayPlanDTO();
            dayDTO.setDayNumber(itineraryDTO.getDayNumber());
            dayDTO.setDate(LocalDate.parse(itineraryDTO.getDate()));
            dayDTO.setNotes(itineraryDTO.getNotes());
            
            // Get activities for this day
            List<ActivityDTO> dayActivities = activityRepository.findByItineraryId(itineraryDTO.getId())
                .stream()
                .map(this::convertToActivityDTO)
                .collect(Collectors.toList());
            dayDTO.setActivities(dayActivities);
            
            days.add(dayDTO);
        }
        
        tripPlanDTO.setDays(days);
        
        System.out.println("✅ Unified trip plan retrieved successfully");
        return tripPlanDTO;
    }

    // Conversion Methods
    private TripDTO convertToTripDTO(Trip trip) {
        TripDTO dto = new TripDTO();
        dto.setId(trip.getId());
        dto.setTitle(trip.getTitle());
        dto.setDestination(trip.getDestination());
        dto.setStartDate(trip.getStartDate());
        dto.setEndDate(trip.getEndDate());
        dto.setBudget(trip.getBudget());
        dto.setDescription(trip.getDescription());
        dto.setStatus(trip.getStatus());
        dto.setVisibility(trip.getVisibility());
        dto.setCreatedAt(trip.getCreatedAt());
        dto.setUpdatedAt(trip.getUpdatedAt());
        dto.setFirebaseUid(trip.getUser() != null ? trip.getUser().getFirebaseUid() : null);
        
        // Convert places - handle lazy loading safely
        try {
            List<PlaceDTO> placeDTOs = trip.getPlaces().stream()
                .map(this::convertToPlaceDTO)
                .collect(Collectors.toList());
            dto.setPlaces(placeDTOs);
        } catch (Exception e) {
            System.out.println("⚠️ Warning: Could not load places for trip " + trip.getId() + ": " + e.getMessage());
            dto.setPlaces(new ArrayList<>());
        }
        
        // Convert expenses - handle lazy loading safely
        try {
            List<ExpenseDTO> expenseDTOs = trip.getExpenses().stream()
                .map(this::convertToExpenseDTO)
                .collect(Collectors.toList());
            dto.setExpenses(expenseDTOs);
        } catch (Exception e) {
            System.out.println("⚠️ Warning: Could not load expenses for trip " + trip.getId() + ": " + e.getMessage());
            dto.setExpenses(new ArrayList<>());
        }
        
        return dto;
    }

    private PlaceDTO convertToPlaceDTO(Place place) {
        PlaceDTO dto = new PlaceDTO();
        dto.setId(place.getId());
        dto.setName(place.getName());
        dto.setLocation(place.getLocation());
        dto.setDescription(place.getDescription());
        dto.setCategory(place.getCategory());
        dto.setRating(place.getRating());
        dto.setCost(place.getCost());
        dto.setDuration(place.getDuration());
        dto.setLatitude(place.getLatitude());
        dto.setLongitude(place.getLongitude());
        
        dto.setPhotos(place.getPhotos());
        
        dto.setTripId(place.getTrip() != null ? place.getTrip().getId() : null);
        dto.setCreatedAt(place.getCreatedAt());
        dto.setUpdatedAt(place.getUpdatedAt());
        return dto;
    }

    private ExpenseDTO convertToExpenseDTO(Expense expense) {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(expense.getId());
        dto.setDayNumber(expense.getDayNumber());
        dto.setExpenseDate(expense.getExpenseDate().toString());
        dto.setCategory(expense.getCategory());
        dto.setDescription(expense.getDescription());
        dto.setAmount(expense.getAmount());
        dto.setCurrency(expense.getCurrency());
        dto.setReceiptUrl(expense.getReceiptUrl());
        dto.setPaymentMethod(expense.getPaymentMethod());
        dto.setVendor(expense.getVendor());
        dto.setLocation(expense.getLocation());
        dto.setNotes(expense.getNotes());
        dto.setReimbursable(expense.getReimbursable());
        dto.setReimbursed(expense.getReimbursed());
        dto.setReimbursementReference(expense.getReimbursementReference());
        dto.setStatus(expense.getStatus());
        dto.setTripId(expense.getTrip() != null ? expense.getTrip().getId() : null);
        dto.setActivityId(expense.getActivity() != null ? expense.getActivity().getId() : null);
        dto.setPlaceId(expense.getPlace() != null ? expense.getPlace().getId() : null);
        dto.setCreatedAt(expense.getCreatedAt());
        dto.setUpdatedAt(expense.getUpdatedAt());
        return dto;
    }

    private ActivityDTO convertToActivityDTO(Activity activity) {
        ActivityDTO dto = new ActivityDTO();
        dto.setId(activity.getId());
        dto.setName(activity.getName());
        dto.setDescription(activity.getDescription());
        dto.setStartTime(activity.getStartTime() != null ? activity.getStartTime().toString() : null);
        dto.setEndTime(activity.getEndTime() != null ? activity.getEndTime().toString() : null);
        dto.setCost(activity.getCost());
        dto.setDurationHours(activity.getDurationHours() != null ? 
            BigDecimal.valueOf(activity.getDurationHours()) : null);
        dto.setType(activity.getType());
        dto.setStatus(activity.getStatus());
        dto.setTripId(activity.getTrip() != null ? activity.getTrip().getId() : null);
        dto.setItineraryId(activity.getItinerary() != null ? activity.getItinerary().getId() : null);
        dto.setPlaceId(activity.getPlace() != null ? activity.getPlace().getId() : null);
        dto.setCreatedAt(activity.getCreatedAt());
        dto.setUpdatedAt(activity.getUpdatedAt());
        return dto;
    }

    private ItineraryDTO convertToItineraryDTO(Itinerary itinerary) {
        ItineraryDTO dto = new ItineraryDTO();
        dto.setId(itinerary.getId());
        dto.setDayNumber(itinerary.getDayNumber());
        dto.setDate(itinerary.getDate().toString());
        dto.setNotes(itinerary.getNotes());
        dto.setTripId(itinerary.getTrip() != null ? itinerary.getTrip().getId() : null);
        dto.setCreatedAt(itinerary.getCreatedAt());
        dto.setUpdatedAt(itinerary.getUpdatedAt());
        return dto;
    }
}
