import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, Calendar, Star, Phone, Mail, MessageCircle, AlertCircle } from 'lucide-react';
import { ServiceProvider } from '../types';
import { useServiceProviders } from '../hooks/useServiceProviders';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { MapView } from './MapView';
import { BookingModal } from './BookingModal';

export function FindServices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [bookingProvider, setBookingProvider] = useState<ServiceProvider | null>(null);
  
  const { providers, loading: providersLoading } = useServiceProviders();
  const { geocodeAddress, isLoaded: mapsLoaded } = useGoogleMaps();

  const services = [
    'Plumbing', 'Electrical Work', 'Carpentry', 'Painting', 'Gardening',
    'Cleaning', 'Tutoring', 'Catering', 'Photography', 'Web Development',
    'Graphic Design', 'Music Lessons', 'Fitness Training', 'Hair Styling',
    'Mechanic', 'Tailoring'
  ];

  // Debug logging
  useEffect(() => {
    console.log('FindServices - Providers:', providers.length);
    console.log('FindServices - Loading:', providersLoading);
    console.log('FindServices - Maps loaded:', mapsLoaded);
  }, [providers, providersLoading, mapsLoaded]);

  const handleLocationSearch = async (location: string) => {
    if (!mapsLoaded) {
      console.warn('Google Maps not loaded yet');
      return;
    }
    
    const coords = await geocodeAddress(location);
    if (coords) {
      setUserLocation(coords);
      console.log('User location set:', coords);
    }
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesService = !selectedService || provider.service === selectedService;
    
    return matchesSearch && matchesService && provider.status === 'Published';
  });

  const nearbyProviders = userLocation 
    ? filteredProviders.filter(provider => {
        if (!provider.coordinates) return true;
        const distance = calculateDistance(userLocation, provider.coordinates);
        return distance <= 15; // 15km radius
      })
    : filteredProviders;

  // Show loading state
  if (providersLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading service providers...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">Find Services</h2>
            <p className="text-gray-600 mt-2 text-lg">Discover local service providers on TAC Market Place</p>
            <p className="text-sm text-gray-500 mt-1">{providers.length} service providers available</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all font-medium ${
                showMap 
                  ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-teal-50 hover:text-teal-600'
              }`}
              disabled={!mapsLoaded}
            >
              <MapPin className="w-5 h-5" />
              <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
              {!mapsLoaded && <span className="text-xs">(Loading...)</span>}
            </button>
          </div>
        </div>
        
        {/* Search Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search providers or services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full pl-12 pr-8 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-gray-50 focus:bg-white transition-all"
            >
              <option value="">All Services</option>
              {services.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>
          
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Enter your location..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleLocationSearch(e.currentTarget.value);
                }
              }}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              disabled={!mapsLoaded}
            />
          </div>
        </div>

        {/* Maps API Status */}
        {!mapsLoaded && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800 text-sm">
                Google Maps is loading... Location search and map view will be available shortly.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Map View */}
      {showMap && mapsLoaded && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <MapView 
            providers={nearbyProviders}
            center={userLocation || undefined}
            onProviderSelect={setSelectedProvider}
          />
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nearbyProviders.map(provider => (
          <div key={provider.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 overflow-hidden group">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {provider.fullName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {provider.isBusinessOwner && provider.businessInfo 
                        ? provider.businessInfo.businessName 
                        : provider.fullName}
                    </h3>
                    <p className="text-sm text-teal-600 font-medium">{provider.service}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">4.8 (24 reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-teal-500" />
                  <span>{provider.location}</span>
                </div>
                <div className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  From R{provider.suggestedPrice}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-6 line-clamp-2">
                {provider.generatedBio}
              </p>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setBookingProvider(provider)}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Now</span>
                </button>
                
                <div className="flex space-x-2">
                  {provider.contactDetails?.phone && (
                    <a
                      href={`tel:${provider.contactDetails.phone}`}
                      className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors"
                      title="Call"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  
                  {provider.contactDetails?.whatsapp && (
                    <a
                      href={`https://wa.me/${provider.contactDetails.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                  
                  {provider.contactDetails?.email && (
                    <a
                      href={`mailto:${provider.contactDetails.email}`}
                      className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
                      title="Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {nearbyProviders.length === 0 && !providersLoading && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-r from-teal-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-teal-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">No services found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or location</p>
          {providers.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              No service providers are currently available. Please check back later.
            </p>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {bookingProvider && (
        <BookingModal
          isOpen={!!bookingProvider}
          onClose={() => setBookingProvider(null)}
          provider={bookingProvider}
        />
      )}
    </div>
  );
}

// Helper function to calculate distance
function calculateDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (destination.lat - origin.lat) * Math.PI / 180;
  const dLon = (destination.lng - origin.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}