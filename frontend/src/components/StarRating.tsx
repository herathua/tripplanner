import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { blogRatingService, BlogRating } from '../services/blogRatingService';

interface StarRatingProps {
  blogPostId: number;
  firebaseUid?: string;
  averageRating?: number;
  ratingCount?: number;
  showStats?: boolean;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  blogPostId,
  firebaseUid,
  averageRating = 0,
  ratingCount = 0,
  showStats = true,
  interactive = false,
  size = 'md',
  onRatingChange
}) => {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAverageRating, setCurrentAverageRating] = useState(averageRating);
  const [currentRatingCount, setCurrentRatingCount] = useState(ratingCount);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Load user's existing rating
  useEffect(() => {
    if (interactive && firebaseUid) {
      loadUserRating();
    }
  }, [blogPostId, firebaseUid, interactive]);

  const loadUserRating = async () => {
    try {
      const rating = await blogRatingService.getUserRating(blogPostId, firebaseUid!);
      setUserRating(rating?.rating || null);
    } catch (error) {
      console.error('Error loading user rating:', error);
    }
  };

  const handleStarClick = async (rating: number) => {
    if (!interactive || !firebaseUid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await blogRatingService.submitRating(blogPostId, firebaseUid, rating);
      setUserRating(rating);
      
      // Update stats
      const stats = await blogRatingService.getRatingStats(blogPostId);
      setCurrentAverageRating(stats.averageRating);
      setCurrentRatingCount(stats.ratingCount);
      
      if (onRatingChange) {
        onRatingChange(rating);
      }
      
      // Show success feedback
      console.log(`Successfully rated ${rating} stars!`);
    } catch (error) {
      console.error('Error submitting rating:', error);
      
      // Show user-friendly error messages
      if (error.response?.data?.error) {
        const errorMessage = error.response.data.error;
        if (errorMessage.includes('Too many ratings')) {
          alert('You\'ve rated too many posts recently. Please wait before rating again.');
        } else if (errorMessage.includes('cannot rate your own')) {
          alert('You cannot rate your own blog post.');
        } else {
          alert(`Rating failed: ${errorMessage}`);
        }
      } else {
        alert('Failed to submit rating. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarHover = (rating: number) => {
    if (!interactive) return;
    setHoveredRating(rating);
  };

  const handleStarLeave = () => {
    if (!interactive) return;
    setHoveredRating(null);
  };

  const renderStar = (starNumber: number) => {
    const isFilled = starNumber <= (hoveredRating || userRating || currentAverageRating);
    const isHalfFilled = !isFilled && starNumber - 0.5 <= (hoveredRating || userRating || currentAverageRating);
    
    return (
      <Star
        key={starNumber}
        className={`${sizeClasses[size]} ${
          isFilled 
            ? 'text-yellow-400 fill-current' 
            : isHalfFilled 
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        } ${
          interactive ? 'cursor-pointer hover:text-yellow-400 transition-colors' : ''
        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => handleStarClick(starNumber)}
        onMouseEnter={() => handleStarHover(starNumber)}
        onMouseLeave={handleStarLeave}
      />
    );
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map(renderStar)}
      </div>
      
      {showStats && (
        <div className={`${textSizeClasses[size]} text-gray-600 ml-2`}>
          <span className="font-medium">
            {currentAverageRating > 0 ? currentAverageRating.toFixed(1) : '0.0'}
          </span>
          {currentRatingCount > 0 && (
            <span className="ml-1">
              ({currentRatingCount} {currentRatingCount === 1 ? 'rating' : 'ratings'})
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StarRating;
