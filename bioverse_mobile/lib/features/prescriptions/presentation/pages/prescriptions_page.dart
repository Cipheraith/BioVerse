import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class PrescriptionsPage extends StatelessWidget {
  const PrescriptionsPage({super.key});

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
            'PrescriptionsPage',
            style: const TextStyle(color: AppTheme.textPrimary, fontSize: 24),
          ),
        ),
      ),
    );
  }
}
