import { generateHealthTwinsForAllPatients } from '../services/healthTwinGenerator';

const initializeDigitalTwins = async () => {
  console.log('Initializing Digital Twins for all patients...');
  const healthTwins = await generateHealthTwinsForAllPatients();
  console.log(`Generated ${healthTwins.length} Health Twins successfully.`);
}

initializeDigitalTwins();

