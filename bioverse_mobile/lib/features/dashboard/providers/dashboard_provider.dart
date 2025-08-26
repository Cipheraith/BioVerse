import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/material.dart';

// Dashboard State
class DashboardState {
  final bool isLoading;
  final String? error;
  final HealthData? healthData;
  final List<ScheduleItem> schedule;
  final List<ActivityItem> recentActivity;
  final HealthInsight? insight;
  final bool isRefreshing;

  const DashboardState({
    this.isLoading = false,
    this.error,
    this.healthData,
    this.schedule = const [],
    this.recentActivity = const [],
    this.insight,
    this.isRefreshing = false,
  });

  DashboardState copyWith({
    bool? isLoading,
    String? error,
    HealthData? healthData,
    List<ScheduleItem>? schedule,
    List<ActivityItem>? recentActivity,
    HealthInsight? insight,
    bool? isRefreshing,
  }) {
    return DashboardState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      healthData: healthData ?? this.healthData,
      schedule: schedule ?? this.schedule,
      recentActivity: recentActivity ?? this.recentActivity,
      insight: insight ?? this.insight,
      isRefreshing: isRefreshing ?? this.isRefreshing,
    );
  }
}

// Health Data Model
class HealthData {
  final int healthScore;
  final VitalSigns vitals;
  final ActivityMetrics activity;
  final SleepData sleep;
  final StressLevel stress;

  const HealthData({
    required this.healthScore,
    required this.vitals,
    required this.activity,
    required this.sleep,
    required this.stress,
  });
}

class VitalSigns {
  final int heartRate;
  final String bloodPressure;
  final double temperature;
  final int respiratoryRate;
  final DateTime lastUpdated;

  const VitalSigns({
    required this.heartRate,
    required this.bloodPressure,
    required this.temperature,
    required this.respiratoryRate,
    required this.lastUpdated,
  });
}

class ActivityMetrics {
  final int steps;
  final int calories;
  final int activeMinutes;
  final double distance;
  final int heartRateZoneMinutes;

  const ActivityMetrics({
    required this.steps,
    required this.calories,
    required this.activeMinutes,
    required this.distance,
    required this.heartRateZoneMinutes,
  });
}

class SleepData {
  final Duration sleepDuration;
  final int sleepScore;
  final double efficiency;
  final Duration deepSleep;
  final Duration lightSleep;
  final Duration remSleep;

  const SleepData({
    required this.sleepDuration,
    required this.sleepScore,
    required this.efficiency,
    required this.deepSleep,
    required this.lightSleep,
    required this.remSleep,
  });
}

class StressLevel {
  final int level;
  final String description;
  final List<String> recommendations;

  const StressLevel({
    required this.level,
    required this.description,
    required this.recommendations,
  });
}

// Schedule Item Model
class ScheduleItem {
  final String id;
  final String title;
  final String description;
  final DateTime dateTime;
  final ScheduleType type;
  final String? doctorName;
  final String? location;
  final bool isCompleted;

  const ScheduleItem({
    required this.id,
    required this.title,
    required this.description,
    required this.dateTime,
    required this.type,
    this.doctorName,
    this.location,
    this.isCompleted = false,
  });
}

enum ScheduleType {
  appointment,
  medication,
  exercise,
  checkup,
  reminder,
}

// Activity Item Model
class ActivityItem {
  final String id;
  final String title;
  final String description;
  final DateTime timestamp;
  final ActivityType type;
  final Map<String, dynamic>? data;

  const ActivityItem({
    required this.id,
    required this.title,
    required this.description,
    required this.timestamp,
    required this.type,
    this.data,
  });
}

enum ActivityType {
  vitalSigns,
  medication,
  exercise,
  appointment,
  symptom,
  mood,
}

// Health Insight Model
class HealthInsight {
  final String title;
  final String message;
  final InsightType type;
  final int priority;
  final List<String> recommendations;
  final DateTime generatedAt;

