import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'dart:ui';

/// Advanced Animation System for BioVerse Mobile
/// Implementing web app's sophisticated animation library
/// 
/// This system creates competition-winning animations that will
/// impress judges at the ZICTA Young Innovators Program!

class BioVerseAnimations {
  // Animation Durations - optimized for mobile performance
  static const Duration ultraFast = Duration(milliseconds: 150);
  static const Duration fast = Duration(milliseconds: 250);
  static const Duration normal = Duration(milliseconds: 400);
  static const Duration slow = Duration(milliseconds: 600);
  static const Duration verySlow = Duration(milliseconds: 1000);

  // Curves for premium feel
  static const Curve bounceIn = Curves.elasticOut;
  static const Curve smoothOut = Curves.fastOutSlowIn;
  static const Curve springy = Curves.bounceOut;
  static const Curve silky = Curves.easeInOutCubic;
}

/// Premium Card Animation Widget
class PremiumAnimatedCard extends StatefulWidget {
  final Widget child;
  final Duration duration;
  final Curve curve;
  final bool enableHover;
  final bool enableGlow;
  final bool enableFloat;
  final Color? glowColor;
  final double maxScale;
  final VoidCallback? onTap;

  const PremiumAnimatedCard({
    super.key,
    required this.child,
    this.duration = const Duration(milliseconds: 300),
    this.curve = Curves.easeInOutCubic,
    this.enableHover = true,
    this.enableGlow = false,
    this.enableFloat = false,
    this.glowColor,
    this.maxScale = 1.05,
    this.onTap,
  });

  @override
  State<PremiumAnimatedCard> createState() => _PremiumAnimatedCardState();
}

class _PremiumAnimatedCardState extends State<PremiumAnimatedCard>
    with TickerProviderStateMixin {
  late AnimationController _hoverController;
  late AnimationController _tapController;
  late AnimationController _floatController;
  late AnimationController _glowController;

  late Animation<double> _scaleAnimation;
  late Animation<double> _elevationAnimation;
  late Animation<double> _floatAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();

    _hoverController = AnimationController(
      duration: widget.duration,
      vsync: this,
    );

    _tapController = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );

    _floatController = AnimationController(
      duration: const Duration(seconds: 4),
      vsync: this,
    );

    _glowController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: widget.maxScale,
    ).animate(CurvedAnimation(
      parent: _hoverController,
      curve: widget.curve,
    ));

    _elevationAnimation = Tween<double>(
      begin: 4.0,
      end: 20.0,
    ).animate(CurvedAnimation(
      parent: _hoverController,
      curve: widget.curve,
    ));

    _floatAnimation = Tween<double>(
      begin: 0.0,
      end: -10.0,
    ).animate(CurvedAnimation(
      parent: _floatController,
      curve: Curves.easeInOut,
    ));

    _glowAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _glowController,
      curve: Curves.easeInOut,
    ));

    if (widget.enableFloat) {
      _floatController.repeat(reverse: true);
    }

    if (widget.enableGlow) {
      _glowController.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _hoverController.dispose();
    _tapController.dispose();
    _floatController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails details) {
    _tapController.forward();
  }

  void _onTapUp(TapUpDetails details) {
    _tapController.reverse();
    if (widget.onTap != null) {
      widget.onTap!();
    }
  }

  void _onTapCancel() {
    _tapController.reverse();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: _onTapDown,
      onTapUp: _onTapUp,
      onTapCancel: _onTapCancel,
      onTap: widget.onTap,
      child: MouseRegion(
        onEnter: (_) {
          if (widget.enableHover) {
            _hoverController.forward();
          }
        },
        onExit: (_) {
          if (widget.enableHover) {
            _hoverController.reverse();
          }
        },
        child: AnimatedBuilder(
          animation: Listenable.merge([
            _scaleAnimation,
            _elevationAnimation,
            _floatAnimation,
            _glowAnimation,
          ]),
          builder: (context, child) {
            return Transform.translate(
              offset: widget.enableFloat
                  ? Offset(0, _floatAnimation.value)
                  : Offset.zero,
              child: Transform.scale(
                scale: _scaleAnimation.value * 
                       (1 - _tapController.value * 0.05),
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      // Base shadow
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: _elevationAnimation.value,
                        offset: Offset(0, _elevationAnimation.value / 2),
                      ),
                      // Glow effect
                      if (widget.enableGlow)
                        BoxShadow(
                          color: (widget.glowColor ?? Colors.cyan)
                              .withOpacity(0.3 * _glowAnimation.value),
                          blurRadius: 30 * _glowAnimation.value,
                          spreadRadius: 5 * _glowAnimation.value,
                        ),
                    ],
                  ),
                  child: widget.child,
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

/// Glass Morphism Card Widget
class GlassMorphismCard extends StatelessWidget {
  final Widget child;
  final double blur;
  final double opacity;
  final Color color;
  final BorderRadius? borderRadius;

  const GlassMorphismCard({
    super.key,
    required this.child,
    this.blur = 20.0,
    this.opacity = 0.15,
    this.color = Colors.white,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: color.withOpacity(opacity),
        borderRadius: borderRadius ?? BorderRadius.circular(16),
        border: Border.all(
          color: color.withOpacity(0.2),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: child,
      ),
    );
  }
}

/// Shimmer Loading Effect
class ShimmerEffect extends StatefulWidget {
  final Widget child;
  final Color baseColor;
  final Color highlightColor;
  final Duration period;

  const ShimmerEffect({
    super.key,
    required this.child,
    this.baseColor = const Color(0xFFE0E0E0),
    this.highlightColor = const Color(0xFFF5F5F5),
    this.period = const Duration(seconds: 2),
  });

  @override
  State<ShimmerEffect> createState() => _ShimmerEffectState();
}

class _ShimmerEffectState extends State<ShimmerEffect>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.period,
      vsync: this,
    )..repeat();

    _animation = Tween<double>(
      begin: -1.0,
      end: 2.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return ShaderMask(
          shaderCallback: (bounds) {
            return LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                widget.baseColor,
                widget.highlightColor,
                widget.baseColor,
              ],
              stops: [
                _animation.value - 0.3,
                _animation.value,
                _animation.value + 0.3,
              ].map((e) => e.clamp(0.0, 1.0)).toList(),
            ).createShader(bounds);
          },
          child: widget.child,
        );
      },
    );
  }
}

