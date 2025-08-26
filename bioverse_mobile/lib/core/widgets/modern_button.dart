import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_theme.dart';

/// Modern button component with various styles and animations
class ModernButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final IconData? icon;
  final IconData? suffixIcon;
  final Widget? child;
  final ModernButtonType type;
  final ModernButtonSize size;
  final bool isLoading;
  final bool enabled;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry? padding;
  final BorderRadius? borderRadius;
  final Color? color;
  final Color? textColor;
  final List<Color>? gradient;
  final bool showShadow;
  final bool hapticFeedback;
  final Duration animationDuration;
  final String? tooltip;
  final Widget? loadingWidget;

  const ModernButton({
    super.key,
    required this.text,
    this.onPressed,
    this.icon,
    this.suffixIcon,
    this.child,
    this.type = ModernButtonType.primary,
    this.size = ModernButtonSize.medium,
    this.isLoading = false,
    this.enabled = true,
    this.width,
    this.height,
    this.padding,
    this.borderRadius,
    this.color,
    this.textColor,
    this.gradient,
    this.showShadow = true,
    this.hapticFeedback = true,
    this.animationDuration = const Duration(milliseconds: 200),
    this.tooltip,
    this.loadingWidget,
  });

  /// Primary button with gradient background
  const ModernButton.primary({
    super.key,
    required this.text,
    this.onPressed,
    this.icon,
    this.suffixIcon,
    this.child,
    this.isLoading = false,
    this.enabled = true,
    this.width,
    this.height,
    this.size = ModernButtonSize.medium,
    this.hapticFeedback = true,
    this.tooltip,
    this.loadingWidget,
  }) : type = ModernButtonType.primary,
       padding = null,
       borderRadius = null,
       color = null,
       textColor = null,
       gradient = null,
       showShadow = true,
       animationDuration = const Duration(milliseconds: 200);

  /// Secondary button with outlined style
  const ModernButton.secondary({
    super.key,
    required this.text,
    this.onPressed,
    this.icon,
    this.suffixIcon,
    this.child,
    this.isLoading = false,
    this.enabled = true,
    this.width,
    this.height,
    this.size = ModernButtonSize.medium,
    this.hapticFeedback = true,
    this.tooltip,
    this.loadingWidget,
  }) : type = ModernButtonType.secondary,
       padding = null,
       borderRadius = null,
       color = null,
       textColor = null,
       gradient = null,
       showShadow = false,
       animationDuration = const Duration(milliseconds: 200);

  /// Ghost button with transparent background
  const ModernButton.ghost({
    super.key,
    required this.text,
    this.onPressed,
    this.icon,
    this.suffixIcon,
    this.child,
    this.isLoading = false,
    this.enabled = true,
    this.width,
    this.height,
    this.size = ModernButtonSize.medium,
    this.hapticFeedback = true,
    this.tooltip,
    this.loadingWidget,
  }) : type = ModernButtonType.ghost,
       padding = null,
       borderRadius = null,
       color = null,
       textColor = null,
       gradient = null,
       showShadow = false,
       animationDuration = const Duration(milliseconds: 150);

  /// Danger button for destructive actions
  const ModernButton.danger({
    super.key,
    required this.text,
    this.onPressed,
    this.icon,
    this.suffixIcon,
    this.child,
    this.isLoading = false,
    this.enabled = true,
    this.width,
    this.height,
    this.size = ModernButtonSize.medium,
    this.hapticFeedback = true,
    this.tooltip,
    this.loadingWidget,
  }) : type = ModernButtonType.danger,
       padding = null,
       borderRadius = null,
       color = null,
       textColor = null,
       gradient = null,
       showShadow = true,
       animationDuration = const Duration(milliseconds: 200);

  /// Icon-only button
  const ModernButton.icon({
    super.key,
    required this.icon,
    this.onPressed,
    this.child,
    this.type = ModernButtonType.ghost,
    this.size = ModernButtonSize.medium,
    this.isLoading = false,
    this.enabled = true,
    this.width,
    this.height,
    this.padding,
    this.borderRadius,
    this.color,
    this.textColor,
    this.gradient,
    this.showShadow = false,
    this.hapticFeedback = true,
    this.animationDuration = const Duration(milliseconds: 150),
    this.tooltip,
    this.loadingWidget,
  }) : text = '',
       suffixIcon = null;

  /// Floating action button style
  const ModernButton.fab({
    super.key,
    required this.icon,
    this.onPressed,
    this.child,
    this.isLoading = false,
    this.enabled = true,
    this.color,
    this.hapticFeedback = true,
    this.tooltip,
    this.loadingWidget,
  }) : text = '',
       suffixIcon = null,
       type = ModernButtonType.primary,
       size = ModernButtonSize.large,
       width = 56,
       height = 56,
       padding = const EdgeInsets.all(16),
       borderRadius = const BorderRadius.all(Radius.circular(28)),
       textColor = null,
       gradient = null,
       showShadow = true,
       animationDuration = const Duration(milliseconds: 200);

  @override
  State<ModernButton> createState() => _ModernButtonState();
}

