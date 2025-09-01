# 🖼️ Unsplash Image Service for Trip & Guide Cards

This service automatically provides beautiful, relevant images for your trip plans and travel guides instead of hardcoded images.

## 🚀 Quick Start

### 1. Replace Hardcoded Images in Your Cards

Instead of this:
```tsx
<img src="/src/assets/hardcoded-temple-image.jpg" alt="Travel destination" />
```

Use this:
```tsx
import CardImageService from '../../utils/cardImageService';

// In your component
const [imageData, setImageData] = useState(null);

useEffect(() => {
  const loadImage = async () => {
    const image = await CardImageService.getTripCardImage('Tokyo', 'city');
    setImageData(image);
  };
  loadImage();
}, []);

// In your JSX
<img 
  src={imageData?.url || '/src/assets/logo.png'} 
  alt={imageData?.alt || 'Travel destination'} 
/>
```

### 2. Available Methods

#### For Trip Cards
```typescript
// Get destination-specific image
const image = await CardImageService.getTripCardImage('Paris');

// Get activity-specific image
const image = await CardImageService.getTripCardImage('Bali', 'beach');
const image = await CardImageService.getTripCardImage('Tokyo', 'city');
const image = await CardImageService.getTripCardImage('Switzerland', 'mountain');
```

#### For Guide Cards
```typescript
// Get guide-specific image
const image = await CardImageService.getGuideCardImage('Rome', 'culture');
const image = await CardImageService.getGuideCardImage('Thailand', 'food');
const image = await CardImageService.getGuideCardImage('New Zealand', 'adventure');
```

#### Seasonal Images
```typescript
// Get seasonal image (automatically detects current season)
const image = await CardImageService.getSeasonalImage('Kyoto');

// Or specify season
const image = await CardImageService.getSeasonalImage('Kyoto', 'autumn');
```

#### Multiple Images
```typescript
// Get multiple images for carousel/gallery
const images = await CardImageService.getDestinationGallery('Venice', 5);
```

## 🎯 Integration Examples

### Trip Card Component
```tsx
import React, { useState, useEffect } from 'react';
import CardImageService from '../../utils/cardImageService';

const TripCard = ({ destination, activity, title, dates, price }) => {
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const image = await CardImageService.getTripCardImage(destination, activity);
        setImageData(image);
      } catch (error) {
        console.error('Failed to load image:', error);
      }
    };
    loadImage();
  }, [destination, activity]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img
          src={imageData?.url || '/src/assets/logo.png'}
          alt={imageData?.alt || 'Travel destination'}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-semibold">
          PLANNING
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-gray-600 text-sm">{destination}</p>
        <p className="text-gray-500 text-xs">{dates}</p>
        <p className="text-green-600 font-semibold">{price}</p>
      </div>
    </div>
  );
};
```

### Guide Card Component
```tsx
const GuideCard = ({ destination, guideType, title, description }) => {
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const image = await CardImageService.getGuideCardImage(destination, guideType);
        setImageData(image);
      } catch (error) {
        console.error('Failed to load image:', error);
      }
    };
    loadImage();
  }, [destination, guideType]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img
          src={imageData?.url || '/src/assets/logo.png'}
          alt={imageData?.alt || 'Travel guide'}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-green-400 text-black px-2 py-1 rounded-full text-xs font-semibold">
          PUBLISHED
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};
```

## 🔧 Configuration

### Environment Variables
Add to your `.env` file:
```env
VITE_UNSPLASH_API_KEY=MjwYOUS8g6wm55UM6A1_lutLuAJq0sMQPTHKNK64B84
```

### API Configuration
The service is already configured in `src/config/api.ts` with your Unsplash API key.

## 🎨 Image Quality & Optimization

- **Automatic Orientation**: Images are optimized for landscape orientation (better for cards)
- **Responsive URLs**: Uses `regular` size images (good quality, reasonable file size)
- **Fallback System**: Automatically falls back to general travel images if destination-specific not found
- **Error Handling**: Gracefully handles API failures with default images

## 📱 Performance Tips

1. **Cache Images**: Store image URLs in your component state to avoid repeated API calls
2. **Lazy Loading**: Load images only when cards come into view
3. **Preload Important Images**: Preload images for visible cards on page load

## 🚨 Important Notes

- **API Limits**: Unsplash has rate limits (50 requests per hour for demo apps)
- **Image Credits**: Always display photographer credits as required by Unsplash
- **Fallback Images**: Always provide fallback images for better user experience
- **Error Handling**: Implement proper error handling for network issues

## 🔍 Troubleshooting

### Common Issues

1. **Images not loading**: Check your Unsplash API key and network connection
2. **Rate limiting**: Implement caching to reduce API calls
3. **CORS issues**: The service handles this automatically

### Debug Mode
Enable console logging to see what's happening:
```typescript
// In your component
useEffect(() => {
  const loadImage = async () => {
    try {
      console.log('Loading image for:', destination);
      const image = await CardImageService.getTripCardImage(destination);
      console.log('Image loaded:', image);
      setImageData(image);
    } catch (error) {
      console.error('Image loading failed:', error);
    }
  };
  loadImage();
}, [destination]);
```

## 🎉 Benefits

✅ **No more hardcoded images**  
✅ **Automatically relevant to destination**  
✅ **High-quality, professional photos**  
✅ **Seasonal variations**  
✅ **Activity-specific images**  
✅ **Automatic fallbacks**  
✅ **Proper image credits**  

Your trip and guide cards will now have beautiful, relevant images that automatically match the destination and context! 🗺️✨
