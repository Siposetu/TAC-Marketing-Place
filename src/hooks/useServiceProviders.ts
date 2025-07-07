import { useState, useEffect } from 'react';
import { ServiceProvider, FormData } from '../types';
import { useGoogleMaps } from './useGoogleMaps';
import { useGoogleSheets } from './useGoogleSheets';

// Mock data with proper structure
const mockServiceProviders: ServiceProvider[] = [
  {
    id: 'mock-001',
    fullName: 'Thabo Mthembu',
    service: 'Plumbing',
    yearsExperience: 8,
    location: 'Khayelitsha, Cape Town',
    coordinates: { lat: -34.0351, lng: 18.6920 },
    contactDetails: {
      phone: '+27 73 456 7890',
      email: 'thabo.plumbing@gmail.com',
      whatsapp: '+27 73 456 7890'
    },
    generatedBio: 'Thabo is a skilled plumber with 8 years of experience serving clients in Khayelitsha and surrounding areas. Known for delivering high-quality work and exceptional customer service, specializing in residential and commercial plumbing solutions.',
    suggestedPrice: 350,
    status: 'Published',
    createdAt: new Date('2024-01-15'),
    isBusinessOwner: false,
    availability: [
      { date: '2024-12-20', startTime: '08:00', endTime: '12:00', available: true },
      { date: '2024-12-20', startTime: '13:00', endTime: '17:00', available: true },
      { date: '2024-12-21', startTime: '08:00', endTime: '12:00', available: true },
      { date: '2024-12-21', startTime: '13:00', endTime: '17:00', available: false },
      { date: '2024-12-22', startTime: '08:00', endTime: '12:00', available: true }
    ]
  },
  {
    id: 'mock-002',
    fullName: 'Nomsa Dlamini',
    service: 'Hair Styling',
    yearsExperience: 12,
    location: 'Gugulethu, Cape Town',
    coordinates: { lat: -34.0167, lng: 18.5833 },
    contactDetails: {
      phone: '+27 82 123 4567',
      email: 'nomsa.hair@outlook.com',
      whatsapp: '+27 82 123 4567'
    },
    generatedBio: 'Nomsa brings 12 years of professional hair styling experience to every client. Based in Gugulethu, she specializes in natural hair care, braids, weaves, and modern styling techniques. Known for her creativity and attention to detail.',
    suggestedPrice: 180,
    status: 'Published',
    createdAt: new Date('2024-02-10'),
    isBusinessOwner: true,
    businessInfo: {
      businessName: 'Nomsa\'s Hair Studio',
      businessType: 'Small Business',
      description: 'A modern hair salon specializing in natural hair care and contemporary styling for the community.',
      services: ['Hair Styling', 'Braids', 'Weaves', 'Hair Treatment'],
      operatingHours: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '08:00', close: '16:00', closed: false },
        sunday: { open: '10:00', close: '14:00', closed: true }
      }
    },
    availability: [
      { date: '2024-12-20', startTime: '09:00', endTime: '12:00', available: true },
      { date: '2024-12-20', startTime: '14:00', endTime: '17:00', available: true },
      { date: '2024-12-21', startTime: '09:00', endTime: '12:00', available: false },
      { date: '2024-12-21', startTime: '14:00', endTime: '17:00', available: true }
    ]
  },
  {
    id: 'mock-003',
    fullName: 'Ahmed Hassan',
    service: 'Electrical Work',
    yearsExperience: 15,
    location: 'Mitchell\'s Plain, Cape Town',
    coordinates: { lat: -34.0333, lng: 18.6167 },
    contactDetails: {
      phone: '+27 71 987 6543',
      email: 'ahmed.electrical@gmail.com',
      whatsapp: '+27 71 987 6543',
      website: 'https://ahmedelectrical.co.za'
    },
    generatedBio: 'Ahmed is a certified electrician with 15 years of experience in residential and commercial electrical work. Based in Mitchell\'s Plain, he provides reliable electrical services including installations, repairs, and safety inspections.',
    suggestedPrice: 400,
    status: 'Published',
    createdAt: new Date('2024-01-20'),
    isBusinessOwner: true,
    businessInfo: {
      businessName: 'Hassan Electrical Services',
      businessType: 'Small Business',
      description: 'Professional electrical services for homes and businesses with certified, experienced technicians.',
      services: ['Electrical Installations', 'Repairs', 'Safety Inspections', 'Emergency Services'],
      operatingHours: {
        monday: { open: '07:00', close: '17:00', closed: false },
        tuesday: { open: '07:00', close: '17:00', closed: false },
        wednesday: { open: '07:00', close: '17:00', closed: false },
        thursday: { open: '07:00', close: '17:00', closed: false },
        friday: { open: '07:00', close: '17:00', closed: false },
        saturday: { open: '08:00', close: '14:00', closed: false },
        sunday: { open: '09:00', close: '13:00', closed: true }
      }
    },
    availability: [
      { date: '2024-12-20', startTime: '07:00', endTime: '11:00', available: true },
      { date: '2024-12-20', startTime: '12:00', endTime: '16:00', available: true },
      { date: '2024-12-21', startTime: '07:00', endTime: '11:00', available: true }
    ]
  },
  {
    id: 'mock-004',
    fullName: 'Sipho Ndaba',
    service: 'Tutoring',
    yearsExperience: 6,
    location: 'Langa, Cape Town',
    coordinates: { lat: -33.9500, lng: 18.5167 },
    contactDetails: {
      phone: '+27 84 567 8901',
      email: 'sipho.tutor@gmail.com',
      whatsapp: '+27 84 567 8901'
    },
    generatedBio: 'Sipho is a dedicated mathematics and science tutor with 6 years of experience helping students excel in their studies. Based in Langa, he specializes in high school mathematics, physical science, and exam preparation.',
    suggestedPrice: 200,
    status: 'Published',
    createdAt: new Date('2024-03-05'),
    isBusinessOwner: false,
    availability: [
      { date: '2024-12-20', startTime: '15:00', endTime: '18:00', available: true },
      { date: '2024-12-21', startTime: '15:00', endTime: '18:00', available: true },
      { date: '2024-12-22', startTime: '09:00', endTime: '12:00', available: true }
    ]
  },
  {
    id: 'mock-005',
    fullName: 'Fatima Abrahams',
    service: 'Catering',
    yearsExperience: 10,
    location: 'Athlone, Cape Town',
    coordinates: { lat: -33.9667, lng: 18.5167 },
    contactDetails: {
      phone: '+27 76 234 5678',
      email: 'fatima.catering@gmail.com',
      whatsapp: '+27 76 234 5678'
    },
    generatedBio: 'Fatima specializes in traditional Cape Malay cuisine and modern catering services with 10 years of experience. Based in Athlone, she provides catering for weddings, corporate events, and special occasions with authentic flavors.',
    suggestedPrice: 280,
    status: 'Published',
    createdAt: new Date('2024-02-28'),
    isBusinessOwner: true,
    businessInfo: {
      businessName: 'Fatima\'s Cape Malay Kitchen',
      businessType: 'Small Business',
      description: 'Authentic Cape Malay cuisine and catering services for all occasions, bringing traditional flavors to your events.',
      services: ['Wedding Catering', 'Corporate Events', 'Traditional Cuisine', 'Special Occasions'],
      operatingHours: {
        monday: { open: '08:00', close: '18:00', closed: false },
        tuesday: { open: '08:00', close: '18:00', closed: false },
        wednesday: { open: '08:00', close: '18:00', closed: false },
        thursday: { open: '08:00', close: '18:00', closed: false },
        friday: { open: '08:00', close: '18:00', closed: false },
        saturday: { open: '07:00', close: '20:00', closed: false },
        sunday: { open: '08:00', close: '16:00', closed: false }
      }
    },
    availability: [
      { date: '2024-12-21', startTime: '10:00', endTime: '14:00', available: true },
      { date: '2024-12-22', startTime: '08:00', endTime: '12:00', available: true }
    ]
  },
  {
    id: 'mock-006',
    fullName: 'Mandla Zulu',
    service: 'Gardening',
    yearsExperience: 7,
    location: 'Nyanga, Cape Town',
    coordinates: { lat: -34.0167, lng: 18.5833 },
    contactDetails: {
      phone: '+27 78 345 6789',
      email: 'mandla.gardens@gmail.com',
      whatsapp: '+27 78 345 6789'
    },
    generatedBio: 'Mandla is a passionate gardener with 7 years of experience in landscape design and garden maintenance. Based in Nyanga, he specializes in indigenous plants, vegetable gardens, and sustainable gardening practices.',
    suggestedPrice: 160,
    status: 'Published',
    createdAt: new Date('2024-01-30'),
    isBusinessOwner: false,
    availability: [
      { date: '2024-12-20', startTime: '06:00', endTime: '10:00', available: true },
      { date: '2024-12-20', startTime: '14:00', endTime: '18:00', available: true },
      { date: '2024-12-21', startTime: '06:00', endTime: '10:00', available: true }
    ]
  },
  {
    id: 'mock-007',
    fullName: 'Priya Patel',
    service: 'Photography',
    yearsExperience: 9,
    location: 'Wynberg, Cape Town',
    coordinates: { lat: -34.0167, lng: 18.4667 },
    contactDetails: {
      phone: '+27 83 456 7890',
      email: 'priya.photography@gmail.com',
      whatsapp: '+27 83 456 7890',
      website: 'https://priyaphotography.co.za'
    },
    generatedBio: 'Priya is a professional photographer with 9 years of experience capturing life\'s precious moments. Based in Wynberg, she specializes in weddings, portraits, and event photography with a creative and artistic approach.',
    suggestedPrice: 450,
    status: 'Published',
    createdAt: new Date('2024-02-15'),
    isBusinessOwner: true,
    businessInfo: {
      businessName: 'Priya Photography Studio',
      businessType: 'Small Business',
      description: 'Professional photography services specializing in weddings, portraits, and events with artistic flair.',
      services: ['Wedding Photography', 'Portrait Sessions', 'Event Photography', 'Family Photos'],
      operatingHours: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '08:00', close: '20:00', closed: false },
        sunday: { open: '10:00', close: '18:00', closed: false }
      }
    },
    availability: [
      { date: '2024-12-21', startTime: '09:00', endTime: '13:00', available: true },
      { date: '2024-12-22', startTime: '14:00', endTime: '18:00', available: true }
    ]
  },
  {
    id: 'mock-008',
    fullName: 'Lungile Mthembu',
    service: 'Cleaning',
    yearsExperience: 5,
    location: 'Philippi, Cape Town',
    coordinates: { lat: -34.0333, lng: 18.6000 },
    contactDetails: {
      phone: '+27 72 567 8901',
      email: 'lungile.cleaning@gmail.com',
      whatsapp: '+27 72 567 8901'
    },
    generatedBio: 'Lungile provides professional cleaning services with 5 years of experience in residential and office cleaning. Based in Philippi, she is known for her attention to detail and reliable service.',
    suggestedPrice: 140,
    status: 'Published',
    createdAt: new Date('2024-03-10'),
    isBusinessOwner: false,
    availability: [
      { date: '2024-12-20', startTime: '08:00', endTime: '12:00', available: true },
      { date: '2024-12-20', startTime: '13:00', endTime: '17:00', available: true },
      { date: '2024-12-21', startTime: '08:00', endTime: '12:00', available: true }
    ]
  }
];

