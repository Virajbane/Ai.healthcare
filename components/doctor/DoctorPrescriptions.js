import React, { useState } from 'react';
import { 
  Search, Filter, Download, Plus, Eye, Edit, Trash2,
  Pill, Calendar, User, FileText, AlertCircle, Clock,
  MoreHorizontal, CheckCircle, XCircle
} from 'lucide-react';

const DoctorPrescriptions = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showNewPrescriptionModal, setShowNewPrescriptionModal] = useState(false);

  // Sample prescription data
  const prescriptions = [
    {
      id: 'PRX-001',
      patientName: 'John Doe',
      patientAge: 45,
      patientId: 'P-001',
      date: '2024-08-08',
      status: 'Active',
      medications: [
        { name: 'Amoxicillin', dosage: '500mg', frequency: 'TID', duration: '7 days' },
        { name: 'Paracetamol', dosage: '650mg', frequency: 'QID', duration: '5 days' }
      ],
      diagnosis: 'Upper Respiratory Infection',
      instructions: 'Take with food. Complete the full course.',
      followUpDate: '2024-08-15',
      pharmacy: 'MedPlus Pharmacy'
    },
    {
      id: 'PRX-002',
      patientName: 'Sarah Wilson',
      patientAge: 32,
      patientId: 'P-002',
      date: '2024-08-07',
      status: 'Completed',
      medications: [
        { name: 'Metformin', dosage: '850mg', frequency: 'BID', duration: '30 days' }
      ],
      diagnosis: 'Type 2 Diabetes',
      instructions: 'Monitor blood glucose levels daily.',
      followUpDate: '2024-09-07',
      pharmacy: 'Apollo Pharmacy'
    },
    {
      id: 'PRX-003',
      patientName: 'Michael Johnson',
      patientAge: 55,
      patientId: 'P-003',
      date: '2024-08-06',
      status: 'Pending',
      medications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'OD', duration: '30 days' },
        { name: 'Amlodipine', dosage: '5mg', frequency: 'OD', duration: '30 days' }
      ],
      diagnosis: 'Hypertension',
      instructions: 'Monitor blood pressure twice daily.',
      followUpDate: '2024-09-06',
      pharmacy: 'Wellness Pharmacy'
    }
  ];

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || prescription.status.toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const NewPrescriptionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">New Prescription</h2>
          <button
            onClick={() => setShowNewPrescriptionModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Patient</label>
              <select className="w-full p-2 border rounded-md">
                <option>Select Patient</option>
                <option>John Doe</option>
                <option>Sarah Wilson</option>
                <option>Michael Johnson</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                defaultValue="2024-08-08"
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Diagnosis</label>
            <input
              type="text"
              placeholder="Enter diagnosis"
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Medications</label>
            <div className="border rounded-md p-4 space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <input placeholder="Medication" className="p-2 border rounded" />
                <input placeholder="Dosage" className="p-2 border rounded" />
                <input placeholder="Frequency" className="p-2 border rounded" />
                <input placeholder="Duration" className="p-2 border rounded" />
              </div>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Medication
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Instructions</label>
            <textarea
              placeholder="Special instructions for the patient"
              rows={3}
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Follow-up Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preferred Pharmacy</label>
              <select className="w-full p-2 border rounded-md">
                <option>Select Pharmacy</option>
                <option>MedPlus Pharmacy</option>
                <option>Apollo Pharmacy</option>
                <option>Wellness Pharmacy</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowNewPrescriptionModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                // Handle form submission here
                setShowNewPrescriptionModal(false);
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Prescription
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const PrescriptionDetailsModal = ({ prescription }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Prescription Details</h2>
          <button
            onClick={() => setSelectedPrescription(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Prescription ID</label>
              <p className="font-semibold">{prescription.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Date</label>
              <p className="font-semibold">{prescription.date}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Patient</label>
              <p className="font-semibold">{prescription.patientName} ({prescription.patientAge}y)</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                {getStatusIcon(prescription.status)}
                {prescription.status}
              </span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Diagnosis</label>
            <p className="font-semibold">{prescription.diagnosis}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500 mb-2 block">Medications</label>
            <div className="space-y-2">
              {prescription.medications.map((med, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <Pill className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold">{med.name}</span>
                  </div>
                  <div className="text-sm text-gray-600 ml-6">
                    <span className="font-medium">Dosage:</span> {med.dosage} | 
                    <span className="font-medium"> Frequency:</span> {med.frequency} | 
                    <span className="font-medium"> Duration:</span> {med.duration}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Instructions</label>
            <p className="text-gray-700">{prescription.instructions}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Follow-up Date</label>
              <p className="font-semibold">{prescription.followUpDate}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Pharmacy</label>
              <p className="font-semibold">{prescription.pharmacy}</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 pt-6 border-t">
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-600">Manage and track patient prescriptions</p>
        </div>
        <button
          onClick={() => setShowNewPrescriptionModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Prescription
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-blue-600">42</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">98</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">16</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Prescriptions</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prescription ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnosis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medications</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPrescriptions.map((prescription) => (
                <tr key={prescription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-blue-600">{prescription.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{prescription.patientName}</p>
                        <p className="text-sm text-gray-500">{prescription.patientAge}y old</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prescription.date}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{prescription.diagnosis}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {prescription.medications.length} medication{prescription.medications.length > 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                      {getStatusIcon(prescription.status)}
                      {prescription.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPrescription(prescription)}
                        className="text-blue-600 hover:text-blue-700"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-700"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        title="More options"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showNewPrescriptionModal && <NewPrescriptionModal />}
      {selectedPrescription && <PrescriptionDetailsModal prescription={selectedPrescription} />}
    </div>
  );
};

export default DoctorPrescriptions;