import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_theme.dart';

class BioVerseLogo extends StatelessWidget {
  final double size;
  final bool animate;
  final bool showText;
  final Color? color;
  
  const BioVerseLogo({
    super.key,
    this.size = 120,
    this.animate = true,
    this.showText = true,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Original BioVerse Logo
        Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(size * 0.1),
            boxShadow: [
              BoxShadow(
                color: (color ?? AppTheme.primaryColor).withOpacity(0.3),
                blurRadius: size * 0.15,
                offset: Offset(0, size * 0.08),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(size * 0.1),
            child: Image.asset(
              'assets/images/bio.png',
              width: size,
              height: size,
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) {
                // Fallback if image fails to load
                return Container(
                  width: size,
                  height: size,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(size * 0.25),
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: color != null 
                        ? [color!, color!.withOpacity(0.8)]
                        : AppTheme.primaryGradient,
                    ),
                  ),
                  child: Icon(
                    Icons.biotech,
                    size: size * 0.6,
                    color: Colors.white,
                  ),
                );
              },
            ),
          ),
        )
        .animate(
          onPlay: (controller) => animate ? controller.repeat() : null,
        )
        .scale(delay: 300.ms, duration: 600.ms)
        .then(delay: 200.ms)
        .shimmer(
          duration: 2000.ms,
          color: Colors.white.withOpacity(0.3),
        ),
        
        if (showText) ...[
          SizedBox(height: size * 0.2),
          
          // BioVerse Text
          Text(
            'BIOVERSE',
            style: TextStyle(
              fontSize: size * 0.2,
              fontWeight: FontWeight.w900,
              color: color ?? AppTheme.textPrimary,
              letterSpacing: size * 0.015,
            ),
          )
          .animate()
          .fadeIn(delay: 800.ms, duration: 600.ms)
          .slideY(begin: 0.3, end: 0),
          
          SizedBox(height: size * 0.05),
          
          // Zambia Text  
          Text(
            'ZAMBIA',
            style: TextStyle(
              fontSize: size * 0.15,
              fontWeight: FontWeight.w600,
              color: AppTheme.secondaryColor,
              letterSpacing: size * 0.012,
            ),
          )
          .animate()
          .fadeIn(delay: 1000.ms, duration: 600.ms)
          .slideY(begin: 0.3, end: 0),
        ],
      ],
    );
  }
}

class BioVerseLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill
      ..strokeWidth = 2;
    
    final strokePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width * 0.4;

    // Draw brain left hemisphere (curved lines)
    final brainPath = Path();
    
    // Left brain hemisphere with organic curves
    brainPath.moveTo(center.dx - radius * 0.8, center.dy - radius * 0.3);
    brainPath.quadraticBezierTo(
      center.dx - radius * 1.1, center.dy - radius * 0.7,
      center.dx - radius * 0.6, center.dy - radius * 0.9,
    );
    brainPath.quadraticBezierTo(
      center.dx - radius * 0.2, center.dy - radius * 1.1,
      center.dx, center.dy - radius * 0.8,
    );
    brainPath.quadraticBezierTo(
      center.dx - radius * 0.3, center.dy - radius * 0.4,
      center.dx - radius * 0.8, center.dy - radius * 0.3,
    );
    
    // Draw brain outline
    canvas.drawPath(brainPath, paint);
    
    // Add brain texture lines
    for (int i = 0; i < 3; i++) {
      final y = center.dy - radius * 0.7 + (i * radius * 0.3);
      canvas.drawPath(
        Path()
          ..moveTo(center.dx - radius * 0.7, y)
          ..quadraticBezierTo(
            center.dx - radius * 0.4, y - radius * 0.1,
            center.dx - radius * 0.1, y,
          ),
        strokePaint..strokeWidth = 1.5,
      );
    }

    // Draw medical cross (right side)
    final crossSize = radius * 0.8;
    final crossThickness = crossSize * 0.25;
    
    // Vertical bar of cross
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(
          center: Offset(center.dx + radius * 0.3, center.dy - radius * 0.1),
          width: crossThickness,
          height: crossSize,
        ),
        Radius.circular(crossThickness * 0.3),
      ),
      paint,
    );
    
    // Horizontal bar of cross
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(
          center: Offset(center.dx + radius * 0.3, center.dy - radius * 0.1),
          width: crossSize * 0.7,
          height: crossThickness,
        ),
        Radius.circular(crossThickness * 0.3),
      ),
      paint,
    );

    // Draw book/knowledge base (bottom)
    final bookHeight = radius * 0.4;
    final bookWidth = radius * 1.4;
    final bookCenter = Offset(center.dx, center.dy + radius * 0.4);
    
    // Book base
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(
          center: bookCenter,
          width: bookWidth,
          height: bookHeight * 0.7,
        ),
        Radius.circular(radius * 0.1),
      ),
      paint,
    );
    
    // Book pages (lines)
    for (int i = 0; i < 4; i++) {
      final lineY = bookCenter.dy - bookHeight * 0.15 + (i * bookHeight * 0.1);
      canvas.drawLine(
        Offset(bookCenter.dx - bookWidth * 0.35, lineY),
        Offset(bookCenter.dx + bookWidth * 0.35, lineY),
        strokePaint..strokeWidth = 1,
      );
    }
    
    // Book spine (center line)
    canvas.drawLine(
      Offset(bookCenter.dx, bookCenter.dy - bookHeight * 0.35),
      Offset(bookCenter.dx, bookCenter.dy + bookHeight * 0.35),
      strokePaint..strokeWidth = 2,
    );

    // Add connecting elements (data flows)
    final connectionPaint = Paint()
      ..color = Colors.white.withOpacity(0.7)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    
    // Connection from brain to cross
    canvas.drawPath(
      Path()
        ..moveTo(center.dx - radius * 0.1, center.dy - radius * 0.5)
        ..quadraticBezierTo(
          center.dx + radius * 0.1, center.dy - radius * 0.7,
          center.dx + radius * 0.3, center.dy - radius * 0.5,
        ),
      connectionPaint,
    );
    
    // Connection from cross to book
    canvas.drawPath(
      Path()
        ..moveTo(center.dx + radius * 0.3, center.dy + radius * 0.2)
        ..quadraticBezierTo(
          center.dx + radius * 0.1, center.dy + radius * 0.3,
          center.dx, center.dy + radius * 0.1,
        ),
      connectionPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Simplified version for small spaces - uses original logo
class BioVerseLogoMini extends StatelessWidget {
  final double size;
  final Color? color;
  
  const BioVerseLogoMini({
    super.key,
    this.size = 40,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(size * 0.1),
        boxShadow: [
          if (color != null)
            BoxShadow(
              color: color!.withOpacity(0.3),
              blurRadius: size * 0.1,
              offset: Offset(0, size * 0.05),
            ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(size * 0.1),
        child: Image.asset(
          'assets/images/bio.png',
          width: size,
          height: size,
          fit: BoxFit.contain,
          errorBuilder: (context, error, stackTrace) {
            // Fallback if image fails to load
            return Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(size * 0.1),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: color != null 
                    ? [color!, color!.withOpacity(0.8)]
                    : AppTheme.primaryGradient,
                ),
              ),
              child: Icon(
                Icons.biotech,
                size: size * 0.6,
                color: Colors.white,
              ),
            );
          },
        ),
      ),
    );
  }
}

class BioVerseLogoMiniPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width * 0.3;

    // Simplified brain + cross + book icon
    // Brain (left curve)
    canvas.drawCircle(
      Offset(center.dx - radius * 0.3, center.dy - radius * 0.2),
      radius * 0.4,
      paint,
    );
    
    // Medical cross (center)
    canvas.drawRect(
      Rect.fromCenter(
        center: center,
        width: radius * 0.3,
        height: radius * 1.2,
      ),
      paint,
    );
    canvas.drawRect(
      Rect.fromCenter(
        center: center,
        width: radius * 0.8,
        height: radius * 0.3,
      ),
      paint,
    );
    
    // Book (bottom)
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(
          center: Offset(center.dx, center.dy + radius * 0.6),
          width: radius * 1.2,
          height: radius * 0.4,
        ),
        Radius.circular(radius * 0.1),
      ),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Floating animated version for splash/loading
class BioVerseLogoFloating extends StatefulWidget {
  final double size;
  
  const BioVerseLogoFloating({
    super.key,
    this.size = 120,
  });

  @override
  State<BioVerseLogoFloating> createState() => _BioVerseLogoFloatingState();
}

class _BioVerseLogoFloatingState extends State<BioVerseLogoFloating>
    with TickerProviderStateMixin {
  late AnimationController _floatController;
  late AnimationController _glowController;
  
  @override
  void initState() {
    super.initState();
    
    _floatController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat(reverse: true);
    
    _glowController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);
  }
  
  @override
  void dispose() {
    _floatController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([_floatController, _glowController]),
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, -10 * _floatController.value),
          child: Container(
            width: widget.size,
            height: widget.size,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(widget.size * 0.1),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryColor.withOpacity(
                    0.3 + 0.3 * _glowController.value,
                  ),
                  blurRadius: widget.size * 0.15 * (1 + _glowController.value),
                  offset: Offset(0, widget.size * 0.08),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(widget.size * 0.1),
              child: Image.asset(
                'assets/images/bio.png',
                width: widget.size,
                height: widget.size,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) {
                  // Fallback if image fails to load
                  return Container(
                    width: widget.size,
                    height: widget.size,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(widget.size * 0.1),
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: AppTheme.primaryGradient,
                      ),
                    ),
                    child: CustomPaint(
                      size: Size(widget.size * 0.7, widget.size * 0.7),
                      painter: BioVerseLogoPainter(),
                    ),
                  );
                },
              ),
            ),
          ),
        );
      },
    );
  }
}
