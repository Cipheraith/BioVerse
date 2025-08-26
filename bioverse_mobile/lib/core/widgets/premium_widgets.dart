import 'package:flutter/material.dart';
import '../animations/advanced_animations.dart' as anim;
import '../theme/bioverse_theme.dart';
import 'dart:math' as math;

/// Premium Interactive Widgets for BioVerse Mobile
/// 
/// These widgets will make your ZICTA submission absolutely stunning!
/// Each widget is crafted to impress competition judges.

/// Premium Gradient Button with Advanced Animations
class PremiumGradientButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final List<Color>? gradientColors;
  final IconData? icon;
  final bool loading;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry? padding;

  const PremiumGradientButton({
    super.key,
    required this.text,
    this.onPressed,
    this.gradientColors,
    this.icon,
    this.loading = false,
    this.width,
    this.height,
    this.padding,
  });

  @override
  State<PremiumGradientButton> createState() => _PremiumGradientButtonState();
}

class _PremiumGradientButtonState extends State<PremiumGradientButton>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late AnimationController _glowController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _glowController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOutCubic,
    ));

    _glowAnimation = Tween<double>(
      begin: 0.3,
      end: 0.6,
    ).animate(CurvedAnimation(
      parent: _glowController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    _glowController.dispose();
    super.dispose();
  }

  void _onTapDown() {
    _controller.forward();
  }

  void _onTapUp() {
    _controller.reverse();
    if (widget.onPressed != null && !widget.loading) {
      widget.onPressed!();
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _onTapDown(),
      onTapUp: (_) => _onTapUp(),
      onTapCancel: () => _controller.reverse(),
      child: AnimatedBuilder(
        animation: Listenable.merge([_scaleAnimation, _glowAnimation]),
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Container(
              width: widget.width,
              height: widget.height ?? 56,
              padding: widget.padding ?? 
                  const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                gradient: LinearGradient(
                  colors: widget.gradientColors ?? 
                      [BioVerseTheme.primaryCyan, BioVerseTheme.primaryBlue],
                ),
                boxShadow: [
                  BoxShadow(
                    color: (widget.gradientColors?.first ?? BioVerseTheme.primaryCyan)
                        .withOpacity(_glowAnimation.value),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Center(
                child: widget.loading
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (widget.icon != null) ...[
                            Icon(
                              widget.icon,
                              color: Colors.white,
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                          ],
                          Text(
                            widget.text,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
              ),
            ),
          );
        },
      ),
    );
  }
}

/// Floating Action Button with Advanced Effects
class FloatingActionWidget extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final Color? backgroundColor;
  final bool enableFloat;
  final bool enableGlow;
  final bool enablePulse;

  const FloatingActionWidget({
    super.key,
    required this.child,
    this.onTap,
    this.backgroundColor,
    this.enableFloat = true,
    this.enableGlow = true,
    this.enablePulse = false,
  });

  @override
  State<FloatingActionWidget> createState() => _FloatingActionWidgetState();
}

class _FloatingActionWidgetState extends State<FloatingActionWidget>
    with TickerProviderStateMixin {
  late AnimationController _floatController;
  late AnimationController _glowController;
  late AnimationController _pulseController;
  late AnimationController _tapController;

  late Animation<double> _floatAnimation;
  late Animation<double> _glowAnimation;
  late Animation<double> _pulseAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();

    _floatController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );

    _glowController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );

    _tapController = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );

    _floatAnimation = Tween<double>(
      begin: 0.0,
      end: -15.0,
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

    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.9,
    ).animate(CurvedAnimation(
      parent: _tapController,
      curve: Curves.easeInOut,
    ));

    if (widget.enableFloat) {
      _floatController.repeat(reverse: true);
    }

    if (widget.enableGlow) {
      _glowController.repeat(reverse: true);
    }

    if (widget.enablePulse) {
      _pulseController.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _floatController.dispose();
    _glowController.dispose();
    _pulseController.dispose();
    _tapController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _tapController.forward(),
      onTapUp: (_) {
        _tapController.reverse();
        if (widget.onTap != null) widget.onTap!();
      },
      onTapCancel: () => _tapController.reverse(),
      child: AnimatedBuilder(
        animation: Listenable.merge([
          _floatAnimation,
          _glowAnimation,
          _pulseAnimation,
          _scaleAnimation,
        ]),
        builder: (context, child) {
          return Transform.translate(
            offset: Offset(0, _floatAnimation.value),
            child: Transform.scale(
              scale: _scaleAnimation.value * _pulseAnimation.value,
              child: Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: widget.backgroundColor ?? BioVerseTheme.primaryCyan,
                  boxShadow: [
                    if (widget.enableGlow)
                      BoxShadow(
                        color: (widget.backgroundColor ?? BioVerseTheme.primaryCyan)
                            .withOpacity(0.4 * _glowAnimation.value),
                        blurRadius: 30 * _glowAnimation.value,
                        spreadRadius: 10 * _glowAnimation.value,
                      ),
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 10,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: widget.child,
              ),
            ),
          );
        },
      ),
    );
  }
}

