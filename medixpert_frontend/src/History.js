import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

const History = () => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const data = await apiService.getPredictions();
        setPredictions(data.results || data);
      } catch (err) {
        setError('Failed to load prediction history');
        console.error('History error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPredictions();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to view your history.</p>
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
          <p className="text-gray-600">Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Diagnosis History</h1>
          <p className="text-gray-600">
            View all your previous AI-powered health diagnoses and track your health journey.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {predictions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">No Diagnoses Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't performed any diagnoses yet. Start your health journey with our AI-powered diagnosis tool.
            </p>
            <Link
              to="/diagnosis"
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              Start Your First Diagnosis
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mr-4">
                        {prediction.predicted_disease.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        prediction.predicted_disease.severity === 'high' ? 'bg-red-100 text-red-800' :
                        prediction.predicted_disease.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        prediction.predicted_disease.severity === 'critical' ? 'bg-red-200 text-red-900' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {prediction.predicted_disease.severity} severity
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4">
                      {prediction.predicted_disease.description}
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Symptoms Analyzed:</h4>
                        <div className="flex flex-wrap gap-2">
                          {prediction.symptoms.map((symptom) => (
                            <span
                              key={symptom.id}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                            >
                              {symptom.name.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Confidence Score:</h4>
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${
                                prediction.confidence_score >= 80 ? 'bg-green-500' :
                                prediction.confidence_score >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${prediction.confidence_score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {prediction.confidence_score.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {prediction.additional_symptoms && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Additional Symptoms:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {prediction.additional_symptoms}
                        </p>
                      </div>
                    )}

                    {prediction.notes && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {prediction.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="lg:ml-6 lg:text-right">
                    <div className="text-sm text-gray-500 mb-2">
                      {new Date(prediction.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="flex lg:flex-col gap-2">
                      <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                        View Details
                      </button>
                      <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                        Export
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 text-center">
          <Link
            to="/diagnosis"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold mr-4"
          >
            New Diagnosis
          </Link>
          <Link
            to="/dashboard"
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default History;

