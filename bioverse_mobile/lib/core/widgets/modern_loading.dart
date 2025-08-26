import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme/app_theme.dart';

enum LoadingType {
  spinner,
  pulse,
  dots,
  health,
  wave,
}

class ModernLoading extends StatefulWidget {
  final LoadingType type;
  final String? message;
  final double size;
  final Color? color;
  final bool showMessage;

  const ModernLoading({
    super.key,
    this.type = LoadingType.spinner,
    this.message,
    this.size = 40,
    this.color,
    this.showMessage = true,
  });

  @override
  State<ModernLoading> createState() => _ModernLoadingState();
}

class _ModernLoadingState extends State<ModernLoading>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat();

    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _buildLoadingWidget(),
        if (widget.showMessage && widget.message != null) ...[
          const SizedBox(height: 16),
          Text(
            widget.message!,
            style: TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ],
    );
  }

  Widget _buildLoadingWidget() {
    switch (widget.type) {
      case LoadingType.spinner:
        return _buildSpinner();
      case LoadingType.pulse:
        return _buildPulse();
      case LoadingType.dots:
        return _buildDots();
      case LoadingType.health:
        return _buildHealth();
      case LoadingType.wave:
        return _buildWave();
    }
  }

  Widget _buildSpinner() {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.rotate(
          angle: _controller.value * 2 * 3.14159,
          child: Container(
            width: widget.size,
            height: widget.size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: SweepGradient(
                colors: [
                  Colors.transparent,
                  widget.color ?? AppTheme.primaryColor,
                ],
                stops: const [0.0, 1.0],
              ),
            ),
            child: Container(
              margin: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.backgroundColor,
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildPulse() {
    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        return Container(
          width: widget.size,
          height: widget.size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(
              colors: [
                (widget.color ?? AppTheme.primaryColor).withOpacity(0.8),
                (widget.color ?? AppTheme.primaryColor).withOpacity(0.2),
                Colors.transparent,
              ],
              stops: [0.0, _pulseController.value, 1.0],
            ),
          ),
          child: Center(
            child: Container(
              width: widget.size * 0.4,
              height: widget.size * 0.4,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: widget.color ?? AppTheme.primaryColor,
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildDots() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(3, (index) {
        return Container(
          width: 12,
          height: 12,
          margin: const EdgeInsets.symmetric(horizontal: 4),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: widget.color ?? AppTheme.primaryColor,
          ),
        ).animate(
          onPlay: (controller) => controller.repeat(reverse: true),
        ).scale(
          delay: Duration(milliseconds: index * 200),
          duration: 600.ms,
          begin: const Offset(0.5, 0.5),
          end: const Offset(1.0, 1.0),
        );
      }),
    );
  }

  Widget _buildHealth() {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Outer pulse ring
        AnimatedBuilder(
          animation: _pulseController,
          builder: (context, child) {
            return Container(
              width: widget.size * (1 + _pulseController.value * 0.5),
              height: widget.size * (1 + _pulseController.value * 0.5),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: (widget.color ?? AppTheme.primaryColor)
                      .withOpacity(1 - _pulseController.value),
                  width: 2,
                ),
              ),
            );
          },
        ),
        
        // Heart icon with rotation
        AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Transform.rotate(
              angle: _controller.value * 2 * 3.14159,
              child: Container(
                width: widget.size * 0.6,
                height: widget.size * 0.6,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [
                      widget.color ?? AppTheme.primaryColor,
                      AppTheme.secondaryColor,
                    ],
                  ),
                ),
                child: const Icon(
                  LucideIcons.heart,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildWave() {
    return SizedBox(
      width: widget.size * 2,
      height: widget.size * 0.5,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: List.generate(5, (index) {
          return Container(
            width: 4,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(2),
              color: widget.color ?? AppTheme.primaryColor,
            ),
          ).animate(
            onPlay: (controller) => controller.repeat(reverse: true),
          ).scaleY(
            delay: Duration(milliseconds: index * 100),
            duration: 800.ms,
            begin: 0.3,
            end: 1.0,
          );
        }),
      ),
    );
  }
}

// Full screen loading overlay
class FullScreenLoading extends StatelessWidget {
  final String? message;
  final LoadingType type;
  final bool dismissible;

  const FullScreenLoading({
    super.key,
    this.message,
    this.type = LoadingType.health,
    this.dismissible = false,
  });

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async => dismissible,
      child: Container(
        color: AppTheme.backgroundColor.withOpacity(0.9),
        child: Center(
          child: Container(
            padding: const EdgeInsets.all(32),
            margin: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppTheme.cardColor,
                  AppTheme.surfaceColor.withOpacity(0.8),
                ],
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: AppTheme.borderColor.withOpacity(0.3),
                width: 1,
              ),
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
                // Logo
                Container(
                  width: 60,
                  height: 60,
                  margin: const EdgeInsets.only(bottom: 24),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [
                        AppTheme.primaryColor,
                        AppTheme.secondaryColor,
                      ],
                    ),
                  ),
                  child: const Icon(
                    LucideIcons.heart,
                    color: Colors.white,
                    size: 30,
                  ),
                ).animate().scale(duration: 600.ms, curve: Curves.elasticOut),
                
                // Loading animation
                ModernLoading(
                  type: type,
                  size: 60,
                  showMessage: false,
                ),
                
                const SizedBox(height: 24),
                
                // Message
                Text(
                  message ?? 'Loading...',
                  style: const TextStyle(
                    color: AppTheme.textPrimary,
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                  textAlign: TextAlign.center,
                ),
                
                const SizedBox(height: 8),
                
                const Text(
                  'Please wait while we prepare your health data',
                  style: TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ).animate().fadeIn(duration: 300.ms).scale(
            begin: const Offset(0.8, 0.8),
            curve: Curves.easeOut,
          ),
        ),
      ),
    );
  }
}

// Loading button with integrated loading state
class LoadingButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData? icon;
  final Color? backgroundColor;
  final Color? textColor;
  final double? width;
  final double height;

  const LoadingButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.icon,
    this.backgroundColor,
    this.textColor,
    this.width,
    this.height = 56,
  });

  @override
  State<LoadingButton> createState() => _LoadingButtonState();
}

class _LoadingButtonState extends State<LoadingButton> {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: widget.width,
      height: widget.height,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            widget.backgroundColor ?? AppTheme.primaryColor,
            (widget.backgroundColor ?? AppTheme.primaryColor).withOpacity(0.8),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: (widget.backgroundColor ?? AppTheme.primaryColor)
                .withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: widget.isLoading ? null : widget.onPressed,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (widget.isLoading) ...[
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        widget.textColor ?? Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                ] else if (widget.icon != null) ...[
                  Icon(
                    widget.icon,
                    color: widget.textColor ?? Colors.white,
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                ],
                Text(
                  widget.isLoading ? 'Loading...' : widget.text,
                  style: TextStyle(
                    color: widget.textColor ?? Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}