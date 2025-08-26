import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';

class ModernLandingPage extends StatefulWidget {
  const ModernLandingPage({super.key});

  @override
  State<ModernLandingPage> createState() => _ModernLandingPageState();
}

class _ModernLandingPageState extends State<ModernLandingPage>
    with TickerProviderStateMixin {
  late AnimationController _heroAnimationController;
  late AnimationController _statsAnimationController;
  late Animation<double> _fadeInAnimation;
  late Animation<Offset> _slideInAnimation;

  @override
  void initState() {
    super.initState();
    _heroAnimationController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    _statsAnimationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    
    _fadeInAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _heroAnimationController,
      curve: Curves.easeInOut,
    ));
    
    _slideInAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _heroAnimationController,
      curve: Curves.easeOutBack,
    ));

    _heroAnimationController.forward();
    Future.delayed(const Duration(milliseconds: 500), () {
      _statsAnimationController.forward();
    });
  }

  @override
  void dispose() {
    _heroAnimationController.dispose();
    _statsAnimationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      extendBodyBehindAppBar: true,
      appBar: _buildAppBar(),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildHeroSection(size),
            _buildFeaturesSection(),
            _buildCompetitiveSection(),
            _buildImpactSection(),
            _buildCTASection(),
            _buildFooter(),
          ],
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.transparent,
      elevation: 0,
      systemOverlayStyle: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
      ),
      leading: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            gradient: LinearGradient(
              colors: AppTheme.primaryGradient,
            ),
          ),
          child: const Icon(
            Icons.biotech,
            color: Colors.white,
            size: 24,
          ),
        ),
      ),
      title: Text(
        'BioVerse',
        style: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          foreground: Paint()
            ..shader = LinearGradient(
              colors: AppTheme.primaryGradient,
            ).createShader(const Rect.fromLTWH(0, 0, 200, 70)),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => context.go('/login'),
          child: Text(
            'Sign In',
            style: GoogleFonts.inter(
              color: AppTheme.textPrimary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Container(
          margin: const EdgeInsets.only(right: 16, left: 8),
          child: ElevatedButton(
            onPressed: () => context.go('/register'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryBlue,
              foregroundColor: AppTheme.textWhite,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            ),
            child: Text(
              'Get Started',
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHeroSection(Size size) {
    return Container(
      height: size.height,
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: AppTheme.backgroundGradient,
        ),
      ),
      child: Stack(
        children: [
          // Animated background particles
          ...List.generate(30, (index) {
            return AnimatedBuilder(
              animation: _heroAnimationController,
              builder: (context, child) {
                return Positioned(
                  left: (index % 5) * (size.width / 5) + 
                        (50 * _fadeInAnimation.value),
                  top: (index ~/ 5) * (size.height / 6) + 
                       (30 * _fadeInAnimation.value),
                  child: Opacity(
                    opacity: _fadeInAnimation.value * 0.3,
                    child: Container(
                      width: 4,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppTheme.primaryCyan,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                );
              },
            );
          }),
          
          // Main content
          SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                minHeight: size.height,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(height: size.height * 0.1),
                
                // Badge
                FadeTransition(
                  opacity: _fadeInAnimation,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppTheme.primaryBlue.withOpacity(0.1),
                          AppTheme.primaryCyan.withOpacity(0.1),
                        ],
                      ),
                      border: Border.all(
                        color: AppTheme.primaryBlue.withOpacity(0.2),
                      ),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.favorite,
                          color: Colors.red,
                          size: 16,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Your Personal Health Companion',
                          style: GoogleFonts.inter(
                            color: AppTheme.primaryBlue,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: Colors.green,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // Main headline
                SlideTransition(
                  position: _slideInAnimation,
                  child: FadeTransition(
                    opacity: _fadeInAnimation,
                    child: Column(
                      children: [
                        Text(
                          "Your Health,",
                          style: GoogleFonts.inter(
                            fontSize: 40,
                            fontWeight: FontWeight.bold,
                            height: 1.1,
                            foreground: Paint()
                              ..shader = const LinearGradient(
                                colors: [Colors.white, Color(0xFFE0E7FF), Color(0xFF67E8F9)],
                              ).createShader(const Rect.fromLTWH(0, 0, 300, 100)),
                          ),
                          textAlign: TextAlign.center,
                        ),
                        Text(
                          "Reimagined",
                          style: GoogleFonts.inter(
                            fontSize: 40,
                            fontWeight: FontWeight.bold,
                            height: 1.1,
                            foreground: Paint()
                              ..shader = LinearGradient(
                                colors: [AppTheme.primaryBlue, AppTheme.primaryCyan, const Color(0xFF10B981)],
                              ).createShader(const Rect.fromLTWH(0, 0, 300, 100)),
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // Subtitle
                FadeTransition(
                  opacity: _fadeInAnimation,
                  child: Text(
                    "Take control of your health with AI-powered predictions, instant access to doctors, and personalized health insights. Get the care you deserve, when you need it.",
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      color: AppTheme.textPrimary,
                      height: 1.6,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                
                const SizedBox(height: 32),
                
                // CTA Buttons
                FadeTransition(
                  opacity: _fadeInAnimation,
                  child: Column(
                    children: [
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => context.go('/register'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryBlue,
                            foregroundColor: AppTheme.textWhite,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Start Your Health Journey',
                                style: GoogleFonts.inter(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Icon(Icons.arrow_forward, size: 18),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton(
                          onPressed: () {
                            // Show demo dialog or navigate to demo
                          },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppTheme.textWhite,
                            side: BorderSide(color: AppTheme.borderColor),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.play_arrow, size: 18),
                              const SizedBox(width: 8),
                              Text(
                                'Learn More',
                                style: GoogleFonts.inter(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 48),
                
                // Stats
                AnimatedBuilder(
                  animation: _statsAnimationController,
                  builder: (context, child) {
                    return Opacity(
                      opacity: _statsAnimationController.value,
                      child: _buildStats(),
                    );
                  },
                ),
                SizedBox(height: size.height * 0.1),
              ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStats() {
    final stats = [
      {'number': '24/7', 'label': 'Access to Healthcare Services', 'icon': Icons.access_time},
      {'number': '1000+', 'label': 'Verified Healthcare Providers', 'icon': Icons.verified_user},
      {'number': '< 5min', 'label': 'Average Response Time', 'icon': Icons.speed},
      {'number': '99.9%', 'label': 'Service Uptime', 'icon': Icons.check_circle},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
        childAspectRatio: 1.2,
      ),
      itemCount: stats.length,
      itemBuilder: (context, index) {
        final stat = stats[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.cardColor.withOpacity(0.5),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.borderColor),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                stat['icon'] as IconData,
                color: AppTheme.primaryCyan,
                size: 24,
              ),
              const SizedBox(height: 8),
              Text(
                stat['number'] as String,
                style: GoogleFonts.inter(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                stat['label'] as String,
                style: GoogleFonts.inter(
                  fontSize: 10,
                  color: AppTheme.textPrimary,
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildFeaturesSection() {
    final features = [
      {
        'icon': Icons.psychology,
        'title': 'AI Health Assistant',
        'description': 'Get instant health advice and personalized recommendations powered by advanced AI',
        'gradient': [const Color(0xFFEF4444), const Color(0xFFEC4899)],
      },
      {
        'icon': Icons.video_call,
        'title': 'Virtual Consultations',
        'description': 'Connect with certified doctors and specialists from the comfort of your home',
        'gradient': [AppTheme.primaryBlue, AppTheme.primaryCyan],
      },
      {
        'icon': Icons.shield_outlined,
        'title': 'Secure & Private',
        'description': 'Your health data is encrypted and protected with bank-level security',
        'gradient': [const Color(0xFF10B981), const Color(0xFF059669)],
      },
      {
        'icon': Icons.emergency,
        'title': 'Emergency Response',
        'description': 'Quick access to ambulance services and emergency care when you need it most',
        'gradient': [const Color(0xFFF59E0B), const Color(0xFFEF4444)],
      },
    ];

    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Text(
            'Healthcare Made Simple',
            style: GoogleFonts.inter(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              foreground: Paint()
                ..shader = LinearGradient(
                  colors: [AppTheme.primaryBlue, AppTheme.primaryCyan],
                ).createShader(const Rect.fromLTWH(0, 0, 300, 70)),
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'Everything you need to stay healthy, all in one app',
            style: GoogleFonts.inter(
              fontSize: 16,
              color: AppTheme.textPrimary,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: features.length,
            itemBuilder: (context, index) {
              final feature = features[index];
              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppTheme.cardColor.withOpacity(0.5),
                      AppTheme.surfaceColor.withOpacity(0.3),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.borderColor.withOpacity(0.5)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: feature['gradient'] as List<Color>,
                        ),
                        borderRadius: BorderRadius.circular(12),
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
                            style: GoogleFonts.inter(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            feature['description'] as String,
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              color: AppTheme.textPrimary,
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildCompetitiveSection() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            AppTheme.backgroundColor,
            Colors.black,
          ],
        ),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              border: Border.all(color: AppTheme.primaryBlue.withOpacity(0.2)),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.bolt, color: AppTheme.primaryBlue, size: 16),
                const SizedBox(width: 8),
                Text(
                  'What Makes BioVerse Different',
                  style: GoogleFonts.inter(
                    color: AppTheme.primaryBlue,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Healthcare That Understands You',
            style: GoogleFonts.inter(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              foreground: Paint()
                ..shader = const LinearGradient(
                  colors: [Color(0xFFD1D5DB), Color(0xFFE5E7EB), Color(0xFFF9FAFB)],
                ).createShader(const Rect.fromLTWH(0, 0, 300, 70)),
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            'BioVerse combines the best of modern medicine with AI technology to give you personalized health insights and predictions tailored to your unique needs.',
            style: GoogleFonts.inter(
              fontSize: 16,
              color: AppTheme.textPrimary,
              height: 1.6,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),
          _buildCompetitiveDifference(),
        ],
      ),
    );
  }

  Widget _buildCompetitiveDifference() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppTheme.primaryBlue.withOpacity(0.4),
            AppTheme.primaryCyan.withOpacity(0.4),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.primaryCyan.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.primaryCyan, AppTheme.primaryBlue],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.psychology,
              color: Colors.white,
              size: 24,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'BioVerse AI Healthcare',
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 16),
          ...[
            'AI Predictions - Know health risks before symptoms appear',
            'Personal Health Twin - Your digital health companion',
            'Local Doctors - Connect with healthcare providers near you',
            'Secure & Private - Your health data is protected',
            'Works Everywhere - Even with slow internet connection',
          ].map((feature) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                const Icon(Icons.check, color: Colors.green, size: 16),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    feature,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ),
              ],
            ),
          )).toList(),
        ],
      ),
    );
  }

  Widget _buildImpactSection() {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Text(
            'Your Health, Our Priority',
            style: GoogleFonts.inter(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              foreground: Paint()
                ..shader = LinearGradient(
                  colors: [const Color(0xFF10B981), AppTheme.primaryCyan],
                ).createShader(const Rect.fromLTWH(0, 0, 300, 70)),
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            'Join thousands of users who have taken control of their health with BioVerse. From prevention to treatment, we\'re with you every step of your health journey.',
            style: GoogleFonts.inter(
              fontSize: 16,
              color: AppTheme.textPrimary,
              height: 1.6,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),
          ...[
            'Track vital signs and get health insights in real-time',
            'Book appointments with verified healthcare providers',
            'Access your medical records anytime, anywhere',
            'Get emergency help with one-touch SOS feature',
          ].map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              children: [
                const Icon(Icons.check_circle, color: Color(0xFF10B981), size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    item,
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ),
              ],
            ),
          )).toList(),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: AppTheme.cardGradient,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.borderColor),
            ),
            child: GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 1.5,
              children: [
                _buildImpactStat('50K+', 'Happy Users', const Color(0xFF10B981)),
                _buildImpactStat('4.8★', 'User Rating', AppTheme.primaryBlue),
                _buildImpactStat('1M+', 'Consultations', AppTheme.primaryCyan),
                _buildImpactStat('#1', 'Health App', const Color(0xFF8B5CF6)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImpactStat(String number, String label, Color color) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          number,
          style: GoogleFonts.inter(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12,
            color: AppTheme.textPrimary,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildCTASection() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppTheme.primaryBlue.withOpacity(0.1),
            AppTheme.primaryCyan.withOpacity(0.1),
          ],
        ),
      ),
      child: Column(
        children: [
          Text(
            'Ready for the Future of Healthcare?',
            style: GoogleFonts.inter(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              foreground: Paint()
                ..shader = const LinearGradient(
                  colors: [Colors.white, Color(0xFF67E8F9)],
                ).createShader(const Rect.fromLTWH(0, 0, 300, 70)),
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            'Join thousands of users who trust BioVerse for their healthcare needs. Start your journey to better health today.',
            style: GoogleFonts.inter(
              fontSize: 16,
              color: AppTheme.textPrimary,
              height: 1.6,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),
          Column(
            children: [
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => context.go('/register'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryCyan,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Get Started Free',
                        style: GoogleFonts.inter(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(Icons.arrow_forward, size: 20),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () {
                    // Navigate to contact
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.primaryCyan,
                    side: BorderSide(color: AppTheme.primaryCyan),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.phone, size: 18),
                      const SizedBox(width: 8),
                      Text(
                        'Schedule a Demo',
                        style: GoogleFonts.inter(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFooter() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.backgroundColor,
        border: Border(
          top: BorderSide(color: AppTheme.borderColor),
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: AppTheme.primaryGradient),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.biotech, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'BioVerse',
                    style: GoogleFonts.inter(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  TextButton(
                    onPressed: () {},
                    child: Text(
                      'Privacy',
                      style: GoogleFonts.inter(color: AppTheme.textPrimary),
                    ),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: Text(
                      'Terms',
                      style: GoogleFonts.inter(color: AppTheme.textPrimary),
                    ),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: Text(
                      'Contact',
                      style: GoogleFonts.inter(color: AppTheme.textPrimary),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Divider(color: AppTheme.borderColor),
          const SizedBox(height: 16),
          Text(
            '© 2024 BioVerse. Your trusted health companion.',
            style: GoogleFonts.inter(
              color: AppTheme.textPrimary,
              fontSize: 14,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
