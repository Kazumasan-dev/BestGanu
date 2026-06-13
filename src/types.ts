export interface ExperienceItem {
  id: string;
  name: string;
  category: 'wetlands' | 'islands' | 'culture' | 'homestay' | 'food';
  location: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  ecoBadges: string[];
  vendorName: string;
  vendorContact: string;
  coordinate?: { lat: number; lng: number };
}

export interface BookingTicket {
  id: string;
  experienceId: string;
  experienceName: string;
  bookingDate: string;
  bookedBy: string;
  status: 'active' | 'completed' | 'cancelled';
  price: number;
  guestCount: number;
  qrCodeData: string;
  formattedTime?: string;
  ecoImpactPoints: number;
}

export interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  ecoImpact: string;
  location: string;
}

export interface ItineraryDay {
  day: number;
  theme: string;
  activities: ItineraryActivity[];
}

export interface AIItineraryResponse {
  itinerary: ItineraryDay[];
  tips: string[];
  carbonSavedKg: number;
}
