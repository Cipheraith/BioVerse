import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

/// A widget that applies common fade and slide animations to its child
class AnimatedSlideIn extends StatelessWidget {
  final Widget child;
  final Duration delay;
  final Duration duration;
  final Offset offset;

  const AnimatedSlideIn({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.duration = const Duration(milliseconds: 600),
    this.offset = const Offset(0, 30),
  });

  @override
  Widget build(BuildContext context) {
    return child
        .animate(delay: delay)
        .fadeIn(duration: duration, curve: Curves.easeOutCubic)
        .slideY(
          begin: offset.dy,
          duration: duration,
          curve: Curves.easeOutCubic,
        );
  }
}

/// A widget that applies a scale and fade animation to its child
class AnimatedScaleIn extends StatelessWidget {
  final Widget child;
  final Duration delay;
  final Duration duration;
  final double scale;

  const AnimatedScaleIn({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.duration = const Duration(milliseconds: 600),
    this.scale = 0.8,
  });

  @override
  Widget build(BuildContext context) {
    return child
        .animate(delay: delay)
        .fadeIn(duration: duration, curve: Curves.easeOutCubic)
        .scale(
          begin: Offset(scale, scale),
          duration: duration,
          curve: Curves.elasticOut,
        );
  }
}

/// A widget that applies a shimmer loading animation
class AnimatedShimmer extends StatelessWidget {
  final Widget child;
  final Duration duration;
  final bool enabled;

  const AnimatedShimmer({
    super.key,
    required this.child,
    this.duration = const Duration(milliseconds: 1500),
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    if (!enabled) return child;
    
    return child
        .animate(onPlay: (controller) => controller.repeat())
        .shimmer(
          duration: duration,
          color: Colors.white.withOpacity(0.3),
        );
  }
}

/// A widget that applies a staggered animation to a list of children
class AnimatedStaggered extends StatelessWidget {
  final List<Widget> children;
  final Duration delay;
  final Duration stagger;
  final Axis direction;
  final CrossAxisAlignment crossAxisAlignment;
  final MainAxisAlignment mainAxisAlignment;

  const AnimatedStaggered({
    super.key,
    required this.children,
    this.delay = Duration.zero,
    this.stagger = const Duration(milliseconds: 100),
    this.direction = Axis.vertical,
    this.crossAxisAlignment = CrossAxisAlignment.center,
    this.mainAxisAlignment = MainAxisAlignment.start,
  });

  @override
  Widget build(BuildContext context) {
    final widgets = <Widget>[];
    
    for (int i = 0; i < children.length; i++) {
      widgets.add(
        AnimatedSlideIn(
          delay: delay + (stagger * i),
          child: children[i],
        ),
      );
    }

    if (direction == Axis.vertical) {
      return Column(
        crossAxisAlignment: crossAxisAlignment,
        mainAxisAlignment: mainAxisAlignment,
        children: widgets,
      );
    } else {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: mainAxisAlignment,
        children: widgets,
      );
    }
  }
}

/// A widget that applies a floating animation to its child
class AnimatedFloat extends StatelessWidget {
  final Widget child;
  final Duration duration;
  final double offset;

  const AnimatedFloat({
    super.key,
    required this.child,
    this.duration = const Duration(seconds: 3),
    this.offset = 10.0,
  });

  @override
  Widget build(BuildContext context) {
    return child
        .animate(onPlay: (controller) => controller.repeat(reverse: true))
        .moveY(
          begin: -offset,
          end: offset,
          duration: duration,
          curve: Curves.easeInOut,
        );
  }
}

/// A widget that applies a pulse animation to its child
class AnimatedPulse extends StatelessWidget {
  final Widget child;
  final Duration duration;
  final double minScale;
  final double maxScale;

  const AnimatedPulse({
    super.key,
    required this.child,
    this.duration = const Duration(milliseconds: 1000),
    this.minScale = 0.95,
    this.maxScale = 1.05,
  });

  @override
  Widget build(BuildContext context) {
    return child
        .animate(onPlay: (controller) => controller.repeat(reverse: true))
        .scale(
          begin: Offset(minScale, minScale),
          end: Offset(maxScale, maxScale),
          duration: duration,
          curve: Curves.easeInOut,
        );
  }
}

/// A widget that applies a bounce animation when tapped
class AnimatedTapBounce extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final Duration duration;

  const AnimatedTapBounce({
    super.key,
    required this.child,
    this.onTap,
    this.duration = const Duration(milliseconds: 100),
  });

  @override
  State<AnimatedTapBounce> createState() => _AnimatedTapBounceState();
}

class _AnimatedTapBounceState extends State<AnimatedTapBounce>
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
      end: 0.95,
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
    return GestureDetector(
      onTapDown: (_) {
        _controller.forward();
      },
      onTapUp: (_) {
        _controller.reverse();
        widget.onTap?.call();
      },
      onTapCancel: () {
        _controller.reverse();
      },
      child: AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: widget.child,
          );
        },
      ),
    );
  }
}

/// A widget that applies a typing animation to text
class AnimatedTypewriter extends StatelessWidget {
  final String text;
  final TextStyle? style;
  final Duration duration;
  final Duration delay;

  const AnimatedTypewriter({
    super.key,
    required this.text,
    this.style,
    this.duration = const Duration(milliseconds: 50),
    this.delay = Duration.zero,
  });

  @override
  Widget build(BuildContext context) {
    return Text(text, style: style)
        .animate(delay: delay)
        .fadeIn(duration: const Duration(milliseconds: 300));
  }
}

