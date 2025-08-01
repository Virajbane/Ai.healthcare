import React from 'react';
import { Menu, Bell, MessageCircle } from 'lucide-react';

const DashboardHeader = ({ 
  activeSection, 
  navigationItems, 
  user, 
  userType = 'patient',
  onMenuClick,
  onNotificationClick,
  onMessageClick 
}) => {
  const getSectionTitle = () => {
    const item = navigationItems.find(item => item.id === activeSection);
    return item?.label || 'Dashboard';
  };

  const getWelcomeMessage = () => {
    if (userType === 'doctor') {
      return user ? `Welcome back, Dr. ${user.firstName} ${user.lastName}` : 'Welcome back';
    }
    return user ? `Welcome back, ${user.firstName} ${user.lastName}` : 'Welcome back';
  };

  return (
    <header className="bg-white/5 backdrop-blur-lg border-b border-white/10 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">
              {getSectionTitle()}
            </h1>
            <p className="text-gray-400">
              {getWelcomeMessage()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={onNotificationClick}
            className="relative p-2 text-gray-400 hover:text-white"
          >
            <Bell className="w-5 h-5" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full"></div>
          </button>
          <button 
            onClick={onMessageClick}
            className="relative p-2 text-gray-400 hover:text-white"
          >
            <MessageCircle className="w-5 h-5" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-blue-400 rounded-full"></div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;