  const HealthInsight({
    required this.title,
    required this.message,
    required this.type,
    required this.priority,
    required this.recommendations,
    required this.generatedAt,
  });
}

enum InsightType {
  positive,
  warning,
  critical,
  informational,
}

// Dashboard Provider
class DashboardNotifier extends StateNotifier<DashboardState> {
  DashboardNotifier() : super(const DashboardState()) {
    _initializeDashboard();
  }

  Future<void> _initializeDashboard() async {
    state = state.copyWith(isLoading: true);

    try {
      await Future.wait([
        _loadHealthData(),
        _loadSchedule(),
        _loadRecentActivity(),
        _loadHealthInsight(),
      ]);

      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load dashboard data: ${e.toString()}',
      );
    }
  }

  Future<void> _loadHealthData() async {
    // Simulate API call
    await Future.delayed(const Duration(milliseconds: 500));

    final healthData = HealthData(
      healthScore: 87,
      vitals: VitalSigns(
        heartRate: 72,
        bloodPressure: '120/80',
        temperature: 98.6,
        respiratoryRate: 16,
        lastUpdated: DateTime.now().subtract(const Duration(hours: 2)),
      ),
      activity: const ActivityMetrics(
        steps: 8234,
        calories: 2150,
        activeMinutes: 45,
        distance: 4.2,
        heartRateZoneMinutes: 32,
      ),
      sleep: SleepData(
        sleepDuration: const Duration(hours: 7, minutes: 30),
        sleepScore: 85,
        efficiency: 0.87,
        deepSleep: const Duration(hours: 1, minutes: 45),
        lightSleep: const Duration(hours: 4, minutes: 30),
        remSleep: const Duration(hours: 1, minutes: 15),
      ),
      stress: const StressLevel(
        level: 76,
        description: 'Low-Moderate',
        recommendations: [
          'Continue regular exercise',
          'Practice deep breathing',
          'Maintain consistent sleep schedule',
        ],
      ),
    );

    state = state.copyWith(healthData: healthData);
  }

  Future<void> _loadSchedule() async {
    // Simulate API call
    await Future.delayed(const Duration(milliseconds: 300));

    final now = DateTime.now();
    final schedule = [
      ScheduleItem(
        id: '1',
        title: 'Dr. Smith - Cardiology',
        description: 'Routine checkup',
        dateTime: DateTime(now.year, now.month, now.day, 10, 0),
        type: ScheduleType.appointment,
        doctorName: 'Dr. Smith',
        location: 'Cardiology Department',
      ),
      ScheduleItem(
        id: '2',
        title: 'Blood Test',
        description: 'Lab appointment',
        dateTime: DateTime(now.year, now.month, now.day, 14, 0),
        type: ScheduleType.checkup,
        location: 'Lab Services',
      ),
      ScheduleItem(
        id: '3',
        title: 'Medication Reminder',
        description: 'Lisinopril 10mg',
        dateTime: DateTime(now.year, now.month, now.day, 20, 0),
        type: ScheduleType.medication,
      ),
    ];

    state = state.copyWith(schedule: schedule);
  }

  Future<void> _loadRecentActivity() async {
    // Simulate API call
    await Future.delayed(const Duration(milliseconds: 200));

    final now = DateTime.now();
    final recentActivity = [
      ActivityItem(
        id: '1',
        title: 'Blood Pressure Recorded',
        description: '120/80 mmHg - Normal range',
        timestamp: now.subtract(const Duration(hours: 2)),
        type: ActivityType.vitalSigns,
        data: {'systolic': 120, 'diastolic': 80},
      ),
      ActivityItem(
        id: '2',
        title: 'Completed Workout',
        description: '45 min cardio workout',
        timestamp: now.subtract(const Duration(hours: 6)),
        type: ActivityType.exercise,
        data: {'duration': 45, 'type': 'cardio', 'calories': 320},
      ),
      ActivityItem(
        id: '3',
        title: 'Medication Taken',
        description: 'Lisinopril 10mg',
        timestamp: now.subtract(const Duration(hours: 8)),
        type: ActivityType.medication,
        data: {'medication': 'Lisinopril', 'dosage': '10mg'},
      ),
    ];

    state = state.copyWith(recentActivity: recentActivity);
  }

  Future<void> _loadHealthInsight() async {
    // Simulate API call
    await Future.delayed(const Duration(milliseconds: 400));

    final insight = HealthInsight(
      title: 'Cardiovascular Health',
      message: 'Your cardiovascular health shows excellent improvement over the past month. Your consistent exercise routine is paying off!',
      type: InsightType.positive,
      priority: 1,
      recommendations: [
        'Continue current exercise routine',
        'Maintain healthy diet',
        'Monitor blood pressure weekly',
      ],
      generatedAt: DateTime.now(),
    );

    state = state.copyWith(insight: insight);
  }

  Future<void> refreshDashboard() async {
    state = state.copyWith(isRefreshing: true);

    try {
      await Future.wait([
        _loadHealthData(),
        _loadSchedule(),
        _loadRecentActivity(),
        _loadHealthInsight(),
      ]);

      state = state.copyWith(isRefreshing: false, error: null);
    } catch (e) {
      state = state.copyWith(
        isRefreshing: false,
        error: 'Failed to refresh dashboard: ${e.toString()}',
      );
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }

  Future<void> logVitalSigns({
    int? heartRate,
    String? bloodPressure,
    double? temperature,
    double? weight,
  }) async {
    try {
      // Simulate API call
      await Future.delayed(const Duration(milliseconds: 500));

      // Add to recent activity
      final newActivity = ActivityItem(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: 'Vital Signs Logged',
        description: _buildVitalDescription(heartRate, bloodPressure, temperature, weight),
        timestamp: DateTime.now(),
        type: ActivityType.vitalSigns,
        data: {
          if (heartRate != null) 'heartRate': heartRate,
          if (bloodPressure != null) 'bloodPressure': bloodPressure,
          if (temperature != null) 'temperature': temperature,
          if (weight != null) 'weight': weight,
        },
      );

      final updatedActivity = [newActivity, ...state.recentActivity];
      state = state.copyWith(recentActivity: updatedActivity);

      // Update health data if needed
      if (heartRate != null || bloodPressure != null || temperature != null) {
        await _loadHealthData(); // Reload to get updated vitals
      }
    } catch (e) {
      state = state.copyWith(error: 'Failed to log vital signs: ${e.toString()}');
    }
  }

  String _buildVitalDescription(int? heartRate, String? bloodPressure, double? temperature, double? weight) {
    final parts = <String>[];

    if (heartRate != null) parts.add('HR: $heartRate bpm');
    if (bloodPressure != null) parts.add('BP: $bloodPressure mmHg');
    if (temperature != null) parts.add('Temp: ${temperature}°F');
    if (weight != null) parts.add('Weight: ${weight} lbs');

    return parts.join(', ');
  }

  Future<void> completeScheduleItem(String itemId) async {
    try {
      // Simulate API call
      await Future.delayed(const Duration(milliseconds: 300));

      final updatedSchedule = state.schedule.map((item) {
        if (item.id == itemId) {
          return ScheduleItem(
            id: item.id,
            title: item.title,
            description: item.description,
            dateTime: item.dateTime,
            type: item.type,
            doctorName: item.doctorName,
            location: item.location,
            isCompleted: true,
          );
        }
        return item;
      }).toList();

      state = state.copyWith(schedule: updatedSchedule);

      // Add to recent activity
      final completedItem = state.schedule.firstWhere((item) => item.id == itemId);
      final newActivity = ActivityItem(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: 'Completed: ${completedItem.title}',
        description: completedItem.description,
        timestamp: DateTime.now(),
        type: _mapScheduleTypeToActivityType(completedItem.type),
      );

      final updatedActivity = [newActivity, ...state.recentActivity];
      state = state.copyWith(recentActivity: updatedActivity);
    } catch (e) {
      state = state.copyWith(error: 'Failed to complete schedule item: ${e.toString()}');
    }
  }

  ActivityType _mapScheduleTypeToActivityType(ScheduleType scheduleType) {
    switch (scheduleType) {
      case ScheduleType.appointment:
        return ActivityType.appointment;
      case ScheduleType.medication:
        return ActivityType.medication;
      case ScheduleType.exercise:
        return ActivityType.exercise;
      case ScheduleType.checkup:
        return ActivityType.appointment;
      case ScheduleType.reminder:
        return ActivityType.appointment;
    }
  }

  Future<void> updateHealthScore() async {
    try {
      // Simulate AI calculation
      await Future.delayed(const Duration(milliseconds: 800));

      final currentHealth = state.healthData;
      if (currentHealth != null) {
        // Simple score calculation based on various factors
        int newScore = _calculateHealthScore(currentHealth);

        final updatedHealth = HealthData(
          healthScore: newScore,
          vitals: currentHealth.vitals,
          activity: currentHealth.activity,
          sleep: currentHealth.sleep,
          stress: currentHealth.stress,
        );

        state = state.copyWith(healthData: updatedHealth);
      }
    } catch (e) {
      state = state.copyWith(error: 'Failed to update health score: ${e.toString()}');
    }
  }

  int _calculateHealthScore(HealthData health) {
    int score = 0;

    // Heart rate score (max 25 points)
    final hr = health.vitals.heartRate;
    if (hr >= 60 && hr <= 80) {
      score += 25;
    } else if (hr >= 50 && hr <= 90) {
      score += 20;
    } else {
      score += 10;
    }

    // Activity score (max 25 points)
    final steps = health.activity.steps;
    if (steps >= 10000) {
      score += 25;
    } else if (steps >= 7500) {
      score += 20;
    } else if (steps >= 5000) {
      score += 15;
    } else {
      score += 5;
    }

    // Sleep score (max 25 points)
    final sleepHours = health.sleep.sleepDuration.inHours;
    if (sleepHours >= 7 && sleepHours <= 9) {
      score += 25;
    } else if (sleepHours >= 6 && sleepHours <= 10) {
      score += 20;
    } else {
      score += 10;
    }

    // Stress score (max 25 points)
    final stress = health.stress.level;
    if (stress <= 30) {
      score += 25;
    } else if (stress <= 50) {
      score += 20;
    } else if (stress <= 70) {
      score += 15;
    } else {
      score += 5;
    }

    return score.clamp(0, 100);
  }
}

