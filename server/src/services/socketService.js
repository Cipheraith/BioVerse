const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { socket: logger } = require('./logger');
const { getQuery } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  logger.warn('WARNING: JWT_SECRET is not set. Socket authentication will be insecure.');
}

let io;
const connectedUsers = new Map();
const userSockets = new Map();

// Socket.IO authentication middleware
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    logger.warn('Socket connection rejected: No token provided');
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    socket.username = decoded.username;
    next();
  } catch (error) {
    logger.warn('Socket connection rejected: Invalid token');
    next(new Error('Authentication error'));
  }
};

// Setup Socket.IO server
const setupSocketIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.username} (${socket.userId}) - Role: ${socket.userRole}`);

    // Store user connection
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      username: socket.username,
      role: socket.userRole,
      connectedAt: new Date(),
    });

    userSockets.set(socket.userId, socket);

    // Join role-based rooms
    socket.join(`role:${socket.userRole}`);
    socket.join(`user:${socket.userId}`);

    // Handle user status updates
    socket.on('user:status', (status) => {
      logger.debug(`User ${socket.username} status update: ${status}`);
      socket.broadcast.emit('user:status:update', {
        userId: socket.userId,
        username: socket.username,
        status: status,
        timestamp: new Date(),
      });
    });

    // Handle real-time appointment scheduling
    socket.on('appointment:schedule', async (appointmentData) => {
      logger.info(`Appointment scheduled by ${socket.username}: ${JSON.stringify(appointmentData)}`);

      try {
        // Validate incoming data
        if (!appointmentData.patientId || !appointmentData.date || !appointmentData.time || !appointmentData.type) {
          return socket.emit('appointment:error', { message: 'Missing required fields for appointment scheduling.' });
        }

        // Check for existing appointments
        const existingAppointments = await getQuery('SELECT * FROM appointments WHERE date = $1 AND time = $2 AND (patientId = $3 OR healthWorkerId = $4)', [appointmentData.date, appointmentData.time, appointmentData.patientId, socket.userId]);
        
        if (existingAppointments) {
          return socket.emit('appointment:error', { message: 'Appointment slot already booked.' });
        }

        // Create appointment
        const result = await runQuery(`INSERT INTO appointments (patientId, healthWorkerId, date, time, type, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`, [appointmentData.patientId, socket.userId, appointmentData.date, appointmentData.time, appointmentData.type, appointmentData.notes]);
        
        const newAppointment = { ...appointmentData, id: result.id, healthWorkerId: socket.userId, status: 'scheduled' };
        
        // Notify health worker (self)
        socket.emit('appointment:scheduled', newAppointment);

        // Notify patient
        sendToUser(appointmentData.patientId, 'appointment:scheduled', newAppointment);

        // Notify other health workers
        sendToRole('health_worker', 'appointment:new', newAppointment);
      } catch (error) {
        logger.error('Error scheduling appointment:', error);
        socket.emit('appointment:error', { message: 'Failed to schedule appointment due to server error.' });
      }
    });

    // Handle appointment cancellation
    socket.on('appointment:cancel', async (appointmentId) => {
      logger.info(`Appointment cancellation requested by ${socket.username} for ID: ${appointmentId}`);

      try {
        await runQuery('UPDATE appointments SET status = $1 WHERE id = $2', ['cancelled', appointmentId]);

        // Notify user and health worker
        socket.emit('appointment:cancelled', { id: appointmentId });
        sendToUser(socket.userId, 'appointment:cancelled', { id: appointmentId });
        sendToRole('health_worker', 'appointment:cancelled', { id: appointmentId });
      } catch (error) {
        logger.error('Error cancelling appointment:', error);
        socket.emit('appointment:error', { message: 'Failed to cancel appointment due to server error.' });
      }
    });

    // Handle emergency alerts
    socket.on('emergency:alert', async (alertData) => {
      logger.info(`Emergency alert from ${socket.username}: ${JSON.stringify(alertData)}`);

      let patientDetails = {};
      if (alertData.patientId) {
        try {
          const patient = await getQuery('SELECT * FROM patients WHERE id = $1', [alertData.patientId]);
          if (patient) {
            patientDetails = {
              name: patient.name,
              dateOfBirth: patient.dateOfBirth,
              gender: patient.gender,
              contact: patient.contact,
              address: patient.address,
              medicalHistory: JSON.parse(patient.medicalHistory || '[]'),
              bloodType: patient.bloodType,
              allergies: JSON.parse(patient.allergies || '[]'),
              chronicConditions: JSON.parse(patient.chronicConditions || '[]'),
              medications: JSON.parse(patient.medications || '[]'),
              lastCheckupDate: patient.lastCheckupDate,
              riskFactors: JSON.parse(patient.riskFactors || '[]'),
            };
          }
        } catch (error) {
          logger.error(`Error fetching patient details for emergency alert: ${error.message}`);
        }
      }

      const emergencyPayload = {
        alertId: alertData.id || Date.now(), // Use provided ID or generate one
        patientId: alertData.patientId,
        location: alertData.location,
        severity: alertData.severity,
        symptoms: alertData.symptoms,
        timestamp: new Date(),
        reportedBy: socket.username,
        patientDetails: patientDetails, // Include comprehensive patient data
      };

      // Notify all ambulance drivers and health workers
      io.to('role:ambulance_driver').emit('emergency:new', emergencyPayload);
      io.to('role:health_worker').emit('emergency:new', emergencyPayload);

      // Notify MOH for high severity alerts
      if (alertData.severity === 'high' || alertData.severity === 'critical') {
        io.to('role:moh').emit('emergency:critical', emergencyPayload);
      }
    });

    // Handle emergency acknowledgement
    socket.on('emergency:acknowledge', (ackData) => {
      logger.info(`Emergency acknowledged by ${socket.username} (${socket.userRole}): ${JSON.stringify(ackData)}`);

      // Notify the patient (if connected) and MOH that the emergency has been acknowledged
      if (ackData.patientId && userSockets.has(ackData.patientId)) {
        io.to(`user:${ackData.patientId}`).emit('emergency:acknowledged', {
          alertId: ackData.alertId,
          acknowledgedBy: socket.username,
          role: socket.userRole,
          timestamp: new Date(),
          message: 'Your emergency alert has been acknowledged. Help is on the way.'
        });
      }

      io.to('role:moh').emit('emergency:acknowledged', {
        alertId: ackData.alertId,
        acknowledgedBy: socket.username,
        role: socket.userRole,
        timestamp: new Date(),
      });

      // Optionally, notify other health workers/ambulance drivers that someone has acknowledged
      socket.broadcast.to('role:health_worker').emit('emergency:acknowledged:broadcast', {
        alertId: ackData.alertId,
        acknowledgedBy: socket.username,
        role: socket.userRole,
        timestamp: new Date(),
      });
      socket.broadcast.to('role:ambulance_driver').emit('emergency:acknowledged:broadcast', {
        alertId: ackData.alertId,
        acknowledgedBy: socket.username,
        role: socket.userRole,
        timestamp: new Date(),
      });
    });

    // Handle ambulance location updates
    socket.on('ambulance:location', (locationData) => {
      if (socket.userRole === 'ambulance_driver') {
        logger.debug(`Ambulance location update from ${socket.username}`);

        // Broadcast to dispatch and MOH
        io.to('role:moh').emit('ambulance:location:update', {
          ambulanceId: socket.userId,
          driverName: socket.username,
          location: locationData.location,
          status: locationData.status,
          timestamp: new Date(),
        });

        // Broadcast to health workers in the area
        io.to('role:health_worker').emit('ambulance:location:update', {
          ambulanceId: socket.userId,
          driverName: socket.username,
          location: locationData.location,
          status: locationData.status,
          timestamp: new Date(),
        });
      }
    });

    // Handle health worker patient updates
    socket.on('patient:update', (patientData) => {
      if (socket.userRole === 'health_worker' || socket.userRole === 'admin') {
        logger.debug(`Patient update from ${socket.username}: Patient ${patientData.patientId}`);

        // Notify MOH about patient updates
        io.to('role:moh').emit('patient:status:update', {
          patientId: patientData.patientId,
          status: patientData.status,
          notes: patientData.notes,
          updatedBy: socket.username,
          timestamp: new Date(),
        });

        // Notify the patient if they're connected
        if (patientData.patientId && userSockets.has(patientData.patientId)) {
          io.to(`user:${patientData.patientId}`).emit('patient:update', {
            status: patientData.status,
            notes: patientData.notes,
            updatedBy: socket.username,
            timestamp: new Date(),
          });
        }
      }
    });

    // Handle chat messages
    socket.on('message:send', (messageData) => {
      logger.debug(`Message from ${socket.username} to ${messageData.recipientId}`);

      // Send to specific user
      if (messageData.recipientId && userSockets.has(messageData.recipientId)) {
        io.to(`user:${messageData.recipientId}`).emit('message:receive', {
          senderId: socket.userId,
          senderName: socket.username,
          message: messageData.message,
          timestamp: new Date(),
        });
      }
    });

    // Handle appointment notifications
    socket.on('appointment:created', (appointmentData) => {
      logger.debug(`Appointment created by ${socket.username}`);

      // Notify the patient
      if (appointmentData.patientId && userSockets.has(appointmentData.patientId)) {
        io.to(`user:${appointmentData.patientId}`).emit('appointment:notification', {
          type: 'created',
          appointment: appointmentData,
          timestamp: new Date(),
        });
      }

      // Notify health workers
      io.to('role:health_worker').emit('appointment:created', {
        appointment: appointmentData,
        createdBy: socket.username,
        timestamp: new Date(),
      });
    });

    // Handle maternal health alerts
    socket.on('maternal:alert', (alertData) => {
      logger.info(`Maternal health alert from ${socket.username}: ${JSON.stringify(alertData)}`);

      // Notify all health workers and MOH
      io.to('role:health_worker').emit('maternal:alert:new', {
        patientId: alertData.patientId,
        alertType: alertData.type,
        severity: alertData.severity,
        notes: alertData.notes,
        timestamp: new Date(),
        reportedBy: socket.username,
      });

      io.to('role:moh').emit('maternal:alert:new', {
        patientId: alertData.patientId,
        alertType: alertData.type,
        severity: alertData.severity,
        notes: alertData.notes,
        timestamp: new Date(),
        reportedBy: socket.username,
      });
    });

    // Handle symptom trend alerts
    socket.on('symptom:trend:alert', (trendData) => {
      if (socket.userRole === 'admin' || socket.userRole === 'moh') {
        logger.info(`Symptom trend alert from ${socket.username}: ${JSON.stringify(trendData)}`);

        // Notify all relevant health workers
        io.to('role:health_worker').emit('symptom:trend:alert', {
          location: trendData.location,
          symptom: trendData.symptom,
          trend: trendData.trend,
          count: trendData.count,
          timestamp: new Date(),
        });
      }
    });

    // Handle pharmacy stock updates
    socket.on('pharmacy:stock:update', (stockData) => {
      if (socket.userRole === 'pharmacy') {
        logger.debug(`Pharmacy stock update from ${socket.username}`);

        // Notify MOH about stock levels
        io.to('role:moh').emit('pharmacy:stock:update', {
          pharmacyId: socket.userId,
          pharmacyName: socket.username,
          medication: stockData.medication,
          quantity: stockData.quantity,
          status: stockData.status,
          timestamp: new Date(),
        });

        // Notify health workers about low stock
        if (stockData.status === 'low' || stockData.status === 'out') {
          io.to('role:health_worker').emit('pharmacy:stock:alert', {
            pharmacyId: socket.userId,
            pharmacyName: socket.username,
            medication: stockData.medication,
            status: stockData.status,
            timestamp: new Date(),
          });
        }
      }
    });

    // Handle user typing indicators
    socket.on('typing:start', (data) => {
      if (data.recipientId && userSockets.has(data.recipientId)) {
        io.to(`user:${data.recipientId}`).emit('typing:start', {
          senderId: socket.userId,
          senderName: socket.username,
        });
      }
    });

    socket.on('typing:stop', (data) => {
      if (data.recipientId && userSockets.has(data.recipientId)) {
        io.to(`user:${data.recipientId}`).emit('typing:stop', {
          senderId: socket.userId,
          senderName: socket.username,
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${socket.username} (${socket.userId}) - Reason: ${reason}`);

      // Remove user from connected users
      connectedUsers.delete(socket.userId);
      userSockets.delete(socket.userId);

      // Notify others about user going offline
      socket.broadcast.emit('user:offline', {
        userId: socket.userId,
        username: socket.username,
        timestamp: new Date(),
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${socket.username}: ${error.message}`);
    });
  });

  logger.info('Socket.IO server initialized successfully');
  return io;
};

// Utility functions to send messages from other parts of the application
const sendToUser = (userId, event, data) => {
  if (userSockets.has(userId)) {
    userSockets.get(userId).emit(event, data);
    return true;
  }
  return false;
};

const sendToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
    return true;
  }
  return false;
};

const sendToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
    return true;
  }
  return false;
};

const getConnectedUsers = () => {
  return Array.from(connectedUsers.values());
};

const getUserSocketInfo = (userId) => {
  return connectedUsers.get(userId);
};

const isUserConnected = (userId) => {
  return connectedUsers.has(userId);
};

module.exports = {
  setupSocketIO,
  sendToUser,
  sendToRole,
  sendToAll,
  getConnectedUsers,
  getUserSocketInfo,
  isUserConnected,
};
