import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await apiService.getDashboard();
        setDashboardData(data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to access your dashboard.</p>
          <Link to="/login" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.first_name || user.username}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your health journey with MediXpert
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/diagnosis"
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">New Diagnosis</h3>
                <p className="text-gray-600">Start a new symptom analysis</p>
              </div>
            </div>
          </Link>

          <Link
            to="/history"
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">View History</h3>
                <p className="text-gray-600">See past diagnoses</p>
              </div>
            </div>
          </Link>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
                <p className="text-gray-600">Manage your account</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {dashboardData?.total_predictions || 0}
              </div>
              <div className="text-gray-600">Total Diagnoses</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">
                {dashboardData?.total_health_records || 0}
              </div>
              <div className="text-gray-600">Health Records</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {dashboardData?.recent_predictions?.length || 0}
              </div>
              <div className="text-gray-600">Recent Diagnoses</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {user ? new Date(user.date_joined).getFullYear() : '2024'}
              </div>
              <div className="text-gray-600">Member Since</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Predictions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Diagnoses</h3>
            {dashboardData?.recent_predictions?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recent_predictions.map((prediction) => (
                  <div key={prediction.id} className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {prediction.predicted_disease.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Confidence: {prediction.confidence_score.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(prediction.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        prediction.predicted_disease.severity === 'high' ? 'bg-red-100 text-red-800' :
                        prediction.predicted_disease.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {prediction.predicted_disease.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-600 mb-4">No diagnoses yet</p>
                <Link
                  to="/diagnosis"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Start Your First Diagnosis
                </Link>
              </div>
            )}
          </div>

          {/* Health Tips */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Health Tips</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Stay Hydrated</h4>
                <p className="text-blue-800 text-sm">
                  Drink at least 8 glasses of water daily to maintain optimal health.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Regular Exercise</h4>
                <p className="text-green-800 text-sm">
                  Aim for at least 30 minutes of moderate exercise most days of the week.
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Balanced Diet</h4>
                <p className="text-yellow-800 text-sm">
                  Include plenty of fruits, vegetables, and whole grains in your diet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

