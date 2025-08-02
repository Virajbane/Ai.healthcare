// lib/socket.js
import { io } from 'socket.io-client';

// Use the same base URL as your API
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socket = null;

export const initializeSocket = (userId) => {
  if (typeof window === 'undefined') return null;
  
  if (!socket || socket.disconnected) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      if (userId) {
        socket.emit('join', userId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Health metrics real-time updates
export const subscribeToHealthMetrics = (userId, callback) => {
  if (!socket) return;
  
  socket.on('health_metrics_updated', callback);
  
  return () => socket.off('health_metrics_updated', callback);
};

// Medication real-time updates
export const subscribeToMedications = (userId, callback) => {
  if (!socket) return;
  
  const handlers = {
    medication_added: callback,
    medication_updated: callback,
    medication_deleted: callback,
  };

  Object.entries(handlers).forEach(([event, handler]) => {
    socket.on(event, handler);
  });

  return () => {
    Object.keys(handlers).forEach(event => {
      socket.off(event, callback);
    });
  };
};

// Appointment real-time updates
export const subscribeToAppointments = (userId, callback) => {
  if (!socket) return;
  
  const handlers = {
    new_appointment: callback,
    appointment_updated: callback,
    appointment_approved: callback,
    appointment_rejected: callback,
  };

  Object.entries(handlers).forEach(([event, handler]) => {
    socket.on(event, handler);
  });

  return () => {
    Object.keys(handlers).forEach(event => {
      socket.off(event, callback);
    });
  };
};

// Notification real-time updates
export const subscribeToNotifications = (userId, callback) => {
  if (!socket) return;
  
  socket.on('notification', callback);
  
  return () => socket.off('notification', callback);
};

// Lab reports real-time updates
export const subscribeToLabReports = (userId, callback) => {
  if (!socket) return;
  
  socket.on('new_lab_report', callback);
  
  return () => socket.off('new_lab_report', callback);
};