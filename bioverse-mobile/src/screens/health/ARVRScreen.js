import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

// Components
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';

// Services
import { ARVRService } from '../../services/ARVRService';
import { HealthService } from '../../services/HealthService';

// Constants
import { colors, gradients, spacing, typography } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const ARVRScreen = ({ navigation }) => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [availableExperiences, setAvailableExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeARVR();
    startAnimations();
    startRotationAnimation();
  }, []);

  const initializeARVR = async () => {
    try {
      // Load active sessions
      const sessions = await ARVRService.getActiveSessions();
      setActiveSessions(sessions);

      // Load available experiences
      const experiences = await ARVRService.getAvailableExperiences();
      setAvailableExperiences(experiences);

    } catch (error) {
      console.error('Error loading AR/VR data:', error);
    }
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startRotationAnimation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  };

  const startARSession = async (experience) => {
    try {
      setLoading(true);
      
      const session = await ARVRService.startARSession(experience);
      
      if (session) {
        setActiveSessions([...activeSessions, session]);
        
        // Award tokens for AR session
        await HealthService.awardTokens(75, 'ar_session_started');
        
        Alert.alert(
          'AR Session Started!',
          `${experience.name} session is now active. You earned 75 BVH tokens!`,
          [
            {
              text: 'Continue',
              onPress: () => {
                // In a real app, this would launch the AR experience
                Alert.alert(
                  'AR Experience',
                  'AR experience would launch here with camera and 3D rendering.',
                  [{ text: 'OK' }]
                );
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start AR session');
    } finally {
      setLoading(false);
    }
  };

  const startVRSession = async (experience) => {
    try {
      setLoading(true);
      
      const session = await ARVRService.startVRSession(experience);
      
      if (session) {
        setActiveSessions([...activeSessions, session]);
        
        // Award tokens for VR session
        await HealthService.awardTokens(100, 'vr_therapy_session');
        
        Alert.alert(
          'VR Session Started!',
          `${experience.name} therapy session is now active. You earned 100 BVH tokens!`,
          [
            {
              text: 'Continue',
              onPress: () => {
                // In a real app, this would launch the VR experience
                Alert.alert(
                  'VR Experience',
                  'VR therapy experience would launch here with immersive 3D environment.',
                  [{ text: 'OK' }]
                );
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start VR session');
    } finally {
      setLoading(false);
    }
  };

  const arExperiences = [
    {
      id: 'anatomy_education',
      name: 'Interactive Anatomy',
      description: 'Explore 3D human anatomy with AR visualization',
      icon: 'body',
      type: 'AR',
      duration: '15-30 min',
      difficulty: 'Beginner',
      gradient: gradients.primary,
      features: ['3D Organs', 'Interactive Learning', 'Real-time Info'],
    },
    {
      id: 'surgical_planning',
      name: 'Surgical Planning',
      description: 'Advanced AR tools for surgical procedure planning',
      icon: 'medical',
      type: 'AR',
      duration: '30-60 min',
      difficulty: 'Advanced',
      gradient: gradients.error,
      features: ['3D Modeling', 'Precision Tools', 'Risk Analysis'],
    },
    {
      id: 'diagnosis_visualization',
      name: 'Diagnosis Visualization',
      description: 'Visualize medical conditions and symptoms in AR',
      icon: 'eye',
      type: 'AR',
      duration: '10-20 min',
      difficulty: 'Intermediate',
      gradient: gradients.info,
      features: ['Symptom Mapping', 'Visual Diagnosis', 'Treatment Plans'],
    },
  ];

  const vrExperiences = [
    {
      id: 'pain_management',
      name: 'Pain Management VR',
      description: 'Immersive VR therapy for chronic pain relief',
      icon: 'heart',
      type: 'VR',
      duration: '20-45 min',
      difficulty: 'Beginner',
      gradient: gradients.success,
      features: ['Guided Meditation', 'Biofeedback', 'Pain Tracking'],
    },
    {
      id: 'anxiety_treatment',
      name: 'Anxiety Therapy',
      description: 'VR environments designed to reduce anxiety',
      icon: 'leaf',
      type: 'VR',
      duration: '15-30 min',
      difficulty: 'Beginner',
      gradient: gradients.secondary,
      features: ['Calming Environments', 'Breathing Exercises', 'Progress Tracking'],
    },
    {
      id: 'phobia_exposure',
      name: 'Phobia Exposure Therapy',
      description: 'Gradual exposure therapy in controlled VR environments',
      icon: 'shield',
      type: 'VR',
      duration: '30-60 min',
      difficulty: 'Advanced',
      gradient: gradients.warning,
      features: ['Controlled Exposure', 'Progress Monitoring', 'Safety Controls'],
    },
    {
      id: 'physical_rehab',
      name: 'Physical Rehabilitation',
      description: 'VR-assisted physical therapy and rehabilitation',
      icon: 'fitness',
      type: 'VR',
      duration: '20-40 min',
      difficulty: 'Intermediate',
      gradient: gradients.ai,
      features: ['Motion Tracking', 'Exercise Games', 'Progress Analytics'],
    },
  ];

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const ExperienceCard = ({ experience, onStart }) => (
    <TouchableOpacity
      style={styles.experienceCard}
      onPress={() => onStart(experience)}
      disabled={loading}
    >
      <GlassCard style={styles.experienceContent}>
        <LinearGradient
          colors={experience.gradient}
          style={styles.experienceGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.experienceHeader}>
            <View style={styles.experienceIcon}>
              <Ionicons name={experience.icon} size={32} color={colors.text} />
            </View>
            <View style={styles.experienceType}>
              <Text style={styles.experienceTypeText}>{experience.type}</Text>
            </View>
          </View>
          
          <Text style={styles.experienceName}>{experience.name}</Text>
          <Text style={styles.experienceDescription}>{experience.description}</Text>
          
          <View style={styles.experienceDetails}>
            <View style={styles.experienceDetail}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.experienceDetailText}>{experience.duration}</Text>
            </View>
            <View style={styles.experienceDetail}>
              <Ionicons name="bar-chart-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.experienceDetailText}>{experience.difficulty}</Text>
            </View>
          </View>
          
          <View style={styles.experienceFeatures}>
            {experience.features.map((feature, index) => (
              <View key={index} style={styles.featureTag}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={gradients.hero} style={styles.background}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AR/VR Medical</Text>
          <View style={styles.headerIcon}>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Ionicons name="glasses" size={24} color={colors.primary[400]} />
            </Animated.View>
          </View>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <GlassCard style={styles.heroCard}>
              <LinearGradient
                colors={gradients.ai}
                style={styles.heroGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.heroContent}>
                  <Animated.View style={{ transform: [{ rotate }] }}>
                    <Ionicons name="glasses" size={64} color={colors.text} />
                  </Animated.View>
                  <Text style={styles.heroTitle}>Immersive Healthcare</Text>
                  <Text style={styles.heroSubtitle}>
                    Experience the future of medical education and therapy through 
                    cutting-edge AR/VR technology
                  </Text>
                </View>
              </LinearGradient>
            </GlassCard>
          </Animated.View>

          {/* Active Sessions */}
          {activeSessions.length > 0 && (
            <Animated.View
              style={[
                styles.section,
                { opacity: fadeAnim },
              ]}
            >
              <Text style={styles.sectionTitle}>Active Sessions</Text>
              {activeSessions.map((session, index) => (
                <GlassCard key={session.id} style={styles.sessionCard}>
                  <View style={styles.sessionContent}>
                    <View style={styles.sessionHeader}>
                      <View style={styles.sessionIcon}>
                        <Ionicons 
                          name={session.type === 'AR' ? 'eye' : 'glasses'} 
                          size={24} 
                          color={colors.primary[400]} 
                        />
                      </View>
                      <View style={styles.sessionInfo}>
                        <Text style={styles.sessionName}>{session.name}</Text>
                        <Text style={styles.sessionType}>{session.type} Session</Text>
                      </View>
                      <View style={styles.sessionStatus}>
                        <View style={styles.statusIndicator} />
                        <Text style={styles.statusText}>Active</Text>
                      </View>
                    </View>
                    <View style={styles.sessionProgress}>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${session.progress}%` }]} />
                      </View>
                      <Text style={styles.progressText}>{session.progress}% Complete</Text>
                    </View>
                  </View>
                </GlassCard>
              ))}
            </Animated.View>
          )}

          {/* AR Experiences */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.sectionTitle}>Augmented Reality</Text>
            <Text style={styles.sectionSubtitle}>
              Interactive medical education and visualization
            </Text>
            {arExperiences.map((experience, index) => (
              <Animated.View
                key={experience.id}
                style={{
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50 + (index * 20), 0],
                    })
                  }]
                }}
              >
                <ExperienceCard
                  experience={experience}
                  onStart={startARSession}
                />
              </Animated.View>
            ))}
          </Animated.View>

          {/* VR Experiences */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.sectionTitle}>Virtual Reality Therapy</Text>
            <Text style={styles.sectionSubtitle}>
              Immersive therapeutic experiences for healing
            </Text>
            {vrExperiences.map((experience, index) => (
              <Animated.View
                key={experience.id}
                style={{
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50 + (index * 20), 0],
                    })
                  }]
                }}
              >
                <ExperienceCard
                  experience={experience}
                  onStart={startVRSession}
                />
              </Animated.View>
            ))}
          </Animated.View>

          {/* Benefits Section */}
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.sectionTitle}>Benefits</Text>
            <GlassCard style={styles.benefitsCard}>
              <View style={styles.benefit}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="school" size={24} color={colors.primary[400]} />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>Enhanced Learning</Text>
                  <Text style={styles.benefitDescription}>
                    3D visualization improves understanding of complex medical concepts
                  </Text>
                </View>
              </View>
              
              <View style={styles.benefitDivider} />
              
              <View style={styles.benefit}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="heart" size={24} color={colors.success[400]} />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>Therapeutic Relief</Text>
                  <Text style={styles.benefitDescription}>
                    VR therapy provides effective treatment for pain and anxiety
                  </Text>
                </View>
              </View>
              
              <View style={styles.benefitDivider} />
              
              <View style={styles.benefit}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="shield-checkmark" size={24} color={colors.info[400]} />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>Safe Environment</Text>
                  <Text style={styles.benefitDescription}>
                    Practice and learn in risk-free virtual environments
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        </ScrollView>
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
  headerIcon: {
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
  
  // Hero section
  heroSection: {
    marginBottom: spacing.xl,
  },
  heroCard: {
    overflow: 'hidden',
  },
  heroGradient: {
    padding: spacing.xl,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.md,
  },
  
  // Section styles
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  
  // Active sessions
  sessionCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sessionContent: {
    // Content styles
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  sessionType: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sessionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success[500],
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    color: colors.success[400],
    fontWeight: typography.fontWeights.medium,
  },
  sessionProgress: {
    // Progress styles
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  
  // Experience card
  experienceCard: {
    marginBottom: spacing.lg,
  },
  experienceContent: {
    overflow: 'hidden',
  },
  experienceGradient: {
    padding: spacing.lg,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  experienceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  experienceType: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  experienceTypeText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  experienceName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  experienceDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.md,
    marginBottom: spacing.md,
  },
  experienceDetails: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.lg,
  },
  experienceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  experienceDetailText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  experienceFeatures: {
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
  
  // Benefits section
  benefitsCard: {
    padding: spacing.lg,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  benefitDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.sm,
  },
  benefitDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});

export default ARVRScreen;