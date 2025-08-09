import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Camera, Bell, Lock, 
  Clock, Calendar, CreditCard, Shield, Eye, EyeOff,
  Save, Edit, Trash2, Plus, Settings, AlertCircle,
  CheckCircle, Globe, Smartphone, Monitor
} from 'lucide-react';

const DoctorSettings = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    emailAppointments: true,
    smsReminders: true,
    pushNotifications: false,
    marketingEmails: false
  });

  const [availabilitySlots, setAvailabilitySlots] = useState([
    { day: 'Monday', startTime: '09:00', endTime: '17:00', isActive: true },
    { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isActive: true },
    { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isActive: true },
    { day: 'Thursday', startTime: '09:00', endTime: '17:00', isActive: true },
    { day: 'Friday', startTime: '09:00', endTime: '17:00', isActive: true },
    { day: 'Saturday', startTime: '09:00', endTime: '13:00', isActive: true },
    { day: 'Sunday', startTime: '10:00', endTime: '14:00', isActive: false }
  ]);

  const [profileData, setProfileData] = useState({
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@healthcare.com',
    phone: '+91 98765 43210',
    specialization: 'Cardiologist',
    experience: '12 years',
    qualification: 'MBBS, MD Cardiology',
    license: 'MED12345',
    address: '123 Medical Center, Mumbai, Maharashtra',
    bio: 'Experienced cardiologist with expertise in interventional cardiology and heart disease prevention.',
    consultationFee: '500',
    followUpFee: '300'
  });

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ];

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleAvailabilityChange = (index, field, value) => {
    const updated = [...availabilitySlots];
    updated[index] = { ...updated[index], [field]: value };
    setAvailabilitySlots(updated);
  };

  const ProfileSettings = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Profile Photo</h3>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Upload Photo
            </button>
            <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Specialization</label>
            <select
              value={profileData.specialization}
              onChange={(e) => setProfileData({...profileData, specialization: e.target.value})}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option>Cardiologist</option>
              <option>Dermatologist</option>
              <option>Neurologist</option>
              <option>Orthopedist</option>
              <option>Pediatrician</option>
              <option>General Physician</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Experience</label>
            <input
              type="text"
              value={profileData.experience}
              onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Qualification</label>
          <input
            type="text"
            value={profileData.qualification}
            onChange={(e) => setProfileData({...profileData, qualification: e.target.value})}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Medical License Number</label>
          <input
            type="text"
            value={profileData.license}
            onChange={(e) => setProfileData({...profileData, license: e.target.value})}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Address</label>
          <textarea
            value={profileData.address}
            onChange={(e) => setProfileData({...profileData, address: e.target.value})}
            rows={2}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
            rows={3}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description about your practice and expertise"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Consultation Fees</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Consultation Fee (₹)</label>
            <input
              type="number"
              value={profileData.consultationFee}
              onChange={(e) => setProfileData({...profileData, consultationFee: e.target.value})}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Follow-up Fee (₹)</label>
            <input
              type="number"
              value={profileData.followUpFee}
              onChange={(e) => setProfileData({...profileData, followUpFee: e.target.value})}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const AvailabilitySettings = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Weekly Availability</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Break
          </button>
        </div>
        
        <div className="space-y-4">
          {availabilitySlots.map((slot, index) => (
            <div key={slot.day} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={slot.isActive}
                  onChange={(e) => handleAvailabilityChange(index, 'isActive', e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="w-20 font-medium">{slot.day}</span>
              </div>
              
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => handleAvailabilityChange(index, 'startTime', e.target.value)}
                  disabled={!slot.isActive}
                  className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => handleAvailabilityChange(index, 'endTime', e.target.value)}
                  disabled={!slot.isActive}
                  className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Appointment Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Slot Duration (minutes)</label>
            <select className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500">
              <option>15</option>
              <option>20</option>
              <option selected>30</option>
              <option>45</option>
              <option>60</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Buffer Time (minutes)</label>
            <select className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500">
              <option>0</option>
              <option selected>5</option>
              <option>10</option>
              <option>15</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Advance Booking (days)</label>
            <input
              type="number"
              defaultValue="30"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Same Day Booking</label>
            <select className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500">
              <option>Allowed</option>
              <option>Not Allowed</option>
              <option selected>Until 2 hours before</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const NotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">New Appointments</h4>
              <p className="text-sm text-gray-500">Get notified when patients book appointments</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.emailAppointments}
                onChange={() => handleNotificationChange('emailAppointments')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Marketing Emails</h4>
              <p className="text-sm text-gray-500">Receive updates about new features and tips</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.marketingEmails}
                onChange={() => handleNotificationChange('marketingEmails')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">SMS & Push Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">SMS Reminders</h4>
              <p className="text-sm text-gray-500">Send appointment reminders to patients</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.smsReminders}
                onChange={() => handleNotificationChange('smsReminders')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Push Notifications</h4>
              <p className="text-sm text-gray-500">Instant notifications on your device</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.pushNotifications}
                onChange={() => handleNotificationChange('pushNotifications')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const SecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-2 pr-10 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Update Password
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium">Enable 2FA</h4>
            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            Enable
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="font-medium">Desktop - Chrome</h4>
                <p className="text-sm text-gray-500">Mumbai, India • Active now</p>
              </div>
            </div>
            <span className="text-green-600 text-sm">Current Session</span>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="font-medium">Mobile - Safari</h4>
                <p className="text-sm text-gray-500">Mumbai, India • 2 hours ago</p>
              </div>
            </div>
            <button className="text-red-600 text-sm hover:text-red-700">Terminate</button>
          </div>
        </div>
      </div>
    </div>
  );

  const BillingSettings = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="font-medium">•••• •••• •••• 1234</h4>
                <p className="text-sm text-gray-500">Expires 12/25</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="text-blue-600 text-sm hover:text-blue-700">Edit</button>
              <button className="text-red-600 text-sm hover:text-red-700">Remove</button>
            </div>
          </div>
          
          <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-600 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Add Payment Method
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Business Name</label>
            <input
              type="text"
              defaultValue="Dr. Sarah Johnson Clinic"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">GST Number</label>
            <input
              type="text"
              placeholder="Enter GST number"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Billing Address</label>
            <textarea
              rows={3}
              defaultValue="123 Medical Center, Bandra West, Mumbai, Maharashtra 400050"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-semibold text-lg">Professional Plan</h4>
              <p className="text-gray-600">₹2,999/month</p>
            </div>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">Active</span>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Unlimited appointments</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Advanced analytics</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>24/7 support</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Upgrade Plan
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">
              View All Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Display Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input type="radio" name="theme" value="light" defaultChecked className="mr-2" />
                Light
              </label>
              <label className="flex items-center">
                <input type="radio" name="theme" value="dark" className="mr-2" />
                Dark
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500">
              <option>English</option>
              <option>Hindi</option>
              <option>Marathi</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Accessibility</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" /> Enable high-contrast mode
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" /> Enable text-to-speech
          </label>
        </div>
      </div>
    </div>
  

  // --- MAIN RETURN ---
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Doctor Settings</h2>
      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-64 bg-white rounded-lg shadow-sm border p-4 space-y-2">
          {settingsTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-md text-left ${
                activeTab === tab.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'availability' && <AvailabilitySettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'billing' && <BillingSettings />}
          {activeTab === 'preferences' && <PreferencesSettings />}
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;