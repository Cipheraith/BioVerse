const { runQuery, getQuery, allQuery } = require('../config/database');
const logger = require('../config/logger');
const routingService = require('../services/routingService');

// Helper function to parse JSONB fields if necessary
const parseLocation = (location) => {
    if (!location) return null;
    return {
        ...location,
        position: location.position || null,
        medicationStock: location.medicationStock || {},
        equipmentAvailable: location.equipmentAvailable || {},
        specialistsAvailable: location.specialistsAvailable || {},
    };
};

/**
 * Get all facilities with their available resources
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllFacilitiesResources = async (req, res) => {
    try {
        const facilities = await allQuery('SELECT * FROM locations');
        res.json(facilities.map(parseLocation));
    } catch (error) {
        logger.error('Error fetching all facilities resources:', error);
        res.status(500).json({ message: 'Failed to retrieve facilities resources due to an internal error.' });
    }
};

/**
 * Update resource availability for a specific facility
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateFacilityResources = async (req, res) => {
    const { id } = req.params;
    const { bedsAvailable, medicationStock, equipmentAvailable, specialistsAvailable } = req.body;

    try {
        let facility = await getQuery('SELECT * FROM locations WHERE id = $1', [id]);
        if (!facility) {
            return res.status(404).json({ message: 'Facility not found.' });
        }

        // Authorization: Only admin or MOH can update facility resources
        if (!(['admin', 'moh'].includes(req.user.role))) {
            return res.status(403).json({ message: 'Access Denied: Only authorized roles can update facility resources.' });
        }

        const updates = [];
        const params = [id];
        let paramIndex = 2;

        if (bedsAvailable !== undefined) { updates.push(`bedsAvailable = ${paramIndex++}`); params.push(bedsAvailable); }
        if (medicationStock !== undefined) { updates.push(`medicationStock = ${paramIndex++}`); params.push(JSON.stringify(medicationStock)); }
        if (equipmentAvailable !== undefined) { updates.push(`equipmentAvailable = ${paramIndex++}`); params.push(JSON.stringify(equipmentAvailable)); }
        if (specialistsAvailable !== undefined) { updates.push(`specialistsAvailable = ${paramIndex++}`); params.push(JSON.stringify(specialistsAvailable)); }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update.' });
        }

        const setClause = updates.join(', ');
        await runQuery(`UPDATE locations SET ${setClause}, updated_at = NOW() WHERE id = $1`, params);

        facility = await getQuery('SELECT * FROM locations WHERE id = $1', [id]); // Fetch updated facility
        res.json(parseLocation(facility));
    } catch (error) {
        logger.error('Error updating facility resources:', error);
        res.status(500).json({ message: 'Failed to update facility resources due to an internal error.' });
    }
};

/**
 * Find the nearest facility that meets specific resource requirements.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const findNearestFacility = async (req, res) => {
    const { patientLocation, requiredResources } = req.body;

    if (!patientLocation || !patientLocation.latitude || !patientLocation.longitude) {
        return res.status(400).json({ message: 'Patient location (latitude, longitude) is required.' });
    }
    if (!requiredResources) {
        return res.status(400).json({ message: 'Required resources are needed.' });
    }

    try {
        // Authorization: Accessible by health_worker, ambulance_driver, admin, moh, and patient (for self-use)
        if (!(['admin', 'moh', 'health_worker', 'ambulance_driver', 'patient'].includes(req.user.role))) {
            return res.status(403).json({ message: 'Access Denied: Unauthorized role to find nearest facility.' });
        }
        // If patient role, ensure it's for their own location (simplified for now)
        // A more robust check would involve verifying patientLocation against user's registered address

        const result = await routingService.findNearestFacility(patientLocation, requiredResources);

        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ message: 'No suitable facility found matching the criteria.' });
        }
    } catch (error) {
        logger.error('Error finding nearest facility:', error);
        res.status(500).json({ message: 'Failed to find nearest facility due to an internal error.' });
    }
};

module.exports = {
    getAllFacilitiesResources,
    updateFacilityResources,
    findNearestFacility,
};
