# Trip Planner API Endpoints

This document lists all available API endpoints in the Trip Planner backend.

## Base URL
- **Development**: `http://localhost:8080/api` (via Vite proxy: `/api`)
- **Production**: `http://localhost:8080/api`

## Authentication
Currently, all endpoints are public (no authentication required).

## Endpoints

### Trip Management (`/trips`)

#### GET `/trips`
Get all trips
- **Response**: `Trip[]`
- **Status**: 200 OK

#### GET `/trips/{id}`
Get trip by ID
- **Parameters**: `id` (Long)
- **Response**: `Trip`
- **Status**: 200 OK, 404 Not Found

#### POST `/trips`
Create a new trip
- **Request Body**: `Trip`
- **Response**: `Trip`
- **Status**: 200 OK

#### PUT `/trips/{id}`
Update an existing trip
- **Parameters**: `id` (Long)
- **Request Body**: `Trip`
- **Response**: `Trip`
- **Status**: 200 OK, 404 Not Found

#### DELETE `/trips/{id}`
Delete a trip
- **Parameters**: `id` (Long)
- **Response**: No Content
- **Status**: 204 No Content, 404 Not Found

#### GET `/trips/search?query={query}`
Search trips by destination or title
- **Parameters**: `query` (String)
- **Response**: `Trip[]`
- **Status**: 200 OK

#### GET `/trips/status/{status}`
Get trips by status
- **Parameters**: `status` (TripStatus enum)
- **Response**: `Trip[]`
- **Status**: 200 OK

### User Management (`/users`)

#### GET `/users`
Get all users
- **Response**: `User[]`
- **Status**: 200 OK

#### GET `/users/{id}`
Get user by ID
- **Parameters**: `id` (Long)
- **Response**: `User`
- **Status**: 200 OK, 404 Not Found

#### POST `/users`
Create a new user
- **Request Body**: `User`
- **Response**: `User`
- **Status**: 200 OK

#### PUT `/users/{id}`
Update an existing user
- **Parameters**: `id` (Long)
- **Request Body**: `User`
- **Response**: `User`
- **Status**: 200 OK, 404 Not Found

#### DELETE `/users/{id}`
Delete a user
- **Parameters**: `id` (Long)
- **Response**: No Content
- **Status**: 204 No Content, 404 Not Found

#### GET `/users/firebase/{firebaseUid}`
Get user by Firebase UID
- **Parameters**: `firebaseUid` (String)
- **Response**: `User`
- **Status**: 200 OK, 404 Not Found

#### GET `/users/email/{email}`
Get user by email
- **Parameters**: `email` (String)
- **Response**: `User`
- **Status**: 200 OK, 404 Not Found

### Place Management (`/places`)

#### GET `/places`
Get all places
- **Response**: `Place[]`
- **Status**: 200 OK

#### GET `/places/{id}`
Get place by ID
- **Parameters**: `id` (Long)
- **Response**: `Place`
- **Status**: 200 OK, 404 Not Found

#### POST `/places`
Create a new place
- **Request Body**: `Place`
- **Response**: `Place`
- **Status**: 200 OK

#### PUT `/places/{id}`
Update an existing place
- **Parameters**: `id` (Long)
- **Request Body**: `Place`
- **Response**: `Place`
- **Status**: 200 OK, 404 Not Found

#### DELETE `/places/{id}`
Delete a place
- **Parameters**: `id` (Long)
- **Response**: No Content
- **Status**: 204 No Content, 404 Not Found

#### GET `/places/search?query={query}`
Search places by name, location, or description
- **Parameters**: `query` (String)
- **Response**: `Place[]`
- **Status**: 200 OK

#### GET `/places/category/{category}`
Get places by category
- **Parameters**: `category` (PlaceCategory enum)
- **Response**: `Place[]`
- **Status**: 200 OK

#### GET `/places/rating/{minRating}`
Get places by minimum rating
- **Parameters**: `minRating` (Integer)
- **Response**: `Place[]`
- **Status**: 200 OK

### Test Endpoints (`/api/test`)

#### GET `/api/test/cors`
Test CORS GET request
- **Response**: `{ message: string, timestamp: number, status: string }`
- **Status**: 200 OK

#### POST `/api/test/cors`
Test CORS POST request
- **Request Body**: Any JSON object
- **Response**: `{ message: string, receivedData: any, timestamp: number, status: string }`
- **Status**: 200 OK

## Data Models

### Trip
```typescript
interface Trip {
  id?: number;
  title: string;
  destination: string;
  startDate: string; // ISO date format (YYYY-MM-DD)
  endDate: string; // ISO date format (YYYY-MM-DD)
  budget?: number;
  description?: string;
  status?: TripStatus;
  visibility?: TripVisibility;
  createdAt?: string;
  updatedAt?: string;
}

enum TripStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

enum TripVisibility {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
  SHARED = 'SHARED'
}
```

### User
```typescript
interface User {
  id?: number;
  firebaseUid?: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  phoneNumber?: string;
  role?: UserRole;
  emailVerified?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}
```

### Place
```typescript
interface Place {
  id?: number;
  name: string;
  location: string;
  description?: string;
  category: PlaceCategory;
  rating?: number;
  cost?: number;
  duration?: number;
  latitude?: number;
  longitude?: number;
  photos?: string[];
  createdAt?: string;
  updatedAt?: string;
}

enum PlaceCategory {
  RESTAURANT = 'RESTAURANT',
  HOTEL = 'HOTEL',
  ATTRACTION = 'ATTRACTION',
  SHOPPING = 'SHOPPING',
  ENTERTAINMENT = 'ENTERTAINMENT',
  CULTURAL = 'CULTURAL',
  NATURE = 'NATURE',
  TRANSPORT = 'TRANSPORT',
  OTHER = 'OTHER'
}
```

## Frontend Services

The frontend includes TypeScript services for all endpoints:

- `tripService` - Trip management operations
- `userService` - User management operations  
- `placeService` - Place management operations

### Usage Example
```typescript
import { tripService } from '../services';

// Create a new trip
const newTrip = await tripService.createTrip({
  title: 'My Trip',
  destination: 'Paris',
  startDate: '2024-06-01',
  endDate: '2024-06-07',
  budget: 1000
});

// Get all trips
const trips = await tripService.getAllTrips();
```

## Testing

### CORS Test
Visit `http://localhost:5173/cors-test` to test basic CORS functionality.

### API Test
Visit `http://localhost:5173/api-test` to test all API endpoints with sample data.

### Manual Testing
```bash
# Test GET request
curl -X GET http://localhost:8080/api/trips

# Test POST request
curl -X POST http://localhost:8080/api/trips \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Trip","destination":"Test","startDate":"2024-06-01","endDate":"2024-06-07"}'
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200 OK` - Success
- `204 No Content` - Success (DELETE operations)
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error responses include error details in the response body.

## CORS Configuration

The backend is configured to allow requests from:
- `http://localhost:3000` (React default)
- `http://localhost:5173` (Vite default)
- `http://localhost:4173` (Vite preview)
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:4173`

All HTTP methods (GET, POST, PUT, DELETE, OPTIONS, PATCH) are allowed.
Credentials are enabled for authentication support.
