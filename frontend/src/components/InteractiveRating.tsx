import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { blogRatingService } from '../services/blogRatingService';

interface InteractiveRatingProps {
  blogPostId: number;
  firebaseUid?: string;
  onRatingSubmitted?: (rating: number) => void;
}

const InteractiveRating: React.FC<InteractiveRatingProps> = ({
  blogPostId,
  firebaseUid,
  onRatingSubmitted
}) => {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    if (firebaseUid) {
      loadUserRating();
    }
  }, [blogPostId, firebaseUid]);

  const loadUserRating = async () => {
    try {
      const rating = await blogRatingService.getUserRating(blogPostId, firebaseUid!);
      if (rating) {
        setUserRating(rating.rating);
        setHasRated(true);
      }
    } catch (error) {
      console.error('Error loading user rating:', error);
    }
  };

  const handleStarClick = async (rating: number) => {
    if (!firebaseUid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await blogRatingService.submitRating(blogPostId, firebaseUid, rating);
      setUserRating(rating);
      setHasRated(true);
      
      if (onRatingSubmitted) {
        onRatingSubmitted(rating);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarHover = (rating: number) => {
    setHoveredRating(rating);
  };

  const handleStarLeave = () => {
    setHoveredRating(null);
  };

  const renderStar = (starNumber: number) => {
    const isFilled = starNumber <= (hoveredRating || userRating || 0);
    
    return (
      <Star
        key={starNumber}
        className={`w-6 h-6 ${
          isFilled 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        } cursor-pointer hover:text-yellow-400 transition-colors ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => handleStarClick(starNumber)}
        onMouseEnter={() => handleStarHover(starNumber)}
        onMouseLeave={handleStarLeave}
      />
    );
  };

  if (!firebaseUid) {
    return (
      <div className="text-gray-500 text-sm">
        Please log in to rate this guide
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start space-y-2">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(renderStar)}
      </div>
      
      {hasRated && userRating && (
        <div className="text-sm text-gray-600">
          You rated this guide {userRating} star{userRating !== 1 ? 's' : ''}
        </div>
      )}
      
      {!hasRated && (
        <div className="text-sm text-gray-500">
          Click a star to rate this guide
        </div>
      )}
    </div>
  );
};

export default InteractiveRating;