export function useServiceProviders() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { geocodeAddress } = useGoogleMaps();
  const { syncServiceProviderToSheets, isGoogleSheetsConfigured, setupAllSheets } = useGoogleSheets();

  // Initialize providers and auto-sync to Google Sheets
  useEffect(() => {
    const initializeProviders = async () => {
      if (initialized) return;
      
      console.log('Initializing service providers...');
      
      // Load from localStorage first
      const savedProviders = localStorage.getItem('serviceProviders');
      let currentProviders: ServiceProvider[] = [];
      
      if (savedProviders) {
        try {
          currentProviders = JSON.parse(savedProviders).map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt)
          }));
          console.log('Loaded providers from localStorage:', currentProviders.length);
        } catch (error) {
          console.error('Error parsing saved providers:', error);
          currentProviders = [];
        }
      }
      
      // If no saved providers or less than expected, initialize with mock data
      if (currentProviders.length === 0) {
        console.log('No saved providers found, initializing with mock data...');
        currentProviders = mockServiceProviders;
        localStorage.setItem('serviceProviders', JSON.stringify(currentProviders));
      }
      
      setProviders(currentProviders);
      setInitialized(true);
      
      // Auto-sync to Google Sheets if configured
      if (isGoogleSheetsConfigured()) {
        console.log('Google Sheets configured, attempting auto-sync...');
        try {
          await setupAllSheets();
          
          // Sync all providers to Google Sheets
          for (const provider of currentProviders) {
            try {
              await syncServiceProviderToSheets(provider);
              console.log(`Synced provider ${provider.fullName} to Google Sheets`);
            } catch (syncError) {
              console.warn(`Failed to sync provider ${provider.fullName}:`, syncError);
            }
          }
          console.log('Auto-sync to Google Sheets completed');
        } catch (error) {
          console.warn('Google Sheets auto-sync failed:', error);
        }
      } else {
        console.log('Google Sheets not configured, skipping auto-sync');
      }
    };

    initializeProviders();
  }, [initialized, isGoogleSheetsConfigured, setupAllSheets, syncServiceProviderToSheets]);

  const saveProviders = (newProviders: ServiceProvider[]) => {
    console.log('Saving providers:', newProviders.length);
    setProviders(newProviders);
    localStorage.setItem('serviceProviders', JSON.stringify(newProviders));
  };

  const addProvider = async (provider: ServiceProvider) => {
    console.log('Adding new provider:', provider.fullName);
    const newProviders = [...providers, provider];
    saveProviders(newProviders);
    
    // Auto-sync to Google Sheets
    if (isGoogleSheetsConfigured()) {
      try {
        await syncServiceProviderToSheets(provider);
        console.log(`Auto-synced new provider ${provider.fullName} to Google Sheets`);
      } catch (error) {
        console.warn('Auto-sync to Google Sheets failed for new provider:', error);
      }
    }
  };

  const updateProvider = async (id: string, updates: Partial<ServiceProvider>) => {
    console.log('Updating provider:', id);
    const newProviders = providers.map(p => {
      if (p.id === id) {
        const updatedProvider = { ...p, ...updates };
        
        // Auto-sync to Google Sheets when provider is updated
        if (isGoogleSheetsConfigured()) {
          syncServiceProviderToSheets(updatedProvider).then(() => {
            console.log(`Auto-synced updated provider ${updatedProvider.fullName} to Google Sheets`);
          }).catch(error => {
            console.warn('Auto-sync to Google Sheets failed for provider update:', error);
          });
        }
        
        return updatedProvider;
      }
      return p;
    });
    saveProviders(newProviders);
  };

  const deleteProvider = (id: string) => {
    console.log('Deleting provider:', id);
    const newProviders = providers.filter(p => p.id !== id);
    saveProviders(newProviders);
  };

  const generateProfile = async (formData: FormData): Promise<ServiceProvider> => {
    setLoading(true);
    
    try {
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get coordinates for the location
      const coordinates = await geocodeAddress(formData.location);
      
      const generatedBio = generateBio(formData);
      const suggestedPrice = generatePrice(formData);
      
      const newProvider: ServiceProvider = {
        id: Date.now().toString(),
        fullName: formData.fullName,
        service: formData.service,
        yearsExperience: formData.yearsExperience,
        location: formData.location,
        coordinates,
        contactDetails: formData.contactDetails,
        generatedBio,
        suggestedPrice,
        status: 'Ready',
        createdAt: new Date(),
        isBusinessOwner: formData.isBusinessOwner,
        businessInfo: formData.businessInfo,
        availability: generateDefaultAvailability(),
        profileImages: formData.profileImages,
        customerReviews: formData.customerReviews,
        customAvailability: formData.customAvailability
      };
      
      await addProvider(newProvider);
      return newProvider;
    } catch (error) {
      console.error('Error generating profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const findNearbyProviders = (userLocation: { lat: number; lng: number }, radiusKm: number = 15) => {
    return providers.filter(provider => {
      if (!provider.coordinates) return true; // Include providers without coordinates
      
      const distance = calculateDistance(userLocation, provider.coordinates);
      return distance <= radiusKm;
    });
  };

  const refreshMockData = () => {
    console.log('Refreshing with mock data...');
    localStorage.removeItem('serviceProviders');
    setInitialized(false);
    setProviders([]);
  };

  return {
    providers,
    loading,
    addProvider,
    updateProvider,
    deleteProvider,
    generateProfile,
    findNearbyProviders,
    refreshMockData
  };
}

function generateBio(formData: FormData): string {
  const { fullName, service, yearsExperience, location, isBusinessOwner, businessInfo } = formData;
  
  if (isBusinessOwner && businessInfo) {
    return `${businessInfo.businessName} is a ${businessInfo.businessType.toLowerCase()} specializing in ${service.toLowerCase()} with ${yearsExperience} years of experience in ${location}. ${businessInfo.description}`;
  }
  
  const templates = [
    `${fullName} is a skilled ${service.toLowerCase()} with ${yearsExperience} years of experience serving clients in ${location}. Known for delivering high-quality work and exceptional customer service.`,
    `With ${yearsExperience} years of hands-on experience, ${fullName} specializes in ${service.toLowerCase()} and has built a reputation for reliability and expertise in ${location}.`,
    `${fullName} brings ${yearsExperience} years of professional ${service.toLowerCase()} experience to every project. Based in ${location}, they are committed to exceeding client expectations.`,
    `An experienced ${service.toLowerCase()} professional with ${yearsExperience} years in the field, ${fullName} serves the ${location} community with dedication and skill.`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

function generatePrice(formData: FormData): number {
  const { service, yearsExperience } = formData;
  
  const basePrices: { [key: string]: number } = {
    'Plumbing': 300,
    'Electrical Work': 350,
    'Carpentry': 280,
    'Painting': 200,
    'Gardening': 150,
    'Cleaning': 120,
    'Tutoring': 180,
    'Catering': 250,
    'Photography': 400,
    'Web Development': 500,
    'Graphic Design': 300,
    'Music Lessons': 200,
    'Fitness Training': 250,
    'Hair Styling': 150,
    'Mechanic': 320,
    'Tailoring': 180
  };
  
  const basePrice = basePrices[service] || 200;
  const experienceMultiplier = 1 + (yearsExperience * 0.1);
  
  return Math.round(basePrice * experienceMultiplier);
}

function generateDefaultAvailability() {
  const slots = [];
  const today = new Date();
  
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Generate morning and afternoon slots
    slots.push({
      date: date.toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '12:00',
      available: Math.random() > 0.3
    });
    
    slots.push({
      date: date.toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '17:00',
      available: Math.random() > 0.3
    });
  }
  
  return slots;
}

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