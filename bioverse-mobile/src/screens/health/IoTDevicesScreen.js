import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Components
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import DeviceCard from '../../components/iot/DeviceCard';
import DeviceDataChart from '../../components/iot/DeviceDataChart';

// Services
import { IoTService } from '../../services/IoTService';
import { HealthService } from '../../services/HealthService';

// Constants
import { colors, gradients, spacing, typography } from '../../constants/theme';

const IoTDevicesScreen = ({ navigation }) => {
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [realTimeData, setRealTimeData] = useState({});
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    initializeDevices();
    startAnimations();
    startRealTimeUpdates();

    return () => {
      // Cleanup real-time updates
      if (realTimeInterval) {
        clearInterval(realTimeInterval);
      }
    };
  }, []);

  let realTimeInterval;

  const initializeDevices = async () => {
    try {
      setLoading(true);
      
      // Load connected devices
      const connected = await IoTService.getConnectedDevices();
      setConnectedDevices(connected);

      // Load available devices for pairing
      const available = await IoTService.getAvailableDevices();
      setAvailableDevices(available);

      // Load real-time data for connected devices
      const data = await IoTService.getRealTimeData();
      setRealTimeData(data);

    } catch (error) {
      console.error('Error loading devices:', error);
      Alert.alert('Error', 'Failed to load device information');
    } finally {
      setLoading(false);
    }
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startRealTimeUpdates = () => {
    realTimeInterval = setInterval(async () => {
      try {
        const data = await IoTService.getRealTimeData();
        setRealTimeData(data);
      } catch (error) {
        console.error('Error updating real-time data:', error);
      }
    }, 5000); // Update every 5 seconds
  };

  const connectDevice = async (device) => {
    try {
      setLoading(true);
      
      const success = await IoTService.connectDevice(device);
      
      if (success) {
        // Update connected devices list
        setConnectedDevices([...connectedDevices, device]);
        setAvailableDevices(availableDevices.filter(d => d.id !== device.id));
        
        // Award tokens for device connection
        await HealthService.awardTokens(25, 'iot_device_connected');
        
        Alert.alert(
          'Device Connected!',
          `${device.name} has been successfully connected. You earned 25 BVH tokens!`,
          [{ text: 'OK' }]
        );
        
        setShowAddDevice(false);
      } else {
        Alert.alert('Connection Failed', 'Unable to connect to the device. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect device');
    } finally {
      setLoading(false);
    }
  };

  const disconnectDevice = async (device) => {
    Alert.alert(
      'Disconnect Device',
      `Are you sure you want to disconnect ${device.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await IoTService.disconnectDevice(device);
              
              if (success) {
                setConnectedDevices(connectedDevices.filter(d => d.id !== device.id));
                setAvailableDevices([...availableDevices, device]);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to disconnect device');
            }
          },
        },
      ]
    );
  };

  const toggleDeviceMonitoring = async (device, enabled) => {
    try {
      await IoTService.toggleMonitoring(device.id, enabled);
      
      // Update device status
      const updatedDevices = connectedDevices.map(d => 
        d.id === device.id ? { ...d, monitoring: enabled } : d
      );
      setConnectedDevices(updatedDevices);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to update monitoring settings');
    }
  };

  const supportedDevices = [
    {
      id: 'apple_watch',
      name: 'Apple Watch',
      icon: 'watch',
      type: 'smartwatch',
      features: ['Heart Rate', 'Steps', 'Calories', 'Sleep'],
      gradient: gradients.primary,
    },
    {
      id: 'fitbit_charge',
      name: 'Fitbit Charge',
      icon: 'fitness',
      type: 'fitness_tracker',
      features: ['Heart Rate', 'Steps', 'Sleep', 'Stress'],
      gradient: gradients.success,
    },
    {
      id: 'oura_ring',
      name: 'Oura Ring',
      icon: 'radio-button-on',
      type: 'smart_ring',
      features: ['Sleep', 'HRV', 'Temperature', 'Recovery'],
      gradient: gradients.secondary,
    },
    {
      id: 'glucose_monitor',
      name: 'Glucose Monitor',
      icon: 'medical',
      type: 'medical_device',
      features: ['Blood Glucose', 'Trends', 'Alerts'],
      gradient: gradients.warning,
    },
    {
      id: 'bp_monitor',
      name: 'Blood Pressure Monitor',
      icon: 'heart',
      type: 'medical_device',
      features: ['Systolic', 'Diastolic', 'Pulse', 'History'],
      gradient: gradients.error,
    },
    {
      id: 'smart_scale',
      name: 'Smart Scale',
      icon: 'scale',
      type: 'health_device',
      features: ['Weight', 'BMI', 'Body Fat', 'Muscle Mass'],
      gradient: gradients.info,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={gradients.hero} style={styles.background}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>IoT Devices</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddDevice(true)}
          >
            <Ionicons name="add" size={24} color={colors.text} />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Connected Devices Overview */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <GlassCard style={styles.overviewCard}>
              <View style={styles.overviewContent}>
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewNumber}>{connectedDevices.length}</Text>
                  <Text style={styles.overviewLabel}>Connected</Text>
                </View>
                <View style={styles.overviewDivider} />
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewNumber}>
                    {connectedDevices.filter(d => d.monitoring).length}
                  </Text>
                  <Text style={styles.overviewLabel}>Monitoring</Text>
                </View>
                <View style={styles.overviewDivider} />
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewNumber}>24/7</Text>
                  <Text style={styles.overviewLabel}>Active</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Real-time Data */}
          {Object.keys(realTimeData).length > 0 && (
            <Animated.View
              style={[
                styles.section,
                { opacity: fadeAnim },
              ]}
            >
              <Text style={styles.sectionTitle}>Real-time Data</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.realTimeContainer}
              >
                {Object.entries(realTimeData).map(([deviceId, data], index) => (
                  <GlassCard key={deviceId} style={styles.realTimeCard}>
                    <View style={styles.realTimeHeader}>
                      <Ionicons 
                        name={data.icon || 'pulse'} 
                        size={24} 
                        color={colors.primary[400]} 
                      />
                      <Text style={styles.realTimeTitle}>{data.name}</Text>
                    </View>
                    <Text style={styles.realTimeValue}>{data.value}</Text>
                    <Text style={styles.realTimeUnit}>{data.unit}</Text>
                    <View style={[styles.realTimeStatus, { 
                      backgroundColor: data.status === 'normal' ? colors.success[500] : colors.warning[500] 
                    }]}>
                      <Text style={styles.realTimeStatusText}>{data.status}</Text>
                    </View>
                  </GlassCard>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Connected Devices */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.sectionTitle}>Connected Devices</Text>
            {connectedDevices.length > 0 ? (
              connectedDevices.map((device, index) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onPress={() => setSelectedDevice(device)}
                  onDisconnect={() => disconnectDevice(device)}
                  onToggleMonitoring={(enabled) => toggleDeviceMonitoring(device, enabled)}
                  style={[styles.deviceCard, {
                    transform: [{
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 50],
                        outputRange: [0, 50 + (index * 10)],
                      })
                    }]
                  }]}
                />
              ))
            ) : (
              <GlassCard style={styles.emptyCard}>
                <Ionicons name="phone-portrait-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyTitle}>No Devices Connected</Text>
                <Text style={styles.emptySubtitle}>
                  Connect your first IoT device to start monitoring your health
                </Text>
                <GradientButton
                  title="Add Device"
                  gradient={gradients.primary}
                  style={styles.emptyButton}
                  onPress={() => setShowAddDevice(true)}
                />
              </GlassCard>
            )}
          </Animated.View>

          {/* Device Data Charts */}
          {selectedDevice && (
            <Animated.View
              style={[
                styles.section,
                { opacity: fadeAnim },
              ]}
            >
              <Text style={styles.sectionTitle}>
                {selectedDevice.name} Data
              </Text>
              <DeviceDataChart
                device={selectedDevice}
                data={realTimeData[selectedDevice.id]}
              />
            </Animated.View>
          )}
        </ScrollView>

        {/* Add Device Modal */}
        <Modal
          visible={showAddDevice}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowAddDevice(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <LinearGradient colors={gradients.hero} style={styles.modalBackground}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowAddDevice(false)}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Add Device</Text>
                <View style={styles.modalPlaceholder} />
              </View>

              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
              >
                <Text style={styles.modalSubtitle}>
                  Choose from our supported devices
                </Text>

                {supportedDevices.map((device, index) => (
                  <TouchableOpacity
                    key={device.id}
                    style={styles.availableDeviceCard}
                    onPress={() => connectDevice(device)}
                    disabled={loading}
                  >
                    <GlassCard style={styles.availableDeviceContent}>
                      <LinearGradient
                        colors={device.gradient}
                        style={styles.availableDeviceGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <View style={styles.availableDeviceHeader}>
                          <View style={styles.availableDeviceIcon}>
                            <Ionicons name={device.icon} size={32} color={colors.text} />
                          </View>
                          <View style={styles.availableDeviceInfo}>
                            <Text style={styles.availableDeviceName}>{device.name}</Text>
                            <Text style={styles.availableDeviceType}>{device.type.replace('_', ' ')}</Text>
                          </View>
                        </View>
                        <View style={styles.availableDeviceFeatures}>
                          {device.features.map((feature, idx) => (
                            <View key={idx} style={styles.featureTag}>
                              <Text style={styles.featureText}>{feature}</Text>
                            </View>
                          ))}
                        </View>
                      </LinearGradient>
                    </GlassCard>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </LinearGradient>
          </SafeAreaView>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  addButton: {
    padding: spacing.sm,
  },
  
  // Scroll view styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  
  // Section styles
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  
  // Overview card
  overviewCard: {
    padding: spacing.lg,
  },
  overviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewNumber: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  overviewLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  
  // Real-time data
  realTimeContainer: {
    paddingRight: spacing.lg,
  },
  realTimeCard: {
    width: 140,
    padding: spacing.md,
    marginRight: spacing.md,
    alignItems: 'center',
  },
  realTimeHeader: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  realTimeTitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  realTimeValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  realTimeUnit: {
    fontSize: typography.fontSizes.xs,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  realTimeStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  realTimeStatusText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text,
    fontWeight: typography.fontWeights.medium,
    textTransform: 'capitalize',
  },
  
  // Device card
  deviceCard: {
    marginBottom: spacing.md,
  },
  
  // Empty state
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    paddingHorizontal: spacing.xl,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  modalCloseButton: {
    padding: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  modalPlaceholder: {
    width: 40,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  modalSubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  
  // Available device card
  availableDeviceCard: {
    marginBottom: spacing.md,
  },
  availableDeviceContent: {
    overflow: 'hidden',
  },
  availableDeviceGradient: {
    padding: spacing.lg,
  },
  availableDeviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  availableDeviceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  availableDeviceInfo: {
    flex: 1,
  },
  availableDeviceName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  availableDeviceType: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  availableDeviceFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  featureTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  featureText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text,
    fontWeight: typography.fontWeights.medium,
  },
});

export default IoTDevicesScreen;