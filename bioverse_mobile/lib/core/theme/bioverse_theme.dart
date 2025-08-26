import 'package:flutter/material.dart';

/// BioVerse Premium Theme System
/// Implementing the web app's sophisticated design language
/// 
/// This theme system will make the mobile app competition-ready
/// for the ZICTA Young Innovators Program!

class BioVerseTheme {
  // Core Color Palette - matching web app
  static const Color primaryCyan = Color(0xFF43E97B);
  static const Color primaryBlue = Color(0xFF5A67D8);
  static const Color primaryPurple = Color(0xFF667EEA);
  static const Color accentPink = Color(0xFFF093FB);
  static const Color accentOrange = Color(0xFFECC94B);

  // Background Colors
  static const Color darkBackground = Color(0xFF0F0F23);
  static const Color darkSecondary = Color(0xFF1A1A2E);
  static const Color darkTertiary = Color(0xFF16213E);

  // Surface Colors
  static const Color surfaceDark = Color(0xFF232946);
  static const Color surfaceCard = Color(0xFF1A1D25);
  static const Color surfaceBorder = Color(0xFF2D334A);

  // Text Colors
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFA0A0A0);
  static const Color textMuted = Color(0xFF6B7280);

  // Gradient Definitions
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryCyan, primaryBlue, primaryPurple],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient backgroundGradient = LinearGradient(
    colors: [darkBackground, darkSecondary, darkBackground],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardGradient = LinearGradient(
    colors: [Color(0xFF232946), Color(0xFF1A1D25)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient glowGradient = LinearGradient(
    colors: [
      Color(0x4043E97B),
      Color(0x405A67D8),
      Color(0x40667EEA),
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Animation Gradients
  static const LinearGradient shimmerGradient = LinearGradient(
    colors: [
      Color(0xFF2D3748),
      Color(0xFF4A5568),
      Color(0xFF2D3748),
    ],
    stops: [0.25, 0.5, 0.75],
  );

  // Box Shadow Definitions
  static List<BoxShadow> get cardShadow => [
    BoxShadow(
      color: Colors.black.withOpacity(0.3),
      blurRadius: 24,
      offset: const Offset(0, 8),
    ),
  ];

  static List<BoxShadow> get glowShadow => [
    BoxShadow(
      color: primaryCyan.withOpacity(0.3),
      blurRadius: 20,
      offset: const Offset(0, 0),
    ),
    BoxShadow(
      color: primaryBlue.withOpacity(0.2),
      blurRadius: 40,
      offset: const Offset(0, 0),
    ),
  ];

  static List<BoxShadow> get buttonShadow => [
    BoxShadow(
      color: primaryCyan.withOpacity(0.3),
      blurRadius: 20,
      offset: const Offset(0, 10),
    ),
    BoxShadow(
      color: primaryBlue.withOpacity(0.2),
      blurRadius: 10,
      offset: const Offset(0, 5),
    ),
  ];

  // Theme Data
  static ThemeData get darkTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    fontFamily: 'Inter',
    
    // Color Scheme
    colorScheme: const ColorScheme.dark(
      primary: primaryCyan,
      secondary: primaryBlue,
      tertiary: primaryPurple,
      background: darkBackground,
      surface: surfaceDark,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onBackground: textPrimary,
      onSurface: textPrimary,
    ),

    // App Bar Theme
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: TextStyle(
        color: textPrimary,
        fontSize: 20,
        fontWeight: FontWeight.w700,
      ),
    ),

    // Card Theme
    cardTheme: CardThemeData(
      color: surfaceCard,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(
          color: surfaceBorder,
          width: 1,
        ),
      ),
      shadowColor: Colors.black.withOpacity(0.3),
    ),

    // Button Themes
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.transparent,
        foregroundColor: textPrimary,
        shadowColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: 24,
          vertical: 16,
        ),
        textStyle: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w700,
        ),
      ),
    ),

    // Input Decoration Theme
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: surfaceCard,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(
          color: surfaceBorder,
          width: 1,
        ),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(
          color: surfaceBorder,
          width: 1,
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(
          color: primaryCyan,
          width: 2,
        ),
      ),
      hintStyle: const TextStyle(
        color: textMuted,
        fontSize: 16,
      ),
      labelStyle: const TextStyle(
        color: textSecondary,
        fontSize: 14,
      ),
      contentPadding: const EdgeInsets.all(16),
    ),

    // Text Theme
    textTheme: const TextTheme(
      displayLarge: TextStyle(
        color: textPrimary,
        fontSize: 32,
        fontWeight: FontWeight.w900,
        height: 1.2,
      ),
      displayMedium: TextStyle(
        color: textPrimary,
        fontSize: 28,
        fontWeight: FontWeight.w800,
        height: 1.3,
      ),
      displaySmall: TextStyle(
        color: textPrimary,
        fontSize: 24,
        fontWeight: FontWeight.w700,
        height: 1.3,
      ),
      headlineLarge: TextStyle(
        color: textPrimary,
        fontSize: 22,
        fontWeight: FontWeight.w700,
        height: 1.4,
      ),
      headlineMedium: TextStyle(
        color: textPrimary,
        fontSize: 20,
        fontWeight: FontWeight.w600,
        height: 1.4,
      ),
      headlineSmall: TextStyle(
        color: textPrimary,
        fontSize: 18,
        fontWeight: FontWeight.w600,
        height: 1.4,
      ),
      titleLarge: TextStyle(
        color: textPrimary,
        fontSize: 16,
        fontWeight: FontWeight.w600,
        height: 1.5,
      ),
      titleMedium: TextStyle(
        color: textPrimary,
        fontSize: 14,
        fontWeight: FontWeight.w500,
        height: 1.5,
      ),
      titleSmall: TextStyle(
        color: textSecondary,
        fontSize: 12,
        fontWeight: FontWeight.w500,
        height: 1.5,
      ),
      bodyLarge: TextStyle(
        color: textPrimary,
        fontSize: 16,
        fontWeight: FontWeight.w400,
        height: 1.5,
      ),
      bodyMedium: TextStyle(
        color: textSecondary,
        fontSize: 14,
        fontWeight: FontWeight.w400,
        height: 1.5,
      ),
      bodySmall: TextStyle(
        color: textMuted,
        fontSize: 12,
        fontWeight: FontWeight.w400,
        height: 1.5,
      ),
    ),
  );
}

