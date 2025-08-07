import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { Link } from 'react-router-dom';

const Diagnosis = () => {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [additionalSymptoms, setAdditionalSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const data = await apiService.getSymptoms();
        setSymptoms(data.results || data);
      } catch (err) {
        setError('Failed to load symptoms');
        console.error('Symptoms error:', err);
      }
    };

    fetchSymptoms();
  }, []);

  const handleSymptomToggle = (symptomName) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomName)
        ? prev.filter(s => s !== symptomName)
        : [...prev, symptomName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await apiService.predictDisease(selectedSymptoms, additionalSymptoms, notes);
      setPrediction(result.prediction);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get diagnosis');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetDiagnosis = () => {
    setSelectedSymptoms([]);
    setAdditionalSymptoms('');
    setNotes('');
    setPrediction(null);
    setError('');
    setStep(1);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to access the diagnosis tool.</p>
          <Link to="/login" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Disease Diagnosis</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select your symptoms and get an AI-powered preliminary diagnosis. 
            Remember, this is not a substitute for professional medical advice.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-primary' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 3 ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Symptoms</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {symptoms.map((symptom) => (
                  <div
                    key={symptom.id}
                    onClick={() => handleSymptomToggle(symptom.name)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedSymptoms.includes(symptom.name)
                        ? 'border-primary bg-blue-50 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold capitalize">
                          {symptom.name.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {symptom.description}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        selectedSymptoms.includes(symptom.name)
                          ? 'bg-primary border-primary'
                          : 'border-gray-300'
                      }`}>
                        {selectedSymptoms.includes(symptom.name) && (
                          <svg className="w-3 h-3 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <div className="text-sm text-gray-600">
                  Selected: {selectedSymptoms.length} symptoms
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={selectedSymptoms.length === 0}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Information</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Symptoms:</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedSymptoms.map((symptom) => (
                      <span
                        key={symptom}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {symptom.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="additionalSymptoms" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Symptoms (Optional)
                  </label>
                  <textarea
                    id="additionalSymptoms"
                    value={additionalSymptoms}
                    onChange={(e) => setAdditionalSymptoms(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Describe any other symptoms you're experiencing..."
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Any additional information about your condition..."
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Analyzing...' : 'Get Diagnosis'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && prediction && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Diagnosis Results</h2>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Predicted Condition: {prediction.predicted_disease.name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    prediction.predicted_disease.severity === 'high' ? 'bg-red-100 text-red-800' :
                    prediction.predicted_disease.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {prediction.predicted_disease.severity} severity
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4">
                  {prediction.predicted_disease.description}
                </p>
                
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">Confidence Score:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${prediction.confidence_score}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {prediction.confidence_score.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                <div className="flex">
                  <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-yellow-800">Important Disclaimer</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      This is a preliminary AI-based analysis and should not replace professional medical advice. 
                      Please consult with a healthcare provider for proper diagnosis and treatment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={resetDiagnosis}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  New Diagnosis
                </button>
                <div className="space-x-4">
                  <Link
                    to="/history"
                    className="bg-secondary text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    View History
                  </Link>
                  <Link
                    to="/dashboard"
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Diagnosis;

