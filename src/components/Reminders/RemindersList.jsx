import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const RemindersList = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [filteredReminders, setFilteredReminders] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, inactive, upcoming, completed
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadReminders();
      loadProfiles();
    }
  }, [user]);

  useEffect(() => {
    filterReminders();
  }, [reminders, filter, searchTerm]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_061iy_reminders')
        .select(`
          *,
          profile:app_061iy_profiles(name, relationship)
        `)
        .eq('user_id', user.id)
        .order('reminder_date', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('app_061iy_profiles')
        .select('id, name, relationship')
        .eq('user_id', user.id);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const filterReminders = () => {
    let filtered = reminders;

    // Filter by status
    switch (filter) {
      case 'active':
        filtered = filtered.filter(reminder => reminder.is_active && !reminder.is_completed);
        break;
      case 'inactive':
        filtered = filtered.filter(reminder => !reminder.is_active);
        break;
      case 'completed':
        filtered = filtered.filter(reminder => reminder.is_completed);
        break;
      case 'upcoming':
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(reminder => {
          const reminderDate = new Date(reminder.reminder_date);
          return reminder.is_active && !reminder.is_completed && reminderDate >= today && reminderDate <= nextWeek;
        });
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(reminder =>
        reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reminder.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reminder.reminder_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by reminder date
    filtered.sort((a, b) => new Date(a.reminder_date) - new Date(b.reminder_date));

    setFilteredReminders(filtered);
  };

  const handleDelete = async (reminderId) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        const { error } = await supabase
          .from('app_061iy_reminders')
          .delete()
          .eq('id', reminderId)
          .eq('user_id', user.id);

        if (error) throw error;
        setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
      } catch (error) {
        console.error('Error deleting reminder:', error);
        alert('Failed to delete reminder. Please try again.');
      }
    }
  };

  const handleComplete = async (reminderId) => {
    try {
      const { error } = await supabase
        .from('app_061iy_reminders')
        .update({ 
          is_completed: true, 
          completed_at: new Date().toISOString()
        })
        .eq('id', reminderId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setReminders(prev => prev.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, is_completed: true, completed_at: new Date().toISOString() }
          : reminder
      ));
    } catch (error) {
      console.error('Error completing reminder:', error);
      alert('Failed to mark reminder as completed. Please try again.');
    }
  };

  const handleSnooze = async (reminderId, minutes = 60) => {
    try {
      const snoozeUntil = new Date();
      snoozeUntil.setMinutes(snoozeUntil.getMinutes() + minutes);

      const { error } = await supabase
        .from('app_061iy_reminders')
        .update({ 
          snoozed_until: snoozeUntil.toISOString(),
          snooze_count: supabase.sql`snooze_count + 1`
        })
        .eq('id', reminderId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      loadReminders(); // Reload to get updated data
    } catch (error) {
      console.error('Error snoozing reminder:', error);
      alert('Failed to snooze reminder. Please try again.');
    }
  };

  const isUpcoming = (reminderDate) => {
    const today = new Date();
    const reminder = new Date(reminderDate);
    const diffTime = reminder - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const isPast = (reminderDate) => {
    const today = new Date();
    const reminder = new Date(reminderDate);
    return reminder < today;
  };

  const isToday = (reminderDate) => {
    const today = new Date();
    const reminder = new Date(reminderDate);
    return today.toDateString() === reminder.toDateString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getReminderStatusColor = (reminder) => {
    if (reminder.is_completed) return 'bg-green-50 border-green-300';
    if (!reminder.is_active) return 'bg-gray-100 border-gray-300';
    if (isToday(reminder.reminder_date)) return 'bg-orange-50 border-orange-300';
    if (isPast(reminder.reminder_date)) return 'bg-red-50 border-red-300';
    if (isUpcoming(reminder.reminder_date)) return 'bg-yellow-50 border-yellow-300';
    return 'bg-blue-50 border-blue-300';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReminderTypeIcon = (type) => {
    switch (type) {
      case 'exam':
        return '👁️';
      case 'prescription':
        return '💊';
      case 'checkup':
        return '🩺';
      case 'medication':
        return '💉';
      case 'appointment':
        return '📅';
      default:
        return '⏰';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Reminders</h1>
        <Link
          to="/reminders/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Add New Reminder
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search reminders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Reminders</option>
              <option value="active">Active Only</option>
              <option value="completed">Completed</option>
              <option value="inactive">Inactive</option>
              <option value="upcoming">Upcoming (Next 7 days)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg">
            {searchTerm || filter !== 'all' 
              ? 'No reminders match your current filters.' 
              : 'You don\'t have any reminders yet.'
            }
          </p>
          {(!searchTerm && filter === 'all') && (
            <Link
              to="/reminders/new"
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Create Your First Reminder
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${getReminderStatusColor(reminder)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-2xl">{getReminderTypeIcon(reminder.reminder_type)}</span>
                    <h3 className="text-xl font-semibold text-gray-800">{reminder.title}</h3>
                    
                    {/* Priority Badge */}
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(reminder.priority)}`}>
                      {reminder.priority.toUpperCase()}
                    </span>

                    {/* Status Badges */}
                    {reminder.is_completed && (
                      <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
                        ✓ Completed
                      </span>
                    )}
                    {!reminder.is_active && !reminder.is_completed && (
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                        Inactive
                      </span>
                    )}
                    {isToday(reminder.reminder_date) && reminder.is_active && !reminder.is_completed && (
                      <span className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded-full">
                        Today
                      </span>
                    )}
                    {isUpcoming(reminder.reminder_date) && reminder.is_active && !reminder.is_completed && !isToday(reminder.reminder_date) && (
                      <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Upcoming
                      </span>
                    )}
                    {isPast(reminder.reminder_date) && reminder.is_active && !reminder.is_completed && (
                      <span className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded-full">
                        Overdue
                      </span>
                    )}
                    {reminder.is_recurring && (
                      <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
                        🔄 Recurring
                      </span>
                    )}
                  </div>
                  
                  {reminder.description && (
                    <p className="text-gray-600 mb-3">{reminder.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>📅 {formatDate(reminder.reminder_date)}</span>
                    {reminder.reminder_time && (
                      <span>🕐 {formatTime(reminder.reminder_time)}</span>
                    )}
                    <span className="capitalize">📋 {reminder.reminder_type}</span>
                    {reminder.profile && (
                      <span>👤 {reminder.profile.name}</span>
                    )}
                    {reminder.doctor_name && (
                      <span>👨‍⚕️ {reminder.doctor_name}</span>
                    )}
                    {reminder.location && (
                      <span>📍 {reminder.location}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <div className="flex gap-2">
                    {!reminder.is_completed && reminder.is_active && (
                      <button
                        onClick={() => handleComplete(reminder.id)}
                        className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-sm transition-colors"
                      >
                        ✓ Complete
                      </button>
                    )}
                    <Link
                      to={`/reminders/${reminder.id}/edit`}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                  
                  <div className="flex gap-2">
                    {!reminder.is_completed && reminder.is_active && (
                      <>
                        <button
                          onClick={() => handleSnooze(reminder.id, 60)}
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1 rounded text-xs transition-colors"
                        >
                          Snooze 1h
                        </button>
                        <button
                          onClick={() => handleSnooze(reminder.id, 1440)}
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1 rounded text-xs transition-colors"
                        >
                          Snooze 1d
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Reminders Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{reminders.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {reminders.filter(r => r.is_active && !r.is_completed).length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {reminders.filter(r => r.is_active && !r.is_completed && isUpcoming(r.reminder_date)).length}
            </div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {reminders.filter(r => r.is_active && !r.is_completed && isPast(r.reminder_date)).length}
            </div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {reminders.filter(r => r.is_completed).length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemindersList;