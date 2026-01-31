const { allQuery, runQuery } = require('../config/database');
const { sendTransportBookingNotification } = require('./notificationService');
const { maternal: logger } = require('./logger');

async function checkAndBookTransport() {
  try {
    const pregnancies = await allQuery('SELECT * FROM pregnancies');
    const today = new Date();

    for (const pregnancy of pregnancies) {
      const dueDate = new Date(pregnancy.estimatedDueDate);
      const daysUntilDue = (dueDate - today) / (1000 * 60 * 60 * 24);

      // pregnancy.transportBooked is already a boolean from PostgreSQL
      if (daysUntilDue <= 7 && !pregnancy.transportBooked) {
        logger.info(`Booking transport for patient ${pregnancy.patientId} (Pregnancy ID: ${pregnancy.id})`);
        
        // alerts is already an array/object from PostgreSQL JSONB type
        const alerts = pregnancy.alerts || [];
        alerts.push(`Transport booked on ${today.toISOString().split('T')[0]}`);

        await runQuery(
          `UPDATE pregnancies SET transportBooked = $1, alerts = $2 WHERE id = $3`,
          [true, alerts, pregnancy.id]
        );
        
        // Send notification to patient about transport booking
        await sendTransportBookingNotification({
          patientId: pregnancy.patientId,
          dueDate: pregnancy.estimatedDueDate,
          pregnancyId: pregnancy.id
        });
      }
    }
  } catch (error) {
    logger.error('Error in maternal health scheduler:', { error });
  }
}

function startTransportScheduler() {
  logger.info('Starting maternal health scheduler...');
  // Run once on startup
  checkAndBookTransport();
  // Then run every 24 hours
  setInterval(checkAndBookTransport, 24 * 60 * 60 * 1000);
  
  // Monitor system usage
  setInterval(async () => {
    try {
      const activePregnancies = await allQuery('SELECT COUNT(*) as count FROM pregnancies WHERE transportBooked = false');
      logger.info(`Active pregnancies without transport booked: ${activePregnancies[0].count}`);
    } catch (error) {
      logger.error('Error monitoring pregnancies:', { error });
    }
  }, 60000); // Log active pregnancies every minute
}

module.exports = { startTransportScheduler };