enum ModernButtonType { primary, secondary, ghost, danger, success, warning }
enum ModernButtonSize { small, medium, large, extraLarge }

class _ModernButtonState extends State<ModernButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _shadowAnimation;
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

    _shadowAnimation = Tween<double>(
      begin: 1.0,
      end: 0.5,
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

  void _handleTap() {
    if (!widget.enabled || widget.isLoading || widget.onPressed == null) return;

    if (widget.hapticFeedback) {
      HapticFeedback.lightImpact();
    }

    widget.onPressed!();
  }

  void _handleTapDown(TapDownDetails details) {
    if (!widget.enabled || widget.isLoading) return;
    setState(() => _isPressed = true);
    _animationController.forward();
  }

  void _handleTapUp(TapUpDetails details) {
    setState(() => _isPressed = false);
    _animationController.reverse();
  }

  void _handleTapCancel() {
    setState(() => _isPressed = false);
    _animationController.reverse();
  }

  @override
  Widget build(BuildContext context) {
    final buttonConfig = _getButtonConfiguration();
    final sizeConfig = _getSizeConfiguration();

    Widget button = AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Container(
            width: widget.width,
            height: widget.height ?? sizeConfig.height,
            decoration: BoxDecoration(
              color: buttonConfig.backgroundColor,
              gradient: buttonConfig.gradient,
              borderRadius: widget.borderRadius ??
                  BorderRadius.circular(sizeConfig.borderRadius),
              border: buttonConfig.border,
              boxShadow: widget.showShadow && buttonConfig.shadow != null
                  ? [
                      buttonConfig.shadow!.copyWith(
                        blurRadius: buttonConfig.shadow!.blurRadius * _shadowAnimation.value,
                        spreadRadius: buttonConfig.shadow!.spreadRadius * _shadowAnimation.value,
                      ),
                    ]
                  : null,
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: _handleTap,
                onTapDown: _handleTapDown,
                onTapUp: _handleTapUp,
                onTapCancel: _handleTapCancel,
                borderRadius: widget.borderRadius ??
                    BorderRadius.circular(sizeConfig.borderRadius),
                child: Container(
                  padding: widget.padding ?? sizeConfig.padding,
                  child: _buildButtonContent(buttonConfig, sizeConfig),
                ),
              ),
            ),
          ),
        );
      },
    );

    if (widget.tooltip != null) {
      button = Tooltip(
        message: widget.tooltip!,
        child: button,
      );
    }

    return Opacity(
      opacity: widget.enabled ? 1.0 : 0.6,
      child: button,
    );
  }

  Widget _buildButtonContent(ButtonConfiguration config, SizeConfiguration sizeConfig) {
    if (widget.child != null) {
      return Center(child: widget.child);
    }

    if (widget.isLoading) {
      return Center(
        child: widget.loadingWidget ??
            SizedBox(
              width: sizeConfig.iconSize,
              height: sizeConfig.iconSize,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(config.textColor),
              ),
            ),
      );
    }

    if (widget.text.isEmpty && widget.icon != null) {
      // Icon-only button
      return Center(
        child: Icon(
          widget.icon,
          size: sizeConfig.iconSize,
          color: config.textColor,
        ),
      );
    }

    List<Widget> children = [];

    if (widget.icon != null) {
      children.add(
        Icon(
          widget.icon,
          size: sizeConfig.iconSize,
          color: config.textColor,
        ),
      );
      children.add(SizedBox(width: sizeConfig.spacing));
    }

    if (widget.text.isNotEmpty) {
      children.add(
        Flexible(
          child: Text(
            widget.text,
            style: TextStyle(
              fontSize: sizeConfig.fontSize,
              fontWeight: sizeConfig.fontWeight,
              color: config.textColor,
              letterSpacing: 0.5,
            ),
            textAlign: TextAlign.center,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      );
    }

    if (widget.suffixIcon != null) {
      children.add(SizedBox(width: sizeConfig.spacing));
      children.add(
        Icon(
          widget.suffixIcon,
          size: sizeConfig.iconSize,
          color: config.textColor,
        ),
      );
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: children,
    );
  }

  ButtonConfiguration _getButtonConfiguration() {
    switch (widget.type) {
      case ModernButtonType.primary:
        return ButtonConfiguration(
          backgroundColor: widget.color,
          gradient: widget.gradient != null ? LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: widget.gradient!,
          ) : const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppTheme.primaryColor,
              AppTheme.primaryColor,
            ],
          ),
          textColor: widget.textColor ?? Colors.white,
          border: null,
          shadow: BoxShadow(
            color: AppTheme.primaryColor.withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
            spreadRadius: 0,
          ),
        );

      case ModernButtonType.secondary:
        return ButtonConfiguration(
          backgroundColor: widget.color ?? Colors.transparent,
          gradient: widget.gradient != null ? LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: widget.gradient!,
          ) : null,
          textColor: widget.textColor ?? AppTheme.primaryColor,
          border: Border.all(
            color: AppTheme.primaryColor,
            width: 2,
          ),
          shadow: null,
        );

      case ModernButtonType.ghost:
        return ButtonConfiguration(
          backgroundColor: widget.color ?? AppTheme.primaryColor.withOpacity(0.1),
          gradient: widget.gradient != null ? LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: widget.gradient!,
          ) : null,
          textColor: widget.textColor ?? AppTheme.primaryColor,
          border: null,
          shadow: null,
        );

      case ModernButtonType.danger:
        return ButtonConfiguration(
          backgroundColor: widget.color,
          gradient: widget.gradient != null ? LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: widget.gradient!,
          ) : const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppTheme.dangerColor,
              AppTheme.dangerColor,
            ],
          ),
          textColor: widget.textColor ?? Colors.white,
          border: null,
          shadow: BoxShadow(
            color: AppTheme.dangerColor.withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
            spreadRadius: 0,
          ),
        );

      case ModernButtonType.success:
        return ButtonConfiguration(
          backgroundColor: widget.color,
          gradient: widget.gradient != null ? LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: widget.gradient!,
          ) : LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppTheme.successColor,
              AppTheme.successColor.withOpacity(0.8),
            ],
          ),
          textColor: widget.textColor ?? Colors.white,
          border: null,
          shadow: BoxShadow(
            color: AppTheme.successColor.withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
            spreadRadius: 0,
          ),
        );

      case ModernButtonType.warning:
        return ButtonConfiguration(
          backgroundColor: widget.color,
          gradient: widget.gradient != null ? LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: widget.gradient!,
          ) : LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppTheme.warningColor,
              AppTheme.warningColor.withOpacity(0.8),
            ],
          ),
          textColor: widget.textColor ?? Colors.white,
          border: null,
          shadow: BoxShadow(
            color: AppTheme.warningColor.withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
            spreadRadius: 0,
          ),
        );
    }
  }

  SizeConfiguration _getSizeConfiguration() {
    switch (widget.size) {
      case ModernButtonSize.small:
        return SizeConfiguration(
          height: 36,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          fontSize: 14,
          iconSize: 18,
          borderRadius: 18,
          fontWeight: FontWeight.w500,
          spacing: 6,
        );

      case ModernButtonSize.medium:
        return SizeConfiguration(
          height: 48,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          fontSize: 16,
          iconSize: 20,
          borderRadius: 24,
          fontWeight: FontWeight.w600,
          spacing: 8,
        );

      case ModernButtonSize.large:
        return SizeConfiguration(
          height: 56,
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          fontSize: 18,
          iconSize: 24,
          borderRadius: 28,
          fontWeight: FontWeight.w600,
          spacing: 10,
        );

      case ModernButtonSize.extraLarge:
        return SizeConfiguration(
          height: 64,
          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
          fontSize: 20,
          iconSize: 28,
          borderRadius: 32,
          fontWeight: FontWeight.w700,
          spacing: 12,
        );
    }
  }
}

class ButtonConfiguration {
  final Color? backgroundColor;
  final Gradient? gradient;
  final Color textColor;
  final Border? border;
  final BoxShadow? shadow;

  ButtonConfiguration({
    this.backgroundColor,
    this.gradient,
    required this.textColor,
    this.border,
    this.shadow,
  });
}

class SizeConfiguration {
  final double height;
  final EdgeInsetsGeometry padding;
  final double fontSize;
  final double iconSize;
  final double borderRadius;
  final FontWeight fontWeight;
  final double spacing;

  SizeConfiguration({
    required this.height,
    required this.padding,
    required this.fontSize,
    required this.iconSize,
    required this.borderRadius,
    required this.fontWeight,
    required this.spacing,
  });
}

/// Extension for quick button creation
extension ModernButtonExtensions on String {
  /// Create a primary button with this text
  ModernButton primaryButton({
    VoidCallback? onPressed,
    IconData? icon,
    ModernButtonSize size = ModernButtonSize.medium,
    bool isLoading = false,
  }) {
    return ModernButton.primary(
      text: this,
      onPressed: onPressed,
      icon: icon,
      size: size,
      isLoading: isLoading,
    );
  }

  /// Create a secondary button with this text
  ModernButton secondaryButton({
    VoidCallback? onPressed,
    IconData? icon,
    ModernButtonSize size = ModernButtonSize.medium,
    bool isLoading = false,
  }) {
    return ModernButton.secondary(
      text: this,
      onPressed: onPressed,
      icon: icon,
      size: size,
      isLoading: isLoading,
    );
  }

