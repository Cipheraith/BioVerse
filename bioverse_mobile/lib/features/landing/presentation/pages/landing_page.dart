import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'dart:math' as math;
import '../../../../core/widgets/bioverse_logo.dart';
import '../../../../core/widgets/animated_widgets.dart';
import '../../../../core/widgets/premium_widgets.dart';
import '../../../../core/animations/advanced_animations.dart';
import '../../../../core/theme/bioverse_theme.dart';

class LandingPage extends StatefulWidget {
  const LandingPage({super.key});

  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage>
    with TickerProviderStateMixin {
  late AnimationController _particleController;
  late AnimationController _featureController;
  int currentFeature = 0;
  
  final features = [
    {'icon': Icons.psychology, 'title': 'AI Health Twins', 'desc': 'Digital replicas that predict your health future'},
    {'icon': Icons.monitor_heart, 'title': 'Real-time Monitoring', 'desc': 'Continuous health tracking with instant alerts'},
    {'icon': Icons.biotech, 'title': 'Molecular Analysis', 'desc': 'Cellular-level health insights and predictions'},
    {'icon': Icons.precision_manufacturing, 'title': 'Precision Medicine', 'desc': 'Personalized treatments based on your unique profile'},
  ];

  @override
  void initState() {
    super.initState();
    _particleController = AnimationController(
      duration: const Duration(seconds: 20),
      vsync: this,
    )..repeat();
    
    _featureController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat();
    
    // Cycle through features
    _featureController.addListener(() {
      if (_featureController.value == 0) {
        setState(() {
          currentFeature = (currentFeature + 1) % features.length;
        });
      }
    });
  }

  @override
  void dispose() {
    _particleController.dispose();
    _featureController.dispose();
    super.dispose();
  }
  
  void _showDemoModal() {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          child: Container(
            padding: const EdgeInsets.all(24),
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'BioVerse Demo',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.close, color: Colors.grey),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Container(
                  height: 200,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    gradient: const LinearGradient(
                      colors: [Color(0xFF1E293B), Color(0xFF334155)],
                    ),
                  ),
                  child: const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.play_circle_filled,
                        size: 64,
                        color: Colors.cyan,
                      ),
                      SizedBox(height: 16),
                      Text(
                        'BioVerse Demo Video',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Experience the future of healthcare',
                        style: TextStyle(
                          color: Colors.grey,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.cyan,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text(
                      'Close',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF0F172A), // slate-900
              Color(0xFF581C87), // purple-900
              Color(0xFF0F172A), // slate-900
            ],
          ),
        ),
        child: Stack(
          children: [
            // Animated Background
            _buildAnimatedBackground(),
            
            // Main Content
            SafeArea(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: Column(
                    children: [
                      _buildHeader(),
                      _buildHeroSection(),
                      _buildFeaturesSection(),
                      _buildCallToActionSection(),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildAnimatedBackground() {
    return AnimatedBuilder(
      animation: _particleController,
      builder: (context, child) {
        return Stack(
          children: [
            // Glowing orbs
            Positioned(
              top: 80,
              left: 40,
              child: Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      Colors.blue.withOpacity(0.2),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: 100,
              right: 20,
              child: Container(
                width: 150,
                height: 150,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      Colors.purple.withOpacity(0.3),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
            
            // Floating particles
            ...List.generate(20, (index) {
              final angle = (index * 18.0) + (_particleController.value * 360);
              final radius = 100 + (index * 10);
              final x = MediaQuery.of(context).size.width / 2 + 
                       math.cos(angle * math.pi / 180) * radius;
              final y = MediaQuery.of(context).size.height / 2 + 
                       math.sin(angle * math.pi / 180) * radius;
              
              return Positioned(
                left: x,
                top: y,
                child: Container(
                  width: 4,
                  height: 4,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.cyan.withOpacity(0.6),
                  ),
                ),
              );
            }),
          ],
        );
      },
    );
  }
  
  Widget _buildHeader() {
    return AnimatedSlideIn(
      delay: const Duration(milliseconds: 200),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 24.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedFloat(
              child: const BioVerseLogoMini(size: 48),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AnimatedTypewriter(
                  text: 'BIOVERSE',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: 2,
                  ),
                  delay: const Duration(milliseconds: 500),
                ),
                const Text(
                  'AI-POWERED HEALTH NETWORK',
                  style: TextStyle(
                    fontSize: 10,
                    color: Colors.grey,
                    letterSpacing: 1,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildHeroSection() {
    return Column(
      children: [
        const SizedBox(height: 20),
        
        // Badge
        AnimatedSlideIn(
          delay: const Duration(milliseconds: 400),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: Colors.blue.withOpacity(0.3),
              ),
              gradient: LinearGradient(
                colors: [
                  Colors.blue.withOpacity(0.1),
                  Colors.purple.withOpacity(0.1),
                ],
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.auto_awesome, size: 16, color: Colors.blue),
                const SizedBox(width: 8),
                const Text(
                  "World's First AI Health Twin Network",
                  style: TextStyle(
                    color: Colors.blue,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(width: 8),
                AnimatedPulse(
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.green,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        
        const SizedBox(height: 24),
        
        // Main title
        AnimatedSlideIn(
          delay: const Duration(milliseconds: 600),
          child: Column(
            children: [
              ShaderMask(
                shaderCallback: (bounds) => const LinearGradient(
                  colors: [Colors.white, Colors.cyan, Colors.blue],
                ).createShader(bounds),
                child: const Text(
                  'The Future of',
                  style: TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 8),
              ShaderMask(
                shaderCallback: (bounds) => const LinearGradient(
                  colors: [Colors.purple, Colors.pink, Colors.red],
                ).createShader(bounds),
                child: const Text(
                  'Healthcare is Here',
                  style: TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
        
        const SizedBox(height: 24),
        
        // Description
        AnimatedSlideIn(
          delay: const Duration(milliseconds: 800),
          child: Text(
            'BioVerse creates digital twins of your health that predict, prevent, and personalize your medical care. Our groundbreaking AI analyzes your unique biological patterns to deliver precision medicine that adapts in real-time.',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[300],
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
        ),
        
        const SizedBox(height: 32),
        
        // Premium Action Buttons - Competition Winning Design!
        AnimatedSlideIn(
          delay: const Duration(milliseconds: 1000),
          child: Column(
            children: [
              // Watch Demo Button - Simple gradient
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton.icon(
                  onPressed: _showDemoModal,
                  icon: const Icon(Icons.play_arrow, color: Colors.white),
                  label: const Text(
                    'Watch Demo',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: BioVerseTheme.primaryCyan,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(28),
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: 16),
              
              // Start Your Health Journey Button
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton.icon(
                  onPressed: () => context.go('/register'),
                  icon: const Icon(Icons.rocket_launch, color: Colors.white),
                  label: const Text(
                    'Start Your Health Journey',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: BioVerseTheme.primaryPurple,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(28),
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: 16),
              
              // Sign In Button - Simple outline
              SizedBox(
                width: double.infinity,
                height: 56,
                child: OutlinedButton(
                  onPressed: () => context.go('/login'),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: BioVerseTheme.primaryCyan, width: 1.5),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(28),
                    ),
                  ),
                  child: const Text(
                    'Sign In',
                    style: TextStyle(
                      color: BioVerseTheme.primaryCyan,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
  
  Widget _buildFeaturesSection() {
    return AnimatedSlideIn(
      delay: const Duration(milliseconds: 1200),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 48.0),
        child: Column(
          children: [
            const Text(
              'Breakthrough Features',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            
            // Premium Feature Cards - Simplified for Initial Run
            ...features.asMap().entries.map((entry) {
              final index = entry.key;
              final feature = entry.value;
              final isActive = currentFeature == index;
              
              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isActive ? BioVerseTheme.primaryCyan : Colors.grey.withOpacity(0.3),
                    width: isActive ? 2 : 1,
                  ),
                  gradient: LinearGradient(
                    colors: isActive 
                        ? [BioVerseTheme.primaryCyan.withOpacity(0.1), BioVerseTheme.primaryBlue.withOpacity(0.1)]
                        : [Colors.grey.withOpacity(0.05), Colors.transparent],
                  ),
                ),
                child: Row(
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        gradient: isActive
                            ? BioVerseTheme.primaryGradient
                            : LinearGradient(
                                colors: [Colors.grey.withOpacity(0.3), Colors.grey.withOpacity(0.1)],
                              ),
                      ),
                      child: Icon(
                        feature['icon'] as IconData,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            feature['title'] as String,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            feature['desc'] as String,
                            style: TextStyle(
                              color: Colors.grey[400],
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }
  
  Widget _buildCallToActionSection() {
    return AnimatedSlideIn(
      delay: const Duration(milliseconds: 1400),
      child: Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          gradient: LinearGradient(
            colors: [
              Colors.cyan.withOpacity(0.1),
              Colors.purple.withOpacity(0.1),
            ],
          ),
          border: Border.all(
            color: Colors.cyan.withOpacity(0.3),
          ),
        ),
        child: Column(
          children: [
            const Icon(
              Icons.rocket_launch,
              size: 48,
              color: Colors.cyan,
            ),
            const SizedBox(height: 16),
            const Text(
              'Ready to Transform Your Health?',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              "Don't wait for the future of healthcare—experience it today.",
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[300],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => context.go('/register'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: BioVerseTheme.primaryCyan,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                    ),
                    child: const Text(
                      'Get Started',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => context.go('/roles'),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(
                        color: BioVerseTheme.primaryPurple.withOpacity(0.5),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                    ),
                    child: const Text(
                      'Learn More',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Wrap(
              alignment: WrapAlignment.center,
              runSpacing: 8,
              spacing: 16,
              children: [
                _buildFeatureBadge('Free to start', Icons.check_circle, Colors.green),
                _buildFeatureBadge('HIPAA compliant', Icons.security, Colors.blue),
                _buildFeatureBadge('Award winning', Icons.star, Colors.amber),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildFeatureBadge(String text, IconData icon, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 4),
        Text(
          text,
          style: TextStyle(
            color: Colors.grey[400],
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}