/// Premium Button Styles
class BioVerseButtons {
  static ButtonStyle get primaryButton => ElevatedButton.styleFrom(
    backgroundColor: Colors.transparent,
    foregroundColor: Colors.white,
    shadowColor: Colors.transparent,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(16),
    ),
    padding: const EdgeInsets.symmetric(
      horizontal: 32,
      vertical: 16,
    ),
  );

  static ButtonStyle get secondaryButton => OutlinedButton.styleFrom(
    backgroundColor: Colors.transparent,
    foregroundColor: BioVerseTheme.primaryCyan,
    side: const BorderSide(
      color: BioVerseTheme.primaryCyan,
      width: 2,
    ),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(16),
    ),
    padding: const EdgeInsets.symmetric(
      horizontal: 32,
      vertical: 16,
    ),
  );

  static ButtonStyle get glassMorphismButton => ElevatedButton.styleFrom(
    backgroundColor: Colors.white.withOpacity(0.1),
    foregroundColor: Colors.white,
    shadowColor: Colors.transparent,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(16),
      side: BorderSide(
        color: Colors.white.withOpacity(0.2),
        width: 1,
      ),
    ),
    padding: const EdgeInsets.symmetric(
      horizontal: 32,
      vertical: 16,
    ),
  );
}

/// Custom Decorations
class BioVerseDecorations {
  static BoxDecoration get cardDecoration => BoxDecoration(
    borderRadius: BorderRadius.circular(16),
    gradient: BioVerseTheme.cardGradient,
    border: Border.all(
      color: BioVerseTheme.surfaceBorder,
      width: 1,
    ),
    boxShadow: BioVerseTheme.cardShadow,
  );

  static BoxDecoration get glowingCardDecoration => BoxDecoration(
    borderRadius: BorderRadius.circular(16),
    gradient: BioVerseTheme.cardGradient,
    border: Border.all(
      color: BioVerseTheme.primaryCyan.withOpacity(0.3),
      width: 1,
    ),
    boxShadow: BioVerseTheme.glowShadow,
  );

  static BoxDecoration get glassMorphismDecoration => BoxDecoration(
    borderRadius: BorderRadius.circular(16),
    color: Colors.white.withOpacity(0.1),
    border: Border.all(
      color: Colors.white.withOpacity(0.2),
      width: 1,
    ),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.1),
        blurRadius: 10,
        offset: const Offset(0, 5),
      ),
    ],
  );

  static BoxDecoration get gradientButtonDecoration => BoxDecoration(
    borderRadius: BorderRadius.circular(16),
    gradient: BioVerseTheme.primaryGradient,
    boxShadow: BioVerseTheme.buttonShadow,
  );

  static BoxDecoration get shimmerDecoration => const BoxDecoration(
    borderRadius: BorderRadius.all(Radius.circular(8)),
    gradient: BioVerseTheme.shimmerGradient,
  );
}

/// Text Styles with Gradients
class BioVerseTextStyles {
  static TextStyle get gradientTitle => const TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.w900,
    color: Colors.white,
  );

  static TextStyle get gradientSubtitle => const TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: Colors.white,
  );

  static TextStyle get glowingText => TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w700,
    color: Colors.white,
    shadows: [
      Shadow(
        color: BioVerseTheme.primaryCyan.withOpacity(0.5),
        blurRadius: 10,
      ),
    ],
  );
}

/// Animation Constants
class BioVerseAnimations {
  static const Duration ultraFast = Duration(milliseconds: 150);
  static const Duration fast = Duration(milliseconds: 250);
  static const Duration normal = Duration(milliseconds: 400);
  static const Duration slow = Duration(milliseconds: 600);
  static const Duration verySlow = Duration(milliseconds: 1000);

  // Premium Animation Curves
  static const Curve elasticOut = Curves.elasticOut;
  static const Curve bounceOut = Curves.bounceOut;
  static const Curve fastOutSlowIn = Curves.fastOutSlowIn;
  static const Curve easeInOutCubic = Curves.easeInOutCubic;
  static const Curve easeOutBack = Curves.easeOutBack;
  static const Curve easeInOutBack = Curves.easeInOutBack;
}

/// Responsive Breakpoints
class BioVerseBreakpoints {
  static const double mobile = 480;
  static const double tablet = 768;
  static const double desktop = 1024;
  static const double largeDesktop = 1440;

  static bool isMobile(BuildContext context) {
    return MediaQuery.of(context).size.width < mobile;
  }

  static bool isTablet(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    return width >= mobile && width < desktop;
  }

  static bool isDesktop(BuildContext context) {
    return MediaQuery.of(context).size.width >= desktop;
  }
}

/// Spacing System
class BioVerseSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;
  static const double xxxl = 64.0;
}
