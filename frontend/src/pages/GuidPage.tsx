import React, { useState } from 'react';
import { ArrowLeft, Heart, Share2, MapPin, Clock, Star, Camera, Users, ChevronDown, ChevronUp, Edit3, Save, X, Plus, Trash2 } from 'lucide-react';

// Type definitions
interface Highlight {
  id: number;
  title: string;
  description: string;
  image: string;
  duration: string;
}

interface ItineraryItem {
  id: number;
  day: number;
  title: string;
  activities: string[];
}

interface Tip {
  id: number;
  icon: string;
  title: string;
  content: string;
}

interface GuideData {
  title: string;
  destination: string;
  author: string;
  rating: number;
  reviews: number;
  duration: string;
  description: string;
  overview: string;
  coverImage: string;
  tags: string[];
  budget: string;
  bestTime: string;
  difficulty: string;
}

const GuidePage: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    overview: true,
    highlights: true,
    itinerary: true,
    tips: true
  });

  const [guideData, setGuideData] = useState<GuideData>({
    title: "Japan Video Game Guide 👾",
    destination: "Tokyo, Japan",
    author: "GameTravel Expert",
    rating: 4.9,
    reviews: 234,
    duration: "5-7 days",
    description: "Discover the ultimate gaming paradise in Tokyo! From retro arcades to modern gaming cafes, this guide covers all the must-visit spots for gaming enthusiasts.",
    overview: "This comprehensive guide will take you through Tokyo's vibrant gaming culture, from the neon-lit arcades of Akihabara to cutting-edge gaming cafes and retro game treasure hunts. Whether you're a casual gamer or a hardcore enthusiast, you'll discover hidden gems and iconic locations that make Tokyo the ultimate gaming destination.",
    coverImage: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&h=600&fit=crop",
    tags: ["Gaming", "Technology", "Culture", "Entertainment"],
    budget: "¥15,000-30,000",
    bestTime: "Year-round",
    difficulty: "Easy"
  });

  const [highlights, setHighlights] = useState<Highlight[]>([
    {
      id: 1,
      title: "Akihabara Electric Town",
      description: "The mecca of gaming and electronics with countless arcades, game stores, and retro finds.",
      image: "https://images.unsplash.com/photo-1554797589-7241bb691973?w=400&h=250&fit=crop",
      duration: "Half day"
    },
    {
      id: 2,
      title: "TeamLab Borderless",
      description: "Interactive digital art museum that feels like stepping into a video game world.",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
      duration: "3-4 hours"
    },
    {
      id: 3,
      title: "Nintendo Museum Tokyo",
      description: "Dive into Nintendo's history and try out exclusive gaming experiences.",
      image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=400&h=250&fit=crop",
      duration: "2-3 hours"
    }
  ]);

  const [itinerary, setItinerary] = useState<ItineraryItem[]>([
    {
      id: 1,
      day: 1,
      title: "Akihabara Deep Dive",
      activities: [
        "Morning: Explore Yodobashi Camera Akiba",
        "Afternoon: Visit classic arcades like Taito Station",
        "Evening: Gaming cafe experience at Bagus"
      ]
    },
    {
      id: 2,
      day: 2,
      title: "Modern Gaming Culture",
      activities: [
        "Morning: TeamLab Borderless",
        "Afternoon: Nintendo Museum",
        "Evening: Shibuya gaming scene"
      ]
    },
    {
      id: 3,
      day: 3,
      title: "Retro Gaming Paradise",
      activities: [
        "Morning: Super Potato retro game store",
        "Afternoon: Retro game hunting in Den Den Town",
        "Evening: Classic arcade tournaments"
      ]
    }
  ]);

  const [tips, setTips] = useState<Tip[]>([
    {
      id: 1,
      icon: "💰",
      title: "Budget Tips",
      content: "Many arcades offer all-day passes. Buy a JR Pass for easy transportation between gaming districts."
    },
    {
      id: 2,
      icon: "🎯",
      title: "Pro Tips",
      content: "Visit arcades during weekday afternoons for less crowds. Learn basic Japanese gaming terms for better experiences."
    },
    {
      id: 3,
      icon: "📱",
      title: "Essential Apps",
      content: "Download Google Translate with camera feature for menu navigation and game instructions."
    },
    {
      id: 4,
      icon: "🎮",
      title: "Gaming Etiquette",
      content: "Respect queues at popular machines. Some arcades have specific rules about photography."
    }
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSave = () => {
    setIsEditMode(false);
    // Here you would typically save to backend
    console.log('Saving guide data:', { guideData, highlights, itinerary, tips });
  };

  const addHighlight = () => {
    const newHighlight: Highlight = {
      id: Date.now(),
      title: "New Highlight",
      description: "Description for new highlight",
      image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400&h=250&fit=crop",
      duration: "2 hours"
    };
    setHighlights([...highlights, newHighlight]);
  };

  const updateHighlight = (id: number, field: keyof Highlight, value: string) => {
    setHighlights(highlights.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const removeHighlight = (id: number) => {
    setHighlights(highlights.filter(h => h.id !== id));
  };

  const addItineraryDay = () => {
    const newDay: ItineraryItem = {
      id: Date.now(),
      day: itinerary.length + 1,
      title: "New Day",
      activities: ["New activity"]
    };
    setItinerary([...itinerary, newDay]);
  };

  const updateItinerary = (id: number, field: keyof ItineraryItem, value: any) => {
    setItinerary(itinerary.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItinerary = (id: number) => {
    setItinerary(itinerary.filter(item => item.id !== id));
  };

  const addActivity = (dayId: number) => {
    setItinerary(itinerary.map(item => 
      item.id === dayId 
        ? { ...item, activities: [...item.activities, "New activity"] }
        : item
    ));
  };

  const updateActivity = (dayId: number, activityIndex: number, value: string) => {
    setItinerary(itinerary.map(item => 
      item.id === dayId 
        ? { 
            ...item, 
            activities: item.activities.map((act, index) => 
              index === activityIndex ? value : act
            )
          }
        : item
    ));
  };

  const removeActivity = (dayId: number, activityIndex: number) => {
    setItinerary(itinerary.map(item => 
      item.id === dayId 
        ? { 
            ...item, 
            activities: item.activities.filter((_, index) => index !== activityIndex)
          }
        : item
    ));
  };

  const addTip = () => {
    const newTip: Tip = {
      id: Date.now(),
      icon: "💡",
      title: "New Tip",
      content: "Add your tip content here"
    };
    setTips([...tips, newTip]);
  };

  const updateTip = (id: number, field: keyof Tip, value: string) => {
    setTips(tips.map(tip => tip.id === id ? { ...tip, [field]: value } : tip));
  };

  const removeTip = (id: number) => {
    setTips(tips.filter(tip => tip.id !== id));
  };

  const addTag = () => {
    setGuideData({
      ...guideData,
      tags: [...guideData.tags, "New Tag"]
    });
  };

  const updateTag = (index: number, value: string) => {
    const newTags = [...guideData.tags];
    newTags[index] = value;
    setGuideData({ ...guideData, tags: newTags });
  };

  const removeTag = (index: number) => {
    setGuideData({
      ...guideData,
      tags: guideData.tags.filter((_, i) => i !== index)
    });
  };

  const EditableText = ({ value, onChange, multiline = false, placeholder = "", className = "" }: {
    value: string;
    onChange: (value: string) => void;
    multiline?: boolean;
    placeholder?: string;
    className?: string;
  }) => {
    if (!isEditMode) {
      return multiline ? (
        <div className={className}>{value}</div>
      ) : (
        <span className={className}>{value}</span>
      );
    }

    return multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${className} border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none w-full`}
        rows={3}
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${className} border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowLeft className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800" />
            <h1 className="text-lg font-semibold text-gray-800">Travel Guide</h1>
          </div>
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-2 rounded-full ${isLiked ? 'text-red-500' : 'text-gray-400'} hover:bg-gray-100 transition-colors`}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <Share2 className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Cover Image */}
        <div className="relative mb-6 rounded-xl overflow-hidden shadow-lg">
          <img
            src={guideData.coverImage}
            alt={guideData.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <EditableText
              value={guideData.title}
              onChange={(value) => setGuideData({ ...guideData, title: value })}
              className="text-2xl font-bold"
            />
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4" />
              <EditableText
                value={guideData.destination}
                onChange={(value) => setGuideData({ ...guideData, destination: value })}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Guide Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-semibold">{guideData.rating}</span>
                <span className="text-gray-500">({guideData.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-5 h-5" />
                <EditableText
                  value={guideData.duration}
                  onChange={(value) => setGuideData({ ...guideData, duration: value })}
                />
              </div>
            </div>
            <span className="text-sm text-gray-500">By {guideData.author}</span>
          </div>

          <EditableText
            value={guideData.description}
            onChange={(value) => setGuideData({ ...guideData, description: value })}
            multiline
            className="text-gray-700 mb-4"
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {guideData.tags.map((tag, index) => (
              <div key={index} className="flex items-center gap-1">
                <EditableText
                  value={tag}
                  onChange={(value) => updateTag(index, value)}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                />
                {isEditMode && (
                  <button
                    onClick={() => removeTag(index)}
                    className="p-1 text-red-500 hover:bg-red-100 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {isEditMode && (
              <button
                onClick={addTag}
                className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm hover:bg-gray-300 transition-colors"
              >
                <Plus className="w-3 h-3 inline mr-1" />
                Add Tag
              </button>
            )}
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Budget:</span>
              <EditableText
                value={guideData.budget}
                onChange={(value) => setGuideData({ ...guideData, budget: value })}
                className="block font-medium"
              />
            </div>
            <div>
              <span className="text-gray-500">Best Time:</span>
              <EditableText
                value={guideData.bestTime}
                onChange={(value) => setGuideData({ ...guideData, bestTime: value })}
                className="block font-medium"
              />
            </div>
            <div>
              <span className="text-gray-500">Difficulty:</span>
              <EditableText
                value={guideData.difficulty}
                onChange={(value) => setGuideData({ ...guideData, difficulty: value })}
                className="block font-medium"
              />
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <button
            onClick={() => toggleSection('overview')}
            className="flex items-center justify-between w-full mb-4"
          >
            <h2 className="text-xl font-bold">Overview</h2>
            {expandedSections.overview ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {expandedSections.overview && (
            <EditableText
              value={guideData.overview}
              onChange={(value) => setGuideData({ ...guideData, overview: value })}
              multiline
              className="text-gray-700 leading-relaxed"
            />
          )}
        </div>

        {/* Highlights Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <button
            onClick={() => toggleSection('highlights')}
            className="flex items-center justify-between w-full mb-4"
          >
            <h2 className="text-xl font-bold">Highlights</h2>
            <div className="flex items-center gap-2">
              {isEditMode && (
                <button
                  onClick={addHighlight}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              {expandedSections.highlights ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>
          {expandedSections.highlights && (
            <div className="grid gap-4">
              {highlights.map((highlight) => (
                <div key={highlight.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                  <img
                    src={highlight.image}
                    alt={highlight.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <EditableText
                        value={highlight.title}
                        onChange={(value) => updateHighlight(highlight.id, 'title', value)}
                        className="font-semibold text-lg mb-2"
                      />
                      {isEditMode && (
                        <button
                          onClick={() => removeHighlight(highlight.id)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <EditableText
                      value={highlight.description}
                      onChange={(value) => updateHighlight(highlight.id, 'description', value)}
                      multiline
                      className="text-gray-600 mb-2"
                    />
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <EditableText
                        value={highlight.duration}
                        onChange={(value) => updateHighlight(highlight.id, 'duration', value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Itinerary Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <button
            onClick={() => toggleSection('itinerary')}
            className="flex items-center justify-between w-full mb-4"
          >
            <h2 className="text-xl font-bold">Itinerary</h2>
            <div className="flex items-center gap-2">
              {isEditMode && (
                <button
                  onClick={addItineraryDay}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              {expandedSections.itinerary ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>
          {expandedSections.itinerary && (
            <div className="space-y-4">
              {itinerary.map((day) => (
                <div key={day.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Day {day.day}
                      </span>
                      <EditableText
                        value={day.title}
                        onChange={(value) => updateItinerary(day.id, 'title', value)}
                        className="font-semibold"
                      />
                    </div>
                    {isEditMode && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => addActivity(day.id)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeItinerary(day.id)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {day.activities.map((activity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <EditableText
                          value={activity}
                          onChange={(value) => updateActivity(day.id, index, value)}
                          className="flex-1"
                        />
                        {isEditMode && (
                          <button
                            onClick={() => removeActivity(day.id, index)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <button
            onClick={() => toggleSection('tips')}
            className="flex items-center justify-between w-full mb-4"
          >
            <h2 className="text-xl font-bold">Tips & Advice</h2>
            <div className="flex items-center gap-2">
              {isEditMode && (
                <button
                  onClick={addTip}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              {expandedSections.tips ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>
          {expandedSections.tips && (
            <div className="grid gap-4">
              {tips.map((tip) => (
                <div key={tip.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                  <EditableText
                    value={tip.icon}
                    onChange={(value) => updateTip(tip.id, 'icon', value)}
                    className="text-2xl"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <EditableText
                        value={tip.title}
                        onChange={(value) => updateTip(tip.id, 'title', value)}
                        className="font-semibold mb-1"
                      />
                      {isEditMode && (
                        <button
                          onClick={() => removeTip(tip.id)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <EditableText
                      value={tip.content}
                      onChange={(value) => updateTip(tip.id, 'content', value)}
                      multiline
                      className="text-gray-600 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuidePage;