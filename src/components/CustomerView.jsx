import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, Sparkles, Send, CheckCircle2, ChevronRight } from 'lucide-react';

function CustomerView({ bookings, onSubmit }) {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    eventName: '',
    date: '',
    timeSlot: 'morning'
  });
  const [errors, setErrors] = useState({});

  // Filter approved bookings to display on the calendar
  const approvedBookings = bookings.filter((b) => b.status === 'approved');

  // Convert approved bookings to FullCalendar events
  const calendarEvents = approvedBookings.map((b) => {
    let slotLabel = '';
    if (b.timeSlot === 'morning') slotLabel = 'Morning';
    if (b.timeSlot === 'evening') slotLabel = 'Evening';
    if (b.timeSlot === 'full-day') slotLabel = 'Full Day';

    return {
      id: b.id,
      title: `${b.eventName || 'Event'} (${slotLabel})`,
      start: b.date,
      allDay: true,
      extendedProps: {
        timeSlot: b.timeSlot,
        customerName: b.customerName
      }
    };
  });

  const checkSlotOverlap = (slot1, slot2) => {
    if (slot1 === 'full-day' || slot2 === 'full-day') return true;
    return slot1 === slot2;
  };

  // Helper to check if a specific slot is booked for a date
  const isSlotBooked = (dateStr, slot) => {
    if (!dateStr) return false;
    return approvedBookings.some(
      (b) => b.date === dateStr && checkSlotOverlap(b.timeSlot, slot)
    );
  };

  const handleDateClick = (arg) => {
    setFormData((prev) => ({
      ...prev,
      date: arg.dateStr
    }));
    // Reset date error if any
    if (errors.date) {
      setErrors((prev) => ({ ...prev, date: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.eventName.trim()) newErrors.eventName = 'Event details are required';
    if (!formData.date) newErrors.date = 'Please select a date from the calendar';

    // Verify selected slot isn't already booked
    if (formData.date && isSlotBooked(formData.date, formData.timeSlot)) {
      newErrors.timeSlot = 'This time slot is already booked for the selected date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = onSubmit(formData);
    if (success) {
      // Clear form
      setFormData({
        customerName: '',
        email: '',
        phone: '',
        eventName: '',
        date: '',
        timeSlot: 'morning'
      });
      setErrors({});
    }
  };

  // Check which slots are unavailable for the currently selected date
  const selectedDate = formData.date;
  const morningBooked = isSlotBooked(selectedDate, 'morning');
  const eveningBooked = isSlotBooked(selectedDate, 'evening');
  const fullDayBooked = isSlotBooked(selectedDate, 'full-day');

  // Custom event renderer for FullCalendar to support accessibity and custom slot indicators
  const renderEventContent = (eventInfo) => {
    const slot = eventInfo.event.extendedProps.timeSlot;
    let emoji = '☀️';
    if (slot === 'evening') emoji = '🌙';
    if (slot === 'full-day') emoji = '⭐';

    return (
      <div className="flex items-center gap-1 overflow-hidden py-0.5">
        <span className={`calendar-event-slot ${slot}`}>
          {emoji} {slot === 'morning' && 'Morn'}
          {slot === 'evening' && 'Eve'}
          {slot === 'full-day' && 'Full'}
        </span>
        <span className="truncate text-xs font-semibold">{eventInfo.event.title.split(' (')[0]}</span>
      </div>
    );
  };

  // Generate class names for day cells to highlight selection
  const handleDayCellClassNames = (arg) => {
    if (formData.date && arg.date.toISOString().split('T')[0] === formData.date) {
      return ['selected-day-highlight'];
    }
    return [];
  };

  return (
    <div className="space-y-6">
      {/* Intro Hero Section */}
      <div className="glass-panel text-center relative overflow-hidden py-10 px-6 sm:px-12 flex flex-col items-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] text-amber-300 text-xs font-semibold mb-4 tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Book Your Dream Venue
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          Seamless Event Bookings at <span className="text-gradient">EventCenter</span>
        </h2>
        <p className="max-w-2xl text-gray-400 text-base sm:text-lg leading-relaxed">
          Check real-time availability on our interactive calendar below, choose an available date, and submit your booking request instantly. No registration required!
        </p>
      </div>

      {/* Main Grid: Calendar & Form */}
      <div className="dashboard-grid">
        {/* Calendar Side */}
        <div className="glass-panel flex flex-col h-full min-h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 m-0">
                <CalendarIcon className="w-5 h-5 text-violet-400" />
                Availability Calendar
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Click a date to select it for your booking request
              </p>
            </div>
            
            {/* Calendar Legend */}
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1.5 bg-gray-900/50 px-2 py-1 rounded border border-gray-800">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> ☀️ Morning
              </span>
              <span className="flex items-center gap-1.5 bg-gray-900/50 px-2 py-1 rounded border border-gray-800">
                <span className="w-2 h-2 rounded-full bg-violet-500"></span> 🌙 Evening
              </span>
              <span className="flex items-center gap-1.5 bg-gray-900/50 px-2 py-1 rounded border border-gray-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> ⭐ Full Day
              </span>
            </div>
          </div>

          <div className="flex-grow calendar-container bg-black/20 p-4 rounded-xl border border-[rgba(255,255,255,0.04)]">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: ''
              }}
              events={calendarEvents}
              dateClick={handleDateClick}
              eventContent={renderEventContent}
              dayCellClassNames={handleDayCellClassNames}
              editable={false}
              selectable={true}
              height="auto"
            />
          </div>
        </div>

        {/* Form Side */}
        <div className="glass-panel flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <Send className="w-5 h-5 text-pink-400" />
              Request Booking
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              Complete the form below to lock in your date
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selected Date Indicator */}
              <div className={`p-4 rounded-xl border transition ${
                formData.date 
                  ? 'bg-[rgba(245,158,11,0.06)] border-[rgba(245,158,11,0.25)] text-amber-200' 
                  : 'bg-[rgba(239,68,68,0.06)] border-[rgba(239,68,68,0.25)] text-red-300'
              }`}>
                <div className="flex items-center gap-2.5">
                  <CalendarIcon className={`w-5 h-5 ${formData.date ? 'text-amber-400' : 'text-red-400'}`} />
                  <div>
                    <span className="text-xs block text-gray-500 font-semibold uppercase tracking-wider">Selected Date</span>
                    <span className="text-sm font-bold">
                      {formData.date ? new Date(formData.date).toLocaleDateString(undefined, { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'Click a date on the calendar first'}
                    </span>
                  </div>
                </div>
                {errors.date && (
                  <p className="text-xs text-red-400 mt-2 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {errors.date}
                  </p>
                )}
              </div>

              {/* Customer Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-violet-400" /> Full Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="glass-input"
                />
                {errors.customerName && <p className="text-xs text-red-400 font-medium">{errors.customerName}</p>}
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-violet-400" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="glass-input"
                />
                {errors.email && <p className="text-xs text-red-400 font-medium">{errors.email}</p>}
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-violet-400" /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 000-0000"
                  className="glass-input"
                />
                {errors.phone && <p className="text-xs text-red-400 font-medium">{errors.phone}</p>}
              </div>

              {/* Event Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Event Name / Description
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  placeholder="Wedding Reception / Graduation Party"
                  className="glass-input"
                />
                {errors.eventName && <p className="text-xs text-red-400 font-medium">{errors.eventName}</p>}
              </div>

              {/* Time Slot Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-violet-400" /> Choose Time Slot
                </label>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Morning Option */}
                  <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                    formData.timeSlot === 'morning' 
                      ? 'bg-violet-600/10 border-violet-500/50 text-white' 
                      : 'bg-black/10 border-[rgba(255,255,255,0.06)] text-gray-400 hover:bg-black/25'
                  } ${morningBooked || fullDayBooked ? 'opacity-40 cursor-not-allowed' : ''}`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="timeSlot"
                        value="morning"
                        checked={formData.timeSlot === 'morning'}
                        onChange={handleChange}
                        disabled={morningBooked || fullDayBooked}
                        className="accent-violet-500 w-4 h-4"
                      />
                      <div className="text-sm font-medium">
                        <span>Morning Slot</span>
                        <span className="block text-xs text-gray-500">8:00 AM – 2:00 PM</span>
                      </div>
                    </div>
                    {(morningBooked || fullDayBooked) && (
                      <span className="text-xs bg-red-950/40 text-red-400 border border-red-900/50 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Booked</span>
                    )}
                  </label>

                  {/* Evening Option */}
                  <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                    formData.timeSlot === 'evening' 
                      ? 'bg-violet-600/10 border-violet-500/50 text-white' 
                      : 'bg-black/10 border-[rgba(255,255,255,0.06)] text-gray-400 hover:bg-black/25'
                  } ${eveningBooked || fullDayBooked ? 'opacity-40 cursor-not-allowed' : ''}`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="timeSlot"
                        value="evening"
                        checked={formData.timeSlot === 'evening'}
                        onChange={handleChange}
                        disabled={eveningBooked || fullDayBooked}
                        className="accent-violet-500 w-4 h-4"
                      />
                      <div className="text-sm font-medium">
                        <span>Evening Slot</span>
                        <span className="block text-xs text-gray-500">4:00 PM – 10:00 PM</span>
                      </div>
                    </div>
                    {(eveningBooked || fullDayBooked) && (
                      <span className="text-xs bg-red-950/40 text-red-400 border border-red-900/50 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Booked</span>
                    )}
                  </label>

                  {/* Full Day Option */}
                  <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                    formData.timeSlot === 'full-day' 
                      ? 'bg-violet-600/10 border-violet-500/50 text-white' 
                      : 'bg-black/10 border-[rgba(255,255,255,0.06)] text-gray-400 hover:bg-black/25'
                  } ${morningBooked || eveningBooked || fullDayBooked ? 'opacity-40 cursor-not-allowed' : ''}`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="timeSlot"
                        value="full-day"
                        checked={formData.timeSlot === 'full-day'}
                        onChange={handleChange}
                        disabled={morningBooked || eveningBooked || fullDayBooked}
                        className="accent-violet-500 w-4 h-4"
                      />
                      <div className="text-sm font-medium">
                        <span>Full Day Slot</span>
                        <span className="block text-xs text-gray-500">8:00 AM – 10:00 PM</span>
                      </div>
                    </div>
                    {(morningBooked || eveningBooked || fullDayBooked) && (
                      <span className="text-xs bg-red-950/40 text-red-400 border border-red-900/50 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Booked</span>
                    )}
                  </label>
                </div>
                {errors.timeSlot && <p className="text-xs text-red-400 font-medium">{errors.timeSlot}</p>}
              </div>
              
              <button
                type="submit"
                className="w-full btn-primary mt-6"
                disabled={!formData.date}
              >
                Submit Request <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerView;
