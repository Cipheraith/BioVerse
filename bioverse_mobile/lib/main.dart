import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';
import 'core/services/notification_service.dart';
import 'core/services/app_initialization_service.dart';
import 'core/services/enhanced_auth_service.dart';
import 'firebase_options.dart';

void main() async {
  // Preserve native splash screen while doing initialization
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);
  
  // Only do critical synchronous initialization
  _setCriticalSystemSettings();
  
  // Create provider container for early access to initialization notifier
  final container = ProviderContainer();
  
  // Start the app immediately
  runApp(UncontrolledProviderScope(
    container: container,
    child: const BioVerseApp(),
  ));
  
  // Do heavy initialization in background
  _initializeAppInBackground(container);
}

void _setCriticalSystemSettings() {
  // Set system UI overlay style (lightweight operation)
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF0F172A), // AppTheme.backgroundColor - Gray 950
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  
  // Set preferred orientations (lightweight operation)
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
}

Future<void> _initializeAppInBackground(ProviderContainer container) async {
  final initNotifier = container.read(appInitializationProvider.notifier);
  
  try {
    // Initialize Firebase in background
    try {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
      initNotifier.markFirebaseReady();
      debugPrint('Firebase initialized successfully!');
    } catch (e) {
      debugPrint('Firebase initialization failed: $e');
      initNotifier.markFirebaseReady(); // Mark as ready even on failure for now
    }
    
    // Initialize Hive for local storage
    await Hive.initFlutter().then((_) {
      initNotifier.markHiveReady();
    }).catchError((e) {
      debugPrint('Hive initialization failed: $e');
      initNotifier.markHiveReady(); // Mark as ready even on failure for now
    });
    
    // Initialize notification service (non-blocking)
    NotificationService.initialize().then((_) {
      initNotifier.markNotificationServiceReady();
    }).catchError((e) {
      debugPrint('Notification service initialization failed: $e');
      initNotifier.markNotificationServiceReady(); // Mark as ready even on failure
    });
    
    // Start preloading common features
    LazyInitializationService.preloadCommonFeatures();
    
    debugPrint('Background initialization completed');
  } finally {
    // Wait longer before removing native splash to allow custom splash to take over smoothly
    await Future.delayed(const Duration(milliseconds: 1000));
    FlutterNativeSplash.remove();
  }
}

class BioVerseApp extends ConsumerWidget {
  const BioVerseApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    
    return MaterialApp.router(
      title: 'BioVerse - Digital Health Twin',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.dark,
      routerConfig: router,
      builder: (context, child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(
            textScaler: const TextScaler.linear(1.0), // Prevent system font scaling
          ),
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }
}
