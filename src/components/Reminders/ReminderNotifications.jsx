import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const ReminderNotifications = () => {
  const { user } = useAuth();
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);

  useEffect(() => {
    if (user) {
      checkUpcomingReminders();
      // Check for reminders every 5 minutes
      const interval = setInterval(checkUpcomingReminders, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    // Show notification banner if permission is default and we have upcoming reminders
    if (notificationPermission === 'default' && upcomingReminders.length > 0) {
      setShowNotificationBanner(true);
    }
  }, [notificationPermission, upcomingReminders]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      setShowNotificationBanner(false);
      return permission === 'granted';
    }
    return false;
  };

  const checkUpcomingReminders = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('app_061iy_reminders')
        .select(`
          *,
          profile:app_061iy_profiles(name, relationship)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('is_completed', false)
        .gte('reminder_date', now.toISOString().split('T')[0])
        .lte('reminder_date', oneHourFromNow.toISOString().split('T')[0])
        .eq('browser_notification', true);

      if (error) throw error;

      const remindersToNotify = (data || []).filter(reminder => {
        const reminderDateTime = new Date(`${reminder.reminder_date}T${reminder.reminder_time || '00:00'}`);
        const notifyTime = new Date(reminderDateTime.getTime() - (reminder.notification_minutes_before * 60 * 1000));
        
        // Check if it's time to notify and we haven't notified recently
        return now >= notifyTime && now <= reminderDateTime;
      });

      setUpcomingReminders(remindersToNotify);

      // Send browser notifications
      if (notificationPermission === 'granted') {
        remindersToNotify.forEach(reminder => {
          showBrowserNotification(reminder);
        });
      }

    } catch (error) {
      console.error('Error checking upcoming reminders:', error);
    }
  };

  const showBrowserNotification = (reminder) => {
    if ('Notification' in window && notificationPermission === 'granted') {
      const title = `EyeMetrics Reminder: ${reminder.title}`;
      const options = {
        body: `${reminder.description || ''}\n${reminder.reminder_date} ${reminder.reminder_time || ''}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `reminder-${reminder.id}`,
        requireInteraction: true,
        silent: false
      };

      const notification = new Notification(title, options);

      notification.onclick = () => {
        window.focus();
        window.location.href = '/reminders';
        notification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);
    }
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(`${date}T${time || '00:00'}`);
    return dateObj.toLocaleString();
  };

  const dismissNotificationBanner = () => {
    setShowNotificationBanner(false);
  };

  if (!user) return null;

  return (
    <>
      {/* Notification Permission Banner */}
      {showNotificationBanner && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-blue-700">
                Enable browser notifications to get reminded about your upcoming appointments and medications.
              </p>
              <div className="mt-2">
                <div className="flex space-x-2">
                  <button
                    onClick={requestNotificationPermission}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                  >
                    Enable Notifications
                  </button>
                  <button
                    onClick={dismissNotificationBanner}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 text-xs px-3 py-1 rounded"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Reminders Widget */}
      {upcomingReminders.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-yellow-800">
              Upcoming Reminders ({upcomingReminders.length})
            </h3>
          </div>
          
          <div className="space-y-2">
            {upcomingReminders.map(reminder => (
              <div key={reminder.id} className="bg-white p-3 rounded border border-yellow-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{reminder.title}</h4>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(reminder.reminder_date, reminder.reminder_time)}
                    </p>
                    {reminder.profile && (
                      <p className="text-xs text-gray-500">
                        For: {reminder.profile.name}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    reminder.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    reminder.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    reminder.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {reminder.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ReminderNotifications;