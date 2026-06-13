import React, { useState } from 'react';
import { AIItineraryResponse } from '../types';
import { Leaf, Navigation, Compass, Calendar, Check, Award, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ItineraryResultProps {
  data: AIItineraryResponse;
}

export function ItineraryResult({ data }: ItineraryResultProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1);

  if (!data || !data.itinerary || data.itinerary.length === 0) {
    return (
      <div className="bg-amber-50 border-2 border-amber-350 p-4 rounded-2xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-display font-semibold text-sm text-amber-900">No Itinerary Data</h4>
          <p className="text-xs text-amber-800">Please choose your dates, interests, and intensity level in the planner above to generate a custom plan!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Carbon Saved Dashboard & Performance Metrics */}
      <div className="bg-gradient-to-br from-[#0A4D4F] to-[#126366] text-white p-5 rounded-2xl border-2 border-[#0A4D4F] relative overflow-hidden shadow-md">
        {/* Decorative Grid Corner */}
        <div className="absolute right-0 top-0 w-24 h-24 dot-matrix-accent rounded-bl-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 bg-[#A9DFBF]/20 border border-[#A9DFBF]/30 px-2.5 py-0.5 rounded-full w-max text-[#A9DFBF] text-[10px] font-mono uppercase tracking-wider font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>Certified Green Trip</span>
            </div>
            <h3 className="font-display font-extrabold text-lg sm:text-xl">Eco Travel Assessment</h3>
            <p className="text-xs text-[#FAF8F5]/80 leading-relaxed font-sans max-w-sm">
              Your optimized transport speeds, low-waste food vendors, and certified nature guides prevent carbon offsets significantly.
            </p>
          </div>

          <div className="bg-[#FAF8F5]/10 border border-[#FAF8F5]/15 p-4 rounded-xl text-center shrink-0 flex items-center gap-3 sm:flex-col sm:gap-1">
            <span className="text-3xl font-display font-extrabold text-[#A9DFBF] tracking-tight block">
              -{data.carbonSavedKg || 12}kg
            </span>
            <span className="text-[10px] sm:text-xs font-mono font-medium text-[#FAF8F5]/90 tracking-wider uppercase block">
              CO₂ Emissions Saved
            </span>
          </div>
        </div>
      </div>

      {/* Day Selector Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
        {data.itinerary.map((dayPlan) => (
          <button
            key={dayPlan.day}
            onClick={() => setSelectedDay(dayPlan.day)}
            className={`px-4 py-2.5 rounded-xl font-display text-xs font-bold shrink-0 transition-all border-2 flex items-center gap-1.5 cursor-pointer outline-none ${
              selectedDay === dayPlan.day
                ? 'bg-[#0A4D4F] text-[#FAF8F5] border-[#0A4D4F] shadow-sm'
                : 'bg-white text-[#0A4D4F] border-[#0A4D4F]/20 hover:border-[#0A4D4F]/40'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Day {dayPlan.day}</span>
          </button>
        ))}
      </div>

      {/* Day Content Area */}
      <AnimatePresence mode="wait">
        {data.itinerary.map((dayPlan) => {
          if (dayPlan.day !== selectedDay) return null;

          return (
            <motion.div
              key={dayPlan.day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="bg-white border-2 border-[#0A4D4F] rounded-2xl p-5 shadow-xs relative"
            >
              {/* Day Theme */}
              <div className="border-b border-[#0A4D4F]/10 pb-4 mb-4">
                <span className="text-[10px] font-mono text-[#0A4D4F]/60 font-bold uppercase tracking-widest block mb-0.5">
                  Day Theme Focus
                </span>
                <h4 className="font-display font-bold text-base text-[#0A4D4F] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-800 shrink-0" />
                  {dayPlan.theme}
                </h4>
              </div>

              {/* Day's Activities Stack */}
              <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-emerald-800/10">
                {dayPlan.activities && dayPlan.activities.map((activity, index) => (
                  <div key={index} className="relative pl-7 group">
                    {/* Time Dot Indicator */}
                    <div className="absolute left-[5px] top-[4px] w-3 h-3 rounded-full bg-[#0A4D4F] border-2 border-white ring-2 ring-[#0A4D4F]/20 group-hover:scale-110 transition-transform" />

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-[#FAF8F5] text-[#0A4D4F] font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#0A4D4F]/15">
                          {activity.time}
                        </span>
                        <span className="flex items-center text-[11px] text-[#0A4D4F]/70 font-sans font-medium">
                          <Navigation className="w-3 h-3 mr-0.5 rotate-45 text-[#0A4D4F]/80" />
                          {activity.location}
                        </span>
                      </div>

                      <h5 className="font-display font-bold text-sm text-[#0A4D4F] leading-snug">
                        {activity.title}
                      </h5>

                      <p className="text-xs text-[#0A4D4F]/85 leading-relaxed font-sans">
                        {activity.description}
                      </p>

                      {/* Carbon/Eco Impact Badge */}
                      <div className="bg-[#A9DFBF]/20 border border-[#A9DFBF]/80 px-3 py-2 rounded-xl text-[11px] text-[#0A4D4F] font-sans font-medium flex items-start gap-1.5 mt-2">
                        <Leaf className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" />
                        <span>
                          <strong className="font-semibold text-emerald-950 font-display">Eco Highlight:</strong> {activity.ecoImpact}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Local Traveling Tips Card */}
      {data.tips && data.tips.length > 0 && (
        <div className="bg-[#FAF8F5] border-2 border-[#0A4D4F]/20 rounded-2xl p-4.5 space-y-3">
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#0A4D4F] flex items-center gap-1.5">
            <Check className="w-4 h-4 text-[#0A4D4F]" />
            BestGanu Travel Guidelines
          </h4>
          <ul className="space-y-2 text-xs text-[#0A4D4F]/90 list-disc list-inside font-sans pl-1">
            {data.tips.map((tip, idx) => (
              <li key={idx} className="leading-relaxed marker:text-emerald-700">
                <span className="pl-0.5">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
