import React, { useState, useEffect } from 'react';
import CustomerView from './components/CustomerView';
import AdminView from './components/AdminView';
import TickerBanner from './components/TickerBanner';
import { Calendar, Shield, Sparkles, X, CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';

const STORAGE_KEY = 'eventcenter_scheduler_bookings';

const DEFAULT_BOOKINGS = [
  {
    id: 'seed-1',
    customerName: 'Eleanor Vance',
    email: 'eleanor@example.com',
    phone: '555-0192',
    eventName: 'Smith Wedding Reception',
    date: '2026-07-20',
    timeSlot: 'evening', // 4:00 PM - 10:00 PM
    status: 'approved',
    createdAt: '2026-07-10T14:30:00.000Z'
  },
  {
    id: 'seed-2',
    customerName: 'Marcus Aurelius',
    email: 'marcus@philosophy.org',
    phone: '555-0144',
    eventName: 'Stoic Leadership Seminar',
    date: '2026-07-25',
    timeSlot: 'morning', // 8:00 AM - 2:00 PM
    status: 'approved',
    createdAt: '2026-07-11T09:15:00.000Z'
  },
  {
    id: 'seed-3',
    customerName: 'Sylvia Plath',
    email: 'sylvia@poetry.edu',
    phone: '555-0188',
    eventName: 'Summer Poetry Reading',
    date: '2026-07-25',
    timeSlot: 'evening', // 4:00 PM - 10:00 PM
    status: 'pending',
    createdAt: '2026-07-12T10:00:00.000Z'
  },
  {
    id: 'seed-4',
    customerName: 'Clara Oswald',
    email: 'clara@tardis.co.uk',
    phone: '555-1963',
    eventName: 'Impossible Birthday Gala',
    date: '2026-07-20',
    timeSlot: 'full-day', // 8:00 AM - 10:00 PM (conflicts with seed-1 evening!)
    status: 'pending',
    createdAt: '2026-07-12T11:45:00.000Z'
  },
  {
    id: 'seed-5',
    customerName: 'Arthur Dent',
    email: 'arthur@tea.co.uk',
    phone: '555-4242',
    eventName: 'Hitchhikers Book Club Launch',
    date: '2026-07-22',
    timeSlot: 'morning', // 8:00 AM - 2:00 PM
    status: 'pending',
    createdAt: '2026-07-12T16:20:00.000Z'
  }
];

function App() {
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved bookings', e);
      }
    }
    return DEFAULT_BOOKINGS;
  });

  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [toasts, setToasts] = useState([]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings]);

  // Keep track of url path changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    
    // Custom event dispatch setup for pushState
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
  };

  // Check slot conflicts
  // Return boolean if two slots overlap
  const checkSlotsOverlap = (slot1, slot2) => {
    if (slot1 === 'full-day' || slot2 === 'full-day') return true;
    return slot1 === slot2;
  };

  const handleSubmitRequest = (requestData) => {
    // Check if slot is already approved
    const isApprovedAlready = bookings.some(
      (b) => b.status === 'approved' && b.date === requestData.date && checkSlotsOverlap(b.timeSlot, requestData.timeSlot)
    );

    if (isApprovedAlready) {
      addToast('Sorry, this time slot is already booked and approved.', 'error');
      return false;
    }

    const newBooking = {
      id: 'req-' + Date.now(),
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setBookings((prev) => [newBooking, ...prev]);
    addToast('Booking request submitted successfully! Status is pending manager approval.', 'success');
    return true;
  };

  const handleApprove = (bookingId) => {
    const bookingToApprove = bookings.find((b) => b.id === bookingId);
    if (!bookingToApprove) return;

    // Check if there's already an approved booking for this date/slot
    const hasExistingApprovedConflict = bookings.some(
      (b) => b.id !== bookingId && b.status === 'approved' && b.date === bookingToApprove.date && checkSlotsOverlap(b.timeSlot, bookingToApprove.timeSlot)
    );

    if (hasExistingApprovedConflict) {
      addToast('Cannot approve. An approved booking already exists for this date and time slot.', 'error');
      return;
    }

    // Auto-reject conflicting pending requests
    const updatedBookings = bookings.map((b) => {
      if (b.id === bookingId) {
        return { ...b, status: 'approved' };
      }
      
      // Overlapping and pending
      if (
        b.status === 'pending' &&
        b.date === bookingToApprove.date &&
        checkSlotsOverlap(b.timeSlot, bookingToApprove.timeSlot)
      ) {
        return { ...b, status: 'conflict' }; // 'conflict' indicates auto-rejected due to overlap
      }
      
      return b;
    });

    setBookings(updatedBookings);
    
    // Count how many were auto-rejected
    const autoRejectedCount = bookings.filter(
      (b) =>
        b.id !== bookingId &&
        b.status === 'pending' &&
        b.date === bookingToApprove.date &&
        checkSlotsOverlap(b.timeSlot, bookingToApprove.timeSlot)
    ).length;

    if (autoRejectedCount > 0) {
      addToast(
        `Booking approved! ${autoRejectedCount} conflicting request(s) auto-rejected.`,
        'warning'
      );
    } else {
      addToast('Booking approved successfully!', 'success');
    }
  };

  const handleReject = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'rejected' } : b))
    );
    addToast('Booking request declined.', 'info');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <TickerBanner bookings={bookings} />
      {/* Toast Notification Area */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />}
            
            <div className="text-sm font-medium pr-4">{toast.message}</div>
            
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,8,19,0.7)] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('/')}>
            <div className="p-2.5 bg-gradient-to-tr from-violet-600 to-pink-500 rounded-xl shadow-lg shadow-violet-950/40">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none tracking-tight text-white flex items-center gap-1.5 m-0">
                EventCenter <span className="text-gradient font-extrabold text-sm uppercase tracking-wider bg-clip-text">Scheduler</span>
              </h1>
              <p className="text-xs text-[rgba(255,255,255,0.4)] mt-0.5 font-medium">Elegant Venue Booking</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-4">
            <button
              onClick={() => navigateTo('/')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                currentPath === '/' 
                  ? 'bg-[rgba(139,92,246,0.15)] text-[rgba(196,181,253,1)] border border-[rgba(139,92,246,0.3)]' 
                  : 'text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.03)]'
              }`}
            >
              Calendar & Request
            </button>
            <button
              onClick={() => navigateTo('/admin')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center gap-1.5 ${
                currentPath === '/admin' 
                  ? 'bg-[rgba(236,72,153,0.15)] text-pink-300 border border-[rgba(236,72,153,0.3)]' 
                  : 'text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.03)]'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin Portal
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPath === '/admin' ? (
          <AdminView 
            bookings={bookings} 
            onApprove={handleApprove} 
            onReject={handleReject} 
            addToast={addToast}
          />
        ) : (
          <CustomerView 
            bookings={bookings} 
            onSubmit={handleSubmitRequest} 
            addToast={addToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[rgba(255,255,255,0.06)] py-6 bg-[rgba(10,8,19,0.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500 font-medium">
            © 2026 EventCenter Scheduler. All rights reserved.
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigateTo('/')} className="text-xs text-gray-400 hover:text-white transition">Public Calendar</button>
            <span className="text-gray-700">•</span>
            <button onClick={() => navigateTo('/admin')} className="text-xs text-gray-400 hover:text-white transition">Admin Dashboard (Unlisted)</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
