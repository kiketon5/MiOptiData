import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getAllProfiles } from '../../utils/api';

const AppointmentBooking = () => {
  const { user } = useContext(AuthContext);
  const [profiles, setProfiles] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const loadInitialData = async () => {
    try {
      const profilesData = await getAllProfiles();
      setProfiles(profilesData);
      
      // Mock doctors data
      const mockDoctors = [
        {
          id: '1',
          name: 'Dr. Sarah Johnson',
          specialty: 'Ophthalmologist',
          location: 'Eye Care Center - Downtown',
          rating: 4.9,
          experience: '15 years',
          avatar: '👩‍⚕️'
        },
        {
          id: '2',
          name: 'Dr. Michael Chen',
          specialty: 'Optometrist',
          location: 'Vision Clinic - Westside',
          rating: 4.8,
          experience: '12 years',
          avatar: '👨‍⚕️'
        },
        {
          id: '3',
          name: 'Dr. Emily Rodriguez',
          specialty: 'Retinal Specialist',
          location: 'Advanced Eye Institute',
          rating: 4.9,
          experience: '20 years',
          avatar: '👩‍⚕️'
        }
      ];
      setDoctors(mockDoctors);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadAvailableSlots = () => {
    // Mock available time slots
    const mockSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];
    
    // Simulate some slots being unavailable
    const available = mockSlots.filter(() => Math.random() > 0.3);
    setAvailableSlots(available);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call to book appointment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const appointmentData = {
        id: Date.now().toString(),
        doctorId: selectedDoctor,
        profileId: selectedProfile,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        notes: notes,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };

      // Store in localStorage for demo
      const appointments = JSON.parse(localStorage.getItem('MiOptiDataAppointments') || '[]');
      appointments.push(appointmentData);
      localStorage.setItem('MiOptiDataAppointments', JSON.stringify(appointments));

      setShowSuccess(true);
      
      // Reset form
      setSelectedDoctor('');
      setSelectedProfile('');
      setSelectedDate('');
      setSelectedTime('');
      setAppointmentType('');
      setNotes('');
      
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error booking appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // 3 months ahead
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Book an Appointment</h2>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Appointment booked successfully! You'll receive a confirmation email shortly.
            </div>
          </div>
        )}

        <form onSubmit={handleBookAppointment} className="space-y-6">
          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Doctor
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedDoctor === doctor.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDoctor(doctor.id)}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">{doctor.avatar}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{doctor.location}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{doctor.experience}</span>
                    <div className="flex items-center">
                      <span className="text-yellow-500">⭐</span>
                      <span className="ml-1 text-gray-600">{doctor.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Selection */}
          <div>
            <label htmlFor="profile" className="block text-sm font-medium text-gray-700 mb-2">
              Patient Profile
            </label>
            <select
              id="profile"
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a profile</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name} ({profile.relationship})
                </option>
              ))}
            </select>
          </div>

          {/* Appointment Type */}
          <div>
            <label htmlFor="appointmentType" className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Type
            </label>
            <select
              id="appointmentType"
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select appointment type</option>
              <option value="routine">Routine Eye Exam</option>
              <option value="followup">Follow-up Visit</option>
              <option value="emergency">Urgent Care</option>
              <option value="consultation">Consultation</option>
              <option value="contact-lens">Contact Lens Fitting</option>
              <option value="surgery-followup">Surgery Follow-up</option>
            </select>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getMinDate()}
                max={getMaxDate()}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Time Selection */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Available Times
              </label>
              {selectedDate && selectedDoctor ? (
                <select
                  id="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select time</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500">
                  Select doctor and date first
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any specific concerns or information for your doctor..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !selectedDoctor || !selectedProfile || !selectedDate || !selectedTime || !appointmentType}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Booking...
                </div>
              ) : (
                'Book Appointment'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Appointment Guidelines */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 Appointment Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-medium mb-2">Before Your Visit:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Bring your current glasses/contacts</li>
              <li>List of current medications</li>
              <li>Insurance card and ID</li>
              <li>Previous eye exam records</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">What to Expect:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Arrive 15 minutes early</li>
              <li>Eye dilation may be required</li>
              <li>Bring sunglasses for after</li>
              <li>Plan for 1-2 hour visit</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;