import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/modern_card.dart';
import '../../../../core/widgets/modern_button.dart';

class TelemedicinePage extends ConsumerStatefulWidget {
  final String? consultationId;

  const TelemedicinePage({super.key, this.consultationId});

  @override
  ConsumerState<TelemedicinePage> createState() => _TelemedicinePageState();
}

class _TelemedicinePageState extends ConsumerState<TelemedicinePage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _selectedIndex = 0;
  bool _isInCall = false;
  bool _isMuted = false;
  bool _isVideoEnabled = true;
  bool _isSpeakerOn = false;

  final List<String> _tabs = [
    'Consultations',
    'Schedule',
    'Doctors',
    'History',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging) {
        setState(() {
          _selectedIndex = _tabController.index;
        });
      }
    });

    // Check if we should start a call immediately
    if (widget.consultationId != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _startVideoCall(widget.consultationId!);
      });
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isInCall) {
      return _buildVideoCallInterface();
    }

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: AppTheme.backgroundGradient,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildHeader(),
              _buildTabBar(),
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildConsultationsTab(),
                    _buildScheduleTab(),
                    _buildDoctorsTab(),
                    _buildHistoryTab(),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.cardColor.withOpacity(0.8),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderColor),
              ),
              child: const Icon(
                LucideIcons.arrowLeft,
                color: AppTheme.textPrimary,
                size: 20,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Telemedicine',
                  style: TextStyle(
                    color: AppTheme.textPrimary,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  widget.consultationId != null
                      ? 'Consultation ID: ${widget.consultationId}'
                      : 'Connect with healthcare professionals',
                  style: const TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          _buildEmergencyButton(),
        ],
      ),
    );
  }

  Widget _buildEmergencyButton() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.dangerColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.dangerColor.withOpacity(0.3)),
      ),
      child: const Icon(
        LucideIcons.phone,
        color: AppTheme.dangerColor,
        size: 20,
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: AppTheme.cardColor.withOpacity(0.8),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.borderColor),
      ),
      child: TabBar(
        controller: _tabController,
        isScrollable: true,
        indicator: BoxDecoration(
          color: AppTheme.primaryColor,
          borderRadius: BorderRadius.circular(16),
        ),
        labelColor: Colors.white,
        unselectedLabelColor: AppTheme.textSecondary,
        labelStyle: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
        tabs: _tabs.map((tab) => Tab(text: tab)).toList(),
      ),
    );
  }

  Widget _buildConsultationsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildUpcomingConsultations(),
          const SizedBox(height: 24),
          _buildQuickConsultation(),
          const SizedBox(height: 24),
          _buildSpecialtyCards(),
        ],
      ),
    );
  }

  Widget _buildUpcomingConsultations() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Upcoming Consultations',
          style: TextStyle(
            color: AppTheme.textPrimary,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        _buildConsultationCard(
          'Dr. Sarah Johnson',
          'Cardiology',
          'Today, 2:00 PM',
          'Follow-up consultation',
          AppTheme.primaryColor,
          'consultation_1',
          true,
        ),
        const SizedBox(height: 12),
        _buildConsultationCard(
          'Dr. Michael Chen',
          'General Practice',
          'Tomorrow, 10:30 AM',
          'Health check-up',
          AppTheme.successColor,
          'consultation_2',
          false,
        ),
      ],
    );
  }

  Widget _buildConsultationCard(
    String doctorName,
    String specialty,
    String time,
    String description,
    Color color,
    String consultationId,
    bool isToday,
  ) {
    return ModernCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(30),
                  border: Border.all(color: color.withOpacity(0.3)),
                ),
                child: Icon(
                  LucideIcons.user,
                  color: color,
                  size: 28,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      doctorName,
                      style: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      specialty,
                      style: const TextStyle(
                        color: AppTheme.textSecondary,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(
                          LucideIcons.clock,
                          color: AppTheme.textMuted,
                          size: 14,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          time,
                          style: const TextStyle(
                            color: AppTheme.textMuted,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              if (isToday)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.successColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'Today',
                    style: TextStyle(
                      color: AppTheme.successColor,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            description,
            style: const TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: ModernButton.secondary(
                  text: 'Reschedule',
                  size: ModernButtonSize.small,
                  onPressed: () => _showRescheduleDialog(consultationId),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ModernButton.primary(
                  text: isToday ? 'Join Call' : 'Details',
                  icon: isToday ? LucideIcons.video : LucideIcons.info,
                  size: ModernButtonSize.small,
                  onPressed: () => isToday
                      ? _startVideoCall(consultationId)
                      : _showConsultationDetails(consultationId),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickConsultation() {
    return ModernCard(
      padding: const EdgeInsets.all(24),
      gradient: AppTheme.accentGradient,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  LucideIcons.zap,
                  color: Colors.white,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              const Expanded(
                child: Text(
                  'Quick Consultation',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            'Connect with available doctors instantly for urgent health concerns.',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 16),
          ModernButton(
            text: 'Start Quick Consultation',
            icon: LucideIcons.phoneCall,
            color: Colors.white,
            textColor: AppTheme.accentColor,
            onPressed: () => _startQuickConsultation(),
          ),
        ],
      ),
    );
  }

  Widget _buildSpecialtyCards() {
    final specialties = [
      _Specialty('Cardiology', LucideIcons.heart, AppTheme.dangerColor),
      _Specialty('Neurology', LucideIcons.brain, AppTheme.accentColor),
      _Specialty('Dermatology', LucideIcons.scan, AppTheme.primaryColor),
      _Specialty('Pediatrics', LucideIcons.baby, AppTheme.successColor),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Specialties',
          style: TextStyle(
            color: AppTheme.textPrimary,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 1.2,
          ),
          itemCount: specialties.length,
          itemBuilder: (context, index) {
            final specialty = specialties[index];
            return ModernCard(
              padding: const EdgeInsets.all(20),
              color: specialty.color.withOpacity(0.1),
              border: Border.all(color: specialty.color.withOpacity(0.3)),
              onTap: () => _showSpecialtyDoctors(specialty.name),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: specialty.color.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Icon(
                      specialty.icon,
                      color: specialty.color,
                      size: 32,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    specialty.name,
                    style: TextStyle(
                      color: specialty.color,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildScheduleTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ModernButton.primary(
            text: 'Schedule New Appointment',
            icon: LucideIcons.plus,
            onPressed: () => _showScheduleAppointment(),
          ),
          const SizedBox(height: 24),
          const Text(
            'Available Time Slots',
            style: TextStyle(
              color: AppTheme.textPrimary,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          _buildTimeSlots(),
        ],
      ),
    );
  }

  Widget _buildTimeSlots() {
    final timeSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'
    ];

    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: timeSlots.map((time) =>
        ModernCard(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          color: AppTheme.primaryColor.withOpacity(0.1),
          border: Border.all(color: AppTheme.primaryColor.withOpacity(0.3)),
          onTap: () => _selectTimeSlot(time),
          child: Text(
            time,
            style: const TextStyle(
              color: AppTheme.primaryColor,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        )
      ).toList(),
    );
  }

  Widget _buildDoctorsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          _buildDoctorCard('Dr. Sarah Johnson', 'Cardiology', 4.9, 150, true),
          const SizedBox(height: 16),
          _buildDoctorCard('Dr. Michael Chen', 'General Practice', 4.8, 200, false),
          const SizedBox(height: 16),
          _buildDoctorCard('Dr. Emily Davis', 'Neurology', 4.7, 120, true),
        ],
      ),
    );
  }

  Widget _buildDoctorCard(String name, String specialty, double rating, int reviews, bool isOnline) {
    return ModernCard(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Stack(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(30),
                  border: Border.all(color: AppTheme.primaryColor.withOpacity(0.3)),
                ),
                child: const Icon(
                  LucideIcons.user,
                  color: AppTheme.primaryColor,
                  size: 28,
                ),
              ),
              if (isOnline)
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: Container(
                    width: 18,
                    height: 18,
                    decoration: BoxDecoration(
                      color: AppTheme.successColor,
                      borderRadius: BorderRadius.circular(9),
                      border: Border.all(color: AppTheme.cardColor, width: 2),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    color: AppTheme.textPrimary,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  specialty,
                  style: const TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(
                      LucideIcons.star,
                      color: AppTheme.warningColor,
                      size: 14,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '$rating ($reviews reviews)',
                      style: const TextStyle(
                        color: AppTheme.textMuted,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Column(
            children: [
              if (isOnline)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.successColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'Online',
                    style: TextStyle(
                      color: AppTheme.successColor,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              const SizedBox(height: 8),
              ModernButton.primary(
                text: isOnline ? 'Call Now' : 'Schedule',
                size: ModernButtonSize.small,
                icon: isOnline ? LucideIcons.phone : LucideIcons.calendar,
                onPressed: () => isOnline
                    ? _startVideoCall('quick_${name.replaceAll(' ', '_').toLowerCase()}')
                    : _showScheduleWithDoctor(name),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          _buildHistoryItem('Dr. Sarah Johnson', 'Cardiology', 'Dec 15, 2023', 'Completed'),
          const SizedBox(height: 12),
          _buildHistoryItem('Dr. Michael Chen', 'General Practice', 'Dec 10, 2023', 'Completed'),
          const SizedBox(height: 12),
          _buildHistoryItem('Dr. Emily Davis', 'Neurology', 'Dec 5, 2023', 'Cancelled'),
        ],
      ),
    );
  }

  Widget _buildHistoryItem(String doctor, String specialty, String date, String status) {
    final isCompleted = status == 'Completed';
    final color = isCompleted ? AppTheme.successColor : AppTheme.warningColor;

    return ModernCard(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppTheme.primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              LucideIcons.user,
              color: AppTheme.primaryColor,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  doctor,
                  style: const TextStyle(
                    color: AppTheme.textPrimary,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  specialty,
                  style: const TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  date,
                  style: const TextStyle(
                    color: AppTheme.textMuted,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              status,
              style: TextStyle(
                color: color,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVideoCallInterface() {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Main video feed
          Container(
            width: double.infinity,
            height: double.infinity,
            color: Colors.black,
            child: const Center(
              child: Text(
                'Video Call Interface\n(WebRTC Integration Required)',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),

          // Self video preview
          Positioned(
            top: 60,
            right: 20,
            child: Container(
              width: 120,
              height: 160,
              decoration: BoxDecoration(
                color: Colors.grey[800],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white24, width: 2),
              ),
              child: const Center(
                child: Icon(
                  LucideIcons.user,
                  color: Colors.white54,
                  size: 40,
                ),
              ),
            ),
          ),

          // Call info
          Positioned(
            top: 60,
            left: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Dr. Sarah Johnson',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Call controls
          Positioned(
            bottom: 80,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildCallControlButton(
                  icon: _isMuted ? LucideIcons.micOff : LucideIcons.mic,
                  isActive: !_isMuted,
                  onTap: () => setState(() => _isMuted = !_isMuted),
                ),
                _buildCallControlButton(
                  icon: _isVideoEnabled ? LucideIcons.video : LucideIcons.videoOff,
                  isActive: _isVideoEnabled,
                  onTap: () => setState(() => _isVideoEnabled = !_isVideoEnabled),
                ),
                _buildCallControlButton(
                  icon: _isSpeakerOn ? LucideIcons.volume2 : LucideIcons.volumeX,
                  isActive: _isSpeakerOn,
                  onTap: () => setState(() => _isSpeakerOn = !_isSpeakerOn),
                ),
                _buildCallControlButton(
                  icon: LucideIcons.phoneOff,
                  isActive: false,
                  isEndCall: true,
                  onTap: () => _endCall(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCallControlButton({
    required IconData icon,
    required bool isActive,
    required VoidCallback onTap,
    bool isEndCall = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          color: isEndCall
              ? AppTheme.dangerColor
              : isActive
                  ? AppTheme.primaryColor
                  : Colors.white24,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(
          icon,
          color: Colors.white,
          size: 24,
        ),
      ),
    );
  }

  void _startVideoCall(String consultationId) {
    setState(() {
      _isInCall = true;
    });
    // Here you would integrate with WebRTC or your video calling service
    print('Starting video call for consultation: $consultationId');
  }

  void _endCall() {
    setState(() {
      _isInCall = false;
      _isMuted = false;
      _isVideoEnabled = true;
      _isSpeakerOn = false;
    });
    // Here you would end the video call session
    print('Ending video call');
  }

  void _startQuickConsultation() {
    _startVideoCall('quick_consultation_${DateTime.now().millisecondsSinceEpoch}');
  }

  void _showRescheduleDialog(String consultationId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppTheme.cardColor,
        title: const Text(
          'Reschedule Consultation',
          style: TextStyle(color: AppTheme.textPrimary),
        ),
        content: const Text(
          'Would you like to reschedule this consultation?',
          style: TextStyle(color: AppTheme.textSecondary),
        ),
        actions: [
          ModernButton.ghost(
            text: 'Cancel',
            onPressed: () => Navigator.pop(context),
          ),
          ModernButton.primary(
            text: 'Reschedule',
            onPressed: () {
              Navigator.pop(context);
              _showScheduleAppointment();
            },
          ),
        ],
      ),
    );
  }

  void _showConsultationDetails(String consultationId) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.6,
        decoration: const BoxDecoration(
          color: AppTheme.cardColor,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Consultation Details',
                style: TextStyle(
                  color: AppTheme.textPrimary,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),
              // Add consultation details here
              Text(
                'Consultation ID: $consultationId',
                style: const TextStyle(
                  color: AppTheme.textSecondary,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showSpecialtyDoctors(String specialty) {
    print('Showing doctors for specialty: $specialty');
    // Navigate to doctors list filtered by specialty
  }

  void _showScheduleAppointment() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.8,
        decoration: const BoxDecoration(
          color: AppTheme.cardColor,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
          ),
        ),
        child: const Padding(
          padding: EdgeInsets.all(20),
          child: Text(
            'Schedule Appointment Form',
            style: TextStyle(
              color: AppTheme.textPrimary,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }

  void _selectTimeSlot(String time) {
    print('Selected time slot: $time');
    // Handle time slot selection
  }

  void _showScheduleWithDoctor(String doctorName) {
    print('Scheduling with doctor: $doctorName');
    _showScheduleAppointment();
  }
}

class _Specialty {
  final String name;
  final IconData icon;
  final Color color;

  _Specialty(this.name, this.icon, this.color);
}
