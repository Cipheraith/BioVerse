import 'dart:ui';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/animated_widgets.dart';
import '../../../auth/providers/auth_provider.dart';

class MainLayoutPage extends ConsumerStatefulWidget {
  final Widget child;
  
  const MainLayoutPage({super.key, required this.child});

  @override
  ConsumerState<MainLayoutPage> createState() => _MainLayoutPageState();
}

class _MainLayoutPageState extends ConsumerState<MainLayoutPage>
    with TickerProviderStateMixin {
  late AnimationController _backgroundController;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _backgroundController = AnimationController(
      duration: const Duration(seconds: 10),
      vsync: this,
    )..repeat();
    
    // Set initial index based on current route
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _updateSelectedIndex();
    });
  }

  @override
  void dispose() {
    _backgroundController.dispose();
    super.dispose();
  }

  void _updateSelectedIndex() {
    final location = GoRouterState.of(context).matchedLocation;
    setState(() {
      if (location.startsWith('/dashboard')) {
        _selectedIndex = 0;
      } else if (location.startsWith('/health-twin')) {
        _selectedIndex = 1;
      } else if (location.startsWith('/telemedicine')) {
        _selectedIndex = 2;
      } else if (location.startsWith('/emergency')) {
        _selectedIndex = 3;
      } else if (location.startsWith('/luma')) {
        _selectedIndex = 4;
      } else if (location.startsWith('/appointments')) {
        _selectedIndex = 1; // For health workers
      } else if (location.startsWith('/prescriptions')) {
        _selectedIndex = 1; // For pharmacies
      } else if (location.startsWith('/analytics')) {
        _selectedIndex = 2; // For admins
      }
    });
  }

  List<NavigationItem> _getNavigationItems(String? userRole) {
    switch (userRole) {
      case 'patient':
        return [
          NavigationItem(icon: Icons.dashboard, label: 'Dashboard', route: '/dashboard'),
          NavigationItem(icon: Icons.psychology, label: 'Health Twin', route: '/health-twin'),
          NavigationItem(icon: Icons.video_call, label: 'Telemedicine', route: '/telemedicine'),
          NavigationItem(icon: Icons.emergency, label: 'Emergency', route: '/emergency'),
          NavigationItem(icon: Icons.smart_toy, label: 'LUMA AI', route: '/luma'),
        ];
      case 'health_worker':
      case 'doctor':
        return [
          NavigationItem(icon: Icons.dashboard, label: 'Dashboard', route: '/dashboard'),
          NavigationItem(icon: Icons.calendar_today, label: 'Appointments', route: '/appointments'),
          NavigationItem(icon: Icons.video_call, label: 'Telemedicine', route: '/telemedicine'),
          NavigationItem(icon: Icons.emergency, label: 'Emergency', route: '/emergency'),
          NavigationItem(icon: Icons.psychology, label: 'Health Twins', route: '/health-twin'),
        ];
      case 'admin':
      case 'moh':
        return [
          NavigationItem(icon: Icons.dashboard, label: 'Dashboard', route: '/dashboard'),
          NavigationItem(icon: Icons.people, label: 'Users', route: '/analytics'),
          NavigationItem(icon: Icons.analytics, label: 'Analytics', route: '/analytics'),
          NavigationItem(icon: Icons.settings, label: 'Settings', route: '/settings'),
          NavigationItem(icon: Icons.emergency, label: 'Emergency', route: '/emergency'),
        ];
      case 'ambulance_driver':
        return [
          NavigationItem(icon: Icons.emergency, label: 'Emergency', route: '/emergency'),
          NavigationItem(icon: Icons.map, label: 'Map', route: '/emergency'),
          NavigationItem(icon: Icons.call, label: 'Communication', route: '/telemedicine'),
          NavigationItem(icon: Icons.person, label: 'Profile', route: '/settings'),
        ];
      case 'pharmacy':
        return [
          NavigationItem(icon: Icons.dashboard, label: 'Dashboard', route: '/dashboard'),
          NavigationItem(icon: Icons.medication, label: 'Prescriptions', route: '/prescriptions'),
          NavigationItem(icon: Icons.inventory, label: 'Inventory', route: '/prescriptions'),
          NavigationItem(icon: Icons.analytics, label: 'Reports', route: '/analytics'),
        ];
      default:
        return [
          NavigationItem(icon: Icons.dashboard, label: 'Dashboard', route: '/dashboard'),
          NavigationItem(icon: Icons.psychology, label: 'Health Twin', route: '/health-twin'),
          NavigationItem(icon: Icons.video_call, label: 'Telemedicine', route: '/telemedicine'),
          NavigationItem(icon: Icons.emergency, label: 'Emergency', route: '/emergency'),
        ];
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final userRole = authState.user?.role;
    final navigationItems = _getNavigationItems(userRole);
    
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF0F172A), // slate-900
              Color(0xFF1E293B), // slate-800
              Color(0xFF0F172A), // slate-900
            ],
          ),
        ),
        child: Stack(
          children: [
            // Animated background
            _buildAnimatedBackground(),
            
            // Main content
            widget.child,
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNavigationBar(navigationItems),
      extendBody: true,
    );
  }

  Widget _buildAnimatedBackground() {
    return AnimatedBuilder(
      animation: _backgroundController,
      builder: (context, child) {
        return Positioned.fill(
          child: CustomPaint(
            painter: BackgroundParticlesPainter(_backgroundController.value),
          ),
        );
      },
    );
  }

  Widget _buildBottomNavigationBar(List<NavigationItem> items) {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: LinearGradient(
          colors: [
            Colors.black.withOpacity(0.8),
            Colors.grey[900]!.withOpacity(0.9),
          ],
        ),
        border: Border.all(
          color: Colors.grey.withOpacity(0.2),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(28),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            height: 80,
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: items.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                final isSelected = _selectedIndex == index;
                
                return AnimatedTapBounce(
                  onTap: () {
                    setState(() => _selectedIndex = index);
                    context.go(item.route);
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeInOutCubic,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      gradient: isSelected
                          ? const LinearGradient(
                              colors: [Color(0xFF0891B2), Color(0xFF1D4ED8)],
                            )
                          : null,
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: Colors.cyan.withOpacity(0.3),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              ),
                            ]
                          : null,
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          child: Icon(
                            item.icon,
                            color: isSelected 
                                ? Colors.white 
                                : Colors.grey[400],
                            size: isSelected ? 26 : 24,
                          ),
                        ),
                        const SizedBox(height: 4),
                        AnimatedDefaultTextStyle(
                          duration: const Duration(milliseconds: 300),
                          style: TextStyle(
                            color: isSelected 
                                ? Colors.white 
                                : Colors.grey[400],
                            fontSize: isSelected ? 12 : 10,
                            fontWeight: isSelected 
                                ? FontWeight.w600 
                                : FontWeight.w500,
                          ),
                          child: Text(item.label),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }
}

