# 🖼️ Unsplash API Setup Guide

## What is Unsplash?

Unsplash is a platform that provides **high-quality, free images** that you can use for:
- Travel blogs and websites
- Presentations and slideshows
- Social media content
- Personal projects
- Commercial applications

## 🚀 Getting Started

### 1. Create Unsplash Account
1. Go to [https://unsplash.com/developers](https://unsplash.com/developers)
2. Click "Register as a developer"
3. Sign up or log in with your Unsplash account

### 2. Create New Application
1. Click "New Application"
2. Fill in the application details:
   - **Application name**: `TripPlanner App` (or your preferred name)
   - **Description**: `Travel planning application with image gallery`
   - **What are you building?**: `Web application`
   - **Will you be using the API for commercial purposes?**: Choose based on your needs

### 3. Get Your API Key
1. After creating the application, you'll see your **Access Key**
2. Copy this key - you'll need it for the environment variable

### 4. Set Environment Variable
Add this to your `.env` file:

```env
VITE_UNSPLASH_API_KEY=your_unsplash_access_key_here
```

## 📊 API Limits & Pricing

### Free Tier (Perfect for most apps)
- **Rate Limit**: 50 requests per hour
- **Search**: 5,000 requests per month
- **Download**: 5,000 downloads per month
- **Cost**: $0 (completely free!)

### Paid Plans (if you need more)
- **Developer**: $5/month - 10,000 requests/hour
- **Production**: $20/month - 50,000 requests/hour

## 🎯 Features Available

### Image Search
```typescript
// Search for travel images
const images = await imageService.searchImages('travel', 1, 20);
```

### Random Images
```typescript
// Get random travel destination images
const randomImages = await imageService.getTravelDestinationImages(15);
```

### City-Specific Images
```typescript
// Get images for a specific city
const cityImages = await imageService.getCityImages('Paris', 10);
```

### Weather-Appropriate Images
```typescript
// Get images matching weather conditions
const weatherImages = await imageService.getWeatherImages('sunny', 8);
```

## 🔧 Usage Examples

### Basic Image Gallery
```tsx
import ImageGallery from '../components/images/ImageGallery';

<ImageGallery
  initialQuery="travel"
  maxImages={20}
  showSearch={true}
  showDownload={true}
/>
```

### Custom Search
```tsx
import imageService from '../services/imageService';

// Search for specific images
const searchResults = await imageService.searchImages('beach sunset', 1, 15);
```

### Download Images
```tsx
// Download an image (triggers tracking)
await imageService.triggerDownload(imageId);

// The actual download happens in the browser
const link = document.createElement('a');
link.href = imageUrls.full;
link.download = 'image.jpg';
link.click();
```

## 📱 Components Available

### 1. ImageGallery
- **Search functionality** with real-time results
- **Responsive grid layout** (1-4 columns based on screen size)
- **Image modal** with full details
- **Download buttons** with proper attribution
- **Hover effects** and smooth animations

### 2. ImagePage
- **Category navigation** (Travel, Cities, Beaches, etc.)
- **Featured sections** highlighting benefits
- **Usage guidelines** and best practices
- **Professional design** with gradients and shadows

## 🎨 Customization Options

### ImageGallery Props
```typescript
interface ImageGalleryProps {
  initialQuery?: string;        // Default search term
  maxImages?: number;           // Maximum images to load
  showSearch?: boolean;         // Show/hide search bar
  showDownload?: boolean;       // Show/hide download buttons
  className?: string;           // Additional CSS classes
}
```

### Styling
- **Responsive design** that works on all devices
- **Tailwind CSS** for easy customization
- **Hover animations** and smooth transitions
- **Professional color scheme** with gradients

## 📋 Best Practices

### 1. Rate Limiting
- Respect the 50 requests/hour limit
- Implement caching for frequently searched terms
- Use pagination for large result sets

### 2. Image Attribution
- While not required, consider showing photographer credits
- Link to original Unsplash pages when possible
- Use the provided user information

### 3. Performance
- Use `loading="lazy"` for images (already implemented)
- Implement virtual scrolling for large galleries
- Cache search results when appropriate

## 🚨 Common Issues & Solutions

### 1. "Unauthorized" Error
- Check your API key is correct
- Ensure the key is in your `.env` file
- Verify the key hasn't expired

### 2. Rate Limit Exceeded
- Wait for the hour to reset
- Implement request caching
- Consider upgrading to a paid plan

### 3. Images Not Loading
- Check network connectivity
- Verify API responses in browser console
- Ensure CORS isn't blocking requests

## 🔗 Useful Links

- [Unsplash API Documentation](https://unsplash.com/documentation)
- [Unsplash License](https://unsplash.com/license)
- [API Rate Limits](https://unsplash.com/documentation#rate-limiting)
- [Best Practices](https://unsplash.com/documentation#best-practices)

## 💡 Pro Tips

1. **Use specific search terms** for better results
2. **Implement image caching** to reduce API calls
3. **Show loading states** for better user experience
4. **Handle errors gracefully** with user-friendly messages
5. **Optimize image sizes** based on your use case

---

🎉 **You're all set!** Your app now has access to millions of free, high-quality images from Unsplash!
