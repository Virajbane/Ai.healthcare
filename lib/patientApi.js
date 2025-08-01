// lib/patientApi.js
export const patientApi = {
  // Get all patients for a doctor
  async getPatients(doctorId) {
    try {
      const response = await fetch(`/api/patients?doctorId=${doctorId}`);
      if (!response.ok) throw new Error('Failed to fetch patients');
      return await response.json();
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  // Get patient by ID
  async getPatient(patientId) {
    try {
      const response = await fetch(`/api/patients/${patientId}`);
      if (!response.ok) throw new Error('Failed to fetch patient');
      return await response.json();
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  },

  // Create new patient
  async createPatient(patientData) {
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });
      if (!response.ok) throw new Error('Failed to create patient');
      return await response.json();
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  // Update patient
  async updatePatient(patientId, updateData) {
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error('Failed to update patient');
      return await response.json();
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  },

  // Delete patient
  async deletePatient(patientId) {
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete patient');
      return await response.json();
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  },

  // Get patient statistics for dashboard
  async getPatientStats(doctorId) {
    try {
      const response = await fetch(`/api/patients/stats?doctorId=${doctorId}`);
      if (!response.ok) throw new Error('Failed to fetch patient stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching patient stats:', error);
      throw error;
    }
  },
};