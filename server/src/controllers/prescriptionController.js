const { runQuery, getQuery, allQuery } = require('../config/database');
const logger = require('../config/logger');

// Helper function to parse JSONB fields if necessary (though pg handles it for direct queries)
const parsePrescription = (prescription) => {
    if (!prescription) return null;
    return {
        ...prescription,
        medications: prescription.medications || [],
    };
};

/**
 * Create a new prescription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createPrescription = async (req, res) => {
    const { patient_id, doctor_id, medications, delivery_address, notes } = req.body;

    // Basic validation
    if (!patient_id || !doctor_id || !medications || medications.length === 0) {
        return res.status(400).json({ message: 'Missing required prescription fields: patient_id, doctor_id, medications.' });
    }

    try {
        const result = await runQuery(
            `INSERT INTO prescriptions (patient_id, doctor_id, medications, delivery_address, notes)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [patient_id, doctor_id, JSON.stringify(medications), delivery_address, notes]
        );
        const newPrescription = result.rows ? result.rows[0] : result; // runQuery returns {id} or {rows: [obj]} depending on RETURNING
        logger.info(`Prescription created: ${newPrescription.id} for patient ${patient_id}`);
        res.status(201).json(parsePrescription(newPrescription));
    } catch (error) {
        logger.error('Error creating prescription:', error);
        res.status(500).json({ message: 'Failed to create prescription due to an internal error.' });
    }
};

/**
 * Get a prescription by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPrescriptionById = async (req, res) => {
    const { id } = req.params;

    try {
        const prescription = await getQuery('SELECT * FROM prescriptions WHERE id = $1', [id]);
        if (prescription) {
            // Authorization check: Only patient, doctor, pharmacy, or admin can view
            if (req.user.role === 'patient' && req.user.id !== prescription.patient_id.toString()) {
                return res.status(403).json({ message: 'Access Denied: Patients can only view their own prescriptions.' });
            }
            if (req.user.role === 'doctor' && req.user.id !== prescription.doctor_id.toString()) {
                return res.status(403).json({ message: 'Access Denied: Doctors can only view their own prescriptions.' });
            }
            if (req.user.role === 'pharmacy' && req.user.id !== prescription.pharmacy_id.toString()) {
                return res.status(403).json({ message: 'Access Denied: Pharmacies can only view their assigned prescriptions.' });
            }
            res.json(parsePrescription(prescription));
        } else {
            res.status(404).json({ message: 'Prescription not found.' });
        }
    } catch (error) {
        logger.error('Error fetching prescription by ID:', error);
        res.status(500).json({ message: 'Failed to retrieve prescription due to an internal error.' });
    }
};

/**
 * Update prescription status (e.g., by pharmacy or courier)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePrescriptionStatus = async (req, res) => {
    const { id } = req.params;
    const { status, pharmacy_id } = req.body;

    // Validate status
    const validStatuses = ['issued', 'pending_pharmacy', 'filled', 'in_delivery', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid or missing status.' });
    }

    try {
        let prescription = await getQuery('SELECT * FROM prescriptions WHERE id = $1', [id]);
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found.' });
        }

        // Authorization: Only admin, pharmacy, or courier (ambulance_driver role for now) can update status
        if (!(['admin', 'pharmacy', 'ambulance_driver'].includes(req.user.role))) {
            return res.status(403).json({ message: 'Access Denied: Only authorized roles can update prescription status.' });
        }

        // If status is being set to 'pending_pharmacy' or 'filled', pharmacy_id must be provided and match user's ID
        if (['pending_pharmacy', 'filled'].includes(status)) {
            if (!pharmacy_id || req.user.id.toString() !== pharmacy_id.toString()) {
                return res.status(400).json({ message: 'Pharmacy ID must be provided and match authenticated user for this status.' });
            }
            // If pharmacy_id is being set for the first time
            if (!prescription.pharmacy_id) {
                await runQuery('UPDATE prescriptions SET status = $1, pharmacy_id = $2, updated_at = NOW() WHERE id = $3', [status, pharmacy_id, id]);
            } else if (prescription.pharmacy_id.toString() !== pharmacy_id.toString()) {
                return res.status(403).json({ message: 'Prescription already assigned to a different pharmacy.' });
            } else {
                await runQuery('UPDATE prescriptions SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
            }
        } else {
            // For other statuses (in_delivery, delivered, cancelled), just update status
            await runQuery('UPDATE prescriptions SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
        }

        prescription = await getQuery('SELECT * FROM prescriptions WHERE id = $1', [id]); // Fetch updated prescription
        res.json(parsePrescription(prescription));
    } catch (error) {
        logger.error('Error updating prescription status:', error);
        res.status(500).json({ message: 'Failed to update prescription status due to an internal error.' });
    }
};

/**
 * Get prescriptions for a specific patient
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPrescriptionsByPatient = async (req, res) => {
    const { patientId } = req.params;

    // Authorization: Patient can only view their own, admin/doctor/moh can view any
    if (req.user.role === 'patient' && req.user.id.toString() !== patientId.toString()) {
        return res.status(403).json({ message: 'Access Denied: Patients can only view their own prescriptions.' });
    }

    try {
        const prescriptions = await allQuery('SELECT * FROM prescriptions WHERE patient_id = $1 ORDER BY issue_date DESC', [patientId]);
        res.json(prescriptions.map(parsePrescription));
    } catch (error) {
        logger.error('Error fetching prescriptions by patient:', error);
        res.status(500).json({ message: 'Failed to retrieve prescriptions due to an internal error.' });
    }
};

/**
 * Get prescriptions assigned to a specific pharmacy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPrescriptionsByPharmacy = async (req, res) => {
    const { pharmacyId } = req.params;

    // Authorization: Pharmacy can only view their own, admin/moh can view any
    if (req.user.role === 'pharmacy' && req.user.id.toString() !== pharmacyId.toString()) {
        return res.status(403).json({ message: 'Access Denied: Pharmacies can only view their own assigned prescriptions.' });
    }

    try {
        const prescriptions = await allQuery('SELECT * FROM prescriptions WHERE pharmacy_id = $1 ORDER BY issue_date DESC', [pharmacyId]);
        res.json(prescriptions.map(parsePrescription));
    } catch (error) {
        logger.error('Error fetching prescriptions by pharmacy:', error);
        res.status(500).json({ message: 'Failed to retrieve prescriptions due to an internal error.' });
    }
};

module.exports = {
    createPrescription,
    getPrescriptionById,
    updatePrescriptionStatus,
    getPrescriptionsByPatient,
    getPrescriptionsByPharmacy,
};
