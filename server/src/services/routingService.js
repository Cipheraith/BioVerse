const { allQuery } = require('../config/database');
const logger = require('../config/logger');

// Haversine formula to calculate distance between two points given their latitudes and longitudes
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance; // Distance in km
}

class RoutingService {
    constructor() {
        logger.info('RoutingService initialized.');
    }

    /**
     * Finds the nearest facility that meets specific resource requirements.
     * @param {Object} patientLocation - { latitude, longitude }
     * @param {Object} requiredResources - { beds: number, equipment: { type: count }, specialists: { type: boolean } }
     * @returns {Promise<Object>} - Nearest facility with route details or null
     */
    async findNearestFacility(patientLocation, requiredResources) {
        try {
            const facilities = await allQuery('SELECT id, name, type, position, bedsAvailable, equipmentAvailable, specialistsAvailable FROM locations WHERE type IN ('clinic', 'hospital')');

            let bestFacility = null;
            let minDistance = Infinity;

            for (const facility of facilities) {
                // Ensure facility has a valid position
                if (!facility.position || typeof facility.position.latitude === 'undefined' || typeof facility.position.longitude === 'undefined') {
                    logger.warn(`Facility ${facility.name} (${facility.id}) has invalid position data. Skipping.`);
                    continue;
                }

                // Check if facility meets resource requirements
                let meetsRequirements = true;

                if (requiredResources.beds && facility.bedsAvailable < requiredResources.beds) {
                    meetsRequirements = false;
                }
                if (requiredResources.equipment) {
                    for (const eqType in requiredResources.equipment) {
                        if (!facility.equipmentAvailable || (facility.equipmentAvailable[eqType] || 0) < requiredResources.equipment[eqType]) {
                            meetsRequirements = false;
                            break;
                        }
                    }
                }
                if (requiredResources.specialists) {
                    for (const specType in requiredResources.specialists) {
                        if (requiredResources.specialists[specType] && (!facility.specialistsAvailable || !facility.specialistsAvailable[specType])) {
                            meetsRequirements = false;
                            break;
                        }
                    }
                }

                if (meetsRequirements) {
                    const distance = haversineDistance(
                        patientLocation.latitude,
                        patientLocation.longitude,
                        facility.position.latitude,
                        facility.position.longitude
                    );

                    if (distance < minDistance) {
                        minDistance = distance;
                        bestFacility = facility;
                    }
                }
            }

            if (bestFacility) {
                // In a real-world scenario, this would integrate with a mapping API (e.g., Google Maps Directions API)
                // to get actual route, traffic, and estimated travel time.
                // For now, we'll simulate it.
                const estimatedTravelTimeMinutes = Math.round(minDistance / 40 * 60); // Assuming average speed of 40 km/h

                return {
                    facility: parseLocation(bestFacility),
                    distanceKm: parseFloat(minDistance.toFixed(2)),
                    estimatedTravelTimeMinutes,
                    route: `Simulated route from (${patientLocation.latitude}, ${patientLocation.longitude}) to ${bestFacility.name} (${bestFacility.position.latitude}, ${bestFacility.position.longitude})`,
                };
            } else {
                return null; // No suitable facility found
            }

        } catch (error) {
            logger.error('Error finding nearest facility:', error);
            throw new Error('Failed to find nearest facility due to an internal error.');
        }
    }

    /**
     * Simulates real-time traffic intelligence to adjust travel time.
     * This would typically come from an external API.
     * @param {number} baseTravelTimeMinutes
     * @returns {number} adjustedTravelTimeMinutes
     */
    simulateTrafficAdjustment(baseTravelTimeMinutes) {
        const trafficFactor = 0.8 + Math.random() * 0.4; // Randomly adjust by -20% to +20%
        return Math.round(baseTravelTimeMinutes * trafficFactor);
    }
}

module.exports = new RoutingService();
