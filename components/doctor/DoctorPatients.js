import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Plus, Eye, Edit, Phone, Mail, 
  Calendar, AlertCircle, CheckCircle, Clock, Activity,
  ChevronRight, Download, Upload, MoreHorizontal
} from 'lucide-react';
import { patientApi, formatDate, getStatusColor } from '../../utils/api';

const DoctorPatients = ({ user }) => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    critical: 0,
    stable: 0
  });

  useEffect(() => {
    loadPatients();
    loadPatientStats();
  }, [user?.id]);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, statusFilter]);

  const loadPatients = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const patientsData = await patientApi.getPatients(user.id);
      setPatients(patientsData);
      setError(null);
    } catch (err) {
      setError('Failed to load patients');
      console.error('Error loading patients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatientStats = async () => {
    if (!user?.id) return;
    
    try {
      const statsData = await patientApi.getPatientStats(user.id);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading patient stats:', err);
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => patient.status === statusFilter);
    }

    setFilteredPatients(filtered);
  };

  const handlePatientView = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'stable':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'monitoring':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'improving':
        return <Activity className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Patients</h1>
          <p className="text-gray-300 mt-1">Manage and monitor your patients</p>
        </div>
        <button className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Patients</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Stable</p>
              <p className="text-2xl font-bold text-green-400">{stats.stable}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Critical</p>
              <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Active</p>
              <p className="text-2xl font-bold text-blue-400">{stats.active}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="stable">Stable</option>
          <option value="critical">Critical</option>
          <option value="monitoring">Monitoring</option>
          <option value="improving">Improving</option>
        </select>
      </div>

      {/* Patients Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Last Visit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Next Appointment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredPatients.map((patient) => (
                <tr key={patient._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                        {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-400">
                          Age {patient.age}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{patient.email}</div>
                    <div className="text-sm text-gray-400">{patient.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(patient.status)}
                      <span className={`text-sm capitalize ${getStatusColor(patient.status)}`}>
                        {patient.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {patient.lastVisit ? formatDate(patient.lastVisit) : 'No visits'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {patient.nextAppointment ? formatDate(patient.nextAppointment) : 'None scheduled'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handlePatientView(patient)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-300 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-300 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-300">No patients found</h3>
            <p className="mt-1 text-sm text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first patient.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Patient Detail Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white">Patient Details</h3>
                <button
                  onClick={() => setShowPatientModal(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              
              {/* Patient Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                    {selectedPatient.firstName?.charAt(0)}{selectedPatient.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h4>
                    <p className="text-gray-400">Age {selectedPatient.age} • {selectedPatient.gender}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-white">{selectedPatient.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Phone</label>
                    <p className="text-white">{selectedPatient.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Status</label>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedPatient.status)}
                      <span className={`capitalize ${getStatusColor(selectedPatient.status)}`}>
                        {selectedPatient.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Last Visit</label>
                    <p className="text-white">
                      {selectedPatient.lastVisit ? formatDate(selectedPatient.lastVisit) : 'No visits'}
                    </p>
                  </div>
                </div>

                {selectedPatient.currentConditions && selectedPatient.currentConditions.length > 0 && (
                  <div>
                    <label className="text-sm text-gray-400">Current Conditions</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedPatient.currentConditions.map((condition, index) => (
                        <span key={index} className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-sm">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                  <div>
                    <label className="text-sm text-gray-400">Allergies</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedPatient.allergies.map((allergy, index) => (
                        <span key={index} className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-sm">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPatient.notes && (
                  <div>
                    <label className="text-sm text-gray-400">Notes</label>
                    <p className="text-white mt-1">{selectedPatient.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPatientModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Edit Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;