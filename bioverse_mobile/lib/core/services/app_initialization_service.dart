import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Provider to track initialization status
final appInitializationProvider = StateNotifierProvider<AppInitializationNotifier, AppInitializationState>((ref) {
  return AppInitializationNotifier();
});

class AppInitializationState {
  final bool isFirebaseReady;
  final bool isHiveReady;
  final bool isNotificationServiceReady;
  final bool isFullyInitialized;

  const AppInitializationState({
    this.isFirebaseReady = false,
    this.isHiveReady = false,
    this.isNotificationServiceReady = false,
  }) : isFullyInitialized = isFirebaseReady && isHiveReady && isNotificationServiceReady;
  
  // Check if critical services are ready for app functionality
  bool get isCriticalServicesReady => isFirebaseReady && isHiveReady;

  AppInitializationState copyWith({
    bool? isFirebaseReady,
    bool? isHiveReady,
    bool? isNotificationServiceReady,
  }) {
    return AppInitializationState(
      isFirebaseReady: isFirebaseReady ?? this.isFirebaseReady,
      isHiveReady: isHiveReady ?? this.isHiveReady,
      isNotificationServiceReady: isNotificationServiceReady ?? this.isNotificationServiceReady,
    );
  }
}

class AppInitializationNotifier extends StateNotifier<AppInitializationState> {
  AppInitializationNotifier() : super(const AppInitializationState());

  void markFirebaseReady() {
    state = state.copyWith(isFirebaseReady: true);
    debugPrint('Firebase initialization completed');
  }

  void markHiveReady() {
    state = state.copyWith(isHiveReady: true);
    debugPrint('Hive initialization completed');
  }

  void markNotificationServiceReady() {
    state = state.copyWith(isNotificationServiceReady: true);
    debugPrint('Notification service initialization completed');
  }

  // Check if critical services are ready for app functionality
  bool get isCriticalServicesReady => state.isFirebaseReady && state.isHiveReady;
}

// Service for managing lazy-loaded features
class LazyInitializationService {
  static final Map<String, bool> _initializedFeatures = {};
  static final Map<String, Future<void>> _initializationFutures = {};

  // Initialize feature only when first needed
  static Future<void> ensureFeatureInitialized(String featureName, Future<void> Function() initializer) async {
    if (_initializedFeatures[featureName] == true) {
      return; // Already initialized
    }

    if (_initializationFutures[featureName] != null) {
      // Initialization in progress, wait for it
      return _initializationFutures[featureName]!;
    }

    // Start initialization
    _initializationFutures[featureName] = _initializeFeature(featureName, initializer);
    return _initializationFutures[featureName]!;
  }

  static Future<void> _initializeFeature(String featureName, Future<void> Function() initializer) async {
    try {
      debugPrint('Initializing feature: $featureName');
      await initializer();
      _initializedFeatures[featureName] = true;
      debugPrint('Feature initialized: $featureName');
    } catch (e) {
      debugPrint('Failed to initialize feature $featureName: $e');
      _initializedFeatures[featureName] = false;
    } finally {
      _initializationFutures.remove(featureName);
    }
  }

  // Pre-initialize features that are likely to be used soon
  static void preloadCommonFeatures() {
    // Example: Preload location service when user is likely to need it
    Future.delayed(const Duration(seconds: 2), () {
      ensureFeatureInitialized('location', () async {
        // Initialize location service
        await Future.delayed(const Duration(milliseconds: 100));
      });
    });

    // Preload camera when user might need it
    Future.delayed(const Duration(seconds: 3), () {
      ensureFeatureInitialized('camera', () async {
        // Initialize camera service
        await Future.delayed(const Duration(milliseconds: 100));
      });
    });
  }

  // Check if a feature is ready
  static bool isFeatureReady(String featureName) {
    return _initializedFeatures[featureName] == true;
  }
}

// Widget that waits for critical services before showing content
class InitializationGate extends ConsumerWidget {
  final Widget child;
  final Widget? loadingWidget;

  const InitializationGate({
    super.key,
    required this.child,
    this.loadingWidget,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final initState = ref.watch(appInitializationProvider);

    if (initState.isCriticalServicesReady) {
      return child;
    }

    return loadingWidget ?? 
      const Scaffold(
        backgroundColor: Color(0xFF0F172A),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
              ),
              SizedBox(height: 16),
              Text(
                'Initializing BioVerse...',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 16,
                ),
              ),
            ],
          ),
        ),
      );
  }
}
