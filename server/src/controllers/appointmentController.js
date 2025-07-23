const { runQuery, allQuery } = require('../config/database');
const { sendAppointmentNotification } = require('../services/notificationService');
const { sendToRole, sendToUser } = require('../services/socketService');
const { app: logger } = require('../services/logger');

const createAppointment = async (req, res) => {
  const { patientId, patientName, date, time, type, notes, healthWorkerId } = req.body;
  
  if (!patientId || !patientName || !date || !time || !type) {
    return res.status(400).json({ error: 'Missing required appointment fields' });
  }
  
  try {
    // Validate appointment time
    const appointmentDateTime = new Date(`${date}T${time}`);
    const appointmentDate = appointmentDateTime.getTime();
    
    if (appointmentDateTime <= new Date()) {
      return res.status(400).json({ error: 'Appointment time must be in the future' });
    }
    
    // Check for conflicts
    const conflictingAppointments = await allQuery(
      'SELECT * FROM appointments WHERE date = $1 AND time = $2 AND (patientId = $3 OR healthWorkerId = $4) AND status != $5',
      [date, time, patientId, healthWorkerId || req.user.id, 'cancelled']
    );
    
    if (conflictingAppointments.length > 0) {
      return res.status(409).json({ error: 'Time slot already booked' });
    }
    
    const newAppointment = {
      patientId,
      patientName,
      date,
      time,
      appointmentDate,
      type,
      notes: notes || '',
      healthWorkerId: healthWorkerId || req.user.id,
      status: 'scheduled',
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };
    
    const result = await runQuery(
      `INSERT INTO appointments (patientId, patientName, date, time, appointmentDate, type, notes, healthWorkerId, status, createdBy, createdAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      Object.values(newAppointment)
    );
    
    const appointmentWithId = { ...newAppointment, id: result.id };
    
    // Send notification to patient
    await sendAppointmentNotification({
      patientId,
      date,
      time,
      type,
      createdBy: req.user.id
    });
    
    // Send real-time update to all health workers
    sendToRole('health_worker', 'appointment:created', appointmentWithId);
    
    // Send real-time update to patient
    sendToUser(patientId, 'appointment:created', appointmentWithId);
    
    logger.info(`Appointment created: ${result.id} for patient ${patientId}`);
    
    res.status(201).json(appointmentWithId);
  } catch (error) {
    logger.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await allQuery('SELECT * FROM appointments');
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const appointments = await allQuery('SELECT * FROM appointments WHERE patientId = ?', [req.user.id]);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { createAppointment, getAllAppointments, getMyAppointments };