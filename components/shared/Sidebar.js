import React from 'react';
import { X, Heart, Stethoscope } from 'lucide-react';

const Sidebar = ({ 
  isOpen, 
  onClose, 
  navigationItems, 
  activeSection, 
  onNavigationChange, 
  user, 
  userType = 'patient' // 'patient' or 'doctor'
}) => {
  const getIcon = () => {
    return userType === 'doctor' ? Stethoscope : Heart;
  };

  const getTitle = () => {
    return userType === 'doctor' ? 'HealthCare AI' : 'HealthCare AI';
  };

  const getSubtitle = () => {
    if (userType === 'doctor') {
      return user ? `Dr. ${user.firstName} ${user.lastName} Portal` : 'Doctor Portal';
    }
    return user ? `${user.firstName} ${user.lastName} Portal` : 'Patient Portal';
  };

  const getUserDisplayName = () => {
    if (userType === 'doctor') {
      return user ? `Dr. ${user.firstName} ${user.lastName}` : 'Doctor';
    }
    return user ? `${user.firstName} ${user.lastName}` : 'Patient';
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return userType === 'doctor' ? 'DR' : 'PT';
  };

  const Icon = getIcon();

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/10 backdrop-blur-lg border-r border-white/10 transform transition-transform duration-300 lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${
            userType === 'doctor' ? 'from-blue-400 to-blue-600' : 'from-green-400 to-green-600'
          } flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">{getTitle()}</h2>
            <p className="text-xs text-gray-400">{getSubtitle()}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const ItemIcon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigationChange(item.id);
                onClose();
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeSection === item.id
                  ? `bg-gradient-to-r ${
                      userType === 'doctor' 
                        ? 'from-blue-400 to-blue-600' 
                        : 'from-green-400 to-green-600'
                    } text-white shadow-lg ${
                      userType === 'doctor' 
                        ? 'shadow-blue-500/30' 
                        : 'shadow-green-500/30'
                    }`
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ItemIcon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${
            userType === 'doctor' ? 'from-blue-400 to-blue-600' : 'from-green-400 to-green-600'
          } flex items-center justify-center`}>
            <span className="text-sm font-semibold text-white">
              {getUserInitials()}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">
              {getUserDisplayName()}
            </p>
            <p className="text-xs text-gray-400">
              {user?.email || (userType === 'doctor' ? 'email@hospital.com' : 'email@example.com')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;