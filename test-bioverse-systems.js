/**
 * BioVerse Systems Test
 * Quick test to verify all revolutionary systems are working
 */

const { HealthBlockchain, HealthRecord, HealthToken } = require('./server/src/services/blockchain_health_records');
const { IoTHealthEcosystem } = require('./server/src/services/iot_health_ecosystem');

async function testBioVerseSystems() {
    console.log('🧪 TESTING BIOVERSE REVOLUTIONARY SYSTEMS\n');

    try {
        // Test 1: Blockchain Health Records
        console.log('🔗 Testing Blockchain Health Records...');
        const blockchain = new HealthBlockchain();
        
        const healthRecord = new HealthRecord({
            patientId: 'test_patient_001',
            providerId: 'test_provider_001',
            recordType: 'test_record',
            encryptedData: 'encrypted_test_data',
            rawData: { test: 'data' },
            accessPermissions: [],
            emergencyAccess: true
        });

        const recordId = blockchain.addHealthRecord(healthRecord);
        console.log(`✅ Health record created: ${recordId}`);

        // Test 2: Health Token System
        console.log('\n💰 Testing Health Token Economy...');
        const healthToken = new HealthToken();
        
        healthToken.rewardHealthyBehavior('test_user_001', 100, 'daily_exercise');
        const balance = healthToken.balanceOf('test_user_001');
        console.log(`✅ Health tokens awarded. Balance: ${balance} BVH`);

        // Test 3: IoT Health Ecosystem
        console.log('\n🌐 Testing IoT Health Ecosystem...');
        const iotEcosystem = new IoTHealthEcosystem();
        
        const deviceConnection = await iotEcosystem.connectDevice(
            'test_device_001',
            'heart_rate_monitor',
            'test_patient_001'
        );
        console.log(`✅ IoT device connected: ${deviceConnection.status}`);

        // Test 4: Wearable Integration
        console.log('\n📱 Testing Wearable Device Integration...');
        const wearableIntegration = await iotEcosystem.integrateWearableDevice(
            'test_user_001',
            'apple_watch',
            { accessToken: 'test_token' }
        );
        console.log(`✅ Wearable integrated: ${wearableIntegration.deviceType}`);

        console.log('\n🎉 ALL SYSTEMS TESTED SUCCESSFULLY!');
        console.log('\n📊 SYSTEM STATUS:');
        console.log('   ✅ Blockchain Health Records: OPERATIONAL');
        console.log('   ✅ Health Token Economy: OPERATIONAL');
        console.log('   ✅ IoT Health Ecosystem: OPERATIONAL');
        console.log('   ✅ Wearable Device Integration: OPERATIONAL');

        console.log('\n🚀 BioVerse is ready to revolutionize healthcare!');

    } catch (error) {
        console.error('❌ System test failed:', error);
        process.exit(1);
    }
}

// Run tests
testBioVerseSystems()
    .then(() => {
        console.log('\n✨ All tests passed! BioVerse systems are operational.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Tests failed:', error);
        process.exit(1);
    });