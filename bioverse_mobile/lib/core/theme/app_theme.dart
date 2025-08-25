import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // 🎯 CHARCOAL MINIMALISTIC THEME - MATCHING WEB APP
  // Primary Colors - Blue/Cyan Gradient System
  static const Color primaryBlue = Color(0xFF2563EB); // Blue 600
  static const Color primaryCyan = Color(0xFF06B6D4); // Cyan 500
  static const Color primaryLight = Color(0xFF3B82F6); // Blue 500
  static const Color primaryDark = Color(0xFF1D4ED8); // Blue 700
  
  // Charcoal Background System - Matching Web App Exactly
  static const Color backgroundColor = Color(0xFF0F172A); // Gray 950 - Web app background
  static const Color cardColor = Color(0xFF1E293B); // Gray 800 - Matching web cards
  static const Color surfaceColor = Color(0xFF334155); // Gray 700 - Surface elements
  static const Color overlayColor = Color(0xFF475569); // Gray 600 - Overlays
  static const Color modalColor = Color(0xFF64748B); // Gray 500 - Modals
  
  // Text Colors - Matching Web App Gray System
  static const Color textPrimary = Color(0xFFD1D5DB); // Gray 300 - Main text (web app standard)
  static const Color textSecondary = Color(0xFF9CA3AF); // Gray 400 - Secondary text
  static const Color textMuted = Color(0xFF6B7280); // Gray 500 - Muted text
  static const Color textDisabled = Color(0xFF4B5563); // Gray 600 - Disabled
  static const Color textWhite = Color(0xFFFFFFFF); // Pure white for buttons
  
  // Border Colors - Minimalistic
  static const Color borderColor = Color(0xFF374151); // Gray 700 - Subtle borders
  static const Color borderLight = Color(0xFF475569); // Gray 600 - Lighter borders
  static const Color dividerColor = Color(0xFF1F2937); // Gray 800 - Subtle dividers
  
  // Status Colors - Minimalistic
  static const Color successColor = Color(0xFF10B981); // Emerald 500
  static const Color dangerColor = Color(0xFFEF4444); // Red 500
  static const Color warningColor = Color(0xFFF59E0B); // Amber 500
  static const Color infoColor = Color(0xFF3B82F6); // Blue 500
  
  // Minimalistic Gradient System - Matching Web App
  static const List<Color> primaryGradient = [
    Color(0xFF2563EB), // Blue 600
    Color(0xFF06B6D4), // Cyan 500
  ];
  
  static const List<Color> backgroundGradient = [
    Color(0xFF0F172A), // Gray 950 - Matching web background
    Color(0xFF1E293B), // Gray 800
  ];
  
  static const List<Color> cardGradient = [
    Color(0xFF1E293B), // Gray 800 - Matching web cards
    Color(0xFF334155), // Gray 700
  ];
  
  static const List<Color> buttonGradient = [
    Color(0xFF2563EB), // Blue 600 - Matching web buttons
    Color(0xFF06B6D4), // Cyan 500
  ];

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      primarySwatch: _createMaterialColor(primaryBlue),
      primaryColor: primaryBlue,
      scaffoldBackgroundColor: backgroundColor,
      cardColor: cardColor,
      dividerColor: dividerColor,
      
      // Typography
      textTheme: GoogleFonts.interTextTheme(
        const TextTheme(
          displayLarge: TextStyle(
            fontSize: 57,
            fontWeight: FontWeight.w400,
            letterSpacing: -0.25,
            color: textPrimary,
          ),
          displayMedium: TextStyle(
            fontSize: 45,
            fontWeight: FontWeight.w400,
            letterSpacing: 0,
            color: textPrimary,
          ),
          displaySmall: TextStyle(
            fontSize: 36,
            fontWeight: FontWeight.w400,
            letterSpacing: 0,
            color: textPrimary,
          ),
          headlineLarge: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w700,
            letterSpacing: 0,
            color: textPrimary,
          ),
          headlineMedium: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w600,
            letterSpacing: 0,
            color: textPrimary,
          ),
          headlineSmall: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w600,
            letterSpacing: 0,
            color: textPrimary,
          ),
          titleLarge: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w600,
            letterSpacing: 0,
            color: textPrimary,
          ),
          titleMedium: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            letterSpacing: 0.15,
            color: textPrimary,
          ),
          titleSmall: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            letterSpacing: 0.1,
            color: textPrimary,
          ),
          bodyLarge: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w400,
            letterSpacing: 0.5,
            color: textPrimary,
          ),
          bodyMedium: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w400,
            letterSpacing: 0.25,
            color: textSecondary,
          ),
          bodySmall: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w400,
            letterSpacing: 0.4,
            color: textMuted,
          ),
          labelLarge: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            letterSpacing: 0.1,
            color: textPrimary,
          ),
          labelMedium: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            letterSpacing: 0.5,
            color: textSecondary,
          ),
          labelSmall: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            letterSpacing: 0.5,
            color: textMuted,
          ),
        ),
      ),
      
      // AppBar Theme
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
        iconTheme: IconThemeData(color: textPrimary),
        systemOverlayStyle: null,
      ),
      
      // Card Theme
      cardTheme: const CardThemeData(
        color: cardColor,
        elevation: 8,
        shadowColor: Colors.black54,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(20)),
          side: BorderSide(color: borderColor, width: 1),
        ),
      ),
      
      // Button Themes - Minimalistic Charcoal Style
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryBlue,
          foregroundColor: textWhite,
          elevation: 0, // Flat design like web app
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8), // Matching web border radius
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          textStyle: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            letterSpacing: 0,
          ),
        ),
      ),
      
      // Input Decoration Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: cardColor,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderColor),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8), // Matching web inputs
          borderSide: const BorderSide(color: primaryBlue, width: 1),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: dangerColor),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: dangerColor, width: 2),
        ),
        labelStyle: const TextStyle(color: textSecondary),
        hintStyle: const TextStyle(color: textMuted),
        prefixIconColor: textSecondary,
        suffixIconColor: textSecondary,
      ),
      
      // Icon Theme
      iconTheme: const IconThemeData(
        color: textSecondary,
        size: 24,
      ),
      
      // Bottom Navigation Bar Theme
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: cardColor,
        selectedItemColor: primaryBlue,
        unselectedItemColor: textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 0, // Flat design
        selectedLabelStyle: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
        unselectedLabelStyle: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w400,
        ),
      ),
      
      // Tab Bar Theme
      tabBarTheme: TabBarThemeData(
        labelColor: primaryBlue,
        unselectedLabelColor: textMuted,
        indicator: const UnderlineTabIndicator(
          borderSide: BorderSide(color: primaryBlue, width: 2),
        ),
        labelStyle: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w400,
        ),
      ),
      
      // Chip Theme
      chipTheme: ChipThemeData(
        backgroundColor: cardColor,
        disabledColor: cardColor.withOpacity(0.5),
        selectedColor: primaryBlue.withOpacity(0.2),
        secondarySelectedColor: primaryCyan.withOpacity(0.2),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        labelStyle: const TextStyle(color: textPrimary),
        secondaryLabelStyle: const TextStyle(color: textPrimary),
        brightness: Brightness.dark,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: borderColor),
        ),
      ),
      
      // Switch Theme
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return primaryBlue;
          }
          return textMuted;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return primaryBlue.withOpacity(0.3);
          }
          return borderColor;
        }),
      ),
      
      // Slider Theme
      sliderTheme: SliderThemeData(
        activeTrackColor: primaryBlue,
        inactiveTrackColor: borderColor,
        thumbColor: primaryBlue,
        overlayColor: primaryBlue.withOpacity(0.2),
        valueIndicatorColor: primaryBlue,
        valueIndicatorTextStyle: const TextStyle(color: Colors.white),
      ),
      
      // Progress Indicator Theme
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: primaryBlue,
        linearTrackColor: borderColor,
        circularTrackColor: borderColor,
      ),
      
      // Dialog Theme
      dialogTheme: DialogThemeData(
        backgroundColor: cardColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: borderColor),
        ),
        titleTextStyle: GoogleFonts.inter(
          color: textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
        contentTextStyle: GoogleFonts.inter(
          color: textSecondary,
          fontSize: 16,
          fontWeight: FontWeight.w400,
        ),
      ),
      
      // SnackBar Theme
      snackBarTheme: SnackBarThemeData(
        backgroundColor: cardColor,
        contentTextStyle: GoogleFonts.inter(
          color: textPrimary,
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        behavior: SnackBarBehavior.floating,
        elevation: 8,
      ),
      
      // FloatingActionButton Theme
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: primaryBlue,
        foregroundColor: textWhite,
        elevation: 0, // Flat design
        shape: CircleBorder(),
      ),
      
      // Checkbox Theme
      checkboxTheme: CheckboxThemeData(
        fillColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return primaryBlue;
          }
          return Colors.transparent;
        }),
        checkColor: WidgetStateProperty.all(Colors.white),
        side: const BorderSide(color: borderColor, width: 2),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4),
        ),
      ),
      
      // Radio Theme
      radioTheme: RadioThemeData(
        fillColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return primaryBlue;
          }
          return borderColor;
        }),
      ),
      
      // Extensions for custom properties
      extensions: const <ThemeExtension<dynamic>>[
        BioVerseThemeExtension(
          primaryGradient: primaryGradient,
          backgroundGradient: backgroundGradient,
          cardGradient: cardGradient,
          buttonGradient: buttonGradient,
          glowColor: primaryBlue,
          pulseColor: primaryCyan,
        ),
      ],
    );
  }

  static MaterialColor _createMaterialColor(Color color) {
    final strengths = <double>[.05];
    final swatch = <int, Color>{};
    final int r = color.red & 0xff;
    final int g = color.green & 0xff; 
    final int b = color.blue & 0xff;

    for (int i = 1; i < 10; i++) {
      strengths.add(0.1 * i);
    }
    for (var strength in strengths) {
      final double ds = 0.5 - strength;
      swatch[(strength * 1000).round()] = Color.fromRGBO(
        r + ((ds < 0 ? r : (255 - r)) * ds).round(),
        g + ((ds < 0 ? g : (255 - g)) * ds).round(),
        b + ((ds < 0 ? b : (255 - b)) * ds).round(),
        1,
      );
    }
    return MaterialColor(color.value, swatch);
  }
}