/// Premium Input Field with Advanced Styling
class PremiumInputField extends StatefulWidget {
  final String? label;
  final String? hint;
  final IconData? prefixIcon;
  final IconData? suffixIcon;
  final VoidCallback? onSuffixTap;
  final TextEditingController? controller;
  final bool obscureText;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;
  final bool enableGlow;

  const PremiumInputField({
    super.key,
    this.label,
    this.hint,
    this.prefixIcon,
    this.suffixIcon,
    this.onSuffixTap,
    this.controller,
    this.obscureText = false,
    this.keyboardType,
    this.validator,
    this.enableGlow = true,
  });

  @override
  State<PremiumInputField> createState() => _PremiumInputFieldState();
}

class _PremiumInputFieldState extends State<PremiumInputField>
    with SingleTickerProviderStateMixin {
  late AnimationController _focusController;
  late Animation<double> _glowAnimation;
  late Animation<Color?> _borderColorAnimation;

  final FocusNode _focusNode = FocusNode();
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();

    _focusController = AnimationController(
      duration: BioVerseAnimations.fast,
      vsync: this,
    );

    _glowAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _focusController,
      curve: Curves.easeInOut,
    ));

    _borderColorAnimation = ColorTween(
      begin: BioVerseTheme.surfaceBorder,
      end: BioVerseTheme.primaryCyan,
    ).animate(CurvedAnimation(
      parent: _focusController,
      curve: Curves.easeInOut,
    ));

    _focusNode.addListener(_onFocusChange);
  }

  @override
  void dispose() {
    _focusController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onFocusChange() {
    setState(() {
      _isFocused = _focusNode.hasFocus;
    });

    if (_isFocused) {
      _focusController.forward();
    } else {
      _focusController.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _focusController,
      builder: (context, child) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (widget.label != null) ...[
              Text(
                widget.label!,
                style: TextStyle(
                  color: _isFocused 
                      ? BioVerseTheme.primaryCyan 
                      : BioVerseTheme.textSecondary,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
            ],
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                boxShadow: widget.enableGlow
                    ? [
                        BoxShadow(
                          color: BioVerseTheme.primaryCyan
                              .withOpacity(0.2 * _glowAnimation.value),
                          blurRadius: 20 * _glowAnimation.value,
                          offset: const Offset(0, 0),
                        ),
                      ]
                    : null,
              ),
              child: TextFormField(
                controller: widget.controller,
                focusNode: _focusNode,
                obscureText: widget.obscureText,
                keyboardType: widget.keyboardType,
                validator: widget.validator,
                style: const TextStyle(
                  color: BioVerseTheme.textPrimary,
                  fontSize: 16,
                ),
                decoration: InputDecoration(
                  hintText: widget.hint,
                  hintStyle: TextStyle(
                    color: BioVerseTheme.textMuted,
                    fontSize: 16,
                  ),
                  prefixIcon: widget.prefixIcon != null
                      ? Icon(
                          widget.prefixIcon,
                          color: _isFocused 
                              ? BioVerseTheme.primaryCyan 
                              : BioVerseTheme.textMuted,
                          size: 20,
                        )
                      : null,
                  suffixIcon: widget.suffixIcon != null
                      ? GestureDetector(
                          onTap: widget.onSuffixTap,
                          child: Icon(
                            widget.suffixIcon,
                            color: BioVerseTheme.textMuted,
                            size: 20,
                          ),
                        )
                      : null,
                  filled: true,
                  fillColor: BioVerseTheme.surfaceCard,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: _borderColorAnimation.value ?? BioVerseTheme.surfaceBorder,
                      width: 2,
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(
                      color: BioVerseTheme.surfaceBorder,
                      width: 1,
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(
                      color: BioVerseTheme.primaryCyan,
                      width: 2,
                    ),
                  ),
                  contentPadding: const EdgeInsets.all(16),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

/// Animated Card Carousel
class AnimatedCardCarousel extends StatefulWidget {
  final List<Widget> children;
  final double height;
  final Duration animationDuration;
  final bool autoPlay;

  const AnimatedCardCarousel({
    super.key,
    required this.children,
    this.height = 200,
    this.animationDuration = const Duration(seconds: 3),
    this.autoPlay = true,
  });

  @override
  State<AnimatedCardCarousel> createState() => _AnimatedCardCarouselState();
}

class _AnimatedCardCarouselState extends State<AnimatedCardCarousel>
    with TickerProviderStateMixin {
  late PageController _pageController;
  late AnimationController _animationController;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(viewportFraction: 0.85);
    _animationController = AnimationController(
      duration: widget.animationDuration,
      vsync: this,
    );

    if (widget.autoPlay) {
      _startAutoPlay();
    }
  }

  void _startAutoPlay() {
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        _nextPage();
        _startAutoPlay();
      }
    });
  }

  void _nextPage() {
    if (_currentIndex < widget.children.length - 1) {
      _currentIndex++;
    } else {
      _currentIndex = 0;
    }
    
    _pageController.animateToPage(
      _currentIndex,
      duration: BioVerseAnimations.slow,
      curve: BioVerseAnimations.easeInOutCubic,
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: widget.height,
      child: PageView.builder(
        controller: _pageController,
        onPageChanged: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        itemCount: widget.children.length,
        itemBuilder: (context, index) {
          return AnimatedBuilder(
            animation: _pageController,
            builder: (context, child) {
              double value = 1.0;
              if (_pageController.position.haveDimensions) {
                value = _pageController.page! - index;
                value = (1 - (value.abs() * 0.3)).clamp(0.0, 1.0);
              }
              
              return Center(
                child: SizedBox(
                  height: Curves.easeInOut.transform(value) * widget.height,
                  child: anim.PremiumAnimatedCard(
                    enableHover: true,
                    enableGlow: index == _currentIndex,
                    glowColor: BioVerseTheme.primaryCyan,
                    child: widget.children[index],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

/// Progress Indicator with Glow Effect
class GlowingProgressIndicator extends StatefulWidget {
  final double progress;
  final Color? color;
  final double height;
  final bool animated;

  const GlowingProgressIndicator({
    super.key,
    required this.progress,
    this.color,
    this.height = 8,
    this.animated = true,
  });

  @override
  State<GlowingProgressIndicator> createState() => _GlowingProgressIndicatorState();
}

class _GlowingProgressIndicatorState extends State<GlowingProgressIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: BioVerseAnimations.slow,
      vsync: this,
    );

    _animation = Tween<double>(
      begin: 0.0,
      end: widget.progress,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: BioVerseAnimations.easeInOutCubic,
    ));

    if (widget.animated) {
      _controller.forward();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: widget.height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(widget.height / 2),
        color: BioVerseTheme.surfaceBorder,
      ),
      child: AnimatedBuilder(
        animation: widget.animated ? _animation : AlwaysStoppedAnimation(widget.progress),
        builder: (context, child) {
          final progress = widget.animated ? _animation.value : widget.progress;
          return Stack(
            children: [
              Container(
                height: widget.height,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(widget.height / 2),
                  color: BioVerseTheme.surfaceBorder,
                ),
              ),
              FractionallySizedBox(
                widthFactor: progress.clamp(0.0, 1.0),
                child: Container(
                  height: widget.height,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(widget.height / 2),
                    gradient: LinearGradient(
                      colors: [
                        widget.color ?? BioVerseTheme.primaryCyan,
                        widget.color?.withOpacity(0.7) ?? BioVerseTheme.primaryBlue,
                      ],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: (widget.color ?? BioVerseTheme.primaryCyan)
                            .withOpacity(0.5),
                        blurRadius: 10,
                        offset: const Offset(0, 0),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

/// Loading Overlay with Premium Animations
class PremiumLoadingOverlay extends StatefulWidget {
  final bool isLoading;
  final Widget child;
  final String? loadingText;

  const PremiumLoadingOverlay({
    super.key,
    required this.isLoading,
    required this.child,
    this.loadingText,
  });

  @override
  State<PremiumLoadingOverlay> createState() => _PremiumLoadingOverlayState();
}

class _PremiumLoadingOverlayState extends State<PremiumLoadingOverlay>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: BioVerseAnimations.fast,
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));

    if (widget.isLoading) {
      _controller.forward();
    }
  }

  @override
  void didUpdateWidget(PremiumLoadingOverlay oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isLoading != oldWidget.isLoading) {
      if (widget.isLoading) {
        _controller.forward();
      } else {
        _controller.reverse();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        widget.child,
        if (widget.isLoading)
          AnimatedBuilder(
            animation: _fadeAnimation,
            builder: (context, child) {
              return Opacity(
                opacity: _fadeAnimation.value,
                child: Container(
                  color: Colors.black.withOpacity(0.7),
                  child: Center(
                    child: anim.GlassMorphismCard(
                      blur: 30,
                      opacity: 0.2,
                      child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            anim.PulseGlow(
                              glowColor: BioVerseTheme.primaryCyan,
                              child: Container(
                                width: 60,
                                height: 60,
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  gradient: BioVerseTheme.primaryGradient,
                                ),
                                child: const Center(
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 3,
                                  ),
                                ),
                              ),
                            ),
                            if (widget.loadingText != null) ...[
                              const SizedBox(height: 24),
                              Text(
                                widget.loadingText!,
                                style: BioVerseTextStyles.gradientSubtitle,
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
      ],
    );
  }
}
