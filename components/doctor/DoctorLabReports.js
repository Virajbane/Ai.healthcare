import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, Download, Upload, Eye, 
  Calendar, User, AlertTriangle, CheckCircle, Clock,
  TrendingUp, TrendingDown, Activity, Plus, MoreHorizontal
} from 'lucide-react';
import { labReportApi, patientApi, formatDate, formatTime } from '../../utils/api';

const DoctorLabReports = ({ user }) => {
  const [labReports, setLabReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [patientFilter, setPatientFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    critical: 0
  });

  useEffect(() => {
    loadLabReports();
    loadPatients();
  }, [user?.id]);

  useEffect(() => {
    filterReports();
  }, [labReports, searchTerm, statusFilter, patientFilter]);

  const loadLabReports = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const reportsData = await labReportApi.getDoctorLabReports(user.id);
      setLabReports(reportsData);
      calculateStats(reportsData);
      setError(null);
    } catch (err) {
      setError('Failed to load lab reports');
      console.error('Error loading lab reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatients = async () => {
    if (!user?.id) return;
    
    try {
      const patientsData = await patientApi.getPatients(user.id);
      setPatients(patientsData);
    } catch (err) {
      console.error('Error loading patients:', err);
    }
  };

  const calculateStats = (reports) => {
    const stats = {
      total: reports.length,
      pending: reports.filter(r => r.status === 'pending').length,
      completed: reports.filter(r => r.status === 'completed').length,
      critical: reports.filter(r => r.priority === 'high' || r.flagged).length
    };
    setStats(stats);
  };

  const filterReports = () => {
    let filtered = labReports;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.labName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Patient filter
    if (patientFilter !== 'all') {
      filtered = filtered.filter(report => report.patientId === patientFilter);
    }

    setFilteredReports(filtered);
  };

  const handleReportView = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleDownloadReport = async (reportId) => {
    try {
      await labReportApi.downloadLabReport(reportId);
    } catch (err) {
      console.error('Error downloading report:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in-progress':
        return <Activity className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getResultTrend = (result) => {
    if (result?.trend === 'up') return <TrendingUp className="w-4 h-4 text-red-400" />;
    if (result?.trend === 'down') return <TrendingDown className="w-4 h-4 text-green-400" />;
    return null;
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
          <AlertTriangle className="w-5 h-5 text-red-400" />
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
          <h1 className="text-2xl font-bold text-white">Lab Reports</h1>
          <p className="text-gray-300 mt-1">Review and manage patient lab results</p>
        </div>
        <button className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Upload Report</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Reports</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Critical</p>
              <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search reports..."
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
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
        </select>
        <select
          value={patientFilter}
          onChange={(e) => setPatientFilter(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Patients</option>
          {patients.map((patient) => (
            <option key={patient._id} value={patient._id}>
              {patient.firstName} {patient.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Reports Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Lab
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredReports.map((report) => (
                <tr key={report._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white flex items-center space-x-2">
                        <span>{report.testName}</span>
                        {report.flagged && <AlertTriangle className="w-4 h-4 text-red-400" />}
                        {getResultTrend(report.result)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {report.patientName || 'Unknown Patient'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{formatDate(report.testDate)}</div>
                    <div className="text-sm text-gray-400">{formatTime(report.testDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(report.status)}
                      <span className="text-sm capitalize text-white">
                        {report.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm capitalize ${getPriorityColor(report.priority)}`}>
                      {report.priority || 'normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {report.labName || 'Lab Corp'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleReportView(report)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="View Report"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadReport(report._id)}
                        className="text-green-400 hover:text-green-300 transition-colors"
                        title="Download Report"
                      >
                        <Download className="w-4 h-4" />
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

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-300">No lab reports found</h3>
            <p className="mt-1 text-sm text-gray-400">
              {searchTerm || statusFilter !== 'all' || patientFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Lab reports will appear here once uploaded.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white">Lab Report Details</h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              
              {/* Report Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <label className="text-sm text-gray-400">Test Name</label>
                  <p className="text-white font-medium">{selectedReport.testName}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <label className="text-sm text-gray-400">Patient</label>
                  <p className="text-white font-medium">{selectedReport.patientName}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <label className="text-sm text-gray-400">Test Date</label>
                  <p className="text-white font-medium">{formatDate(selectedReport.testDate)}</p>
                </div>
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <label className="text-sm text-gray-400">Status</label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(selectedReport.status)}
                    <span className="text-white capitalize">{selectedReport.status}</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <label className="text-sm text-gray-400">Priority</label>
                  <p className={`font-medium capitalize mt-1 ${getPriorityColor(selectedReport.priority)}`}>
                    {selectedReport.priority || 'normal'}
                  </p>
                </div>
              </div>

              {/* Test Results */}
              {selectedReport.results && selectedReport.results.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Test Results</h4>
                  <div className="bg-white/5 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Parameter
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Value
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Reference Range
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {selectedReport.results.map((result, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-white">{result.parameter}</td>
                            <td className="px-4 py-3 text-sm text-white font-medium">
                              {result.value} {result.unit}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-300">{result.referenceRange}</td>
                            <td className="px-4 py-3">
                              <span className={`text-sm px-2 py-1 rounded ${
                                result.status === 'normal' ? 'bg-green-500/20 text-green-300' :
                                result.status === 'high' ? 'bg-red-500/20 text-red-300' :
                                result.status === 'low' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-gray-500/20 text-gray-300'
                              }`}>
                                {result.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Comments and Notes */}
              {selectedReport.comments && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Lab Comments</h4>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-300">{selectedReport.comments}</p>
                  </div>
                </div>
              )}

              {selectedReport.doctorNotes && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Doctor Notes</h4>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-300">{selectedReport.doctorNotes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadReport(selectedReport._id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Add Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorLabReports;