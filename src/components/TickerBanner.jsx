import React from 'react';
import { Check, X, ShieldAlert, Sparkles } from 'lucide-react';

function TickerBanner({ bookings }) {
  // Filter for approved, rejected, and conflict bookings
  const relevantBookings = bookings.filter(
    (b) => b.status === 'approved' || b.status === 'rejected' || b.status === 'conflict'
  );

  // If there are no entries, show a welcome greeting ticker
  const tickerItems = relevantBookings.length > 0 
    ? relevantBookings.map((b) => {
        let statusText = '';
        let dotColor = '';
        let icon = null;

        if (b.status === 'approved') {
          statusText = 'Approved';
          dotColor = 'bg-emerald-500';
          icon = <Check className="w-3 h-3 text-emerald-400 shrink-0" />;
        } else if (b.status === 'rejected') {
          statusText = 'Declined';
          dotColor = 'bg-red-500';
          icon = <X className="w-3 h-3 text-red-400 shrink-0" />;
        } else if (b.status === 'conflict') {
          statusText = 'Overlap Rejected';
          dotColor = 'bg-pink-500';
          icon = <ShieldAlert className="w-3 h-3 text-pink-400 shrink-0" />;
        }

        const dateStr = new Date(b.date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric'
        });

        const slotLabel = b.timeSlot === 'full-day' ? 'Full Day' : b.timeSlot;

        return {
          id: b.id,
          element: (
            <div key={b.id} className="ticker-item flex items-center gap-2 px-6">
              <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                [{statusText}]
              </span>
              <span className="text-sm font-semibold text-white truncate max-w-[200px]">
                {b.eventName}
              </span>
              <span className="text-xs text-gray-500">
                ({dateStr} • {slotLabel})
              </span>
            </div>
          )
        };
      })
    : [
        {
          id: 'welcome-1',
          element: (
            <div key="welcome-1" className="ticker-item flex items-center gap-2 px-6">
              <Sparkles className="w-4.5 h-4.5 text-amber-400 animate-pulse shrink-0" />
              <span className="text-sm font-semibold text-gradient-gold">
                Welcome to EventCenter Scheduler!
              </span>
              <span className="text-xs text-gray-400">
                Submit requests on the calendar below to see booking updates roll in real-time.
              </span>
            </div>
          )
        },
        {
          id: 'welcome-2',
          element: (
            <div key="welcome-2" className="ticker-item flex items-center gap-2 px-6">
              <Sparkles className="w-4.5 h-4.5 text-pink-400 animate-pulse shrink-0" />
              <span className="text-sm font-semibold text-gradient-purple-pink">
                Zero Double-Bookings Guarantee
              </span>
              <span className="text-xs text-gray-400">
                Management reviews booking requests from the admin dashboard to block out calendar dates.
              </span>
            </div>
          )
        }
      ];

  // Repeat items to ensure seamless loop if content width is smaller than screen width
  const renderList = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <div className="ticker-banner-container border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,8,19,0.9)] backdrop-blur-md overflow-hidden relative h-10 flex items-center z-50">
      {/* Ticker Content Wrapper */}
      <div className="ticker-scroll flex items-center">
        {renderList.map((item, idx) => (
          <React.Fragment key={`${item.id}-${idx}`}>
            {item.element}
            <span className="text-gray-800 font-bold px-2">•</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default TickerBanner;
