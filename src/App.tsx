import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Leaf, 
  QrCode, 
  Users, 
  MapPin, 
  Sparkles, 
  Wifi, 
  WifiOff, 
  Globe, 
  BookOpen, 
  PhoneCall, 
  Calendar,
  Layers,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Clock,
  Heart,
  Briefcase
} from 'lucide-react';
import { ECO_EXPERIENCES, MICRO_VENDORS } from './data';
import { ExperienceItem, BookingTicket, AIItineraryResponse } from './types';
import { ExperienceCard } from './components/ExperienceCard';
import { ItineraryResult } from './components/ItineraryResult';
import { TicketView } from './components/TicketView';

// Custom designed Turtle logo outline representational component
const TurtleLogo = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10 stroke-[#0A4D4F] fill-none shrink-0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Shell */}
    <path d="M 50,15 C 32,15 22,35 22,55 C 22,75 32,85 50,85 C 68,85 78,75 78,55 C 78,35 68,15 50,15 Z" fill="#A9DFBF" fillOpacity="0.45" />
    {/* Head */}
    <path d="M 50,15 C 50,15 50,5 50,5 C 54,5 57,8 57,11 C 57,14 53,15 50,15 Z" fill="#0A4D4F" />
    {/* Flippers Front Left */}
    <path d="M 25,30 C 13,24 4,33 11,46 C 16,51 24,38 27,32" />
    {/* Flippers Front Right */}
    <path d="M 75,30 C 87,24 96,33 89,46 C 84,51 76,38 73,32" />
    {/* Flippers Rear Left */}
    <path d="M 28,75 C 18,80 18,92 28,90 C 33,89 32,80 28,75" />
    {/* Flippers Rear Right */}
    <path d="M 72,75 C 82,80 82,92 72,90 C 67,89 68,80 72,75" />
    {/* Tail */}
    <path d="M 50,85 C 50,85 50,94 50,94 C 48,92 48,87 50,85" />
    {/* Shell Patterns */}
    <polygon points="50,32 62,40 62,56 50,64 38,56 38,40" strokeWidth="1.5" />
    <path d="M 50,32 L 50,15 M 62,40 L 78,34 M 62,56 L 78,66 M 50,64 L 50,85 M 38,56 L 22,66 M 38,40 L 22,34" strokeWidth="1.5" />
  </svg>
);

export default function App() {
  // Mobile-first PWA Tab switching state: 'market' | 'planner' | 'tickets' | 'vendors'
  const [activeTab, setActiveTab] = useState<'market' | 'planner' | 'tickets' | 'vendors'>('market');
  
  // Storage of offline active QR tickets
  const [tickets, setTickets] = useState<BookingTicket[]>([]);
  
  // Interactive network mode toggle for live testing review
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  
  // Marketplace categories filter
  const [marketFilter, setMarketFilter] = useState<'all' | 'wetlands' | 'islands' | 'culture'>('all');
  
  // Booking Ticket Dialog form wizard state
  const [showBookingDialog, setShowBookingDialog] = useState<boolean>(false);
  const [selectedExperience, setSelectedExperience] = useState<ExperienceItem | null>(null);
  const [guestName, setGuestName] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [visitDate, setVisitDate] = useState<string>('');

  // AI Planner input states
  const [planDays, setPlanDays] = useState<number>(3);
  const [planPref, setPlanPref] = useState<string>('Wetlands Navigation & Homestays');
  const [ecoIntensity, setEcoIntensity] = useState<string>('Immersive Eco (Conservationist)');
  const [customDemand, setCustomDemand] = useState<string>('');
  
  const [generatedItinerary, setGeneratedItinerary] = useState<AIItineraryResponse | null>(null);
  const [itineraryIsLoading, setItineraryIsLoading] = useState<boolean>(false);
  const [itineraryError, setItineraryError] = useState<string | null>(null);

  // Supabase dynamic states with offline-safe defaults
  const [experiences, setExperiences] = useState<ExperienceItem[]>(ECO_EXPERIENCES);
  const [supabaseStatus, setSupabaseStatus] = useState<{ configured: boolean; message: string }>({
    configured: false,
    message: "Verifying connection..."
  });
  
  // User context with local storage bindings & Supabase Cloud Sync
  const [userEmail, setUserEmail] = useState<string>(() => localStorage.getItem('bestganu_user_email') || '');
  const [userFullName, setUserFullName] = useState<string>(() => localStorage.getItem('bestganu_user_name') || '');
  const [isSyncingProfile, setIsSyncingProfile] = useState<boolean>(false);
  const [profileSyncStatus, setProfileSyncStatus] = useState<string>('');
  const [syncDone, setSyncDone] = useState<boolean>(() => !!localStorage.getItem('bestganu_user_email'));

  // Load and register PWA & server elements
  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then((reg) => {
            console.log('BestGanu PWA Service Worker Registered Successfully!', reg.scope);
          })
          .catch((err) => {
            console.warn('Service Worker registration skipped or failed:', err);
          });
      });
    }

    // Load experiences from Express Server (with Supabase fallback check)
    fetch("/api/experiences")
      .then(res => res.json())
      .then(resData => {
        if (resData && Array.isArray(resData.data)) {
          setExperiences(resData.data);
          console.log("Experiences loaded successfully via API source:", resData.source);
        }
      })
      .catch(err => console.warn("Failed to retrieve live experiences. Running cached mode.", err));

    // Verify Supabase Setup Status
    fetch("/api/supabase-status")
      .then(res => res.json())
      .then(statusData => {
        setSupabaseStatus(statusData);
      })
      .catch(err => {
        console.warn("Could not retrieve Supabase configuration parameter status:", err);
      });

    // Check if live bookings can be loaded from Supabase or fallback to offline standard local storage
    const loadBookings = async () => {
      try {
        const res = await fetch("/api/bookings");
        if (res.ok) {
          const resData = await res.json();
          if (resData && Array.isArray(resData.data) && resData.data.length > 0) {
            setTickets(resData.data);
            return;
          }
        }
      } catch (err) {
        console.warn("Express endpoint was offline or returned error. Falling back to storage cache.");
      }

      const savedTickets = localStorage.getItem('bestganu_tickets');
      if (savedTickets) {
        try {
          setTickets(JSON.parse(savedTickets));
        } catch (err) {
          console.error('Failed to parse saved tickets:', err);
        }
      } else {
        const defaultTicket: BookingTicket = {
          id: 'ticket-984',
          experienceId: 'exp1',
          experienceName: 'Setiu Wetlands Boardwalk & Mangrove Replanting',
          bookingDate: '2026-06-18',
          bookedBy: 'John Doe',
          status: 'active',
          price: 45,
          guestCount: 2,
          qrCodeData: 'BESTGANU-SETIU-9843321',
          ecoImpactPoints: 50
        };
        setTickets([defaultTicket]);
        localStorage.setItem('bestganu_tickets', JSON.stringify([defaultTicket]));
      }
    };

    loadBookings();
  }, []);

  // Sync tickets with storage on update
  const saveTicketsToStorage = (updatedTickets: BookingTicket[]) => {
    setTickets(updatedTickets);
    localStorage.setItem('bestganu_tickets', JSON.stringify(updatedTickets));
  };

  // Launch fresh booking ticket request
  const openBookingWizard = (item: ExperienceItem) => {
    setSelectedExperience(item);
    setGuestName('');
    setGuestCount(1);
    
    // Default tomorrow as reservation date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setVisitDate(tomorrow.toISOString().split('T')[0]);
    
    setShowBookingDialog(true);
  };

  // Process offline certified QR generation & Supabase sync
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExperience || !guestName || !visitDate) return;

    const newTicket: BookingTicket = {
      id: `ticket-${Math.floor(Math.random() * 9000 + 1000)}`,
      experienceId: selectedExperience.id,
      experienceName: selectedExperience.name,
      bookingDate: visitDate,
      bookedBy: guestName,
      status: 'active',
      price: selectedExperience.price * guestCount,
      guestCount: guestCount,
      qrCodeData: `BESTGANU-${selectedExperience.category.toUpperCase()}-${Math.floor(Math.random() * 800000 + 100000)}`,
      ecoImpactPoints: selectedExperience.category === 'wetlands' ? 30 * guestCount : 25 * guestCount
    };

    const nextTickets = [...tickets, newTicket];
    saveTicketsToStorage(nextTickets);

    // Dynamic backend registration (Supabase compatible)
    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTicket)
    })
      .then(res => res.json())
      .then(data => {
        console.log("Booking registration sync trace:", data);
      })
      .catch(err => {
        console.warn("Backend booking synchronization delayed, holding in local storage:", err);
      });

    setShowBookingDialog(false);
    setSelectedExperience(null);
    
    // Automatically redirect to Tickets shell to inspect QR code
    setActiveTab('tickets');
  };

  const handleCancelBooking = (id: string) => {
    if (confirm("Are you sure you want to cancel this booking and surrender your ecological impact points?")) {
      const remaining = tickets.filter(t => t.id !== id);
      saveTicketsToStorage(remaining);

      // Delete from backend / Supabase
      fetch(`/api/bookings/${id}`, { method: "DELETE" })
        .then(res => res.json())
        .then(data => {
          console.log("Delete booking sync trace:", data);
        })
        .catch(err => {
          console.warn("Delayed backend cancellation deletion:", err);
        });
    }
  };

  // Trigger Gemini AI smart travel planner request
  const handleGenerateAIItinerary = async () => {
    setItineraryIsLoading(true);
    setItineraryError(null);
    setGeneratedItinerary(null);

    // If PWA Offline Simulation Mode is toggled on, skip api call and render mock instantly
    if (isOfflineMode) {
      setTimeout(() => {
        // Emulate local high-speed processing
        const offlineMock = getLocalFallback(planDays, planPref, ecoIntensity, customDemand);
        setGeneratedItinerary(offlineMock);
        setItineraryIsLoading(false);
      }, 900);
      return;
    }

    try {
      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: planDays,
          preferences: planPref,
          ecoIntensity,
          customDemands: customDemand
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned error code ${response.status}`);
      }

      const data = await response.json();
      
      // If server returned fallback block directly or actual structural object
      if (data.fallback && !data.itinerary) {
        setGeneratedItinerary(data.fallback);
      } else {
        setGeneratedItinerary(data);
      }

    } catch (err: any) {
      console.warn("AI Generation Endpoint Failed or Offline. Loading premium local engine:", err);
      // Fallback gracefully to dynamic localized template
      setGeneratedItinerary(getLocalFallback(planDays, planPref, ecoIntensity, customDemand));
    } finally {
      setItineraryIsLoading(false);
    }
  };

  // Premium local generator for instant offline/error resilience
  const getLocalFallback = (days: number, pref: string, intensity: string, custom?: string) => {
    const activityPool = [
      {
        time: "08:30 AM",
        title: "Penarik Estuary Mangrove Sapling Protection",
        description: `Experience the breathtaking Setiu delta wetlands. Learn traditional soil banking methods with certified naturalist Yusuf bin Ibrahim and plant defensive mangrove stems.`,
        ecoImpact: "Reinforces soft coastal banks against tidal storms and funds community wetland guardians.",
        location: "Setiu Wetlands"
      },
      {
        time: "11:00 AM",
        title: "Batik Organic Dye Extraction Workshop",
        description: `Visit Kuala Ibai's female-run cottage weavers co-op. Hand-boil wild mahogany bark and sea almond leaves to extract 100% organic, nontoxic dyes.`,
        ecoImpact: "By-passes toxic synthetic petrochemical chemicals, keeping regional rivers clean.",
        location: "Kuala Ibai Co-op"
      },
      {
        time: "02:30 PM",
        title: "Master Hardwood Shipyard Preservation Hub",
        description: `Explore maritime legacies on Duyong Island. Watch master shipwrights fit premium ironwood hulls together using exclusively mortise and tenon joineries.`,
        ecoImpact: "Maintains crucial centuries-old wooden shipbuilding craft guilds that are dying out.",
        location: "Duyong Island"
      },
      {
        time: "05:00 PM",
        title: "Coastal Grass & Nipah Straw Harvesting",
        description: "Harvest natural fibers alongside marshland community craft makers. Try weaving a traditional bag using organic sea-grass blades.",
        ecoImpact: "Promotes local biodegradable natural fibers over standard single-use nylon fabrics.",
        location: "Kampung Mangkuk"
      },
      {
        time: "08:15 PM",
        title: "Kapas Biological Night Snorkeling Patrol",
        description: `Swim with naturalists around Kapas shallow reefs using eco-friendly dim blue head torches to limit bio-luminescent disturbance, checking coral health status.`,
        ecoImpact: "Checks sea bleached coral walls without causing thermocline light fatigue in reef fish.",
        location: "Kapas Sanctuary"
      }
    ];

    const itineraryDays = [];
    for (let i = 1; i <= days; i++) {
      const idx1 = ((i - 1) * 2) % activityPool.length;
      const idx2 = ((i - 1) * 2 + 1) % activityPool.length;

      itineraryDays.push({
        day: i,
        theme: i === 1 
          ? `Coastal Wetland Exploration (${pref})` 
          : i === 2 
          ? `Traditional Terengganu Handicraft Preservation (${intensity})`
          : `Scenic Marine Coral Restorations & Low Carbon Trails`,
        activities: [
          activityPool[idx1],
          activityPool[idx2]
        ]
      });
    }

    return {
      itinerary: itineraryDays,
      tips: [
        "Pack standard stainless steel beverage warmers; wetland water spots discourage selling standard packaged water.",
        "Refrain from utilizing sun creams that contain Oxybenzone before diving; choose eco-certified natural substitutes instead.",
        "Wear breathable light long outfits appropriate for countryside community walkabouts."
      ],
      carbonSavedKg: days * 11 + (intensity.includes("Immersive") ? 15 : 6)
    };
  };

  // Filter experiences using dynamically loaded state (with offline-safe fallback)
  const filteredExperiences = experiences.filter(item => {
    if (marketFilter === 'all') return true;
    return item.category === marketFilter;
  });

  return (
    <div className="bg-[#EAE6DD] min-h-screen py-0 md:py-8 px-0 flex items-center justify-center font-sans antialiased selection:bg-[#A9DFBF] selection:text-[#0A4D4F]">
      
      {/* 
        Responsive PWA Mockup Frame:
        Mimics a native high-end mobile casing on desktop displays (420px maximum scale)
        but expands automatically to fill full-widths on small devices for organic mobile touch screens.
      */}
      <div className="max-w-[440px] w-full md:rounded-[36px] bg-[#F4F1EA] md:shadow-[0_24px_64px_rgba(10,77,20,0.15)] md:border-[10px] border-[#0A4D4F] min-h-screen md:min-h-[820px] flex flex-col relative overflow-hidden">
        
        {/* Virtual Speaker & Notch Plate (Desktop Mockup decoration) */}
        <div className="hidden md:flex justify-center absolute top-0 left-0 right-0 h-6 bg-[#0A4D4F] z-50 items-center">
          <div className="w-20 h-3.5 bg-[#FAF8F5]/10 rounded-full border border-white/5 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-camera bg-black/40 mr-1" />
            <span className="w-6 h-1 bg-white/25 rounded-full" />
          </div>
        </div>

        {/* Dynamic Mobile Status Bar */}
        <div className="pt-0 md:pt-6 bg-[#0A4D4F] text-white/90 text-[11px] font-mono font-medium px-5 py-2.5 flex justify-between items-center select-none shadow-xs">
          <span>BestGanu PWA v2.4</span>
          
          <div className="flex items-center gap-2">
            {/* WiFi Status indicators matching simulated offline states */}
            {isOfflineMode ? (
              <span className="flex items-center gap-0.5 text-amber-300 font-bold bg-amber-950/20 px-1.5 py-0.5 rounded-xs border border-amber-500/20">
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span>OFFLINE</span>
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-emerald-300 font-bold">
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>ONLINE</span>
              </span>
            )}
            <span>10:30 AM</span>
          </div>
        </div>

        {/* Brand App Bar Header */}
        <header className="bg-[#FAF8F5] border-b-2 border-[#0A4D4F] p-4.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
          <div className="flex items-center gap-2.5">
            <TurtleLogo />
            <div>
              <h1 className="font-display font-extrabold text-[#0A4D4F] text-lg tracking-tight leading-none">BestGanu</h1>
              <p className="text-[10px] font-sans font-semibold tracking-wide text-[#0A4D4F]/65 uppercase">Terengganu Eco Tourism</p>
            </div>
          </div>

          {/* Interactive Network Status Switcher (Awesome for PWA review) */}
          <button
            onClick={() => {
              setIsOfflineMode(!isOfflineMode);
              // Trigger simple haptic feel simulation
              if ('vibrate' in navigator) navigator.vibrate(40);
            }}
            className={`p-2.5 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer outline-hidden relative group`}
            style={{ 
              borderColor: isOfflineMode ? '#F59E0B' : '#0A4D4F',
              backgroundColor: isOfflineMode ? '#FEF3C7' : '#E6F4F1'
            }}
            title={isOfflineMode ? "Switch to Online Mode" : "Switch to Offline Mode"}
          >
            {isOfflineMode ? (
              <WifiOff className="w-4 h-4 text-amber-700" />
            ) : (
              <Wifi className="w-4 h-4 text-[#0A4D4F]" />
            )}
            
            <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-[#0A4D4F] text-[#FAF8F5] text-[9px] font-sans px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-bold">
              Test PWA Offline
            </span>
          </button>
        </header>

        {/* Supabase Service Status Banner */}
        <div className={`text-[9px] font-mono px-4 py-1.5 flex items-center justify-between select-none border-b border-[#0A4D4F]/10 ${
          supabaseStatus.configured 
            ? 'bg-[#E6F4F1] text-[#0A4D4F]' 
            : 'bg-amber-50 text-amber-900 border-amber-500/10'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${supabaseStatus.configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>CLOUD STORAGE: <strong className="font-bold">{supabaseStatus.configured ? 'SUPABASE' : 'SANDBOX OFF'}</strong></span>
          </div>
          <span className="text-[8px] font-bold uppercase tracking-wider bg-[#0A4D4F]/5 text-[#0A4D4F] px-1.5 py-0.5 rounded-xs">
            {supabaseStatus.configured ? 'ONLINE SYNC ACTIVE' : 'LOCAL PWA ACTIVE'}
          </span>
        </div>

        {/* Simulated PWA Status Alert Band */}
        {isOfflineMode && (
          <div className="bg-amber-600 text-white text-[11px] font-sans px-4 py-1.5 flex items-center justify-center gap-1.5 select-none font-bold">
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>PWA Local cache active. Full offline testing enabled.</span>
          </div>
        )}

        {/* Main Content Area (Scrollable Sandbox Container) */}
        <main className="flex-grow overflow-y-auto p-4 md:p-5 custom-scrollbar pb-24 space-y-5 bg-[#F4F1EA]">
          
          <AnimatePresence mode="wait">
            {/* TAB 1: CENTRALIZED ECO-TOURISM MARKETPLACE */}
            {activeTab === 'market' && (
              <motion.div
                key="market-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {/* Hero Banner Section */}
                <div className="bg-white border-2 border-[#0A4D4F] rounded-2xl overflow-hidden p-5 relative shadow-xs">
                  {/* Background Ornament Grid */}
                  <div className="absolute right-0 bottom-0 w-20 h-20 dot-matrix pointer-events-none" />
                  
                  <div className="relative z-10 space-y-1.5 max-w-[240px]">
                    <span className="inline-flex items-center gap-1 bg-[#A9DFBF] text-[#0A4D4F] text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm font-bold border border-[#0A4D4F]/10">
                      <Leaf className="w-2.5 h-2.5" />
                      Preserve Shorelines
                    </span>
                    <h2 className="font-display font-bold text-lg text-[#0A4D4F] leading-tight-none">
                      Support Local Micro-Vendors
                    </h2>
                    <p className="text-[11px] text-[#0A4D4F]/80 leading-relaxed font-sans">
                      100% of purchase fees funnel directly to rural boat guides, women cooperatives, and wildlife rescue officers.
                    </p>
                  </div>
                </div>

                {/* Categories Scroll Track */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 select-none custom-scrollbar">
                  {(['all', 'wetlands', 'islands', 'culture'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setMarketFilter(cat)}
                      className={`px-3.5 py-1.5 rounded-lg border font-sans text-xs font-bold shrink-0 transition-colors cursor-pointer outline-hidden ${
                        marketFilter === cat
                          ? 'bg-[#0A4D4F] text-[#FAF8F5] border-[#0A4D4F]'
                          : 'bg-[#FAF8F5] text-[#0A4D4F]/80 border-[#0A4D4F]/15 hover:border-[#0A4D4F]/30'
                      }`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Experiences Loop */}
                <div className="grid grid-cols-1 gap-4">
                  {filteredExperiences.map((trip) => {
                    const alreadyBooked = tickets.some(t => t.experienceId === trip.id);
                    return (
                      <ExperienceCard
                        key={trip.id}
                        item={trip}
                        onBook={openBookingWizard}
                        isBooked={alreadyBooked}
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* TAB 2: AI SMART ITINERARY PLANNER ROUTE */}
            {activeTab === 'planner' && (
              <motion.div
                key="planner-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {/* Planner Configuration Form Card */}
                <div className="bg-white border-2 border-[#0A4D4F] rounded-2xl p-5 shadow-xs relative">
                  <div className="absolute top-3 right-3 text-[#A9DFBF] opacity-50">
                    <Sparkles className="w-5 h-5 fill-current" />
                  </div>

                  <div className="space-y-1 pb-4 border-b border-[#0A4D4F]/10">
                    <h2 className="font-display font-extrabold text-base text-[#0A4D4F]">AI Smart Itinerary Planner</h2>
                    <p className="text-[11px] text-[#0A4D4F]/75 font-sans leading-relaxed">
                      Powered by server-side Gemini AI. Design custom, low-carbon certified pathways through rural Terengganu.
                    </p>
                  </div>

                  <form className="mt-4 space-y-4 font-sans text-[#0A4D4F]">
                    {/* Duration Select */}
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider block">Duration of Visit</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((d) => (
                          <button
                            type="button"
                            key={d}
                            id={`days-btn-${d}`}
                            onClick={() => setPlanDays(d)}
                            className={`py-2 rounded-xl border-2 font-display text-xs font-extrabold cursor-pointer transition-colors ${
                              planDays === d
                                ? 'bg-[#0A4D4F] text-[#FAF8F5] border-[#0A4D4F]'
                                : 'bg-white border-[#0A4D4F]/15 hover:border-[#0A4D4F]/30'
                            }`}
                          >
                            {d} {d === 1 ? 'Day' : 'Days'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Interest Preferences */}
                    <div className="space-y-1">
                      <label htmlFor="pref-select" className="text-xs font-mono font-bold uppercase tracking-wider block">Travel Direction</label>
                      <select
                        id="pref-select"
                        value={planPref}
                        onChange={(e) => setPlanPref(e.target.value)}
                        className="w-full bg-white border-2 border-[#0A4D4F]/20 rounded-xl p-2.5 text-xs font-sans font-medium outline-hidden focus:border-[#0A4D4F]"
                      >
                        <option value="Wetlands Conservation & Crafts">Coastal Wetlands & Traditional Crafts</option>
                        <option value="Marine Sanctuaries & Coral Restoration">Conservationist Island Diving & Reefs</option>
                        <option value="Rural Malay Heritage & Traditional Foodways">Rural Kampungs & Heritage Foodways</option>
                        <option value="Tropical Rainforests & Wild Lake Trekking">Kenyir Rainforest Walks & Herbal Gardens</option>
                      </select>
                    </div>

                    {/* Ecological Intensity Selection */}
                    <div className="space-y-10.5">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider block mb-1">Ecological Intensity</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          'Light Eco (Comfort)',
                          'Immersive Eco (Conservationist)'
                        ].map((level) => (
                          <button
                            type="button"
                            key={level}
                            id={`intensity-${level.replace(/\s+/g, '-')}`}
                            onClick={() => setEcoIntensity(level)}
                            className={`px-3 py-2.5 rounded-xl border-2 font-sans text-[11px] font-bold cursor-pointer transition-colors leading-tight ${
                              ecoIntensity === level
                                ? 'bg-[#0A4D4F] text-[#FAF8F5] border-[#0A4D4F]'
                                : 'bg-white border-[#0A4D4F]/15 hover:border-[#0A4D4F]/30'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom demandes */}
                    <div className="space-y-1">
                      <label htmlFor="demands" className="text-xs font-mono font-bold uppercase tracking-wider block">Traveler Adjustments (Optional)</label>
                      <textarea
                        id="demands"
                        value={customDemand}
                        onChange={(e) => setCustomDemand(e.target.value)}
                        placeholder="e.g. Vegetarian diet, allergic to seafood, prefer homestays, traveling with senior parents..."
                        rows={2}
                        className="w-full bg-white border-2 border-[#0A4D4F]/20 rounded-xl p-2.5 text-xs font-sans outline-hidden focus:border-[#0A4D4F] resize-none"
                      />
                    </div>

                    {/* Submit Planner */}
                    <button
                      type="button"
                      id="plan-submit-btn"
                      onClick={handleGenerateAIItinerary}
                      disabled={itineraryIsLoading}
                      className="w-full bg-[#0A4D4F] hover:bg-[#126366] text-[#FAF8F5] py-3 rounded-xl font-display font-extrabold text-sm border-2 border-[#0A4D4F] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                      {itineraryIsLoading ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin text-[#A9DFBF]" />
                          <span>Generating certified trip...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#A9DFBF]" />
                          <span>Generate Certified Plan</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Display Computed Itinerary */}
                {itineraryIsLoading && (
                  <div className="bg-white border-2 border-[#0A4D4F]/10 rounded-2xl p-6 text-center space-y-3 shadow-xs">
                    <div className="w-12 h-12 rounded-full border-4 border-[#0A4D4F]/20 border-t-[#0A4D4F] animate-spin mx-auto" />
                    <div>
                      <p className="font-display font-bold text-sm text-[#0A4D4F]">Consulting BestGanu AI Guards...</p>
                      <p className="text-[11px] text-[#0A4D4F]/70 font-sans max-w-xs mx-auto mt-1 leading-relaxed">
                        Compiling historical wetlands path files, low-carbon transport logs, and certified local guides.
                      </p>
                    </div>
                  </div>
                )}

                {generatedItinerary && !itineraryIsLoading && (
                  <ItineraryResult data={generatedItinerary} />
                )}
              </motion.div>
            )}

            {/* TAB 3: OFFLINE-CAPABLE RESERVATION PASSES */}
            {activeTab === 'tickets' && (
              <motion.div
                key="tickets-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center bg-white p-3 border-2 border-[#0A4D4F]/10 rounded-2xl">
                  <span className="text-xs font-mono font-bold text-[#0A4D4F]/70 uppercase tracking-wide">
                    CO₂ OFFSET CERTIFICATES
                  </span>
                  
                  <span className="bg-[#0A4D4F] text-[#FAF8F5] border border-[#0A4D4F] text-[10px] font-mono px-2.5 py-1 rounded-full font-bold">
                    ACTIVE: {tickets.length}
                  </span>
                </div>

                <TicketView 
                  tickets={tickets} 
                  onCancel={handleCancelBooking} 
                  isOfflineMode={isOfflineMode} 
                />

                {/* Supabase Account Sync Panel */}
                <div className="bg-[#E6F4F1] border-2 border-[#0A4D4F] rounded-2xl p-4.5 space-y-3.5 relative overflow-hidden shadow-xs">
                  <div className="absolute right-0 bottom-0 w-16 h-16 dot-matrix pointer-events-none opacity-40" />
                  
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 bg-[#0A4D4F] text-[#FAF8F5] text-[9px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded-sm font-bold">
                      Supabase Cloud Sync
                    </span>
                    <h4 className="font-display font-extrabold text-[#0A4D4F] text-sm leading-snug">
                      Traveler Ecological Registry
                    </h4>
                    <p className="text-[10.5px] text-[#0A4D4F]/85 leading-relaxed font-sans">
                      Connect your accounts to Supabase PostgreSQL cloud database to preserve your ecosystem saving certificates.
                    </p>
                  </div>

                  {!syncDone ? (
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!userEmail) return;
                        setIsSyncingProfile(true);
                        setProfileSyncStatus("Establishing handshake with Supabase database...");
                        try {
                          const totalCarbon = tickets.reduce((acc, t) => acc + (t.ecoImpactPoints || 0), 0);
                          const response = await fetch("/api/accounts", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              email: userEmail,
                              full_name: userFullName || "Eco Companion",
                              carbon_saved_kg: totalCarbon
                            })
                          });
                          const responseData = await response.json();
                          setIsSyncingProfile(false);
                          if (responseData.success) {
                            setSyncDone(true);
                            setProfileSyncStatus("Data successfully registered and locked in Supabase account table!");
                            localStorage.setItem('bestganu_user_email', userEmail);
                            localStorage.setItem('bestganu_user_name', userFullName || "Eco Companion");
                          } else {
                            throw new Error(responseData.error || "Establishment failure");
                          }
                        } catch (err: any) {
                          setIsSyncingProfile(false);
                          setProfileSyncStatus(`Sync delayed: ${err.message || "Endpoint unconfigured"}. Profiles will reside on secure client sandbox.`);
                        }
                      }}
                      className="space-y-3.5 pt-1 text-[#0A4D4F]"
                    >
                      <div className="space-y-1">
                        <label htmlFor="user-email-input" className="text-[10px] font-mono font-bold uppercase tracking-wider block">Traveler Email Address *</label>
                        <input
                          id="user-email-input"
                          type="email"
                          required
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          placeholder="e.g. Aimanppe8@gmail.com"
                          className="w-full bg-white border-2 border-[#0A4D4F]/20 rounded-xl p-2 text-xs font-sans font-medium outline-hidden focus:border-[#0A4D4F]"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label htmlFor="user-name-input" className="text-[10px] font-mono font-bold uppercase tracking-wider block">Full Name</label>
                        <input
                          id="user-name-input"
                          type="text"
                          value={userFullName}
                          onChange={(e) => setUserFullName(e.target.value)}
                          placeholder="e.g. Aiman"
                          className="w-full bg-white border-2 border-[#0A4D4F]/20 rounded-xl p-2 text-xs font-sans font-medium outline-hidden focus:border-[#0A4D4F]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSyncingProfile}
                        className="w-full bg-[#0A4D4F] text-[#FAF8F5] border border-[#0A4D4F] py-2 px-3 rounded-xl font-display text-xs font-bold transition-all hover:bg-opacity-95 active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {isSyncingProfile ? "Processing Database Registry..." : "Link Traveler Supabase Account"}
                      </button>

                      {profileSyncStatus && (
                        <p className="text-[10px] font-mono font-medium text-amber-900 border border-amber-900/15 bg-amber-50 rounded-lg p-2 leading-relaxed">
                          {profileSyncStatus}
                        </p>
                      )}
                    </form>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-900/15 rounded-xl p-3.5 space-y-2 text-[#0A4D4F]">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                        <span>Live Cloud Database Handshake Complete</span>
                      </div>
                      <div className="text-[11px] font-sans space-y-1">
                        <p><strong>Registry Email:</strong> {userEmail}</p>
                        <p><strong>Registry Name:</strong> {userFullName || 'Eco Companion'}</p>
                        <p><strong>Total Carbon Preserved:</strong> {tickets.reduce((acc, t) => acc + (t.ecoImpactPoints || 0), 0)} kg</p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setSyncDone(false);
                          setProfileSyncStatus('');
                          localStorage.removeItem('bestganu_user_email');
                          localStorage.removeItem('bestganu_user_name');
                        }}
                        className="text-[10px] font-mono font-bold underline cursor-pointer text-emerald-800 hover:text-emerald-990 pt-1"
                      >
                         Change synchronized profile credentials
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 4: LOCAL MICRO-VENDORS DIRECTORY */}
            {activeTab === 'vendors' && (
              <motion.div
                key="vendors-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="space-y-1 pb-2">
                  <h3 className="font-display font-extrabold text-base text-[#0A4D4F]">Local Micro-Enterprise Directory</h3>
                  <p className="text-xs text-[#0A4D4F]/75 font-sans leading-relaxed">
                    By-pass major travel agencies! Contact native specialists, family weavers, and home kitchens directly to book services.
                  </p>
                </div>

                {/* Micro Vendors Loop */}
                <div className="space-y-3.5">
                  {MICRO_VENDORS.map((v) => (
                    <div 
                      key={v.id} 
                      className="bg-white border-2 border-[#0A4D4F] rounded-2xl p-4.5 space-y-3 shadow-xs relative"
                    >
                      {/* Grid Ornament */}
                      <div className="absolute right-0 bottom-0 w-12 h-12 dot-matrix pointer-events-none rounded-br-2xl" />

                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <span className="text-[9px] font-mono text-[#0A4D4F]/50 font-bold uppercase tracking-wider block bg-emerald-50 border border-emerald-800/10 px-1.5 py-0.5 rounded-sm w-max mb-1">
                            {v.service}
                          </span>
                          <h4 className="font-display font-bold text-sm text-[#0A4D4F] leading-snug">
                            {v.name}
                          </h4>
                          <span className="text-[11px] text-[#0A4D4F]/65 font-sans flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-0.5" />
                            {v.location}
                          </span>
                        </div>

                        {/* Price Indicator */}
                        <div className="bg-[#F4F1EA] px-2.5 py-1 rounded-lg border border-[#0A4D4F]/10 text-right shrink-0">
                          <span className="text-[10px] text-[#0A4D4F]/60 block font-mono">EST COST</span>
                          <span className="text-xs font-display font-bold text-[#0A4D4F]">{v.priceText}</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#0A4D4F]/80 leading-relaxed font-sans pr-4">
                        {v.snippet}
                      </p>

                      {/* Contact trigger mimicking native WhatsApp dialer */}
                      <div className="border-t border-[#0A4D4F]/10 pt-3 flex justify-between items-center">
                        <span className="text-[10px] text-[#0A4D4F]/60 font-mono">DIRECT CHANNEL:</span>
                        <a 
                          href={`tel:${v.contact.replace(/\s+/g, '')}`}
                          className="inline-flex items-center gap-1.5 bg-[#E6F4F1] hover:bg-[#0A4D4F]/10 text-[#0A4D4F] border border-[#0A4D4F]/30 px-3 py-1.5 rounded-xl font-display text-xs font-bold transition-all outline-hidden active:scale-95"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Call: {v.contact.split(' ')[1]}</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>

        {/* BOOKING FLOW WIZARD MODAL DIALOG */}
        <AnimatePresence>
          {showBookingDialog && selectedExperience && (
            <div className="absolute inset-0 bg-[#0A4D4F]/60 backdrop-blur-xs flex items-end justify-center z-50 p-4">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="bg-[#FAF8F5] border-t-4 border-[#A9DFBF] rounded-t-3xl w-full p-5 max-w-sm flex flex-col space-y-4 border-2 border-[#0A4D4F] relative"
              >
                <div className="absolute right-4 top-4">
                  <button 
                    onClick={() => {
                      setShowBookingDialog(false);
                      setSelectedExperience(null);
                    }}
                    className="p-1.5 rounded-full hover:bg-slate-200 transition-colors text-[#0A4D4F]"
                  >
                    ✕
                  </button>
                </div>

                {/* Model Header */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold tracking-widest text-[#0A4D4F]/60 uppercase block">Ticket Generation Registry</span>
                  <h3 className="font-display font-extrabold text-sm text-[#0A4D4F] pr-6 leading-tight">
                    {selectedExperience.name}
                  </h3>
                </div>

                <form onSubmit={handleConfirmBooking} className="space-y-3 font-sans text-xs text-[#0A4D4F]">
                  {/* Lead Guest Field */}
                  <div className="space-y-1">
                    <label htmlFor="guest-name" className="font-mono font-bold uppercase tracking-wider block text-[10px]">Lead Traveller Name</label>
                    <input
                      id="guest-name"
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-white border-2 border-[#0A4D4F]/20 rounded-xl p-2.5 outline-hidden focus:border-[#0A4D4F] text-xs font-sans font-semibold"
                    />
                  </div>

                  {/* Date & Guests config row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="visit-date" className="font-mono font-bold uppercase tracking-wider block text-[10px]">Reservation Date</label>
                      <input
                        id="visit-date"
                        type="date"
                        required
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="w-full bg-white border-2 border-[#0A4D4F]/20 rounded-xl p-2 font-sans text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="visitor-count" className="font-mono font-bold uppercase tracking-wider block text-[10px]">Traveller Headcount</label>
                      <div className="flex border-2 border-[#0A4D4F]/20 rounded-xl overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                          className="px-2.5 py-1.5 font-bold hover:bg-slate-100 transition-colors text-sm text-[#0A4D4F] shrink-0 outline-hidden"
                        >
                          -
                        </button>
                        <span id="visitor-count" className="flex-grow text-center flex items-center justify-center font-display font-bold text-xs text-[#0A4D4F]">
                          {guestCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
                          className="px-2.5 py-1.5 font-bold hover:bg-slate-100 transition-colors text-sm text-[#0A4D4F] shrink-0 outline-hidden"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ecological Footprint Estimation info */}
                  <div className="bg-[#A9DFBF]/15 border border-[#A9DFBF]/80 p-3 rounded-xl space-y-1 text-[#0A4D4F]">
                    <div className="flex items-center gap-1.5 font-display font-bold text-[11px] text-[#0A4D4F]">
                      <Leaf className="w-3.5 h-3.5" />
                      <span>Local Economic Impact:</span>
                    </div>
                    <p className="text-[10px] leading-relaxed">
                      Booking this item instantly directs <strong className="font-bold">RM {selectedExperience.price * guestCount}</strong> to indigenous guides and conservation officers.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      id="confirm-booking-btn"
                      className="w-full bg-[#0A4D4F] hover:bg-[#126366] text-[#FAF8F5] py-2.5 rounded-xl font-display font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Issue Certified QR Card
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* NATIVE-LIKE FLOATING BOTTOM PWA NAVIGATION BAR */}
        <nav className="absolute bottom-0 left-0 right-0 bg-[#FAF8F5]/95 backdrop-blur-md border-t-2 border-[#0A4D4F] px-3.5 py-2 flex justify-between items-center z-40 select-none shadow-[0_-5px_20px_rgba(10,77,20,0.06)]">
          {[
            { id: 'market', label: 'Explore', icon: Compass },
            { id: 'planner', label: 'Planner', icon: Sparkles },
            { id: 'tickets', label: 'My Tickets', icon: QrCode, badge: tickets.length },
            { id: 'vendors', label: 'Micro Biz', icon: Briefcase }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if ('vibrate' in navigator) navigator.vibrate(20);
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all relative shrink-0 cursor-pointer outline-hidden ${
                  isSelected ? 'text-[#0A4D4F] font-bold scale-102' : 'text-[#0A4D4F]/50 hover:text-[#0A4D4F]/85'
                }`}
              >
                {/* Bubble Counter Badge for Active tickets */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute top-1.5 right-1 bg-emerald-700 text-[#FAF8F5] text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded-full border border-white leading-none shrink-0 shadow-sm">
                    {tab.badge}
                  </span>
                )}

                <div className={`p-1 rounded-sm transition-colors ${
                  isSelected ? 'bg-[#A9DFBF] text-[#0A4D4F] font-extrabold' : ''
                }`}>
                  <Icon className="w-5 h-5 transition-transform group-active:scale-95" />
                </div>
                
                <span className="text-[9px] font-sans tracking-wide mt-1 uppercase font-semibold">
                  {tab.label}
                </span>

                {/* Custom dot highlight */}
                {isSelected && (
                  <motion.div 
                    layoutId="active-dot" 
                    className="w-1 h-1 rounded-full bg-[#0A4D4F] absolute -bottom-0.5" 
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
