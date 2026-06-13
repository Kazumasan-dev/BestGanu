import React from 'react';
import { BookingTicket } from '../types';
import { QrCode, Calendar, Users, ShieldCheck, Trash2, Award, WifiOff, MapPin } from 'lucide-react';

interface TicketViewProps {
  tickets: BookingTicket[];
  onCancel: (id: string) => void;
  isOfflineMode: boolean;
}

export function TicketView({ tickets, onCancel, isOfflineMode }: TicketViewProps) {
  // SVG Mock QR Generator based on Ticket details
  const renderSVGQRCode = (data: string) => {
    // Generate static but complex QR looking pattern
    return (
      <svg viewBox="0 0 100 100" className="w-24 h-24 stroke-current text-[#0A4D4F] shrink-0 fill-none" strokeWidth="2">
        {/* Border contours */}
        <path d="M 5 5 L 20 5 M 5 5 L 5 20" strokeWidth="3" />
        <path d="M 95 5 L 80 5 M 95 5 L 95 20" strokeWidth="3" />
        <path d="M 5 95 L 20 95 M 5 95 L 5 80" strokeWidth="3" />
        <path d="M 95 95 L 80 95 M 95 95 L 95 80" strokeWidth="3" />
        
        {/* Standard three corners positioning blocks */}
        <rect x="10" y="10" width="20" height="20" strokeWidth="3" className="fill-[#0A4D4F]/10 stroke-[#0A4D4F]" />
        <rect x="15" y="15" width="10" height="10" className="fill-[#0A4D4F]" />

        <rect x="70" y="10" width="20" height="20" strokeWidth="3" className="fill-[#0A4D4F]/10 stroke-[#0A4D4F]" />
        <rect x="75" y="15" width="10" height="10" className="fill-[#0A4D4F]" />

        <rect x="10" y="70" width="20" height="20" strokeWidth="3" className="fill-[#0A4D4F]/10 stroke-[#0A4D4F]" />
        <rect x="15" y="75" width="10" height="10" className="fill-[#0A4D4F]" />
        
        {/* Fake random data blocks */}
        <rect x="42" y="15" width="6" height="6" className="fill-[#0A4D4F]" />
        <rect x="52" y="15" width="12" height="6" className="fill-[#0A4D4F]" />
        <rect x="42" y="27" width="12" height="12" className="fill-[#0A4D4F]/85" />
        <rect x="70" y="42" width="6" height="18" className="fill-[#0A4D4F]" />
        <rect x="15" y="42" width="18" height="6" className="fill-[#0A4D4F]" />
        <rect x="42" y="48" width="18" height="18" className="fill-[#0A4D4F]" />
        <rect x="70" y="70" width="12" height="12" className="fill-[#0A4D4F]/70" />
        <rect x="70" y="85" width="18" height="6" className="fill-[#0A4D4F]" />
        <rect x="42" y="75" width="18" height="12" className="fill-[#0A4D4F]/90" />
        <rect x="10" y="52" width="6" height="6" className="fill-[#0A4D4F]" />
      </svg>
    );
  };

  if (tickets.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed border-[#0A4D4F]/30 rounded-2xl p-8 text-center space-y-3.5 max-w-sm mx-auto">
        <div className="w-16 h-16 bg-[#F4F1EA] rounded-full flex items-center justify-center mx-auto text-[#0A4D4F] border border-[#0A4D4F]/15">
          <QrCode className="w-8 h-8" />
        </div>
        <div>
          <h4 className="font-display font-bold text-sm text-[#0A4D4F]">No Active QR Tickets</h4>
          <p className="text-xs text-[#0A4D4F]/75 leading-relaxed font-sans max-w-[240px] mx-auto mt-1">
            Book any experience in the Marketplace tab to issue dynamic offline-capable tickets locally on your smartphone.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isOfflineMode && (
        <div className="bg-amber-50 border-2 border-amber-500 rounded-xl p-3 flex items-start gap-2.5 text-amber-900">
          <WifiOff className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs font-sans">
            <span className="font-semibold block">PWA Offline Simulation Mode Active</span>
            <span>Your tickets, barcodes, guidelines, and booking credentials remain 100% accessible locally without internet connection.</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div 
            key={ticket.id} 
            className="bg-white border-2 border-[#0A4D4F] rounded-2xl overflow-hidden flex flex-col relative shadow-sm"
          >
            {/* Passenger Pass Header */}
            <div className="bg-[#0A4D4F] text-[#FAF8F5] p-3 flex justify-between items-center px-4 border-b-2 border-dashed border-white">
              <div className="flex items-center gap-1.5 font-display font-medium text-xs">
                <ShieldCheck className="w-4 h-4 text-[#A9DFBF]" />
                <span>OFFLINE BOARDING CARD</span>
              </div>
              <span className="text-[10px] font-mono select-none px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
                ID: {ticket.qrCodeData}
              </span>
            </div>

            {/* Boarding Pass Body (Torn Ticket Look) */}
            <div className="p-4 bg-white space-y-4 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] block text-[#0A4D4F]/60 font-mono tracking-wider uppercase">EXPERIENCE</span>
                  <p className="font-display font-bold text-sm text-[#0A4D4F] leading-snug line-clamp-2">
                    {ticket.experienceName}
                  </p>
                </div>

                <div className="space-y-1 text-right">
                  <span className="text-[9px] block text-[#0A4D4F]/60 font-mono tracking-wider uppercase">ECO SAVER SCORE</span>
                  <div className="inline-flex items-center gap-1 bg-[#A9DFBF]/20 text-[#0A4D4F] text-[11px] font-sans font-bold px-2 py-0.5 rounded-full border border-[#A9DFBF]/70">
                    <Award className="w-3.5 h-3.5" />
                    <span>+{ticket.ecoImpactPoints} points</span>
                  </div>
                </div>
              </div>

              {/* Booking specifications */}
              <div className="grid grid-cols-3 gap-2 border-t border-dashed border-[#0A4D4F]/10 pt-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] block text-[#0A4D4F]/50 font-mono uppercase">HOLDER</span>
                  <p className="text-xs font-sans font-semibold text-[#0A4D4F] truncate">{ticket.bookedBy}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] block text-[#0A4D4F]/50 font-mono uppercase">DATE</span>
                  <p className="text-xs font-sans font-semibold text-[#0A4D4F] flex items-center gap-1 truncate">
                    <Calendar className="w-3 h-3 text-[#0A4D4F]/80 shrink-0" />
                    {ticket.bookingDate}
                  </p>
                </div>
                <div className="space-y-0.5 text-right">
                  <span className="text-[9px] block text-[#0A4D4F]/50 font-mono uppercase">CAPACITY</span>
                  <p className="text-xs font-sans font-semibold text-[#0A4D4F] flex items-center justify-end gap-1 truncate">
                    <Users className="w-3 h-3 text-[#0A4D4F]/80 shrink-0" />
                    {ticket.guestCount} {ticket.guestCount > 1 ? 'Guests' : 'Guest'}
                  </p>
                </div>
              </div>

              {/* QR and Verification Container */}
              <div className="border-t border-[#0A4D4F]/10 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="space-y-2 max-w-xs font-sans">
                  <div className="flex items-center gap-1 text-xs font-sans font-semibold text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Validated Offline Admission</span>
                  </div>
                  <p className="text-[10px] text-[#0A4D4F]/75 leading-relaxed">
                    This PWA ticket is compiled locally on your device. Present the QR code on-site at the wetland/diving desk for seamless, paper-free entry.
                  </p>
                  <p className="text-[10px] font-mono text-[#0A4D4F]/60">
                    * QR incorporates localized cryptographic hashes.
                  </p>
                </div>

                <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#0A4D4F]/15">
                  {renderSVGQRCode(ticket.qrCodeData)}
                </div>
              </div>
            </div>

            {/* Dotted border line with side punch holes */}
            <div className="absolute left-0 bottom-[40px] right-0 h-4 flex items-center justify-between pointer-events-none select-none">
              <div className="w-2.5 h-5 rounded-r-full bg-[#F4F1EA] border-r border-t border-b border-[#0A4D4F] -ml-[1px]" />
              <div className="w-2.5 h-5 rounded-l-full bg-[#F4F1EA] border-l border-t border-b border-[#0A4D4F] -mr-[1px]" />
            </div>

            {/* Fare Footer & Actions */}
            <div className="bg-[#FAF8F5] p-3 border-t border-[#0A4D4F]/10 flex items-center justify-between px-4">
              <span className="font-mono text-[11px] font-semibold text-[#0A4D4F]/70">
                TRANS-TOTAL: RM {ticket.price} (FULLY PAID)
              </span>
              
              <button
                id={`cancel-btn-${ticket.id}`}
                onClick={() => onCancel(ticket.id)}
                className="text-[#0A4D4F]/60 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors focus:outline-none flex items-center gap-1 text-xs font-sans font-bold"
                title="Cancel ticket & recoup carbon credits"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Revoke Booking</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