/// A widget that applies a gradient animation
class AnimatedGradient extends StatelessWidget {
  final Widget child;
  final List<Color> colors;
  final Duration duration;

  const AnimatedGradient({
    super.key,
    required this.child,
    required this.colors,
    this.duration = const Duration(seconds: 3),
  });

  @override
  Widget build(BuildContext context) {
    return child
        .animate(onPlay: (controller) => controller.repeat(reverse: true))
        .tint(
          color: colors.first,
          duration: duration,
        );
  }
}

/// A widget that applies a glow effect animation
class AnimatedGlow extends StatelessWidget {
  final Widget child;
  final Color glowColor;
  final double blurRadius;
  final Duration duration;

  const AnimatedGlow({
    super.key,
    required this.child,
    this.glowColor = Colors.cyan,
    this.blurRadius = 20.0,
    this.duration = const Duration(seconds: 2),
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: glowColor.withOpacity(0.3),
            blurRadius: blurRadius,
            spreadRadius: 2,
          ),
        ],
      ),
      child: child
          .animate(onPlay: (controller) => controller.repeat(reverse: true))
          .scale(
            begin: const Offset(1.0, 1.0),
            end: const Offset(1.05, 1.05),
            duration: duration,
          ),
    );
  }
}

/// A widget that creates a particle explosion effect
class AnimatedParticleExplosion extends StatelessWidget {
  final Widget child;
  final Color particleColor;
  final int particleCount;
  final Duration duration;

  const AnimatedParticleExplosion({
    super.key,
    required this.child,
    this.particleColor = Colors.cyan,
    this.particleCount = 20,
    this.duration = const Duration(seconds: 2),
  });

  @override
  Widget build(BuildContext context) {
    return child
        .animate()
        .scale(delay: 200.ms, duration: 600.ms)
        .then(delay: 400.ms)
        .shake(hz: 4, curve: Curves.easeInOut);
  }
}

/// A widget that creates a magnetic hover effect
class AnimatedMagneticHover extends StatefulWidget {
  final Widget child;
  final double magnetStrength;
  final Duration duration;

  const AnimatedMagneticHover({
    super.key,
    required this.child,
    this.magnetStrength = 20.0,
    this.duration = const Duration(milliseconds: 300),
  });

  @override
  State<AnimatedMagneticHover> createState() => _AnimatedMagneticHoverState();
}

class _AnimatedMagneticHoverState extends State<AnimatedMagneticHover>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _offsetAnimation;
  Offset _targetOffset = Offset.zero;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );
    _offsetAnimation = Tween<Offset>(
      begin: Offset.zero,
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _updateOffset(Offset localPosition, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final direction = (localPosition - center).scale(1.0, 1.0);
    final distance = direction.distance;
    
    if (distance < widget.magnetStrength) {
      final strength = (widget.magnetStrength - distance) / widget.magnetStrength;
      _targetOffset = direction * strength * 0.3;
    } else {
      _targetOffset = Offset.zero;
    }
    
    _offsetAnimation = Tween<Offset>(
      begin: _offsetAnimation.value,
      end: _targetOffset,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    ));
    
    _controller.forward(from: 0);
  }

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onHover: (event) {
        final RenderBox renderBox = context.findRenderObject() as RenderBox;
        final size = renderBox.size;
        _updateOffset(event.localPosition, size);
      },
      onExit: (event) {
        _targetOffset = Offset.zero;
        _offsetAnimation = Tween<Offset>(
          begin: _offsetAnimation.value,
          end: Offset.zero,
        ).animate(CurvedAnimation(
          parent: _controller,
          curve: Curves.easeOut,
        ));
        _controller.forward(from: 0);
      },
      child: AnimatedBuilder(
        animation: _offsetAnimation,
        builder: (context, child) {
          return Transform.translate(
            offset: _offsetAnimation.value,
            child: widget.child,
          );
        },
      ),
    );
  }
}

/// A widget that creates a morphing shape animation
class AnimatedMorphingShape extends StatefulWidget {
  final double size;
  final Color color;
  final Duration duration;

  const AnimatedMorphingShape({
    super.key,
    this.size = 100,
    this.color = Colors.cyan,
    this.duration = const Duration(seconds: 4),
  });

  @override
  State<AnimatedMorphingShape> createState() => _AnimatedMorphingShapeState();
}

class _AnimatedMorphingShapeState extends State<AnimatedMorphingShape>
    with TickerProviderStateMixin {
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
        return CustomPaint(
          size: Size(widget.size, widget.size),
          painter: MorphingShapePainter(
            animation: _controller.value,
            color: widget.color,
          ),
        );
      },
    );
  }
}

class MorphingShapePainter extends CustomPainter {
  final double animation;
  final Color color;

  MorphingShapePainter({
    required this.animation,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color.withOpacity(0.6)
      ..style = PaintingStyle.fill;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 3;

    final path = Path();
    
    // Create a morphing organic shape
    for (int i = 0; i < 8; i++) {
      final angle = (i * 45.0) * (3.14159 / 180);
      final radiusVariation = radius + 
          (10 * sin(animation * 2 * 3.14159 + i)) +
          (5 * cos(animation * 4 * 3.14159 + i * 0.5));
      
      final x = center.dx + radiusVariation * cos(angle);
      final y = center.dy + radiusVariation * sin(angle);
      
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    
    path.close();
    canvas.drawPath(path, paint);
    
    // Add inner glow
    final glowPaint = Paint()
      ..color = color.withOpacity(0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 3);
    
    canvas.drawPath(path, glowPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
