import React from 'react';
import { ExperienceItem } from '../types';
import { Star, Leaf, MapPin, User, ArrowRight } from 'lucide-react';

interface ExperienceCardProps {
  key?: string;
  item: ExperienceItem;
  onBook: (item: ExperienceItem) => void;
  isBooked: boolean;
}

export function ExperienceCard({ item, onBook, isBooked }: ExperienceCardProps) {
  return (
    <div className="bg-white border-2 border-[#0A4D4F] rounded-2xl overflow-hidden hover-scale shadow-sm flex flex-col h-full">
      {/* Card Header & Image */}
      <div className="relative h-44 w-full bg-slate-200 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 right-2 bg-[#F4F1EA] text-[#0A4D4F] font-mono text-xs font-semibold px-2 py-1 rounded-md border border-[#0A4D4F] flex items-center gap-1 shadow-sm">
          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
          <span>{item.rating}</span>
        </div>
        <div className="absolute bottom-2 left-2 bg-[#0A4D4F]/90 backdrop-blur-xs text-white text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full border border-[#A9DFBF]/40">
          {item.category}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          {/* Location & Title */}
          <div className="flex items-center text-xs text-[#0A4D4F]/75 mb-1.5 font-sans font-medium">
            <MapPin className="w-3.5 h-3.5 mr-1 text-[#0A4D4F]" />
            <span>{item.location}</span>
          </div>
          <h3 className="font-display font-bold text-base text-[#0A4D4F] leading-tight mb-2 min-h-[2.5rem] line-clamp-2">
            {item.name}
          </h3>

          {/* Eco-Badges Grid */}
          <div className="flex flex-wrap gap-1 mb-3.5">
            {item.ecoBadges.map((badge, idx) => (
              <span
                key={idx}
                className="bg-[#A9DFBF]/25 text-[#0A4D4F] text-[10px] font-sans font-semibold px-2 py-0.5 rounded-md border border-[#A9DFBF]/80 flex items-center gap-1"
              >
                <Leaf className="w-2.5 h-2.5 text-[#0A4D4F]" />
                {badge}
              </span>
            ))}
          </div>

          <p className="text-xs text-[#0A4D4F]/85 line-clamp-3 mb-4 leading-relaxed font-sans">
            {item.description}
          </p>
        </div>

        <div>
          {/* Vendor Details */}
          <div className="border-t border-[#0A4D4F]/10 pt-3 mb-4 bg-[#F4F1EA]/50 p-2.5 rounded-xl border border-[#0A4D4F]/10">
            <div className="flex items-center gap-2 text-xs text-[#0A4D4F]/90 font-sans">
              <User className="w-3.5 h-3.5 text-[#0A4D4F]/70 shrink-0" />
              <div className="overflow-hidden">
                <p className="font-semibold truncate leading-none mb-0.5">Guide: {item.vendorName.split(' ')[0]}</p>
                <p className="text-[10px] font-mono text-[#0A4D4F]/70 truncate">{item.vendorContact}</p>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-between mt-auto">
            <div className="font-sans">
              <span className="text-[10px] block text-[#0A4D4F]/60 font-mono">SUPPORT LOCAL</span>
              <span className="text-lg font-display font-extrabold text-[#0A4D4F]">RM {item.price}</span>
              <span className="text-[11px] text-[#0A4D4F]/70 font-sans font-medium"> /pax</span>
            </div>

            <button
              id={`book-btn-${item.id}`}
              onClick={() => onBook(item)}
              disabled={isBooked}
              className={`px-3.5 py-2.5 rounded-xl font-display text-xs font-bold flex items-center gap-1.5 transition-all outline-none cursor-pointer ${
                isBooked
                  ? 'bg-amber-100 text-amber-800 border-2 border-amber-800 cursor-not-allowed opacity-90'
                  : 'bg-[#0A4D4F] text-white hover:bg-[#126366] border-2 border-[#0A4D4F] active:scale-95 shadow-sm'
              }`}
            >
              <span>{isBooked ? 'Issued Offline' : 'Get QR Ticket'}</span>
              {!isBooked && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
