// lib/labReportApi.js
export const labReportApi = {
  // Get lab reports for a doctor
  async getLabReports(doctorId, status = null) {
    try {
      const url = status 
        ? `/api/lab-reports?doctorId=${doctorId}&status=${status}`
        : `/api/lab-reports?doctorId=${doctorId}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch lab reports');
      return await response.json();
    } catch (error) {
      console.error('Error fetching lab reports:', error);
      throw error;
    }
  },

  // Get lab report by ID
  async getLabReport(reportId) {
    try {
      const response = await fetch(`/api/lab-reports/${reportId}`);
      if (!response.ok) throw new Error('Failed to fetch lab report');
      return await response.json();
    } catch (error) {
      console.error('Error fetching lab report:', error);
      throw error;
    }
  },

  // Create new lab report
  async createLabReport(reportData) {
    try {
      const response = await fetch('/api/lab-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });
      if (!response.ok) throw new Error('Failed to create lab report');
      return await response.json();
    } catch (error) {
      console.error('Error creating lab report:', error);
      throw error;
    }
  },

  // Update lab report
  async updateLabReport(reportId, updateData) {
    try {
      const response = await fetch(`/api/lab-reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error('Failed to update lab report');
      return await response.json();
    } catch (error) {
      console.error('Error updating lab report:', error);
      throw error;
    }
  },

  // Delete lab report
  async deleteLabReport(reportId) {
    try {
      const response = await fetch(`/api/lab-reports/${reportId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete lab report');
      return await response.json();
    } catch (error) {
      console.error('Error deleting lab report:', error);
      throw error;
    }
  },

  // Get lab report statistics
  async getLabReportStats(doctorId) {
    try {
      const response = await fetch(`/api/lab-reports/stats?doctorId=${doctorId}`);
      if (!response.ok) throw new Error('Failed to fetch lab report stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching lab report stats:', error);
      throw error;
    }
  },
};