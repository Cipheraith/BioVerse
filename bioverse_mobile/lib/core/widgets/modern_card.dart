import 'package:flutter/material.dart';
import 'package:glassmorphism/glassmorphism.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_theme.dart';

/// Modern card component with glassmorphism effects and gradients
class ModernCard extends StatefulWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final double? width;
  final double? height;
  final Color? color;
  final List<Color>? gradient;
  final double elevation;
  final double borderRadius;
  final Border? border;
  final VoidCallback? onTap;
  final bool enabled;
  final bool showGlow;
  final bool useGlassmorphism;
  final double blur;
  final double opacity;
  final Widget? trailing;
  final Widget? leading;
  final String? title;
  final String? subtitle;
  final IconData? icon;
  final bool animate;
  final Duration animationDuration;
  final ModernCardType type;

  const ModernCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.margin = const EdgeInsets.all(8),
    this.width,
    this.height,
    this.color,
    this.gradient,
    this.elevation = 8,
    this.borderRadius = 20,
    this.border,
    this.onTap,
    this.enabled = true,
    this.showGlow = false,
    this.useGlassmorphism = false,
    this.blur = 10,
    this.opacity = 0.1,
    this.trailing,
    this.leading,
    this.title,
    this.subtitle,
    this.icon,
    this.animate = true,
    this.animationDuration = const Duration(milliseconds: 300),
    this.type = ModernCardType.elevated,
  });

  /// Health metrics card with icon and stats
  const ModernCard.health({
    super.key,
    required this.child,
    required this.title,
    this.subtitle,
    this.icon,
    this.trailing,
    this.onTap,
    this.padding = const EdgeInsets.all(20),
    this.margin = const EdgeInsets.all(8),
    this.width,
    this.height,
    this.showGlow = true,
    this.useGlassmorphism = true,
    this.animate = true,
    this.enabled = true,
  }) : color = null,
       gradient = AppTheme.primaryGradient,
       elevation = 12,
       borderRadius = 24,
       border = null,
       blur = 15,
       opacity = 0.15,
       leading = null,
       animationDuration = const Duration(milliseconds: 400),
       type = ModernCardType.glass;

  /// Dashboard summary card with gradient background
  const ModernCard.dashboard({
    super.key,
    required this.child,
    required this.title,
    this.subtitle,
    this.icon,
    this.onTap,
    this.padding = const EdgeInsets.all(24),
    this.margin = const EdgeInsets.all(12),
    this.width,
    this.height,
    this.showGlow = true,
    this.animate = true,
    this.enabled = true,
  }) : color = null,
       gradient = AppTheme.cardGradient,
       elevation = 16,
       borderRadius = 28,
       border = null,
       useGlassmorphism = false,
       blur = 10,
       opacity = 0.1,
       leading = null,
       trailing = null,
       animationDuration = const Duration(milliseconds: 500),
       type = ModernCardType.gradient;

  /// Notification or alert card with subtle styling
  const ModernCard.notification({
    super.key,
    required this.child,
    this.title,
    this.subtitle,
    this.icon,
    this.leading,
    this.trailing,
    this.onTap,
    this.padding = const EdgeInsets.all(16),
    this.margin = const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
    this.width,
    this.height,
    this.color = AppTheme.cardColor,
    this.animate = true,
    this.enabled = true,
  }) : gradient = null,
       elevation = 4,
       borderRadius = 16,
       border = const Border.fromBorderSide(
         BorderSide(color: AppTheme.borderColor, width: 1)
       ),
       showGlow = false,
       useGlassmorphism = false,
       blur = 10,
       opacity = 0.1,
       animationDuration = const Duration(milliseconds: 250),
       type = ModernCardType.outlined;

  @override
  State<ModernCard> createState() => _ModernCardState();
}

enum ModernCardType { elevated, glass, gradient, outlined, flat }

