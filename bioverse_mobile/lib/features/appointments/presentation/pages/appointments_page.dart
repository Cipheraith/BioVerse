import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class AppointmentsPage extends StatelessWidget {
  final String? initialTab;
  
  const AppointmentsPage({super.key, this.initialTab});

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
            'Appointments Page\n${initialTab != null ? 'Tab: $initialTab' : ''}',
            style: const TextStyle(color: AppTheme.textPrimary, fontSize: 24),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
