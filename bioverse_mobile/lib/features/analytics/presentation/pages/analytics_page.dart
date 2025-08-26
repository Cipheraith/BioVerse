import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class AnalyticsPage extends StatelessWidget {
  const AnalyticsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: AppTheme.backgroundGradient,
          ),
        ),
        child: Center(
          child: Text(
            'AnalyticsPage',
            style: const TextStyle(color: AppTheme.textPrimary, fontSize: 24),
          ),
        ),
      ),
    );
  }
}
