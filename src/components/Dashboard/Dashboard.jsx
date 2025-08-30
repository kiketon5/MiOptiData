import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ReminderNotifications from "../Reminders/ReminderNotifications";
import { supabase } from "../../lib/supabase";

const Dashboard = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Real data fetching from Supabase
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("app_061iy_profiles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (profilesError) throw profilesError;

      // Fetch upcoming reminders
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      const { data: remindersData, error: remindersError } = await supabase
        .from("app_061iy_reminders")
        .select(
          `
          *,
          profile:app_061iy_profiles(name, relationship)
        `
        )
        .eq("user_id", user.id)
        .eq("is_active", true)
        .eq("is_completed", false)
        .gte("reminder_date", today.toISOString().split("T")[0])
        .lte("reminder_date", nextWeek.toISOString().split("T")[0])
        .order("reminder_date", { ascending: true })
        .limit(5);

      if (remindersError) throw remindersError;

      setProfiles(profilesData || []);
      setReminders(remindersData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4"
        role="alert"
      >
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-2">
          Welcome,{" "}
          {user?.user_metadata?.full_name ||
            user?.email?.split("@")[0] ||
            "User"}
          !
        </h1>
        <p className="text-lg">
          Track, manage, and share your eye health metrics in one place.
        </p>
      </div>

      {/* Notification System */}
      <ReminderNotifications />

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/profiles/new"
          className="bg-white p-5 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        >
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 p-3 rounded-full mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-lg">Add Profile</h3>
            <p className="text-gray-600 text-sm mt-1">
              Create a new profile for yourself or a family member
            </p>
          </div>
        </Link>

        <Link
          to="/reminders/new"
          className="bg-white p-5 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        >
          <div className="flex flex-col items-center text-center">
            <div className="bg-indigo-100 p-3 rounded-full mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-lg">Set Reminder</h3>
            <p className="text-gray-600 text-sm mt-1">
              Schedule appointments or medication reminders
            </p>
          </div>
        </Link>

        <Link
          to="/profiles"
          className="bg-white p-5 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        >
          <div className="flex flex-col items-center text-center">
            <div className="bg-green-100 p-3 rounded-full mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-lg">View Records</h3>
            <p className="text-gray-600 text-sm mt-1">
              Check your eye health metrics history
            </p>
          </div>
        </Link>
      </div>

      {/* Profiles Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Profiles</h2>
          <Link
            to="/profiles"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <>
          {profiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profiles.map((profile) => (
                <Link
                  to={`/profiles/${profile.id}/edit`} // Navega al perfil correspondiente
                  key={profile.id}
                  className="block border p-4 rounded-lg shadow hover:shadow-md transition hover:bg-gray-50"
                >
                  <h3 className="font-semibold text-lg mb-1">{profile.name}</h3>
                  <p className="text-sm text-gray-600">
                    {profile.relationship}
                  </p>

                  {/* Opcional: mostrar más info como edad o color de ojos */}
                  {profile.date_of_birth && (
                    <p className="text-xs text-gray-500 mt-1">
                      Date Of Birth:{" "}
                      {new Date(profile.date_of_birth).toLocaleDateString()}
                    </p>
                  )}
                  {profile.eye_color && (
                    <p className="text-xs text-gray-500 mt-1">
                      Eye Color: {profile.eye_color}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <>
              <div className="text-center py-12">
                <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No profiles yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Create your first profile to start tracking eye health metrics
                </p>
                <button
                  onClick={() => navigate("/profiles/new")}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Your First Profile
                </button>
              </div>
            </>
          )}
        </>
      </div>

      {/* Reminders Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upcoming Reminders</h2>
          <Link
            to="/reminders"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </Link>
        </div>

        {reminders.length > 0 ? (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {reminder.reminder_type === "exam"
                          ? "👁️"
                          : reminder.reminder_type === "prescription"
                          ? "💊"
                          : reminder.reminder_type === "checkup"
                          ? "🩺"
                          : reminder.reminder_type === "medication"
                          ? "💉"
                          : reminder.reminder_type === "appointment"
                          ? "📅"
                          : "⏰"}
                      </span>
                      <h3 className="font-semibold text-gray-900">
                        {reminder.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          reminder.priority === "urgent"
                            ? "bg-red-100 text-red-800"
                            : reminder.priority === "high"
                            ? "bg-orange-100 text-orange-800"
                            : reminder.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {reminder.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-x-4">
                      <span>
                        📅{" "}
                        {new Date(reminder.reminder_date).toLocaleDateString()}
                      </span>
                      {reminder.reminder_time && (
                        <span>
                          🕐{" "}
                          {new Date(
                            `2000-01-01T${reminder.reminder_time}`
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                      {reminder.profile && (
                        <span>👤 {reminder.profile.name}</span>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/reminders/${reminder.id}/edit`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No upcoming reminders
            </h3>
            <p className="text-gray-500 mb-4">
              Set up reminders to stay on top of your eye health appointments
            </p>
            <button
              onClick={() => navigate("/reminders/new")}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Your First Reminder
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
