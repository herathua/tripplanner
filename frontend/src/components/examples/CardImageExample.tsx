import React, { useState, useEffect } from 'react';
import CardImageService from '../../utils/cardImageService';

interface CardImageExampleProps {
  destination: string;
  type: 'trip' | 'guide';
  activity?: string;
  guideType?: string;
}

/**
 * Example component showing how to integrate dynamic images into your existing cards
 * Replace your hardcoded images with this dynamic approach
 */
const CardImageExample: React.FC<CardImageExampleProps> = ({
  destination,
  type,
  activity,
  guideType
}) => {
  const [imageData, setImageData] = useState<{
    url: string;
    alt: string;
    credit: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let imageData;
        if (type === 'trip') {
          imageData = await CardImageService.getTripCardImage(destination, activity);
        } else {
          imageData = await CardImageService.getGuideCardImage(destination, guideType);
        }
        
        setImageData(imageData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load image');
        // Fallback to default image
        setImageData({
          url: '/src/assets/logo.png',
          alt: `${destination} ${type}`,
          credit: 'Default image'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [destination, type, activity, guideType]);

  if (isLoading) {
    return (
      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading image...</div>
      </div>
    );
  }

  if (error && !imageData) {
    return (
      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-red-500">Failed to load image</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={imageData?.url}
        alt={imageData?.alt}
        className="w-full h-48 object-cover rounded-lg"
      />
      {/* Optional: Show image credit */}
      <div className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
        {imageData?.credit}
      </div>
    </div>
  );
};

export default CardImageExample;