class _ModernCardState extends State<ModernCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _glowAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: widget.animationDuration,
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _glowAnimation = Tween<double>(
      begin: 1.0,
      end: 1.5,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _handleTapDown(TapDownDetails details) {
    if (!widget.enabled) return;
    setState(() => _isPressed = true);
    if (widget.animate) {
      _animationController.forward();
    }
  }

  void _handleTapUp(TapUpDetails details) {
    if (!widget.enabled) return;
    setState(() => _isPressed = false);
    if (widget.animate) {
      _animationController.reverse();
    }
  }

  void _handleTapCancel() {
    setState(() => _isPressed = false);
    if (widget.animate) {
      _animationController.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    Widget card = _buildCard();

    if (widget.onTap != null && widget.enabled) {
      card = GestureDetector(
        onTap: widget.onTap,
        onTapDown: _handleTapDown,
        onTapUp: _handleTapUp,
        onTapCancel: _handleTapCancel,
        child: card,
      );
    }

    return Container(
      margin: widget.margin,
      width: widget.width,
      height: widget.height,
      child: widget.animate
          ? AnimatedBuilder(
              animation: _animationController,
              builder: (context, child) {
                return Transform.scale(
                  scale: _scaleAnimation.value,
                  child: card,
                );
              },
            )
          : card,
    );
  }

  Widget _buildCard() {
    if (widget.useGlassmorphism) {
      return _buildGlassmorphicCard();
    }

    return _buildRegularCard();
  }

  Widget _buildGlassmorphicCard() {
    return GlassmorphicContainer(
      width: widget.width ?? double.infinity,
      height: widget.height ?? double.infinity,
      borderRadius: widget.borderRadius,
      blur: widget.blur,
      alignment: Alignment.center,
      border: 2,
      linearGradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: widget.gradient ?? [
          Colors.white.withOpacity(0.1),
          Colors.white.withOpacity(0.05),
        ],
      ),
      borderGradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Colors.white.withOpacity(0.2),
          Colors.white.withOpacity(0.1),
        ],
      ),
      child: _buildCardContent(),
    );
  }

  Widget _buildRegularCard() {
    return Container(
      width: widget.width,
      height: widget.height,
      decoration: BoxDecoration(
        color: widget.gradient == null ? (widget.color ?? AppTheme.cardColor) : null,
        gradient: widget.gradient != null
            ? LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: widget.gradient!,
              )
            : null,
        borderRadius: BorderRadius.circular(widget.borderRadius),
        border: widget.border,
        boxShadow: widget.elevation > 0
            ? [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: widget.elevation,
                  offset: Offset(0, widget.elevation / 2),
                ),
                if (widget.showGlow)
                  BoxShadow(
                    color: AppTheme.primaryColor.withOpacity(0.2),
                    blurRadius: widget.elevation * 2,
                    offset: const Offset(0, 0),
                  ),
              ]
            : null,
      ),
      child: _buildCardContent(),
    );
  }

  Widget _buildCardContent() {
    if (widget.title != null || widget.subtitle != null || widget.icon != null) {
      return _buildStructuredContent();
    }

    return Padding(
      padding: widget.padding ?? EdgeInsets.zero,
      child: widget.child,
    );
  }

  Widget _buildStructuredContent() {
    return Padding(
      padding: widget.padding ?? EdgeInsets.zero,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (widget.title != null || widget.icon != null || widget.trailing != null)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      if (widget.leading != null) ...[
                        widget.leading!,
                        const SizedBox(width: 12),
                      ],
                      if (widget.icon != null) ...[
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            widget.icon,
                            color: AppTheme.primaryColor,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 12),
                      ],
                      if (widget.title != null)
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                widget.title!,
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.textPrimary,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                              if (widget.subtitle != null) ...[
                                const SizedBox(height: 2),
                                Text(
                                  widget.subtitle!,
                                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: AppTheme.textSecondary,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
                if (widget.trailing != null) ...[
                  const SizedBox(width: 12),
                  widget.trailing!,
                ],
              ],
            ),
          if (widget.title != null && widget.child != const SizedBox.shrink()) ...[
            const SizedBox(height: 16),
            widget.child,
          ] else if (widget.title == null)
            widget.child,
        ],
      ),
    );
  }
}

/// Extension for quick card creation with common patterns
extension ModernCardExtensions on Widget {
  /// Wrap widget in a modern card
  Widget modernCard({
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    VoidCallback? onTap,
    bool showGlow = false,
    double elevation = 8,
    double borderRadius = 20,
  }) {
    return ModernCard(
      padding: padding,
      margin: margin,
      onTap: onTap,
      showGlow: showGlow,
      elevation: elevation,
      borderRadius: borderRadius,
      child: this,
    );
  }

  /// Wrap widget in a glassmorphic card
  Widget glassCard({
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    VoidCallback? onTap,
    double blur = 15,
    List<Color>? gradient,
  }) {
    return ModernCard(
      padding: padding,
      margin: margin,
      onTap: onTap,
      useGlassmorphism: true,
      blur: blur,
      gradient: gradient ?? AppTheme.primaryGradient,
      child: this,
    );
  }

  /// Wrap widget in a dashboard card
  Widget dashboardCard({
    String? title,
    String? subtitle,
    IconData? icon,
    VoidCallback? onTap,
    Widget? trailing,
  }) {
    return ModernCard.dashboard(
      title: title ?? '',
      subtitle: subtitle,
      icon: icon,
      onTap: onTap,

      child: this,
    );
  }
}

/// Predefined modern card styles for common use cases
class ModernCardStyles {
  static const EdgeInsets defaultPadding = EdgeInsets.all(16);
  static const EdgeInsets largePadding = EdgeInsets.all(24);
  static const EdgeInsets smallPadding = EdgeInsets.all(12);

  static const double defaultRadius = 20;
  static const double largeRadius = 28;
  static const double smallRadius = 16;

  static const double defaultElevation = 8;
  static const double highElevation = 16;
  static const double lowElevation = 4;

  /// Health metric card style
  static ModernCard healthMetric({
    required Widget child,
    required String title,
    String? subtitle,
    IconData? icon,
    VoidCallback? onTap,
    Color? color,
  }) {
    return ModernCard.health(
      title: title,
      subtitle: subtitle,
      icon: icon,
      onTap: onTap,
      child: child,
    );
  }

  /// Statistics card style
  static ModernCard statistic({
    required Widget child,
    required String title,
    String? value,
    IconData? icon,
    Color? color,
    VoidCallback? onTap,
  }) {
    return ModernCard(
      padding: largePadding,
      borderRadius: largeRadius,
      elevation: highElevation,
      showGlow: true,
      gradient: color != null
          ? [color.withOpacity(0.1), color.withOpacity(0.05)]
          : AppTheme.primaryGradient,
      title: title,
      subtitle: value,
      icon: icon,
      onTap: onTap,
      child: child,
    );
  }

  /// Action card style
  static ModernCard action({
    required Widget child,
    required String title,
    String? description,
    IconData? icon,
    required VoidCallback onTap,
  }) {
    return ModernCard(
      padding: defaultPadding,
      borderRadius: defaultRadius,
      elevation: defaultElevation,
      title: title,
      subtitle: description,
      icon: icon,
      onTap: onTap,
      trailing: const Icon(
        Icons.chevron_right_rounded,
        color: AppTheme.textSecondary,
      ),
      child: child,
    );
  }
}
