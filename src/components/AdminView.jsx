import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Inbox, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  User, 
  Mail, 
  Phone, 
  Info,
  Search,
  Filter
} from 'lucide-react';

function AdminView({ bookings, onApprove, onReject }) {
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [searchQuery, setSearchQuery] = useState('');

  // Stats calculation
  const totalRequests = bookings.length;
  const pendingRequests = bookings.filter((b) => b.status === 'pending').length;
  const approvedRequests = bookings.filter((b) => b.status === 'approved').length;
  const rejectedRequests = bookings.filter((b) => b.status === 'rejected' || b.status === 'conflict').length;

  const checkSlotsOverlap = (slot1, slot2) => {
    if (slot1 === 'full-day' || slot2 === 'full-day') return true;
    return slot1 === slot2;
  };

  // Helper to check if there is an approved booking for this date/slot
  const hasApprovedConflict = (date, timeSlot) => {
    return bookings.some(
      (b) => b.status === 'approved' && b.date === date && checkSlotsOverlap(b.timeSlot, timeSlot)
    );
  };

  // Helper to count other pending bookings that overlap with this one
  const getOverlappingPendingCount = (bookingId, date, timeSlot) => {
    return bookings.filter(
      (b) =>
        b.id !== bookingId &&
        b.status === 'pending' &&
        b.date === date &&
        checkSlotsOverlap(b.timeSlot, timeSlot)
    ).length;
  };

  // Filter & Search Logic
  const filteredBookings = bookings.filter((b) => {
    // Tab filtering
    if (filterTab === 'pending' && b.status !== 'pending') return false;
    if (filterTab === 'approved' && b.status !== 'approved') return false;
    if (filterTab === 'rejected' && (b.status !== 'rejected' && b.status !== 'conflict')) return false;

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = b.customerName.toLowerCase().includes(q);
      const matchEmail = b.email.toLowerCase().includes(q);
      const matchEvent = b.eventName.toLowerCase().includes(q);
      const matchDate = b.date.includes(q);
      return matchName || matchEmail || matchEvent || matchDate;
    }

    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="status-badge pending">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case 'approved':
        return (
          <span className="status-badge approved">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="status-badge rejected">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      case 'conflict':
        return (
          <span className="status-badge conflict">
            <AlertTriangle className="w-3.5 h-3.5" /> Overlap Rejected
          </span>
        );
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const getTimeSlotLabel = (slot) => {
    switch (slot) {
      case 'morning':
        return (
          <span className="flex items-center gap-1 text-amber-300 bg-amber-950/20 px-2.5 py-1 rounded border border-amber-900/30 text-xs font-semibold">
            ☀️ Morning (8am-2pm)
          </span>
        );
      case 'evening':
        return (
          <span className="flex items-center gap-1 text-violet-300 bg-violet-950/20 px-2.5 py-1 rounded border border-violet-900/30 text-xs font-semibold">
            🌙 Evening (4pm-10pm)
          </span>
        );
      case 'full-day':
        return (
          <span className="flex items-center gap-1 text-emerald-300 bg-emerald-950/20 px-2.5 py-1 rounded border border-emerald-900/30 text-xs font-semibold">
            ⭐ Full Day (8am-10pm)
          </span>
        );
      default:
        return slot;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          Venue Booking Management
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Review, approve, or reject customer scheduling requests. Approved bookings automatically block times on the customer calendar.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="stats-grid">
        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Submissions</span>
            <div className="text-3xl font-extrabold mt-1 text-white">{totalRequests}</div>
          </div>
          <div className="p-3 bg-gray-800/40 rounded-xl border border-gray-700/30">
            <Inbox className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pending Review</span>
            <div className="text-3xl font-extrabold mt-1 text-amber-400">{pendingRequests}</div>
          </div>
          <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-900/30">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Approved Bookings</span>
            <div className="text-3xl font-extrabold mt-1 text-emerald-400">{approvedRequests}</div>
          </div>
          <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-900/30">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between border-l-4 border-l-red-500">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Declined / Conflict</span>
            <div className="text-3xl font-extrabold mt-1 text-red-400">{rejectedRequests}</div>
          </div>
          <div className="p-3 bg-red-950/20 rounded-xl border border-red-900/30">
            <XCircle className="w-6 h-6 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex bg-black/30 p-1 rounded-lg border border-[rgba(255,255,255,0.06)] self-start">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
              filterTab === 'all'
                ? 'bg-violet-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1 ${
              filterTab === 'pending'
                ? 'bg-amber-500 text-black shadow font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Pending {pendingRequests > 0 && <span className="bg-amber-950 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">{pendingRequests}</span>}
          </button>
          <button
            onClick={() => setFilterTab('approved')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
              filterTab === 'approved'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilterTab('rejected')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
              filterTab === 'rejected'
                ? 'bg-red-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Declined
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-500" />
          </span>
          <input
            type="text"
            placeholder="Search by name, event, date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm glass-input"
          />
        </div>
      </div>

      {/* Requests Table/List */}
      <div className="glass-panel p-0 overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-gray-400">No requests found</h4>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">
              There are no matching booking requests in this view.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)] bg-black/25">
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Event Details</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Customer Contact</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Booking Slot</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                {filteredBookings.map((booking) => {
                  const hasConflict = booking.status === 'pending' && hasApprovedConflict(booking.date, booking.timeSlot);
                  const pendingConflictCount = booking.status === 'pending' 
                    ? getOverlappingPendingCount(booking.id, booking.date, booking.timeSlot) 
                    : 0;

                  return (
                    <tr 
                      key={booking.id} 
                      className={`transition hover:bg-white/[0.01] ${
                        hasConflict ? 'bg-red-500/[0.02]' : ''
                      }`}
                    >
                      {/* Event details */}
                      <td className="p-4 align-top">
                        <div className="font-bold text-white text-base">{booking.eventName}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          Received: {new Date(booking.createdAt).toLocaleDateString()} at {new Date(booking.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </td>

                      {/* Customer contact */}
                      <td className="p-4 align-top">
                        <div className="font-medium text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          {booking.customerName}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex flex-col gap-1">
                          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" /> {booking.email}</span>
                          <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" /> {booking.phone}</span>
                        </div>
                      </td>

                      {/* Booking Slot */}
                      <td className="p-4 align-top">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                          {new Date(booking.date).toLocaleDateString(undefined, { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                        <div className="mt-2">{getTimeSlotLabel(booking.timeSlot)}</div>
                      </td>

                      {/* Status & Warning Badges */}
                      <td className="p-4 align-top">
                        <div className="flex flex-col gap-1.5">
                          <div>{getStatusBadge(booking.status)}</div>
                          
                          {/* Collision checks & Warnings */}
                          {hasConflict && (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-semibold">
                              <AlertTriangle className="w-4 h-4 shrink-0" />
                              Already Booked (Approved slot exists)
                            </div>
                          )}
                          
                          {pendingConflictCount > 0 && (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-pink-950/20 border border-pink-900/40 text-pink-400 text-xs font-semibold">
                              <Info className="w-4 h-4 shrink-0" />
                              {pendingConflictCount} conflicting pending request(s) will auto-reject if approved
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 align-top text-right">
                        {booking.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onApprove(booking.id)}
                              disabled={hasConflict}
                              className={`p-2 rounded-lg border transition ${
                                hasConflict 
                                  ? 'bg-gray-800/20 border-gray-800 text-gray-600 cursor-not-allowed'
                                  : 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                              }`}
                              title={hasConflict ? "Cannot approve due to existing booking" : "Approve booking"}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onReject(booking.id)}
                              className="p-2 rounded-lg bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white transition"
                              title="Reject booking"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-600 font-semibold italic">No actions available</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminView;
