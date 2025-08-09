// components/patient/PatientDashboard.js
import React from 'react';
import { Calendar, Heart, Pill, FileText, Plus } from 'lucide-react';

import PatientOverview from './PatientOverview';
import PatientAppointments from './PatientAppointments';
import PatientMedications from './PatientMedications';
import PatientLabReports from './PatientLabReports';
import PatientPersonalInfo from './PatientPersonalinfo';
import PatientSettings from './PatientSettings';

const PatientDashboard = ({ 
  user, 
  activeSection, 
  onAppointmentModalOpen,
  onSectionChange 
}) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <PatientOverview 
            user={user} 
            onAppointmentModalOpen={onAppointmentModalOpen}
            onSectionChange={onSectionChange}
          />
        );
      case 'appointments':
        return (
          <PatientAppointments 
            user={user} 
            onAppointmentModalOpen={onAppointmentModalOpen}
          />
        );
      case 'medications':
        return <PatientMedications user={user} />;
      case 'lab-reports':
        return <PatientLabReports user={user} />;
      case 'personal-info':
        return <PatientPersonalInfo user={user} />;
      case 'settings':
        return <PatientSettings user={user} />;
      default:
        return (
          <PatientOverview 
            user={user} 
            onAppointmentModalOpen={onAppointmentModalOpen}
            onSectionChange={onSectionChange}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.firstName || user?.name || 'Patient'}!
          </h1>
          <p className="text-gray-300 mt-1">
            Take control of your health journey
          </p>
        </div>
        
        {activeSection === 'dashboard' && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onAppointmentModalOpen(null, 'create')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        )}
      </div>
      
      {renderContent()}
    </div>
  );
};

export default PatientDashboard;