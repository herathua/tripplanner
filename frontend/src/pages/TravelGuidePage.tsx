import React, { useState, useEffect } from 'react';
import { Search, MapPin, ArrowRight, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { blogService, BlogPost } from '../services/blogService';
import CardImageService from '../utils/cardImageService';
import StarRating from '../components/StarRating';

const TravelGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);

  // Dynamic Guide Card Component
  const DynamicGuideCard: React.FC<{ post: BlogPost }> = ({ post }) => {
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
          const guideType = post.tags?.[0] || 'travel';
          const destination = post.title?.split(' ')[0] || 'Travel'; // Simple extraction
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
    }, [post.title, post.tags]);

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewGuide(post)}>
        <div className="relative h-48">
          {isImageLoading ? (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : (
            <img 
              src={imageData?.url || '/src/assets/logo.png'}
              alt={imageData?.alt || post.title || 'Travel guide'}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute top-3 right-3">
            {post.status === 'PUBLISHED' && (
              <span className="px-2 py-1 text-xs rounded-full bg-teal-100 text-teal-800">
                PUBLISHED
              </span>
            )}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold line-clamp-1">
              {post.title || 'Untitled Guide'}
            </h3>
            <div className="flex items-center">
              <StarRating
                blogPostId={post.id!}
                averageRating={post.averageRating}
                ratingCount={post.ratingCount}
                showStats={false}
                interactive={false}
                size="sm"
              />
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            By {post.author?.name || 'Anonymous'} • {post.createdAt ? formatDate(post.createdAt) : 'Recently'}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span>{post.viewCount || 0} views</span>
            </div>
            <button className="text-[#029E9D] hover:text-[#027a7a] flex items-center">
              View Guide <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Load all published blog posts
  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        setLoading(true);
        console.log('Loading published blog posts...');
        const data = await blogService.getPublishedBlogPosts(0, 50); // Load more posts
        console.log('Blog posts data received:', data);
        setBlogPosts(data.content || []);
        setFilteredPosts(data.content || []);
      } catch (error: any) {
        console.error('Error loading blog posts:', error);
        console.error('Error details:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    loadBlogPosts();
  }, []);

  // Filter posts based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPosts(blogPosts);
    } else {
      const filtered = blogPosts.filter(post => 
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [searchTerm, blogPosts]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleViewGuide = (post: BlogPost) => {
    // Use the public slug if available, otherwise use the ID
    const identifier = post.publicSlug || post.id;
    if (identifier) {
      navigate(`/blog/${identifier}`);
    } else {
      console.error('No slug or ID available for blog post:', post);
    }
  };

  const getDefaultImage = (post: BlogPost) => {
    // If post has an image, use it
    if (post.image) return post.image;
    
    // Return a placeholder that will be replaced by dynamic images
    return '/src/assets/logo.png';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[400px]">
        <img 
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Travel destinations"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40">
          <div className="container mx-auto px-4 h-full flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl text-white font-bold mb-4">
              Discover Your Next Adventure
            </h1>
            <p className="text-white/90 text-lg mb-8 max-w-2xl">
              Explore comprehensive travel guides for destinations worldwide, curated by experienced travelers.
            </p>
            <div className="relative max-w-xl">
              <input
                type="text"
                placeholder="Search destinations, activities, or guides..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full py-4 px-6 pr-12 rounded-lg text-gray-900"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Travel Guides Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'Travel Guides'}
          </h2>
          <span className="text-gray-600">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'guide' : 'guides'} found
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#029E9D]"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              {searchTerm ? 'No guides found matching your search.' : 'No travel guides available yet.'}
            </div>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-[#029E9D] hover:text-[#027a7a]"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <DynamicGuideCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Featured Categories */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Featured Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Best Time to Visit", icon: "🌤️", description: "Seasonal travel tips and weather guides" },
              { title: "Local Cuisine Guide", icon: "🍽️", description: "Discover authentic local dishes and restaurants" },
              { title: "Hidden Gems", icon: "💎", description: "Off-the-beaten-path destinations and experiences" },
              { title: "Cultural Experiences", icon: "🏛️", description: "Immerse yourself in local culture and traditions" }
            ].map((category, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="font-semibold mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                <button className="text-[#029E9D] text-sm hover:text-[#027a7a] flex items-center">
                  Explore <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelGuidePage;