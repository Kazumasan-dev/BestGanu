import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Default backend experiences reference to ensure graceful offline-first fallbacks
const ECO_EXPERIENCES_BACKEND = [
  {
    id: 'exp1',
    name: 'Setiu Wetlands Boardwalk & Mangrove Replanting',
    category: 'wetlands',
    location: 'Setiu, Terengganu',
    description: 'Walk through pristine estuary forests, identify unique flora (Nypa, Rhizophora), and actively participate in replanting mangrove saplings. Led by state-certified heritage eco-naturalists who safeguard local sea shell nurseries.',
    price: 45,
    rating: 4.9,
    reviews: 148,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600',
    ecoBadges: ['Zero Plastic', 'Mangrove Replant Match', 'Local Guide Certified', 'Low Carbon Journey'],
    vendorName: 'Yusuf bin Ibrahim (Persatuan Sahabat Setiu)',
    vendorContact: '+60 13-921 4451'
  },
  {
    id: 'exp2',
    name: 'Chagar Hutang Sea Turtle Sanctuary Match',
    category: 'islands',
    location: 'Redang Island, Terengganu',
    description: 'A non-disruptive, educational visit to the island’s primary nesting ground. Watch conservation researchers audit nests, learn the safe crawl patterns of Green and Hawksbill turtles, and directly support turtle tag and release programs.',
    price: 150,
    rating: 4.85,
    reviews: 94,
    image: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&q=80&w=600',
    ecoBadges: ['Turtle Conservation Match', 'Limited Guest Capacity', 'Zero Emission Lights'],
    vendorName: 'Dr. Nadia & Redang Marine Park Guard Guild',
    vendorContact: '+60 19-321 8872'
  },
  {
    id: 'exp3',
    name: 'Kampung Mangkuk Traditional Terrapin Feed & Hatchery',
    category: 'wetlands',
    location: 'Kampung Mangkuk, Setiu',
    description: 'Learn the difference between ocean turtles and land-based river terrapins! Support the river terrapin protection project of Setiu. Feed hashlings, measure shells, and explore local coconut orchards.',
    price: 25,
    rating: 4.95,
    reviews: 73,
    image: 'https://images.unsplash.com/photo-1518467166-367dd630d267?auto=format&fit=crop&q=80&w=600',
    ecoBadges: ['Species Preservation Support', 'Community Led-Enterprise', 'Traditional Snack Provided'],
    vendorName: 'Abang Din (Mangkuk Wild Conservationists)',
    vendorContact: '+60 12-985 3012'
  },
  {
    id: 'exp4',
    name: 'Traditional Wooden Boat Preservation Duyong Walk',
    category: 'culture',
    location: 'Duyong Island, Kuala Terengganu',
    description: 'Watch regional master boat builders craft ocean liners and elegant pinas boats out of seasoned tropical hardwood. This heritage process uses no blueprint paper or metal nails; slots are joined using hand-whittled wooden dowels.',
    price: 20,
    rating: 4.78,
    reviews: 62,
    image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&q=80&w=600',
    ecoBadges: ['Endangered Heritage Guild', 'Family-Owned Museum', 'Walk-Only Itinerary'],
    vendorName: 'Pakcik Haji Rani (Heritage Boat Workshop)',
    vendorContact: '+60 17-911 3491'
  },
  {
    id: 'exp5',
    name: 'Batik Co-op Beeswax Stencil & Organic Dyeing',
    category: 'culture',
    location: 'Kuala Ibai, Kuala Terengganu',
    description: 'Create your own Terengganu batik motif on organic bamboo fabric. Learn beeswax wax-resist chanting, prepare natural dyes boiled from local mangosteen skins and sea almonds, and support rural women batik cooperative guilds.',
    price: 35,
    rating: 4.92,
    reviews: 110,
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=600',
    ecoBadges: ['Biodegradable Organic Dyes', 'Women Empowerment Co-op', 'Slow-Fashion advocate'],
    vendorName: 'Puan Halimah (Kuala Ibai Batik Sisterhood)',
    vendorContact: '+60 14-884 0021'
  },
  {
    id: 'exp6',
    name: 'Kapas Island Snorkeling & Coral Planting',
    category: 'islands',
    location: 'Kapas Island, Marang',
    description: 'Take a short, low-energy craft ride to Kapas Island. Work alongside volunteer marine biologists to place healthy coral polyps on conservation reef grids, assisting Kapas Reef Guard recover bleached local coral walls.',
    price: 95,
    rating: 4.88,
    reviews: 125,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
    ecoBadges: ['Reef Restoration Practice', 'No Anchorage Certified', 'Marine Micro-Donations included'],
    vendorName: 'Captain Harun (Ocean Rangers Marine Service)',
    vendorContact: '+60 11-125 4310'
  }
];

let supabaseClientCache: any = null;

// Lazy initialization of Supabase client to prevent application crashes when unconfigured
function getSupabaseClient() {
  if (supabaseClientCache) return supabaseClientCache;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || url.includes("YOUR_PROJECT_REF") || !key || key.includes("YOUR_SUPABASE")) {
    return null;
  }

  try {
    supabaseClientCache = createClient(url, key);
    return supabaseClientCache;
  } catch (error) {
    console.warn("Could not instantiate Supabase Client. Local cache mode enabled.", error);
    return null;
  }
}

async function startServer() {
  const app = reportAppInfo(express());
  const PORT = 3000;

  function reportAppInfo(expressApp: express.Express) {
    return expressApp;
  }

  // Middleware
  app.use(express.json());

  // Supabase Verification Endpoint
  app.get("/api/supabase-status", (req, res) => {
    const supabase = getSupabaseClient();
    res.json({
      configured: supabase !== null,
      message: supabase 
        ? "Connected to Live Supabase Service Cloud Database." 
        : "Supabase unconfigured, currently running in PWA secure local sandbox cache mode."
    });
  });

  // API Route: GET all eco-tourism experiences (assets)
  app.get("/api/experiences", async (req, res) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.json({ source: "local_pwa_cache", data: ECO_EXPERIENCES_BACKEND });
    }
    try {
      const { data, error } = await supabase.from("assets").select("*").order("name");
      if (error) throw error;

      const formatted = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        location: item.location,
        description: item.description,
        price: parseFloat(item.price),
        rating: parseFloat(item.rating || 5.0),
        reviews: parseInt(item.reviews || 0),
        image: item.image,
        ecoBadges: item.eco_badges || [],
        vendorName: item.vendor_name,
        vendorContact: item.vendor_contact
      }));

      res.json({ source: "supabase", data: formatted });
    } catch (err: any) {
      console.warn("Supabase error fetching experiences, falling back:", err.message);
      res.json({ source: "local_cache_fallback", data: ECO_EXPERIENCES_BACKEND });
    }
  });

  // API Route: Sync accounts (user accounts / credits registry)
  app.post("/api/accounts", async (req, res) => {
    const { email, full_name, carbon_saved_kg } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required to sync account profile." });
    }
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.json({ success: true, localOnly: true, message: "Profile saved to local state securely." });
    }
    try {
      // Upsert profile data
      const { data, error } = await supabase.from("accounts").upsert({
        email,
        full_name,
        carbon_saved_kg: carbon_saved_kg || 0
      }, { onConflict: "email" }).select();

      if (error) throw error;
      res.json({ success: true, localOnly: false, profile: data[0] });
    } catch (err: any) {
      console.error("Supabase user account sync failed:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: GET active reservation tickets (bookings)
  app.get("/api/bookings", async (req, res) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.json({ source: "local_storage", data: [] });
    }
    try {
      const { data, error } = await supabase.from("bookings").select("*, assets(*)").order("created_at", { ascending: false });
      if (error) throw error;

      const formatted = data.map((item: any) => ({
        id: item.id,
        experienceId: item.experience_id,
        experienceName: item.assets ? item.assets.name : "Terengganu Eco Tour",
        bookingDate: item.booking_date,
        bookedBy: item.booked_by,
        status: "active",
        price: parseFloat(item.price),
        guestCount: parseInt(item.guest_count),
        qrCodeData: item.qr_code_data,
        ecoImpactPoints: parseInt(item.eco_impact_points)
      }));

      res.json({ source: "supabase", data: formatted });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: POST a fresh dynamic offline-certified ticket (booking)
  app.post("/api/bookings", async (req, res) => {
    const { id, experienceId, bookedBy, bookingDate, guestCount, price, qrCodeData, ecoImpactPoints } = req.body;
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.json({ success: true, savedOffline: true, message: "Credential unconfigured. PWA offline ticket generated successfully." });
    }
    try {
      const { error } = await supabase.from("bookings").insert({
        id,
        experience_id: experienceId,
        booked_by: bookedBy,
        booking_date: bookingDate,
        guest_count: guestCount,
        price,
        qr_code_data: qrCodeData,
        eco_impact_points: ecoImpactPoints
      });
      if (error) throw error;
      res.json({ success: true, savedOffline: false });
    } catch (err: any) {
      console.error("Supabase saving booking failed:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: Cancel/Delete a reservation booking
  app.delete("/api/bookings/:id", async (req, res) => {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.json({ success: true, message: "Removed local target ticket successfully." });
    }
    try {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // API Route: AI Smart Itinerary Planner for Terengganu Eco Tourism
  app.post("/api/generate-itinerary", async (req, res) => {
    try {
      const { duration, preferences, ecoIntensity, customDemands } = req.body;

      if (!duration || !preferences || !ecoIntensity) {
        return res.status(400).json({
          error: "Missing parameters. Required: duration, preferences, ecoIntensity",
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      // Lazy initialization of Gemini client
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        console.warn("GEMINI_API_KEY is not defined or is placeholder. Falling back to dynamic mock itinerary.");
        return res.json(getMockItinerary(duration, preferences, ecoIntensity, customDemands));
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Generate a fully optimized, realistic, and highly engaging local Terengganu eco-tourism travel itinerary for ${duration} days.
The traveler prefers: ${preferences}.
The eco intensity levels of their travel: ${ecoIntensity}.
Custom traveler preferences or requests (if any): "${customDemands || "none"}".

Ensure the places mentioned are real destinations in Terengganu, Malaysia, including but not limited to: Kuala Terengganu (Pasar Payang, Kampung Mangkuk, Masjid Kristal), Setiu Wetlands (mangrove tours, traditional boat-making, local clam harvesting), Tasik Kenyir (nature reserve, herbal gardens, elephant conservation center), or islands under marine-park conservation (Redang, Perhentian, Lang Tengah, Kapas) for eco-diving/snorkeling and turtle sanctuary protection programs.

Your output must explain precise activities for each day, focusing on supporting local micro-vendors, lowering carbon footprints, and preserving local wildlife (specifically sea turtles and mangrove swamps).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are an expert eco-tourism guide and travel specialist based in Kuala Terengganu, Malaysia, representing the "BestGanu" platform.
Your goal is to promote standard eco-tourism practices in Terengganu code-named 'BestGanu'.
For every single day's plan, ensure activities:
1. Promote zero-carbon or low-carbon footprints (e.g., cycling, traditional rowing, walking).
2. Directly benefit local micro-vendors or native communities (e.g., purchasing traditional Keropok Lekor from family enterprises, homestays, or local naturalists in Setiu Wetlands).
3. Do not cause distress to wildlife. Include a dedicated 'ecoImpact' explanation for each activity.
4. Output strict JSON format adhering to the response schema.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              itinerary: {
                type: Type.ARRAY,
                description: "Array of days covering the itinerary",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: {
                      type: Type.INTEGER,
                      description: "The day number, starting at 1",
                    },
                    theme: {
                      type: Type.STRING,
                      description: "The theme or main focus of the day",
                    },
                    activities: {
                      type: Type.ARRAY,
                      description: "List of custom eco-friendly activities of the day",
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          time: {
                            type: Type.STRING,
                            description: "Specific time placeholder, e.g. '08:00 AM' or '02:30 PM'",
                          },
                          title: {
                            type: Type.STRING,
                            description: "Exquisite title of the eco-tourism activity",
                          },
                          description: {
                            type: Type.STRING,
                            description: "Detailed description representing cultural immersion, outdoor beauty, or eco tours in Terengganu",
                          },
                          ecoImpact: {
                            type: Type.STRING,
                            description: "Factual explanation of how this activity helps local micro-vendors, reduces waste, or protects local ecology",
                          },
                          location: {
                            type: Type.STRING,
                            description: "Name of the place inside Terengganu, Malaysia",
                          },
                        },
                        required: ["time", "title", "description", "ecoImpact", "location"],
                      },
                    },
                  },
                  required: ["day", "theme", "activities"],
                },
              },
              tips: {
                type: Type.ARRAY,
                description: "List of 3 local eco-travel tips tailored to Terengganu heritage (e.g. speaking simple Malay terms, conservative dressing in villages, plastic reduction)",
                items: {
                  type: Type.STRING,
                },
              },
              carbonSavedKg: {
                type: Type.INTEGER,
                description: "Estimated total carbon saved (in kg) compared to conventional commercial travel package",
              },
            },
            required: ["itinerary", "tips", "carbonSavedKg"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response string from Gemini model");
      }

      // Parse and return content
      const parsedData = JSON.parse(responseText.trim());
      res.json(parsedData);

    } catch (error: any) {
      console.error("Error generating AI Itinerary:", error);
      res.status(500).json({
        error: "Failed to generate itinerary. This may be due to missing configuration or service limit. Standard travel itinerary has been provided below.",
        details: error.message,
        fallback: getMockItinerary(req.body.duration || 3, req.body.preferences || "Nature & Conservation", req.body.ecoIntensity || "Light Eco", req.body.customDemands),
      });
    }
  });

  // Serve static folders or Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BestGanu Server up and running on http://localhost:${PORT}`);
  });
}

// Highly detailed mock itinerary fallback helper
function getMockItinerary(duration: number, preferences: string, ecoIntensity: string, customDemands?: string) {
  const days = Math.min(Math.max(duration || 1, 1), 4);
  const sampleActivities = [
    {
      time: "08:30 AM",
      title: "Mangrove Replanting Experience",
      description: "Step into the Setiu Wetlands with local naturalist Encik Yusuf to learn about mangrove saplings and contribute by replanting a tree yourself.",
      ecoImpact: "Restores crucial coastal buffers and rewards expert wetland environmental guides.",
      location: "Setiu Wetlands, Terengganu"
    },
    {
      time: "11:30 AM",
      title: "Traditional Terengganu Cooking & Nasi Dagang",
      description: "Join Kak Som's wood-fired family kitchen to watch how red husked brown rice is steamed twice over local wood charcoal, making traditional local Nasi Dagang.",
      ecoImpact: "100% of payment goes directly to a local home-based grandmama, bypassing massive travel agencies.",
      location: "Kampung Penarik, Besut"
    },
    {
      time: "02:30 PM",
      title: "Wooden Boat-Building Showcase",
      description: "Visit traditional master boat builders on Duyong Island. Watch craftsmen shape hulls by hand without any metal nails, utilizing centuries-old techniques.",
      ecoImpact: "Preserves rare Southeast Asian indigenous sea crafts and funds traditional handiwork lineages.",
      location: "Duyong Island, Kuala Terengganu"
    },
    {
      time: "08:00 PM",
      title: "Kapas Island Reef Conservation Night Walk",
      description: "Participate in a minimally disruptive beach night-watch with KAPAS Reef conservationists, mapping turtle nesting tracks with bio-friendly red headlights.",
      ecoImpact: "Prevents light pollution affecting sea-turtle hatchlings navigating into ocean breaks.",
      location: "Kapas Island Conservation Center"
    },
    {
      time: "09:00 AM",
      title: "Sekayu Elephant Sanctuary & River Trekking",
      description: "Hike along the low-erosion pathways of Sekayu. Help volunteer keepers record behavioral observations of rescued elephants at the local reserve.",
      ecoImpact: "Supports wildlife rescue services and feeds high-calorie natural fiber foliage to rehabilitated fauna.",
      location: "Sekayu Forest Reserve"
    },
    {
      time: "03:00 PM",
      title: "Pasar Payang Heritage Tour & Batik Stencil Workshop",
      description: "Engage in hand-stamping Terengganu batik on organic cotton using beeswax at a tiny cooperative inside Kuala Terengganu.",
      ecoImpact: "Promotes local biodegradable natural dyes and maintains the cottage Batik handloom weaver craft guild.",
      location: "Pasar Payang, Kuala Terengganu"
    }
  ];

  const itineraryDays = [];
  for (let i = 1; i <= days; i++) {
    // Stagger activities
    const act1Index = ((i - 1) * 2) % sampleActivities.length;
    const act2Index = ((i - 1) * 2 + 1) % sampleActivities.length;
    
    itineraryDays.push({
      day: i,
      theme: i === 1 
        ? `Coastal Wet-Wetlands & Cultural Heritage (Ref: ${preferences})` 
        : i === 2 
        ? `Inland Conservation and Rural Handlooms (${ecoIntensity})`
        : i === 3
        ? "Island Marine Life Sanctuary & Eco Trails"
        : "Tasik Kenyir Herbal Reserves & Bamboo Forest Walk",
      activities: [
        sampleActivities[act1Index],
        sampleActivities[act2Index]
      ]
    });
  }

  return {
    itinerary: itineraryDays,
    tips: [
      "Always wear non-toxic reef-safe sunscreen (Zinc-Oxide) before diving or snorkeling in Kapas and Redang marine reserves.",
      "Bring reusable food boxes and drinking bottles; single-use plastic takeaway packings are actively discouraged across coastal wetlands.",
      "Dress conservative when entering kampung homestays – cover shoulders and knees out of respect for local community customs."
    ],
    carbonSavedKg: days * 12 + (ecoIntensity.toLowerCase().includes("immersive") ? 18 : 8)
  };
}

startServer();