/// Morphing Shape Animation
class MorphingShape extends StatefulWidget {
  final double size;
  final List<Color> colors;
  final Duration duration;

  const MorphingShape({
    super.key,
    this.size = 200,
    this.colors = const [Colors.cyan, Colors.blue, Colors.purple],
    this.duration = const Duration(seconds: 8),
  });

  @override
  State<MorphingShape> createState() => _MorphingShapeState();
}

class _MorphingShapeState extends State<MorphingShape>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: widget.size,
          height: widget.size,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: widget.colors,
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(
              widget.size * (0.3 + 0.2 * math.sin(_controller.value * 2 * math.pi)),
            ),
          ),
        );
      },
    );
  }
}

/// Pulse Glow Animation
class PulseGlow extends StatefulWidget {
  final Widget child;
  final Color glowColor;
  final double maxGlowRadius;
  final Duration duration;

  const PulseGlow({
    super.key,
    required this.child,
    this.glowColor = Colors.cyan,
    this.maxGlowRadius = 30.0,
    this.duration = const Duration(seconds: 2),
  });

  @override
  State<PulseGlow> createState() => _PulseGlowState();
}

class _PulseGlowState extends State<PulseGlow>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    )..repeat(reverse: true);

    _glowAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _glowAnimation,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: widget.glowColor.withOpacity(0.3 * _glowAnimation.value),
                blurRadius: widget.maxGlowRadius * _glowAnimation.value,
                spreadRadius: 5 * _glowAnimation.value,
              ),
            ],
          ),
          child: widget.child,
        );
      },
    );
  }
}

/// Netflix-style Hover Scale Effect
class NetflixHover extends StatefulWidget {
  final Widget child;
  final double scaleValue;
  final Duration duration;
  final VoidCallback? onTap;

  const NetflixHover({
    super.key,
    required this.child,
    this.scaleValue = 1.1,
    this.duration = const Duration(milliseconds: 300),
    this.onTap,
  });

  @override
  State<NetflixHover> createState() => _NetflixHoverState();
}

class _NetflixHoverState extends State<NetflixHover>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: widget.scaleValue,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutBack,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _controller.forward(),
      onTapUp: (_) {
        _controller.reverse();
        if (widget.onTap != null) widget.onTap!();
      },
      onTapCancel: () => _controller.reverse(),
      child: MouseRegion(
        onEnter: (_) => _controller.forward(),
        onExit: (_) => _controller.reverse(),
        child: AnimatedBuilder(
          animation: _scaleAnimation,
          builder: (context, child) {
            return Transform.scale(
              scale: _scaleAnimation.value,
              child: widget.child,
            );
          },
        ),
      ),
    );
  }
}