@immutable
class BioVerseThemeExtension extends ThemeExtension<BioVerseThemeExtension> {
  const BioVerseThemeExtension({
    required this.primaryGradient,
    required this.backgroundGradient,
    required this.cardGradient,
    required this.buttonGradient,
    required this.glowColor,
    required this.pulseColor,
  });

  final List<Color> primaryGradient;
  final List<Color> backgroundGradient;
  final List<Color> cardGradient;
  final List<Color> buttonGradient;
  final Color glowColor;
  final Color pulseColor;

  @override
  BioVerseThemeExtension copyWith({
    List<Color>? primaryGradient,
    List<Color>? backgroundGradient,
    List<Color>? cardGradient,
    List<Color>? buttonGradient,
    Color? glowColor,
    Color? pulseColor,
  }) {
    return BioVerseThemeExtension(
      primaryGradient: primaryGradient ?? this.primaryGradient,
      backgroundGradient: backgroundGradient ?? this.backgroundGradient,
      cardGradient: cardGradient ?? this.cardGradient,
      buttonGradient: buttonGradient ?? this.buttonGradient,
      glowColor: glowColor ?? this.glowColor,
      pulseColor: pulseColor ?? this.pulseColor,
    );
  }

  @override
  BioVerseThemeExtension lerp(ThemeExtension<BioVerseThemeExtension>? other, double t) {
    if (other is! BioVerseThemeExtension) {
      return this;
    }
    return BioVerseThemeExtension(
      primaryGradient: primaryGradient,
      backgroundGradient: backgroundGradient,
      cardGradient: cardGradient,
      buttonGradient: buttonGradient,
      glowColor: Color.lerp(glowColor, other.glowColor, t)!,
      pulseColor: Color.lerp(pulseColor, other.pulseColor, t)!,
    );
  }
}