// Provider instances
final dashboardProvider = StateNotifierProvider<DashboardNotifier, DashboardState>((ref) {
  return DashboardNotifier();
});

// Computed providers for easy access to specific data
final healthDataProvider = Provider<HealthData?>((ref) {
  return ref.watch(dashboardProvider).healthData;
});

final todaysScheduleProvider = Provider<List<ScheduleItem>>((ref) {
  final schedule = ref.watch(dashboardProvider).schedule;
  final today = DateTime.now();

  return schedule.where((item) {
    return item.dateTime.year == today.year &&
           item.dateTime.month == today.month &&
           item.dateTime.day == today.day;
  }).toList();
});

final recentActivityProvider = Provider<List<ActivityItem>>((ref) {
  return ref.watch(dashboardProvider).recentActivity;
});

final healthInsightProvider = Provider<HealthInsight?>((ref) {
  return ref.watch(dashboardProvider).insight;
});

final healthScoreProvider = Provider<int>((ref) {
  final healthData = ref.watch(healthDataProvider);
  return healthData?.healthScore ?? 0;
});

final isLoadingProvider = Provider<bool>((ref) {
  return ref.watch(dashboardProvider).isLoading;
});

final errorProvider = Provider<String?>((ref) {
  return ref.watch(dashboardProvider).error;
});
