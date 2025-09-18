# Admin Console Setup Guide

## Overview
The admin console provides comprehensive user management and system monitoring capabilities for your TripPlanner application.

## Features

### 🏠 Dashboard
- **User Statistics**: Total users, active users, user role distribution
- **Content Statistics**: Total trips, blog posts
- **Recent Activity**: System logs and user activity
- **Recent Registrations**: New user signups in the last 7 days

### 👥 User Management
- **View All Users**: Complete list of registered users
- **Role Management**: Change user roles (USER, ADMIN, PREMIUM)
- **Status Control**: Activate/deactivate user accounts
- **User Deletion**: Remove users from the system
- **Profile Information**: View user details, photos, and contact info

### 📋 System Logs
- **Activity Monitoring**: Track system events and user actions
- **Error Tracking**: Monitor application errors and warnings
- **Audit Trail**: Complete history of admin actions

### ⚙️ Settings
- **System Notifications**: Send messages to users
- **Data Export**: Export user data for backup/analysis
- **System Configuration**: Admin-specific settings

## Setup Instructions

### 1. Backend Setup
The admin console requires the following backend components:

#### AdminController
- Located at: `backend/src/main/java/com/example/tripplanner/controller/AdminController.java`
- Provides REST API endpoints for admin operations
- Requires authentication and admin role verification

#### UserRepository Updates
- Added methods: `countByActiveTrue()`, `countByRole()`, `countByCreatedAtAfter()`
- Located at: `backend/src/main/java/com/example/tripplanner/repository/UserRepository.java`

### 2. Frontend Setup
The admin console includes:

#### Admin Service
- Located at: `frontend/src/services/adminService.ts`
- Handles API calls to admin endpoints
- Provides TypeScript interfaces for admin data

#### Admin Route Protection
- Located at: `frontend/src/components/admin/AdminRoute.tsx`
- Ensures only admin users can access admin features
- Redirects non-admin users with access denied message

#### Admin Console Page
- Located at: `frontend/src/pages/AdminConsole.tsx`
- Main admin interface with dashboard, user management, logs, and settings
- Responsive design with tabbed navigation

### 3. Route Configuration
The admin console is accessible at `/admin` route:
- Protected by `AdminRoute` component
- Only visible to users with ADMIN role
- Automatically appears in navigation for admin users

## Usage

### Accessing the Admin Console
1. **Login as Admin**: Ensure your user account has ADMIN role
2. **Navigate**: Click "Admin Console" in the main navigation (only visible to admins)
3. **Direct Access**: Go to `/admin` URL directly

### Making a User Admin
To grant admin privileges to a user:

#### Method 1: Database Update
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'user@example.com';
```

#### Method 2: Backend API
```bash
curl -X PUT "http://localhost:8080/admin/users/{userId}/role" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "ADMIN"}'
```

#### Method 3: Email-based Detection
Users with emails containing "admin" automatically get admin access:
- `admin@example.com`
- `user.admin@company.com`
- `administrator@domain.com`

### Admin Operations

#### User Management
1. **View Users**: See all registered users in the Users tab
2. **Change Roles**: Use dropdown to change user roles
3. **Toggle Status**: Activate/deactivate user accounts
4. **Delete Users**: Remove users permanently (with confirmation)

#### System Monitoring
1. **Dashboard**: Monitor key metrics and statistics
2. **Logs**: View system activity and error logs
3. **Activity**: Track user actions and system events

#### Notifications
1. **Send Messages**: Notify users via system notifications
2. **Target Selection**: Choose all users, admins, or premium users
3. **Message Content**: Customize notification content

## Security Features

### Authentication
- **Firebase Integration**: Uses Firebase authentication tokens
- **Role Verification**: Checks user role before allowing access
- **Session Management**: Respects Firebase session state

### Authorization
- **Admin-Only Access**: Only users with ADMIN role can access
- **Route Protection**: AdminRoute component blocks unauthorized access
- **API Security**: Backend endpoints verify admin privileges

### Data Protection
- **User Privacy**: Admin actions are logged for audit purposes
- **Secure Operations**: All admin operations require authentication
- **Confirmation Dialogs**: Destructive actions require user confirmation

## API Endpoints

### Admin Statistics
- `GET /admin/stats` - Get dashboard statistics
- `GET /admin/users` - Get all users
- `GET /admin/logs` - Get system logs

### User Management
- `PUT /admin/users/{id}/role` - Update user role
- `PUT /admin/users/{id}/status` - Toggle user status
- `DELETE /admin/users/{id}` - Delete user

### System Operations
- `POST /admin/notifications` - Send system notification
- `GET /admin/export/users` - Export user data

## Troubleshooting

### Common Issues

#### "Access Denied" Error
- **Cause**: User doesn't have ADMIN role
- **Solution**: Update user role in database or use admin email

#### Admin Link Not Visible
- **Cause**: User profile doesn't have ADMIN role
- **Solution**: Check user role in database or refresh profile

#### API Errors
- **Cause**: Backend not running or authentication issues
- **Solution**: Verify backend is running and user is authenticated

### Debug Steps
1. **Check User Role**: Verify user has ADMIN role in database
2. **Verify Authentication**: Ensure user is logged in with Firebase
3. **Check Backend**: Confirm backend is running and accessible
4. **Review Logs**: Check browser console and backend logs for errors

## Development Notes

### Adding New Admin Features
1. **Backend**: Add new endpoints to `AdminController`
2. **Service**: Update `adminService.ts` with new API calls
3. **UI**: Add new components to `AdminConsole.tsx`
4. **Routes**: Update navigation and routing as needed

### Customizing Admin Interface
- **Styling**: Modify Tailwind classes in admin components
- **Layout**: Adjust grid layouts and component arrangements
- **Features**: Add new tabs and functionality as needed

## Support
For issues or questions about the admin console:
1. Check this documentation
2. Review browser console for errors
3. Check backend logs for API issues
4. Verify user permissions and authentication
