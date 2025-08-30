# Trip Planner - Axios Integration

This project now includes Axios integration for connecting the frontend React application with the backend Spring Boot API for trip management.

## Features

- **Create Trips**: Save trip data to the backend database
- **List Trips**: View all created trips
- **Delete Trips**: Remove trips from the database
- **Real-time API Communication**: Using Axios for HTTP requests

## Backend API Endpoints

The backend provides the following REST endpoints:

- `GET /api/trips` - Get all trips
- `GET /api/trips/{id}` - Get trip by ID
- `POST /api/trips` - Create a new trip
- `PUT /api/trips/{id}` - Update an existing trip
- `DELETE /api/trips/{id}` - Delete a trip

## Frontend Integration

### API Service (`/frontend/src/services/api.ts`)

The frontend uses Axios to communicate with the backend:

```typescript
import { tripApi } from '../services/api';

// Create a new trip
const tripId = await tripApi.createTrip({
  title: "Trip to Sri Lanka",
  destination: "Sri Lanka",
  startDate: "2024-01-15",
  endDate: "2024-01-25",
  budget: 5000
});

// Get all trips
const trips = await tripApi.getAllTrips();

// Delete a trip
await tripApi.deleteTrip(tripId);
```

### Trip Creation Flow

1. User fills out trip details in the NewTrip page
2. Clicks "Save Trip" button
3. Frontend sends POST request to `/api/trips` with trip data
4. Backend saves trip to database and returns trip ID
5. Frontend shows success message with trip ID
6. Trip is also saved to localStorage for detailed data (places, activities, expenses)

## Setup Instructions

### 1. Start the Backend

```bash
cd backend
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Database Setup

Make sure you have MySQL running and update the database configuration in `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/tripplanner?serverTimezone=UTC
    username: your_username
    password: your_password
```

## Usage

1. Navigate to `/new-trip` to create a new trip
2. Fill in trip details (dates, budget, etc.)
3. Click "Save Trip" to save to the backend
4. Navigate to `/trips` to view all saved trips
5. Use the delete button to remove trips

## Error Handling

The application includes comprehensive error handling:

- Network errors are caught and displayed to users
- Loading states are shown during API calls
- Validation errors are handled gracefully
- CORS is configured to allow frontend-backend communication

## File Structure

```
backend/
├── src/main/java/com/tripplanner/tripplanner/
│   ├── config/
│   │   └── CorsConfig.java          # CORS configuration
│   ├── domain/
│   │   └── Trip.java                # Trip entity
│   ├── model/
│   │   └── TripDTO.java             # Trip data transfer object
│   ├── repos/
│   │   └── TripRepository.java      # Trip repository
│   ├── rest/
│   │   └── TripResource.java        # Trip REST controller
│   └── service/
│       └── TripService.java         # Trip business logic

frontend/
├── src/
│   ├── services/
│   │   └── api.ts                   # Axios API service
│   └── pages/
│       ├── Newtrip.tsx              # Trip creation page
│       └── TripListPage.tsx         # Trip listing page
```

## Dependencies

### Backend
- Spring Boot 3.x
- Spring Data JPA
- MySQL Connector
- Lombok

### Frontend
- React 18
- Axios
- React Router DOM
- Lucide React (icons)
- Tailwind CSS