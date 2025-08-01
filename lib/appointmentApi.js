// lib/appointmentApi.js
export const appointmentApi = {
  // Get appointments for a user
  async getAppointments(userId, userType) {
    try {
      const response = await fetch(`/api/appointments?userId=${userId}&userType=${userType}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return await response.json();
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // Get upcoming appointments
  async getUpcomingAppointments(userId, userType, limit = 5) {
    try {
      const response = await fetch(`/api/appointments/upcoming?userId=${userId}&userType=${userType}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch upcoming appointments');
      return await response.json();
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw error;
    }
  },

  // Create new appointment
  async createAppointment(appointmentData) {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      if (!response.ok) throw new Error('Failed to create appointment');
      return await response.json();
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  // Update appointment
  async updateAppointment(appointmentId, updateData) {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error('Failed to update appointment');
      return await response.json();
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  // Delete appointment
  async deleteAppointment(appointmentId) {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete appointment');
      return await response.json();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  },
}; 