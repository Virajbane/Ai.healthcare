import React, { useState, useEffect } from 'react';
import { Pill, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { medicationApi } from '../../lib/api';
import LoadingSpinner from '../shared/LoadingSpinner';

const PatientMedications = ({ user }) => {
  const [medications, setMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMedications();
  }, [user?.id]);

  const loadMedications = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await medicationApi.getMedications(user.id);
      setMedications(response.medications || []);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your medications..." />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Medication Tracker</h3>
          <button className="flex items-center bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300">
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </button>
        </div>
        
        {medications.length === 0 ? (
          <div className="text-center py-12">
            <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-300 mb-2">No medications found</h4>
            <p className="text-gray-400 mb-6">Add your first medication to start tracking</p>
            <button className="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300">
              Add First Medication
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map((med, index) => (
              <div key={med._id || index} className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{med.name}</h4>
                  <p className="text-sm text-gray-400">{med.dosage} • {med.frequency}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  med.status === 'ok' || med.status === 'active'
                    ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' 
                    : 'bg-gradient-to-r from-red-400 to-red-600 text-white'
                }`}>
                  {med.status || 'Active'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientMedications;