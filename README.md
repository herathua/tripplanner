# 🌍 TripPlanner - AI-Powered Travel Planning Application

A comprehensive full-stack travel planning application that combines artificial intelligence with modern web technologies to create unforgettable travel experiences. Built with Spring Boot backend and React TypeScript frontend, featuring Firebase authentication, Supabase storage, and multiple external API integrations.

## ✨ Features

### 🎯 Core Functionality
- **Trip Planning**: Create, manage, and organize travel itineraries
- **AI Travel Assistant**: Intelligent chatbot powered by Claude 3.5 Sonnet via OpenRouter
- **Interactive Maps**: Google Maps integration with custom markers and routes
- **Blog System**: Rich blog editor with rating system and image management
- **User Management**: Complete user profiles with Firebase authentication
- **Admin Dashboard**: Comprehensive admin panel for user and content management

### 🤖 AI-Powered Features
- **Weather Information**: Real-time weather data using Open-Meteo API
- **Location Discovery**: Tourist attractions via OpenTripMap API
- **Wikipedia Integration**: Educational content about destinations
- **Smart Recommendations**: AI-powered travel advice and suggestions

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Royal Blue Theme**: Professional color scheme (#4169E1 primary, #87CEEB secondary)
- **Interactive Components**: Smooth animations and hover effects
- **Accessibility**: ARIA labels and keyboard navigation support

## 🏗️ Architecture

### Backend (Spring Boot 3.5.5)
- **Framework**: Spring Boot with Java 21
- **Database**: MySQL 8.0+ with JPA/Hibernate
- **Security**: Spring Security with Firebase authentication
- **API Documentation**: OpenAPI/Swagger integration
- **PDF Generation**: iText7 for trip document export
- **Caching**: Spring Cache with Redis support
- **Scheduling**: Quartz for background tasks

### Frontend (React 18 + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **State Management**: Redux Toolkit for global state
- **Routing**: React Router v7 with lazy loading
- **UI Components**: Custom components with Tailwind CSS
- **Maps**: Google Maps API with React integration
- **Rich Text**: TipTap editor for blog content

### External Services
- **Authentication**: Firebase Auth (Email/Password, Google OAuth)
- **Storage**: Supabase for file uploads and image management
- **Images**: Unsplash API for high-quality travel photos
- **AI Services**: OpenRouter API with Claude 3.5 Sonnet
- **Weather**: Open-Meteo API (free, no API key required)
- **Places**: OpenTripMap API for tourist attractions
- **Maps**: Google Maps API for interactive mapping

## 🚀 Quick Start

### Prerequisites
- **Java 21** or higher
- **Node.js 18** or higher
- **MySQL 8.0** or higher
- **Maven 3.6+**
- **Firebase Project** with Authentication enabled
- **Supabase Project** for storage

### Backend Setup

1. **Clone and Navigate**
   ```bash
   git clone <repository-url>
   cd tripplanner/backend
   ```

2. **Database Configuration**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE tripplanner;
   ```

3. **Environment Configuration**
   ```yaml
   # src/main/resources/application.yml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/tripplanner?useSSL=false&serverTimezone=UTC
       username: your-db-username
       password: your-db-password
   ```

4. **Firebase Service Account**
   - Download Firebase service account JSON
   - Place in `src/main/resources/firebase-service-account.json`

5. **Run Application**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

### Frontend Setup

1. **Navigate to Frontend**
   ```bash
   cd ../frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   ```bash
   # Create .env file
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_UNSPLASH_API_KEY=your-unsplash-api-key
   VITE_OPENTRIPMAP_API_KEY=your-opentripmap-api-key
   VITE_OPENROUTER_API_KEY=your-openrouter-api-key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
tripplanner/
├── backend/                          # Spring Boot Backend
│   ├── src/main/java/com/example/tripplanner/
│   │   ├── controller/               # REST API Controllers
│   │   │   ├── TripController.java
│   │   │   ├── UserController.java
│   │   │   ├── BlogPostController.java
│   │   │   ├── AdminController.java
│   │   │   └── ...
│   │   ├── service/                 # Business Logic Services
│   │   ├── repository/              # Data Access Layer
│   │   ├── model/                   # JPA Entities
│   │   ├── dto/                     # Data Transfer Objects
│   │   └── config/                  # Configuration Classes
│   ├── src/main/resources/
│   │   ├── application.yml          # Application Configuration
│   │   └── firebase-service-account.json
│   └── pom.xml                      # Maven Dependencies
├── frontend/                        # React TypeScript Frontend
│   ├── src/
│   │   ├── components/              # Reusable UI Components
│   │   │   ├── admin/              # Admin-specific components
│   │   │   ├── chatbot/            # AI chatbot components
│   │   │   ├── forms/              # Form components
│   │   │   ├── layout/             # Layout components
│   │   │   └── ...
│   │   ├── pages/                  # Page Components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── PlanningPage.tsx
│   │   │   ├── ChatBotPage.tsx
│   │   │   └── ...
│   │   ├── services/               # API Services
│   │   ├── store/                  # Redux Store
│   │   ├── hooks/                  # Custom React Hooks
│   │   ├── types/                  # TypeScript Type Definitions
│   │   └── utils/                  # Utility Functions
│   ├── package.json                # Node.js Dependencies
│   └── vite.config.ts             # Vite Configuration
└── README.md                       # This file
```

## 🔧 API Endpoints

### Trip Management
- `GET /api/trips` - Get all trips
- `POST /api/trips` - Create new trip
- `GET /api/trips/{id}` - Get trip by ID
- `PUT /api/trips/{id}` - Update trip
- `DELETE /api/trips/{id}` - Delete trip

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/firebase/{firebaseUid}` - Get user by Firebase UID
- `POST /api/users/sync` - Sync Firebase user

### Blog System
- `GET /api/blog-posts` - Get all blog posts
- `POST /api/blog-posts` - Create blog post
- `GET /api/blog-posts/{id}` - Get blog post
- `PUT /api/blog-posts/{id}` - Update blog post
- `POST /api/blog-ratings/{blogPostId}` - Submit rating

### Admin Operations
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users (admin)
- `PUT /api/admin/users/{id}/role` - Update user role

## 🎨 UI Components

### Core Components
- **TripCreationModal**: Reusable trip creation form
- **StarRating**: Interactive 5-star rating system
- **MapComponent**: Google Maps integration
- **BlogEditor**: Rich text editor with TipTap
- **ChatBot**: AI-powered travel assistant
- **ImageGallery**: Unsplash image integration

### Layout Components
- **MainLayout**: Main application layout with navigation
- **ProtectedRoute**: Authentication guard
- **LoadingFallback**: Loading state component

## 🔐 Security Features

- **Firebase Authentication**: Secure user authentication
- **JWT Token Validation**: Backend token verification
- **CORS Configuration**: Cross-origin request handling
- **Input Validation**: Server-side validation with Bean Validation
- **SQL Injection Protection**: JPA/Hibernate ORM
- **XSS Protection**: React's built-in XSS protection

## 📊 Database Schema

### Core Tables
- **users**: User profiles and authentication data
- **trips**: Trip information and metadata
- **places**: Points of interest and locations
- **activities**: Trip activities and events
- **expenses**: Trip expense tracking
- **itineraries**: Day-by-day trip planning
- **blog_posts**: Travel blog content
- **blog_ratings**: User ratings for blog posts

### Key Relationships
- Users → Trips (One-to-Many)
- Trips → Places (Many-to-Many)
- Trips → Activities (One-to-Many)
- Trips → Expenses (One-to-Many)
- Blog Posts → Ratings (One-to-Many)

## 🚀 Deployment

### Production Build

**Backend:**
```bash
cd backend
mvn clean package -Pproduction
java -jar target/tripplanner-0.0.1-SNAPSHOT.jar
```

**Frontend:**
```bash
cd frontend
npm run build
# Deploy dist/ folder to your web server
```

### Docker Deployment
```bash
# Backend
mvn spring-boot:build-image -Dspring-boot.build-image.imageName=tripplanner/backend

# Frontend
docker build -t tripplanner/frontend .
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/tripplanner
SPRING_DATASOURCE_USERNAME=your-username
SPRING_DATASOURCE_PASSWORD=your-password
FIREBASE_PROJECT_ID=your-project-id
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_FIREBASE_API_KEY=your-api-key
VITE_UNSPLASH_API_KEY=your-unsplash-key
VITE_OPENTRIPMAP_API_KEY=your-opentripmap-key
VITE_OPENROUTER_API_KEY=your-openrouter-key
```

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [Blog Rating System](BLOG_RATING_SYSTEM_README.md) - Rating system implementation
- [AI Chatbot Setup](frontend/AI_CHATBOT_SETUP.md) - AI assistant configuration
- [Supabase Setup](SUPABASE_DATABASE_SETUP.md) - Database and storage setup
- [Unsplash Integration](frontend/UNSPLASH_SETUP.md) - Image API setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Firebase** for authentication services
- **Supabase** for storage and database services
- **Unsplash** for high-quality travel images
- **OpenRouter** for AI capabilities
- **Open-Meteo** for weather data
- **OpenTripMap** for location information
- **Google Maps** for mapping services

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation files
- Review the API documentation at `/swagger-ui.html`

---

**Built with ❤️ for travelers worldwide** 🌍✈️

