import React from 'react';
import PatientOverview from './PatientOverview';
import PatientAppointments from './PatientAppointments';
import PatientMedications from './PatientMedications';
import PatientLabReports from './PatientLabReports';
import PatientPersonalInfo from './PatientPersonalInfo';
import PatientSettings from './PatientSettings';
import AIHealthAssistant from './AIHealthAssistant';

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
      case 'ai-chatbot':
        return <AIHealthAssistant user={user} />;
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
      {renderContent()}
    </div>
  );
};

export default PatientDashboard;