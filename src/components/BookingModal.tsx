import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, MessageSquare, CheckCircle, AlertCircle, CalendarDays } from 'lucide-react';
import { ServiceProvider, TimeSlot } from '../types';
import { useAppointments } from '../hooks/useAppointments';
import { useAuth } from '../hooks/useAuth';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ServiceProvider;
}

export function BookingModal({ isOpen, onClose, provider }: BookingModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [customDate, setCustomDate] = useState('');
  const [customStartTime, setCustomStartTime] = useState('09:00');
  const [customEndTime, setCustomEndTime] = useState('10:00');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const { bookAppointment, loading } = useAppointments();
  const { user } = useAuth();

  // Pre-fill with user data if logged in
  React.useEffect(() => {
    if (user) {
      setClientInfo(prev => ({
        ...prev,
        name: user.name,
        phone: user.phone || '',
        email: user.email
      }));
    }
  }, [user]);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setBookingSuccess(false);
      setBookingError('');
      setSelectedSlot(null);
      setUseCustomTime(false);
      setCustomDate('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const availableSlots = provider.availability?.filter(slot => slot.available) || [];

  // Generate future dates for custom booking (next 30 days)
  const generateFutureDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const futureDates = generateFutureDates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientInfo.name || !clientInfo.phone || !clientInfo.email) {
      setBookingError('Please fill in all required fields');
      return;
    }

    let appointmentDate, startTime, endTime;

    if (useCustomTime) {
      if (!customDate || !customStartTime || !customEndTime) {
        setBookingError('Please select a date and time for your appointment');
        return;
      }
      appointmentDate = customDate;
      startTime = customStartTime;
      endTime = customEndTime;
    } else {
      if (!selectedSlot) {
        setBookingError('Please select a time slot or choose custom date/time');
        return;
      }
      appointmentDate = selectedSlot.date;
      startTime = selectedSlot.startTime;
      endTime = selectedSlot.endTime;
    }

    setIsSubmitting(true);
    setBookingError('');
    
    try {
      await bookAppointment({
        providerId: provider.id,
        clientName: clientInfo.name,
        clientPhone: clientInfo.phone,
        clientEmail: clientInfo.email,
        service: provider.service,
        date: appointmentDate,
        startTime: startTime,
        endTime: endTime,
        status: useCustomTime ? 'Pending' : 'Pending', // All bookings start as pending
        notes: clientInfo.notes + (useCustomTime ? ' (Custom time requested)' : '')
      });

      setBookingSuccess(true);
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingSuccess) {
    const finalDate = useCustomTime ? customDate : selectedSlot?.date;
    const finalStartTime = useCustomTime ? customStartTime : selectedSlot?.startTime;
    const finalEndTime = useCustomTime ? customEndTime : selectedSlot?.endTime;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Request Sent!</h2>
          <p className="text-gray-600 mb-6">
            Your appointment request has been sent to {provider.fullName}. 
            They will contact you shortly to confirm the details.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Service:</strong> {provider.service}</p>
              <p><strong>Date:</strong> {new Date(finalDate!).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {finalStartTime} - {finalEndTime}</p>
              <p><strong>Estimated Cost:</strong> R{provider.suggestedPrice}</p>
              {useCustomTime && (
                <p className="text-orange-600 font-medium">
                  ⚠️ Custom time requested - awaiting provider confirmation
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
            <p className="text-gray-600">{provider.fullName} - {provider.service}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {bookingError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-800 text-sm font-medium">{bookingError}</p>
              </div>
            </div>
          )}

          {/* Booking Type Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Choose Booking Option</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setUseCustomTime(false)}
                className={`p-4 border-2 rounded-xl text-left transition-all ${
                  !useCustomTime
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Available Slots</span>
                </div>
                <p className="text-sm text-gray-600">
                  Choose from provider's available time slots
                </p>
              </button>

              <button
                type="button"
                onClick={() => setUseCustomTime(true)}
                className={`p-4 border-2 rounded-xl text-left transition-all ${
                  useCustomTime
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <CalendarDays className="w-5 h-5" />
                  <span className="font-medium">Request Custom Time</span>
                </div>
                <p className="text-sm text-gray-600">
                  Request a specific date/time (subject to approval)
                </p>
              </button>
            </div>
          </div>

          {/* Available Time Slots */}
          {!useCustomTime && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Calendar className="w-4 h-4 inline mr-2" />
                Select Available Time Slot
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 border rounded-lg text-left transition-all ${
                      selectedSlot === slot
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">
                      {new Date(slot.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </button>
                ))}
              </div>
              {availableSlots.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No available time slots</p>
                  <p className="text-sm text-gray-400 mt-1">Try requesting a custom time below</p>
                </div>
              )}
            </div>
          )}

          {/* Custom Date/Time Selection */}
          {useCustomTime && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <CalendarDays className="w-4 h-4 inline mr-2" />
                Request Custom Date & Time
              </label>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-orange-800 text-sm font-medium">Custom Time Request</p>
                    <p className="text-orange-700 text-xs mt-1">
                      This will send a request to the provider. They will contact you to confirm availability.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <select
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select date</option>
                    {futureDates.map(date => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={customStartTime}
                    onChange={(e) => setCustomStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={customEndTime}
                    onChange={(e) => setCustomEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                required
                value={clientInfo.name}
                onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={clientInfo.phone}
                onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address *
            </label>
            <input
              type="email"
              required
              value={clientInfo.email}
              onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Additional Notes (Optional)
            </label>
            <textarea
              value={clientInfo.notes}
              onChange={(e) => setClientInfo(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any specific requirements or notes..."
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-lg font-semibold text-gray-900">
              Estimated Cost: <span className="text-blue-600">R{provider.suggestedPrice}</span>
            </div>
            <button
              type="submit"
              disabled={(!selectedSlot && !useCustomTime) || (useCustomTime && !customDate) || isSubmitting || loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Booking...</span>
                </div>
              ) : (
                useCustomTime ? 'Request Appointment' : 'Book Appointment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}