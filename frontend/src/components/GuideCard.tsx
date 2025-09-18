import React, { useState, useEffect } from 'react';
import { Heart, Edit, Trash2, Eye, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BlogPost } from '../services/blogService';
import CardImageService from '../utils/cardImageService';

interface GuideCardProps {
  guide: BlogPost;
  isOwnGuide?: boolean;
  onEdit?: (guide: BlogPost) => void;
  onDelete?: (guideId: number) => void;
  onView?: (guide: BlogPost) => void;
}

const GuideCard: React.FC<GuideCardProps> = ({ 
  guide, 
  isOwnGuide = false, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const navigate = useNavigate();
  const [imageData, setImageData] = useState<{
    url: string;
    alt: string;
    credit: string;
  } | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsImageLoading(true);
        // Use title or tags to determine guide type and destination
        const guideType = guide.tags?.[0] || 'travel';
        const destination = guide.title?.split(' ')[0] || 'Travel'; // Simple extraction
        const image = await CardImageService.getGuideCardImage(destination, guideType);
        setImageData(image);
      } catch (error) {
        console.error('Failed to load guide image:', error);
        // Fallback to default image
        setImageData({
          url: '/src/assets/logo.png',
          alt: 'Travel guide',
          credit: 'Default image'
        });
      } finally {
        setIsImageLoading(false);
      }
    };

    loadImage();
  }, [guide.title, guide.tags]);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(guide);
    } else {
      navigate(`/blog-editor/${guide.id}`);
    }
  };

  const handleDelete = () => {
    if (onDelete && guide.id) {
      onDelete(guide.id);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(guide);
    } else if (guide.publicSlug) {
      navigate(`/blog/${guide.publicSlug}`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-hidden border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="relative">
        {isImageLoading ? (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          <img
            src={imageData?.url || '/src/assets/logo.png'}
            alt={imageData?.alt || guide.title}
            className="object-cover w-full h-48"
          />
        )}
        <div className="absolute top-3 right-3 flex space-x-2">
          {guide.status && (
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(guide.status)}`}>
              {guide.status}
            </span>
          )}
          <Heart className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="mb-2 font-semibold text-lg line-clamp-2">{guide.title}</h3>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">{guide.author?.displayName || 'Anonymous'}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(guide.publishedAt || guide.createdAt)}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="ml-1">4.8</span>
            <span className="mx-1">•</span>
            <span>{guide.viewCount || 0} views</span>
          </div>
        </div>

        {guide.tags && guide.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {guide.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {tag}
              </span>
            ))}
            {guide.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{guide.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={handleView}
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Guide
          </button>

          {isOwnGuide && (
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="flex items-center text-gray-600 hover:text-blue-600 text-sm"
                title="Edit guide"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center text-gray-600 hover:text-red-600 text-sm"
                title="Delete guide"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuideCard;
