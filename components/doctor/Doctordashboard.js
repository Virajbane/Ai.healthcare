// components/doctor/Doctordashboard.js
import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, CheckCircle, XCircle, Clock, 
  TrendingUp, Activity, AlertCircle, Eye, Edit,
  Phone, Mail, MapPin, FileText, Pill, Search,
  Filter, Download, Plus, MoreHorizontal
} from 'lucide-react';

import DoctorOverview from './DoctorOverview';
import DoctorAppointments from './DoctorAppointments';
import DoctorPatients from './DoctorPatients';
import DoctorLabReports from './DoctorLabReports';
import DoctorPrescriptions from './DoctorPrescriptions';
import DoctorAnalytics from './DoctorAnalytics';
import DoctorSettings from './DoctorSettings';

const DoctorDashboard = ({ 
  user, 
  activeSection, 
  onAppointmentModalOpen,
  onSectionChange 
}) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <DoctorOverview 
            user={user} 
            onAppointmentModalOpen={onAppointmentModalOpen}
            onSectionChange={onSectionChange}
          />
        );
      case 'appointments':
        return (
          <DoctorAppointments 
            user={user} 
            onAppointmentModalOpen={onAppointmentModalOpen}
          />
        );
      case 'patients':
        return <DoctorPatients user={user} />;
      case 'lab-reports':
        return <DoctorLabReports user={user} />;
      case 'prescriptions':
        return <DoctorPrescriptions user={user} />;
      case 'analytics':
        return <DoctorAnalytics user={user} />;
      case 'settings':
        return <DoctorSettings user={user} />;
      default:
        return (
          <DoctorOverview 
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

export default DoctorDashboard;