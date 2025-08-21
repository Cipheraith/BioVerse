const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { body, param } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Prescriptions
 *   description: Prescription management and delivery
 */

/**
 * @swagger
 * /prescriptions:
 *   post:
 *     summary: Create a new prescription
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - doctor_id
 *               - medications
 *             properties:
 *               patient_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the patient
 *               doctor_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the doctor issuing the prescription
 *               medications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     dosage:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                 description: Array of medication objects
 *               delivery_address:
 *                 type: string
 *                 description: Address for medication delivery
 *               notes:
 *                 type: string
 *                 description: Additional notes for the prescription
 *     responses:
 *       201:
 *         description: Prescription created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
    '/',
    authenticateToken,
    authorizeRoles(['doctor', 'admin']),
    [ // Validation middleware
        body('patient_id').isUUID().withMessage('Patient ID must be a valid UUID'),
        body('doctor_id').isUUID().withMessage('Doctor ID must be a valid UUID'),
        body('medications').isArray().withMessage('Medications must be an array').notEmpty().withMessage('Medications cannot be empty'),
        body('medications.*.name').notEmpty().withMessage('Medication name is required'),
        body('medications.*.dosage').notEmpty().withMessage('Medication dosage is required'),
        body('medications.*.quantity').isNumeric().withMessage('Medication quantity must be a number'),
    ],
    validate,
    prescriptionController.createPrescription
);

/**
 * @swagger
 * /prescriptions/{id}:
 *   get:
 *     summary: Get a prescription by ID
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the prescription to retrieve
 *     responses:
 *       200:
 *         description: Prescription data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Prescription not found
 */
router.get(
    '/:id',
    authenticateToken,
    authorizeRoles(['patient', 'doctor', 'pharmacy', 'admin', 'moh']),
    [param('id').isUUID().withMessage('Prescription ID must be a valid UUID')],
    validate,
    prescriptionController.getPrescriptionById
);

/**
 * @swagger
 * /prescriptions/{id}/status:
 *   put:
 *     summary: Update prescription status
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the prescription to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [issued, pending_pharmacy, filled, in_delivery, delivered, cancelled]
 *                 description: New status of the prescription
 *               pharmacy_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the pharmacy (required for 'pending_pharmacy' or 'filled' status)
 *     responses:
 *       200:
 *         description: Prescription status updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Prescription not found
 */
router.put(
    '/:id/status',
    authenticateToken,
    authorizeRoles(['pharmacy', 'ambulance_driver', 'admin', 'moh']),
    [ // Validation middleware
        param('id').isUUID().withMessage('Prescription ID must be a valid UUID'),
        body('status').isIn(['issued', 'pending_pharmacy', 'filled', 'in_delivery', 'delivered', 'cancelled']).withMessage('Invalid prescription status'),
        body('pharmacy_id').optional().isUUID().withMessage('Pharmacy ID must be a valid UUID if provided'),
    ],
    validate,
    prescriptionController.updatePrescriptionStatus
);

/**
 * @swagger
 * /prescriptions/patient/{patientId}:
 *   get:
 *     summary: Get all prescriptions for a specific patient
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the patient
 *     responses:
 *       200:
 *         description: List of prescriptions for the patient
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Patient not found
 */
router.get(
    '/patient/:patientId',
    authenticateToken,
    authorizeRoles(['patient', 'doctor', 'admin', 'moh']),
    [param('patientId').isUUID().withMessage('Patient ID must be a valid UUID')],
    validate,
    prescriptionController.getPrescriptionsByPatient
);

/**
 * @swagger
 * /prescriptions/pharmacy/{pharmacyId}:
 *   get:
 *     summary: Get all prescriptions assigned to a specific pharmacy
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pharmacyId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the pharmacy
 *     responses:
 *       200:
 *         description: List of prescriptions for the pharmacy
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Pharmacy not found
 */
router.get(
    '/pharmacy/:pharmacyId',
    authenticateToken,
    authorizeRoles(['pharmacy', 'admin', 'moh']),
    [param('pharmacyId').isUUID().withMessage('Pharmacy ID must be a valid UUID')],
    validate,
    prescriptionController.getPrescriptionsByPharmacy
);

module.exports = router;
