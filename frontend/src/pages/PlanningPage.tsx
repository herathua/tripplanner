import React from 'react';
import { Map, MapPin, User, MessageSquare } from 'lucide-react';

const PlanningPage: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Column - Trip Details */}
      <div className="w-full overflow-y-auto border-r lg:w-2/3">
        {/* Header Image */}
        <div className="relative h-48">
          <img 
            src="https://images.pexels.com/photos/1534411/pexels-photo-1534411.jpeg" 
            alt="Trip to Dubai" 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute flex items-center space-x-4 bottom-4 left-4">
            <img 
              src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg"
              alt="User Avatar"
              className="w-10 h-10 border-2 border-white rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">Dubai: 3 Days to South Trip</h1>
              <div className="flex items-center space-x-2 text-white/80">
                <User size={14} />
                <span>Created by Sarah</span>
                <span>•</span>
                <span>Last updated 2 days ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* General Tips Section */}
        <div className="p-6 border-b">
          <h2 className="mb-4 text-xl font-semibold">General tips</h2>
          <p className="mb-4 text-gray-600">
            Get ready for an unforgettable journey! Here are some tips to help you make the most of your Dubai trip.
          </p>
          <div className="p-4 rounded-lg bg-blue-50">
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Best time to visit: November to March when the weather is pleasant</li>
              <li>• Local currency: UAE Dirham (AED)</li>
              <li>• Download offline maps for easy navigation</li>
              <li>• Respect local customs and dress modestly</li>
            </ul>
          </div>
        </div>

        {/* Itinerary */}
        <div className="p-6">
          <div className="space-y-8">
            {/* Day 1 */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">Day 1</h3>
              <div className="space-y-6">
                {/* Activity 1 */}
                <div className="flex">
                  <div className="flex-shrink-0 w-12">
                    <div className="w-3 h-3 mx-auto bg-blue-500 rounded-full"></div>
                    <div className="w-0.5 h-full bg-gray-200 mx-auto"></div>
                  </div>
                  <div className="flex-grow -mt-1">
                    <div className="p-4 bg-white border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Dubai Mall</h4>
                        <span className="text-sm text-gray-500">9:00 AM</span>
                      </div>
                      <p className="mb-3 text-sm text-gray-600">
                        Start your day at the world's largest shopping mall. Don't miss the Dubai Fountain show!
                      </p>
                      <img 
                        src="https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg"
                        alt="Dubai Mall"
                        className="object-cover w-full h-48 rounded-lg"
                      />
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <MapPin size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-600">Financial Center Road</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MessageSquare size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-600">2 notes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity 2 */}
                <div className="flex">
                  <div className="flex-shrink-0 w-12">
                    <div className="w-3 h-3 mx-auto bg-blue-500 rounded-full"></div>
                    <div className="w-0.5 h-full bg-gray-200 mx-auto"></div>
                  </div>
                  <div className="flex-grow -mt-1">
                    <div className="p-4 bg-white border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Burj Khalifa</h4>
                        <span className="text-sm text-gray-500">2:00 PM</span>
                      </div>
                      <p className="mb-3 text-sm text-gray-600">
                        Visit the observation deck of the world's tallest building for breathtaking views.
                      </p>
                      <img 
                        src="https://images.pexels.com/photos/162031/dubai-tower-arab-khalifa-162031.jpeg"
                        alt="Burj Khalifa"
                        className="object-cover w-full h-48 rounded-lg"
                      />
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <MapPin size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-600">1 Sheikh Mohammed bin Rashid Blvd</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MessageSquare size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-600">1 note</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Day 2 */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">Day 2</h3>
              <div className="space-y-6">
                {/* Activity 1 */}
                <div className="flex">
                  <div className="flex-shrink-0 w-12">
                    <div className="w-3 h-3 mx-auto bg-blue-500 rounded-full"></div>
                    <div className="w-0.5 h-full bg-gray-200 mx-auto"></div>
                  </div>
                  <div className="flex-grow -mt-1">
                    <div className="p-4 bg-white border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Desert Safari</h4>
                        <span className="text-sm text-gray-500">3:00 PM</span>
                      </div>
                      <p className="mb-3 text-sm text-gray-600">
                        Experience dune bashing, camel riding, and a traditional Bedouin camp dinner.
                      </p>
                      <img 
                        src="https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg"
                        alt="Desert Safari"
                        className="object-cover w-full h-48 rounded-lg"
                      />
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <MapPin size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-600">Dubai Desert Conservation Reserve</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MessageSquare size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-600">3 notes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Day 3 */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">Day 3</h3>
              <div className="space-y-6">
                {/* Activity 1 */}
                <div className="flex">
                  <div className="flex-shrink-0 w-12">
                    <div className="w-3 h-3 mx-auto bg-blue-500 rounded-full"></div>
                    <div className="w-0.5 h-full bg-gray-200 mx-auto"></div>
                  </div>
                  <div className="flex-grow -mt-1">
                    <div className="p-4 bg-white border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Dubai Marina</h4>
                        <span className="text-sm text-gray-500">10:00 AM</span>
                      </div>
                      <p className="mb-3 text-sm text-gray-600">
                        Walk along the marina, enjoy lunch at a waterfront restaurant, and take a yacht tour.
                      </p>
                      <img 
                        src="https://images.pexels.com/photos/618079/pexels-photo-618079.jpeg"
                        alt="Dubai Marina"
                        className="object-cover w-full h-48 rounded-lg"
                      />
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <MapPin size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-600">Dubai Marina</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MessageSquare size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-600">2 notes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Map */}
      <div className="hidden lg:block lg:w-1/3">
        <div className="sticky top-0 h-screen">
          <div className="relative w-full h-full bg-gray-100">
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
              <Map size={48} className="text-blue-600" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="p-4 bg-white rounded-lg shadow-lg">
                  <h3 className="mb-2 font-medium">Trip Overview</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Total Distance</span>
                      <span className="font-medium">42 km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Locations</span>
                      <span className="font-medium">6 places</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration</span>
                      <span className="font-medium">3 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningPage;