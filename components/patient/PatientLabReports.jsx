import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Eye } from 'lucide-react';
import { labReportApi } from '../../lib/api';
import LoadingSpinner from '../shared/LoadingSpinner';

const PatientLabReports = ({ user }) => {
  const [labReports, setLabReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLabReports();
  }, [user?.id]);

  const loadLabReports = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await labReportApi.getLabReports(user.id, 'patient');
      setLabReports(response.reports || []);
    } catch (error) {
      console.error('Error loading lab reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`File "${file.name}" selected for upload!`);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your lab reports..." />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-2xl font-bold mb-6">Lab Reports</h3>
        
        <div 
          className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-400/5 transition-all duration-300 cursor-pointer mb-6"
          onClick={() => document.getElementById('fileInput').click()}
        >
          <Upload className="w-12 h-12 text-blue-400 mx-auto mb-3" />
          <p className="text-gray-300">Click to upload new lab results</p>
          <input 
            type="file" 
            id="fileInput" 
            className="hidden" 
            accept=".pdf,.jpg,.png" 
            onChange={handleFileUpload}
          />
        </div>
        
        {labReports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No lab reports found</p>
            <p className="text-sm text-gray-500 mt-2">Upload your first lab report to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold mb-4">Recent Reports</h4>
            {labReports.map((report, index) => (
              <div key={report._id || index} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-white">{report.testType || report.name}</div>
                    <div className="text-sm text-gray-400">
                      {report.testDate ? new Date(report.testDate).toLocaleDateString() : report.date}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {report.status && (
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        report.status === 'completed' || report.status === 'reviewed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {report.status}
                      </div>
                    )}
                    <button className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors">
                      <Eye className="w-4 h-4 text-blue-400" />
                    </button>
                    <button className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors">
                      <Download className="w-4 h-4 text-green-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientLabReports;