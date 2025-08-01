import React, { useState } from 'react';
import { User, Edit, Phone, Mail, Calendar, Heart } from 'lucide-react';

const PatientPersonalInfo = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Personal Health Record</h3>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center bg-gradient-to-r from-purple-400 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? 'Save Changes' : 'Edit Information'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-400" />
                Basic Information
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                  <p className="text-white font-medium">
                    {user ? `${user.firstName} ${user.lastName}` : 'John Doe'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date of Birth</label>
                  <p className="text-white">January 15, 1990</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Age</label>
                  <p className="text-white">34 years</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Gender</label>
                  <p className="text-white">Male</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Blood Type</label>
                  <p className="text-white">A+</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-green-400" />
                Contact Information
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <p className="text-white">{user?.email || 'john.doe@example.com'}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone</label>
                  <p className="text-white">+1 (555) 123-4567</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Address</label>
                  <p className="text-white">123 Main St, City, State 12345</p>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-400" />
                Medical Information
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Height</label>
                  <p className="text-white">5'6" (168 cm)</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Weight</label>
                  <p className="text-white">145 lbs (66 kg)</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">BMI</label>
                  <p className="text-white">23.4 (Normal)</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Allergies</label>
                  <p className="text-white">Penicillin, Shellfish</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-4">Emergency Contact</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name</label>
                  <p className="text-white">Jane Doe (Spouse)</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone</label>
                  <p className="text-white">+1 (555) 123-4568</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Relationship</label>
                  <p className="text-white">Spouse</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-4">Medical History</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white">Hypertension</span>
                  <span className="text-sm text-gray-400">2018</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Appendectomy</span>
                  <span className="text-sm text-gray-400">2015</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Diabetes Type 2</span>
                  <span className="text-sm text-gray-400">2020</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientPersonalInfo;