import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

enum ModernButtonVariant {
  primary,
  secondary, 
  ghost,
  danger,
  success,
  netflix,
  gradient
}

enum ModernButtonSize {
  small,
  medium,
  large,
  extraLarge
}

class PremiumModernButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final ModernButtonVariant variant;
  final ModernButtonSize size;
  final IconData? icon;
  final bool iconOnRight;
  final bool isLoading;
  final bool fullWidth;
  final double? borderRadius;
  final EdgeInsetsGeometry? padding;
  final Color? customColor;
  final List<Color>? gradientColors;

  const PremiumModernButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.variant = ModernButtonVariant.primary,
    this.size = ModernButtonSize.medium,
    this.icon,
    this.iconOnRight = false,
    this.isLoading = false,
    this.fullWidth = false,
    this.borderRadius,
    this.padding,
    this.customColor,
    this.gradientColors,
  }) : super(key: key);

  @override
  State<PremiumModernButton> createState() => _PremiumModernButtonState();
}

class _PremiumModernButtonState extends State<PremiumModernButton>
    with TickerProviderStateMixin {
  late AnimationController _shimmerController;
  late AnimationController _glowController;
  late Animation<double> _shimmerAnimation;
  late Animation<double> _glowAnimation;
  
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    
    _shimmerController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    
    _glowController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    )..repeat(reverse: true);
    
    _shimmerAnimation = Tween<double>(
      begin: -1.0,
      end: 2.0,
    ).animate(CurvedAnimation(
      parent: _shimmerController,
      curve: Curves.easeInOut,
    ));
    
    _glowAnimation = Tween<double>(
      begin: 0.3,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _glowController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _shimmerController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  // Get button dimensions based on size
  EdgeInsetsGeometry _getPadding() {
    if (widget.padding != null) return widget.padding!;
    
    switch (widget.size) {
      case ModernButtonSize.small:
        return const EdgeInsets.symmetric(horizontal: 16, vertical: 10);
      case ModernButtonSize.medium:
        return const EdgeInsets.symmetric(horizontal: 24, vertical: 14);
      case ModernButtonSize.large:
        return const EdgeInsets.symmetric(horizontal: 32, vertical: 18);
      case ModernButtonSize.extraLarge:
        return const EdgeInsets.symmetric(horizontal: 40, vertical: 22);
    }
  }

  double _getFontSize() {
    switch (widget.size) {
      case ModernButtonSize.small:
        return 14;
      case ModernButtonSize.medium:
        return 16;
      case ModernButtonSize.large:
        return 18;
      case ModernButtonSize.extraLarge:
        return 20;
    }
  }

  double _getIconSize() {
    switch (widget.size) {
      case ModernButtonSize.small:
        return 18;
      case ModernButtonSize.medium:
        return 20;
      case ModernButtonSize.large:
        return 22;
      case ModernButtonSize.extraLarge:
        return 24;
    }
  }

  // Get colors based on variant
  Color _getBackgroundColor() {
    if (widget.customColor != null) return widget.customColor!;
    
    final theme = Theme.of(context);
    switch (widget.variant) {
      case ModernButtonVariant.primary:
        return theme.primaryColor;
      case ModernButtonVariant.secondary:
        return const Color(0xFF22C55E);
      case ModernButtonVariant.ghost:
        return Colors.transparent;
      case ModernButtonVariant.danger:
        return const Color(0xFFEF4444);
      case ModernButtonVariant.success:
        return const Color(0xFF10B981);
      case ModernButtonVariant.netflix:
        return const Color(0xFFE50914);
      case ModernButtonVariant.gradient:
        return Colors.transparent; // Will use gradient
    }
  }

  Color _getTextColor() {
    switch (widget.variant) {
      case ModernButtonVariant.ghost:
        return Theme.of(context).textTheme.bodyLarge?.color ?? Colors.white;
      default:
        return Colors.white;
    }
  }

  Color? _getBorderColor() {
    switch (widget.variant) {
      case ModernButtonVariant.ghost:
        return Theme.of(context).dividerColor;
      default:
        return null;
    }
  }

  List<Color> _getGradientColors() {
    if (widget.gradientColors != null) return widget.gradientColors!;
    
    switch (widget.variant) {
      case ModernButtonVariant.gradient:
      case ModernButtonVariant.primary:
        return [
          const Color(0xFF3B82F6),
          const Color(0xFF8B5CF6),
        ];
      case ModernButtonVariant.secondary:
        return [
          const Color(0xFF22C55E),
          const Color(0xFF10B981),
        ];
      case ModernButtonVariant.netflix:
        return [
          const Color(0xFFE50914),
          const Color(0xFFDC2626),
        ];
      default:
        return [_getBackgroundColor(), _getBackgroundColor()];
    }
  }

  void _onTapDown(TapDownDetails details) {
    setState(() => _isPressed = true);
    _shimmerController.forward();
  }

  void _onTapUp(TapUpDetails details) {
    setState(() => _isPressed = false);
  }

  void _onTapCancel() {
    setState(() => _isPressed = false);
  }

  @override
  Widget build(BuildContext context) {
    final isDisabled = widget.onPressed == null || widget.isLoading;
    final borderRadius = widget.borderRadius ?? 20.0;

    return AnimatedBuilder(
      animation: Listenable.merge([_shimmerAnimation, _glowAnimation]),
      builder: (context, child) {
        return GestureDetector(
          onTapDown: isDisabled ? null : _onTapDown,
          onTapUp: isDisabled ? null : _onTapUp,
          onTapCancel: isDisabled ? null : _onTapCancel,
          onTap: isDisabled ? null : widget.onPressed,
          child: AnimatedScale(
            scale: _isPressed ? 0.95 : 1.0,
            duration: const Duration(milliseconds: 100),
            child: Container(
              width: widget.fullWidth ? double.infinity : null,
              padding: _getPadding(),
              decoration: BoxDecoration(
                gradient: widget.variant == ModernButtonVariant.gradient ||
                        widget.variant == ModernButtonVariant.netflix
                    ? LinearGradient(
                        colors: _getGradientColors(),
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      )
                    : null,
                color: widget.variant != ModernButtonVariant.gradient &&
                        widget.variant != ModernButtonVariant.netflix
                    ? _getBackgroundColor()
                    : null,
                borderRadius: BorderRadius.circular(borderRadius),
                border: _getBorderColor() != null
                    ? Border.all(color: _getBorderColor()!, width: 1.5)
                    : null,
                boxShadow: [
                  if (!isDisabled && widget.variant != ModernButtonVariant.ghost)
                    BoxShadow(
                      color: _getGradientColors().first.withOpacity(0.4),
                      blurRadius: 12 * _glowAnimation.value,
                      spreadRadius: 2 * _glowAnimation.value,
                      offset: const Offset(0, 6),
                    ),
                ],
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Shimmer effect overlay
                  if (!isDisabled)
                    Positioned.fill(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(borderRadius),
                        child: AnimatedBuilder(
                          animation: _shimmerAnimation,
                          builder: (context, child) {
                            return Transform.translate(
                              offset: Offset(_shimmerAnimation.value * 200, 0),
                              child: Container(
                                width: 100,
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      Colors.transparent,
                                      Colors.white.withOpacity(0.2),
                                      Colors.transparent,
                                    ],
                                    stops: const [0.0, 0.5, 1.0],
                                    begin: Alignment.centerLeft,
                                    end: Alignment.centerRight,
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  
                  // Button content
                  Opacity(
                    opacity: isDisabled ? 0.6 : 1.0,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (widget.icon != null && !widget.iconOnRight) ...[
                          if (widget.isLoading)
                            SizedBox(
                              width: _getIconSize(),
                              height: _getIconSize(),
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  _getTextColor(),
                                ),
                              ),
                            )
                          else
                            Icon(
                              widget.icon,
                              size: _getIconSize(),
                              color: _getTextColor(),
                            ),
                          const SizedBox(width: 8),
                        ],
                        
                        if (!widget.isLoading || widget.icon == null)
                          Text(
                            widget.text,
                            style: TextStyle(
                              fontSize: _getFontSize(),
                              fontWeight: FontWeight.w600,
                              color: _getTextColor(),
                              letterSpacing: 0.5,
                            ),
                          ),
                        
                        if (widget.icon != null && widget.iconOnRight) ...[
                          const SizedBox(width: 8),
                          if (widget.isLoading)
                            SizedBox(
                              width: _getIconSize(),
                              height: _getIconSize(),
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  _getTextColor(),
                                ),
                              ),
                            )
                          else
                            Icon(
                              widget.icon,
                              size: _getIconSize(),
                              color: _getTextColor(),
                            ),
                        ],
                        
                        if (widget.isLoading && widget.icon == null) ...[
                          const SizedBox(width: 12),
                          SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                _getTextColor(),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
