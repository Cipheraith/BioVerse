const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { body, param } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: Management of healthcare facility resources (beds, equipment, specialists)
 */

/**
 * @swagger
 * /resources/facilities:
 *   get:
 *     summary: Get all healthcare facilities with their available resources
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of facilities with resources
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
    '/facilities',
    authenticateToken,
    authorizeRoles(['admin', 'moh', 'health_worker', 'ambulance_driver']),
    resourceController.getAllFacilitiesResources
);

/**
 * @swagger
 * /resources/facilities/{id}:
 *   put:
 *     summary: Update resource availability for a specific healthcare facility
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the facility to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bedsAvailable:
 *                 type: integer
 *                 description: Number of available beds
 *               medicationStock:
 *                 type: object
 *                 additionalProperties:
 *                   type: integer
 *                 description: Key-value pairs of medication and their stock levels
 *               equipmentAvailable:
 *                 type: object
 *                 additionalProperties:
 *                   type: integer
 *                 description: Key-value pairs of equipment and their availability
 *               specialistsAvailable:
 *                 type: object
 *                 additionalProperties:
 *                   type: boolean
 *                 description: Key-value pairs of specialist types and their availability
 *     responses:
 *       200:
 *         description: Facility resources updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Facility not found
 */
router.put(
    '/facilities/:id',
    authenticateToken,
    authorizeRoles(['admin', 'moh']),
    [ // Validation middleware
        param('id').isInt().withMessage('Facility ID must be an integer'), // Assuming facility IDs are integers (SERIAL PRIMARY KEY)
        body('bedsAvailable').optional().isInt({ min: 0 }).withMessage('Beds available must be a non-negative integer'),
        body('medicationStock').optional().isObject().withMessage('Medication stock must be an object'),
        body('equipmentAvailable').optional().isObject().withMessage('Equipment available must be an object'),
        body('specialistsAvailable').optional().isObject().withMessage('Specialists available must be an object'),
    ],
    validate,
    resourceController.updateFacilityResources
);

/**
 * @swagger
 * /resources/nearest-facility:
 *   post:
 *     summary: Find the nearest healthcare facility that meets specific resource requirements
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientLocation
 *               - requiredResources
 *             properties:
 *               patientLocation:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *                 description: Latitude and longitude of the patient's current location
 *               requiredResources:
 *                 type: object
 *                 properties:
 *                   beds:
 *                     type: integer
 *                     description: Number of beds required
 *                   equipment:
 *                     type: object
 *                     additionalProperties:
 *                       type: integer
 *                     description: Key-value pairs of equipment types and quantities required
 *                   specialists:
 *                     type: object
 *                     additionalProperties:
 *                       type: boolean
 *                     description: Key-value pairs of specialist types and their required presence
 *                 description: Resources required by the patient
 *     responses:
 *       200:
 *         description: Nearest suitable facility found
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: No suitable facility found
 */
router.post(
    '/nearest-facility',
    authenticateToken,
    authorizeRoles(['admin', 'moh', 'health_worker', 'ambulance_driver', 'patient']),
    [ // Validation middleware
        body('patientLocation.latitude').isFloat().withMessage('Patient latitude is required and must be a number'),
        body('patientLocation.longitude').isFloat().withMessage('Patient longitude is required and must be a number'),
        body('requiredResources').isObject().withMessage('Required resources must be an object'),
    ],
    validate,
    resourceController.findNearestFacility
);

module.exports = router;
