# CORS Configuration for Trip Planner

This document explains the CORS (Cross-Origin Resource Sharing) setup for connecting the React frontend with the Spring Boot backend.

## Configuration Overview

### Backend Configuration

1. **SecurityConfig.java** - Main CORS configuration using Spring Security
2. **WebConfig.java** - Alternative CORS configuration using WebMvcConfigurer
3. **application.yml** - Server port configuration (8080)

### Frontend Configuration

1. **vite.config.ts** - Proxy configuration for development
2. **api.ts** - Centralized API client configuration
3. **tripService.ts** - Updated to use centralized API client

## Ports Used

- **Backend**: `http://localhost:8080`
- **Frontend**: `http://localhost:5173` (Vite default)
- **Database**: `localhost:3307` (MySQL)

## How to Test

### 1. Start the Backend

```bash
cd backend
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Test CORS Connection

Visit `http://localhost:5173/cors-test` in your browser to test the CORS configuration.

This page will:
- Test GET requests to the backend
- Test POST requests to the backend
- Show connection information
- Display any CORS errors

### 4. Manual Testing

You can also test manually using curl or browser developer tools:

```bash
# Test GET request
curl -X GET http://localhost:8080/api/test/cors

# Test POST request
curl -X POST http://localhost:8080/api/test/cors \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

## CORS Configuration Details

### Allowed Origins
- `http://localhost:3000` (React default)
- `http://localhost:5173` (Vite default)
- `http://localhost:4173` (Vite preview)
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:4173`

### Allowed Methods
- GET, POST, PUT, DELETE, OPTIONS, PATCH

### Allowed Headers
- Origin, Content-Type, Accept, Authorization, X-Requested-With
- Access-Control-Request-Method, Access-Control-Request-Headers

### Credentials
- Enabled (`withCredentials: true`)

## Development vs Production

### Development
- Uses Vite proxy (`/api` → `http://localhost:8080/api`)
- Automatic CORS handling through proxy
- Detailed logging in console

### Production
- Direct API calls to backend
- CORS handled by Spring Security configuration
- No proxy needed

## Troubleshooting

### Common Issues

1. **CORS Error**: Check that both frontend and backend are running
2. **Port Conflicts**: Ensure ports 8080 and 5173 are available
3. **Database Connection**: Verify MySQL is running on port 3307

### Debug Steps

1. Check browser console for CORS errors
2. Verify backend is responding: `http://localhost:8080/api/test/cors`
3. Check network tab in browser dev tools
4. Verify proxy configuration in Vite

### Logs

The API client includes request/response logging in development mode. Check the browser console for:
- API Request logs
- API Response logs
- Error messages

## Files Modified

### Backend
- `src/main/java/com/example/tripplanner/config/SecurityConfig.java`
- `src/main/java/com/example/tripplanner/config/WebConfig.java`
- `src/main/resources/application.yml`
- `src/main/java/com/example/tripplanner/controller/TestController.java`

### Frontend
- `vite.config.ts`
- `src/config/api.ts`
- `src/services/tripService.ts`
- `src/pages/CorsTestPage.tsx`
- `src/routes.tsx`

## Next Steps

1. Test the CORS configuration using the test page
2. Verify all API endpoints work correctly
3. Remove the test page when no longer needed
4. Update production CORS settings as needed