class NavigationItem {
  final IconData icon;
  final String label;
  final String route;

  NavigationItem({
    required this.icon,
    required this.label,
    required this.route,
  });
}

class BackgroundParticlesPainter extends CustomPainter {
  final double animationValue;
  
  BackgroundParticlesPainter(this.animationValue);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.cyan.withOpacity(0.1)
      ..style = PaintingStyle.fill;

    // Draw floating particles
    for (int i = 0; i < 15; i++) {
      final x = (size.width * 0.1) + 
               (i * size.width * 0.08) + 
               (20 * sin(animationValue * 2 * pi + i));
      final y = (size.height * 0.2) + 
               (i * size.height * 0.05) + 
               (15 * cos(animationValue * 2 * pi + i * 0.5));
      
      canvas.drawCircle(
        Offset(x, y),
        2 + (sin(animationValue * 4 * pi + i) * 1),
        paint,
      );
    }

    // Draw connecting lines
    final linePaint = Paint()
      ..color = Colors.blue.withOpacity(0.05)
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;

    for (int i = 0; i < 8; i++) {
      final startX = size.width * 0.1 + (i * size.width * 0.12);
      final startY = size.height * 0.3 + 
                    (30 * sin(animationValue * 2 * pi + i));
      final endX = size.width * 0.9 - (i * size.width * 0.12);
      final endY = size.height * 0.7 + 
                  (30 * cos(animationValue * 2 * pi + i));
      
      canvas.drawLine(
        Offset(startX, startY),
        Offset(endX, endY),
        linePaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
