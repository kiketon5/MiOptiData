import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getAllProfiles, getMetrics } from '../../utils/api';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const AnalyticsDashboard = () => {
  const { user } = useContext(AuthContext);
  const [profiles, setProfiles] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [selectedProfile, setSelectedProfile] = useState('all');

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, selectedTimeframe, selectedProfile]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const profilesData = await getAllProfiles();
      setProfiles(profilesData);

      let allMetrics = [];
      for (const profile of profilesData) {
        const metrics = await getMetrics(profile.id);
        allMetrics = [...allMetrics, ...metrics.map(m => ({ ...m, profileName: profile.name }))];
      }

      if (selectedProfile !== 'all') {
        allMetrics = allMetrics.filter(m => m.profileId === selectedProfile);
      }

      // Filter by timeframe
      const cutoffDate = new Date();
      switch (selectedTimeframe) {
        case '3months':
          cutoffDate.setMonth(cutoffDate.getMonth() - 3);
          break;
        case '6months':
          cutoffDate.setMonth(cutoffDate.getMonth() - 6);
          break;
        case '1year':
          cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
          break;
        case '2years':
          cutoffDate.setFullYear(cutoffDate.getFullYear() - 2);
          break;
        default:
          cutoffDate.setMonth(cutoffDate.getMonth() - 6);
      }

      allMetrics = allMetrics.filter(m => new Date(m.recordDate) >= cutoffDate);

      const analytics = processAnalyticsData(allMetrics);
      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (metrics) => {
    const prescriptionMetrics = metrics.filter(m => m.recordType === 'prescription');
    const visualAcuityMetrics = metrics.filter(m => m.recordType === 'visualAcuity');

    // Prescription trend analysis
    const prescriptionTrend = prescriptionMetrics
      .sort((a, b) => new Date(a.recordDate) - new Date(b.recordDate))
      .map(m => ({
        date: new Date(m.recordDate).toLocaleDateString(),
        leftSphere: m.data.leftSphere || 0,
        rightSphere: m.data.rightSphere || 0,
        leftCylinder: Math.abs(m.data.leftCylinder || 0),
        rightCylinder: Math.abs(m.data.rightCylinder || 0)
      }));

    // Visual acuity trends
    const acuityTrend = visualAcuityMetrics
      .sort((a, b) => new Date(a.recordDate) - new Date(b.recordDate))
      .map(m => ({
        date: new Date(m.recordDate).toLocaleDateString(),
        leftEye: convertAcuityToNumber(m.data.leftEyeAcuity),
        rightEye: convertAcuityToNumber(m.data.rightEyeAcuity)
      }));

    // Statistics
    const stats = {
      totalExams: metrics.length,
      avgSphereChange: calculateAverageSphereChange(prescriptionTrend),
      visionStability: calculateVisionStability(acuityTrend),
      lastExamDate: metrics.length > 0 ? 
        new Date(Math.max(...metrics.map(m => new Date(m.recordDate)))).toLocaleDateString() : 'N/A'
    };

    // Prescription distribution
    const prescriptionTypes = prescriptionMetrics.reduce((acc, m) => {
      const type = m.data.prescriptionType || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      prescriptionTrend,
      acuityTrend,
      stats,
      prescriptionTypes
    };
  };

  const convertAcuityToNumber = (acuity) => {
    if (!acuity || typeof acuity !== 'string') return 0;
    const match = acuity.match(/(\d+)\/(\d+)/);
    if (match) {
      return parseInt(match[2]) / parseInt(match[1]);
    }
    return 0;
  };

  const calculateAverageSphereChange = (trend) => {
    if (trend.length < 2) return 0;
    let totalChange = 0;
    for (let i = 1; i < trend.length; i++) {
      const prevLeft = trend[i-1].leftSphere;
      const prevRight = trend[i-1].rightSphere;
      const currLeft = trend[i].leftSphere;
      const currRight = trend[i].rightSphere;
      totalChange += Math.abs(currLeft - prevLeft) + Math.abs(currRight - prevRight);
    }
    return (totalChange / (trend.length - 1)).toFixed(2);
  };

  const calculateVisionStability = (trend) => {
    if (trend.length < 2) return 100;
    let stability = 100;
    for (let i = 1; i < trend.length; i++) {
      const change = Math.abs(trend[i].leftEye - trend[i-1].leftEye) + 
                    Math.abs(trend[i].rightEye - trend[i-1].rightEye);
      stability -= change * 10;
    }
    return Math.max(0, stability).toFixed(0);
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Value'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
        <div className="flex gap-4">
          <select
            value={selectedProfile}
            onChange={(e) => setSelectedProfile(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Profiles</option>
            {profiles.map(profile => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="2years">Last 2 Years</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Exams</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData?.stats.totalExams || 0}</p>
            </div>
            <div className="text-blue-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Vision Stability</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData?.stats.visionStability || 0}%</p>
            </div>
            <div className="text-green-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Avg Sphere Change</p>
              <p className="text-2xl font-bold text-gray-900">±{analyticsData?.stats.avgSphereChange || 0}</p>
            </div>
            <div className="text-yellow-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Last Exam</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData?.stats.lastExamDate}</p>
            </div>
            <div className="text-purple-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Prescription Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Prescription Trends</h3>
          {analyticsData?.prescriptionTrend && analyticsData.prescriptionTrend.length > 0 ? (
            <Line
              data={{
                labels: analyticsData.prescriptionTrend.map(d => d.date),
                datasets: [
                  {
                    label: 'Left Eye Sphere',
                    data: analyticsData.prescriptionTrend.map(d => d.leftSphere),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                  },
                  {
                    label: 'Right Eye Sphere',
                    data: analyticsData.prescriptionTrend.map(d => d.rightSphere),
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4
                  }
                ]
              }}
              options={chartOptions}
            />
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No prescription data available for the selected timeframe</p>
            </div>
          )}
        </div>

        {/* Visual Acuity Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Visual Acuity Trends</h3>
          {analyticsData?.acuityTrend && analyticsData.acuityTrend.length > 0 ? (
            <Line
              data={{
                labels: analyticsData.acuityTrend.map(d => d.date),
                datasets: [
                  {
                    label: 'Left Eye',
                    data: analyticsData.acuityTrend.map(d => d.leftEye),
                    borderColor: 'rgb(168, 85, 247)',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    tension: 0.4
                  },
                  {
                    label: 'Right Eye',
                    data: analyticsData.acuityTrend.map(d => d.rightEye),
                    borderColor: 'rgb(245, 158, 11)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4
                  }
                ]
              }}
              options={chartOptions}
            />
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No visual acuity data available for the selected timeframe</p>
            </div>
          )}
        </div>
      </div>

      {/* Prescription Types Distribution */}
      {analyticsData?.prescriptionTypes && Object.keys(analyticsData.prescriptionTypes).length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Prescription Types Distribution</h3>
            <Doughnut
              data={{
                labels: Object.keys(analyticsData.prescriptionTypes),
                datasets: [{
                  data: Object.values(analyticsData.prescriptionTypes),
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                  ],
                  borderWidth: 2,
                  borderColor: '#fff'
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>

          {/* Cylinder Power Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Astigmatism Analysis</h3>
            {analyticsData?.prescriptionTrend && analyticsData.prescriptionTrend.length > 0 ? (
              <Bar
                data={{
                  labels: analyticsData.prescriptionTrend.map(d => d.date),
                  datasets: [
                    {
                      label: 'Left Eye Cylinder',
                      data: analyticsData.prescriptionTrend.map(d => d.leftCylinder),
                      backgroundColor: 'rgba(59, 130, 246, 0.8)',
                      borderColor: 'rgb(59, 130, 246)',
                      borderWidth: 1
                    },
                    {
                      label: 'Right Eye Cylinder',
                      data: analyticsData.prescriptionTrend.map(d => d.rightCylinder),
                      backgroundColor: 'rgba(34, 197, 94, 0.8)',
                      borderColor: 'rgb(34, 197, 94)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Cylinder Power (Diopters)'
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No astigmatism data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Insights Panel */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold mb-4 text-blue-800">📊 Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Vision Stability</h4>
            <p className="text-sm text-gray-600">
              {analyticsData?.stats.visionStability > 80 
                ? "Your vision has been very stable over time. Keep up with regular check-ups!" 
                : analyticsData?.stats.visionStability > 60
                ? "Your vision shows some changes. Consider discussing with your eye care professional."
                : "Significant vision changes detected. Please consult your eye care professional soon."}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Prescription Changes</h4>
            <p className="text-sm text-gray-600">
              {analyticsData?.stats.avgSphereChange < 0.5 
                ? "Minimal prescription changes indicate stable eye health."
                : analyticsData?.stats.avgSphereChange < 1.0
                ? "Moderate prescription changes are normal as you age."
                : "Significant prescription changes may require more frequent monitoring."}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Exam Frequency</h4>
            <p className="text-sm text-gray-600">
              {analyticsData?.stats.totalExams > 2 
                ? "Good job maintaining regular eye exams!"
                : "Consider scheduling more frequent eye exams for better monitoring."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;