  /// Create a ghost button with this text
  ModernButton ghostButton({
    VoidCallback? onPressed,
    IconData? icon,
    ModernButtonSize size = ModernButtonSize.medium,
    bool isLoading = false,
  }) {
    return ModernButton.ghost(
      text: this,
      onPressed: onPressed,
      icon: icon,
      size: size,
      isLoading: isLoading,
    );
  }
}

/// Predefined button styles for common use cases
class ModernButtonStyles {
  /// Emergency action button
  static ModernButton emergency({
    required String text,
    required VoidCallback onPressed,
    IconData icon = Icons.emergency,
    bool isLoading = false,
  }) {
    return ModernButton.danger(
      text: text,
      onPressed: onPressed,
      icon: icon,
      size: ModernButtonSize.large,
      isLoading: isLoading,
    );
  }

  /// Success confirmation button
  static ModernButton confirm({
    required String text,
    required VoidCallback onPressed,
    IconData icon = Icons.check_circle_outline,
    bool isLoading = false,
  }) {
    return ModernButton(
      text: text,
      onPressed: onPressed,
      icon: icon,
      type: ModernButtonType.success,
      size: ModernButtonSize.medium,
      isLoading: isLoading,
    );
  }

  /// Call to action button
  static ModernButton cta({
    required String text,
    required VoidCallback onPressed,
    IconData? icon,
    bool isLoading = false,
  }) {
    return ModernButton.primary(
      text: text,
      onPressed: onPressed,
      icon: icon,
      size: ModernButtonSize.large,
      isLoading: isLoading,
    );
  }

  /// Loading button with custom animation
  static ModernButton loading({
    required String text,
    String? loadingText,
    bool isLoading = false,
    VoidCallback? onPressed,
  }) {
    return ModernButton.primary(
      text: isLoading ? (loadingText ?? 'Loading...') : text,
      onPressed: isLoading ? null : onPressed,
      isLoading: isLoading,
      size: ModernButtonSize.medium,
    );
  }
}
