import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

// Auth Pages
import '../../features/splash/presentation/pages/splash_page.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/auth/presentation/pages/role_selection_page.dart';
import '../../features/landing/presentation/pages/modern_landing_page.dart';

// Dashboard Pages
import '../../features/dashboard/presentation/pages/patient_dashboard_page.dart';
import '../../features/dashboard/presentation/pages/health_worker_dashboard_page.dart';
import '../../features/dashboard/presentation/pages/admin_dashboard_page.dart';

// Feature Pages
import '../../features/health_twin/presentation/pages/health_twin_page.dart';
import '../../features/telemedicine/presentation/pages/telemedicine_page.dart';
import '../../features/emergency/presentation/pages/emergency_page.dart';
import '../../features/luma/presentation/pages/luma_chat_page.dart';
import '../../features/appointments/presentation/pages/appointments_page.dart';
import '../../features/prescriptions/presentation/pages/prescriptions_page.dart';
import '../../features/analytics/presentation/pages/analytics_page.dart';
import '../../features/settings/presentation/pages/settings_page.dart';

// Layout
import '../../features/main/presentation/pages/main_layout_page.dart';

// Auth Provider
import '../../features/auth/providers/auth_provider.dart';
import '../theme/app_theme.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);
  
  return GoRouter(
    initialLocation: '/splash',
    debugLogDiagnostics: true,
    redirect: (context, state) {
      final isLoggedIn = authState.isAuthenticated;
      final hasRole = authState.user?.role != null;
      final currentPath = state.matchedLocation;
      
      print('=== ROUTER REDIRECT DEBUG ===');
      print('Current path: $currentPath');
      print('Is logged in: $isLoggedIn');
      print('Has role: $hasRole');
      print('User: ${authState.user?.email}');
      print('Auth loading: ${authState.isLoading}');
      
      // Always allow splash page
      if (currentPath == '/splash') {
        return null;
      }
      
      // If auth is still loading, stay on current route
      if (authState.isLoading) {
        return null;
      }
      
      // Public routes that don't require authentication
      final publicRoutes = ['/landing', '/login', '/register'];
      
      if (publicRoutes.contains(currentPath)) {
        // If user is logged in and has role, redirect to dashboard
        if (isLoggedIn && hasRole) {
          print('Redirecting to dashboard (user has role)');
          return '/dashboard';
        }
        // If user is logged in but no role, redirect to role selection
        if (isLoggedIn && !hasRole) {
          print('Redirecting to /roles (user logged in but no role)');
          return '/roles';
        }
        print('Staying on public route');
        return null; // Stay on current public route
      }
      
      // Role selection page - only accessible if logged in without role
      if (currentPath == '/roles') {
        if (!isLoggedIn) {
          print('Redirecting to /landing (not logged in)');
          return '/landing';
        }
        if (hasRole) {
          print('Redirecting to /dashboard (already has role)');
          return '/dashboard';
        }
        return null; // Stay on roles page
      }
      
      // Protected routes
      if (!isLoggedIn) {
        print('Redirecting to /landing (protected route, not logged in)');
        return '/landing';
      }
      
      if (!hasRole) {
        print('Redirecting to /roles (protected route, no role)');
        return '/roles';
      }
      
      print('Allowing navigation to protected route');
      return null; // Allow navigation to protected route
    },
    routes: [
      // Splash Route
      GoRoute(
        path: '/splash',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const SplashPage(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
        ),
      ),

      // Landing Route
      GoRoute(
        path: '/landing',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const ModernLandingPage(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return SlideTransition(
              position: animation.drive(
                Tween(begin: const Offset(0.0, 0.2), end: Offset.zero)
                    .chain(CurveTween(curve: Curves.easeOutCubic)),
              ),
              child: child,
            );
          },
        ),
      ),
      
      // Auth Routes
      GoRoute(
        path: '/login',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const LoginPage(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return SlideTransition(
              position: animation.drive(
                Tween(begin: const Offset(1.0, 0.0), end: Offset.zero)
                    .chain(CurveTween(curve: Curves.easeInOut)),
              ),
              child: child,
            );
          },
        ),
      ),
      
      GoRoute(
        path: '/register',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const RegisterPage(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return SlideTransition(
              position: animation.drive(
                Tween(begin: const Offset(1.0, 0.0), end: Offset.zero)
                    .chain(CurveTween(curve: Curves.easeInOut)),
              ),
              child: child,
            );
          },
        ),
      ),
      
      GoRoute(
        path: '/roles',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const RoleSelectionPage(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return ScaleTransition(
              scale: animation.drive(
                Tween(begin: 0.0, end: 1.0)
                    .chain(CurveTween(curve: Curves.elasticOut)),
              ),
              child: child,
            );
          },
        ),
      ),
      
      // Main Shell Route with Bottom Navigation
      ShellRoute(
        builder: (context, state, child) => MainLayoutPage(child: child),
        routes: [
          // Dashboard Route
          GoRoute(
            path: '/dashboard',
            pageBuilder: (context, state) => NoTransitionPage(
              key: state.pageKey,
              child: const DashboardRouterPage(),
            ),
          ),
          
          // Health Twin Route
          GoRoute(
            path: '/health-twin',
            pageBuilder: (context, state) => NoTransitionPage(
              key: state.pageKey,
              child: const HealthTwinPage(),
            ),
            routes: [
              GoRoute(
                path: 'details/:patientId',
                pageBuilder: (context, state) => CustomTransitionPage(
                  key: state.pageKey,
                  child: HealthTwinPage(
                    patientId: state.pathParameters['patientId'],
                  ),
                  transitionsBuilder: (context, animation, secondaryAnimation, child) {
                    return SlideTransition(
                      position: animation.drive(
                        Tween(begin: const Offset(1.0, 0.0), end: Offset.zero)
                            .chain(CurveTween(curve: Curves.easeInOut)),
                      ),
                      child: child,
                    );
                  },
                ),
              ),
            ],
          ),
          
          // Telemedicine Route
          GoRoute(
            path: '/telemedicine',
            pageBuilder: (context, state) => NoTransitionPage(
              key: state.pageKey,
              child: const TelemedicinePage(),
            ),
            routes: [
              GoRoute(
                path: 'call/:consultationId',
                pageBuilder: (context, state) => CustomTransitionPage(
                  key: state.pageKey,
                  child: TelemedicinePage(
                    consultationId: state.pathParameters['consultationId'],
                  ),
                  transitionsBuilder: (context, animation, secondaryAnimation, child) {
                    return FadeTransition(opacity: animation, child: child);
                  },
                ),
              ),
            ],
          ),
          
          // Emergency Route
          GoRoute(
            path: '/emergency',
            pageBuilder: (context, state) => NoTransitionPage(
              key: state.pageKey,
              child: const EmergencyPage(),
            ),
          ),
          
          // LUMA Chat Route
          GoRoute(
            path: '/luma',
            pageBuilder: (context, state) => NoTransitionPage(
              key: state.pageKey,
              child: const LumaChatPage(),
            ),
          ),
          
          // Appointments Route
          GoRoute(
            path: '/appointments',
            pageBuilder: (context, state) => NoTransitionPage(
              key: state.pageKey,
              child: const AppointmentsPage(),
            ),
            routes: [
              GoRoute(
                path: 'book',
                pageBuilder: (context, state) => CustomTransitionPage(
                  key: state.pageKey,
                  child: const AppointmentsPage(initialTab: 'book'),
                  transitionsBuilder: (context, animation, secondaryAnimation, child) {
                    return SlideTransition(
                      position: animation.drive(
                        Tween(begin: const Offset(0.0, 1.0), end: Offset.zero)
                            .chain(CurveTween(curve: Curves.easeInOut)),
                      ),
                      child: child,
                    );
                  },
                ),
              ),
            ],
          ),
          
          // Prescriptions Route
          GoRoute(
            path: '/prescriptions',
            pageBuilder: (context, state) => NoTransitionPage(
              key: state.pageKey,
              child: const PrescriptionsPage(),
            ),
          ),
          
          // Analytics Route
          GoRoute(
            path: '/analytics',
            pageBuilder: (context, state) => NoTransitionPage(
              key: state.pageKey,
              child: const AnalyticsPage(),
            ),
          ),
          
          // Settings Route
          GoRoute(
            path: '/settings',
            pageBuilder: (context, state) => NoTransitionPage(
              key: state.pageKey,
              child: const SettingsPage(),
            ),
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: AppTheme.backgroundGradient,
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline,
                size: 64,
                color: AppTheme.dangerColor,
              ),
              const SizedBox(height: 16),
              Text(
                'Page Not Found',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'The page you are looking for does not exist.',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.go('/dashboard'),
                child: const Text('Go to Dashboard'),
              ),
            ],
          ),
        ),
      ),
    ),
  );
});

// Dashboard Router to handle role-based routing
class DashboardRouterPage extends ConsumerWidget {
  const DashboardRouterPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final userRole = authState.user?.role;

    switch (userRole) {
      case 'patient':
        return const PatientDashboardPage();
      case 'health_worker':
      case 'doctor':
        return const HealthWorkerDashboardPage();
      case 'admin':
      case 'moh':
        return const AdminDashboardPage();
      case 'ambulance_driver':
        return const EmergencyPage();
      case 'pharmacy':
        return const PrescriptionsPage();
      default:
        return const PatientDashboardPage();
    }
  }
}
