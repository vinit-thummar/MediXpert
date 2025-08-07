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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        setLoading(true);
        const data = await apiService.getSymptoms();
        setSymptoms(data.results || data);
      } catch (err) {
        setError('Failed to load symptoms');
        console.error('Symptoms error:', err);
      } finally {
        setLoading(false);
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
      const result = await apiService.predictDisease(
        selectedSymptoms,
        additionalSymptoms,
        notes
      );
      setPrediction(result);
    } catch (err) {
      let errorMsg = 'Failed to get prediction';
      if (err.response && err.response.data) {
        if (err.response.data.error) {
          errorMsg = err.response.data.error;
        } else if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        }
      }
      setError(errorMsg);
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSymptoms = symptoms.filter(symptom =>
    symptom.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Disease Diagnosis</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Search Box */}
            <div className="mb-6">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search Symptoms
              </label>
              <input
                type="text"
                id="search"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Type to search symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Symptoms List */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Symptoms ({selectedSymptoms.length} selected)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-4 border rounded-md">
                {loading ? (
                  <div className="col-span-full text-center">Loading symptoms...</div>
                ) : filteredSymptoms.length > 0 ? (
                  filteredSymptoms.map((symptom) => (
                    <div key={symptom.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`symptom-${symptom.id}`}
                        checked={selectedSymptoms.includes(symptom.name)}
                        onChange={() => handleSymptomToggle(symptom.name)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`symptom-${symptom.id}`}
                        className="ml-2 block text-sm text-gray-900"
                      >
                        {symptom.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center text-gray-500">
                    No symptoms found
                  </div>
                )}
              </div>
            </div>

            {/* Additional Symptoms */}
            <div className="mb-6">
              <label htmlFor="additional" className="block text-sm font-medium text-gray-700">
                Additional Symptoms
              </label>
              <textarea
                id="additional"
                rows="3"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Describe any other symptoms..."
                value={additionalSymptoms}
                onChange={(e) => setAdditionalSymptoms(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                rows="3"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || selectedSymptoms.length === 0}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${loading || selectedSymptoms.length === 0 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
              >
                {loading ? 'Analyzing...' : 'Get Diagnosis'}
              </button>
            </div>
          </form>

          {/* Prediction Results */}
          {prediction && prediction.prediction && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Diagnosis Results</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">Predicted Disease:</h4>
                  <p className="mt-1 text-gray-900">{prediction.prediction.predicted_disease?.name || 'N/A'}</p>
                </div>
                {typeof prediction.prediction.confidence_score !== 'undefined' && (
                  <div>
                    <h4 className="font-medium text-gray-700">Confidence:</h4>
                    <p className="mt-1 text-gray-900">{prediction.prediction.confidence_score}%</p>
                  </div>
                )}
                {prediction.prediction.notes && (
                  <div>
                    <h4 className="font-medium text-gray-700">Notes:</h4>
                    <p className="mt-1 text-gray-900">{prediction.prediction.notes}</p>
                  </div>
                )}
                {prediction.message && (
                  <div>
                    <h4 className="font-medium text-gray-700">Message:</h4>
                    <p className="mt-1 text-gray-900">{prediction.message}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Diagnosis;

