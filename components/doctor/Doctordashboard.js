// components/doctor/DoctorDashboard.js
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
      case 'ai-assistant':
        return (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Assistant</h2>
                  <p className="text-gray-300">AI-powered medical insights and recommendations</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">Diagnosis Assistant</h3>
                <p className="text-gray-300 mb-4">Get AI-powered diagnostic suggestions based on symptoms and patient data.</p>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all">
                  Launch Assistant
                </button>
              </div>
              
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">Treatment Recommendations</h3>
                <p className="text-gray-300 mb-4">Access evidence-based treatment protocols and medication suggestions.</p>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all">
                  View Protocols
                </button>
              </div>
              
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">Drug Interactions</h3>
                <p className="text-gray-300 mb-4">Check for potential drug interactions and contraindications.</p>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all">
                  Check Interactions
                </button>
              </div>
            </div>
          </div>
        );
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, Dr. {user?.lastName || user?.name || 'Doctor'}
          </h1>
          <p className="text-gray-300 mt-1">
            Here's your medical practice overview for today
          </p>
        </div>
        
        {activeSection === 'dashboard' && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onAppointmentModalOpen(null, 'create')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Appointment</span>
            </button>
          </div>
        )}
      </div>
      
      {renderContent()}
    </div>
  );
};

export default DoctorDashboard;