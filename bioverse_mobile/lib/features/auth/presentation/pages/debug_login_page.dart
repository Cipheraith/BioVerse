import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/services/enhanced_auth_service.dart';
import '../../../../core/theme/app_theme.dart';

class DebugLoginPage extends StatefulWidget {
  const DebugLoginPage({super.key});

  @override
  State<DebugLoginPage> createState() => _DebugLoginPageState();
}

class _DebugLoginPageState extends State<DebugLoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  
  bool _isLoading = false;
  String _debugOutput = '';
  Map<String, dynamic> _testResults = {};

  @override
  void initState() {
    super.initState();
    _runInitialTests();
  }

  Future<void> _runInitialTests() async {
    setState(() {
      _debugOutput = 'Running initial tests...\n';
    });

    final results = await EnhancedAuthService.testAuthSetup();
    setState(() {
      _testResults = results;
      _debugOutput += 'Test Results:\n';
      results.forEach((key, value) {
        _debugOutput += '  $key: $value\n';
      });
      _debugOutput += '\n';
    });
  }

  Future<void> _testLogin() async {
    if (_emailController.text.trim().isEmpty || _passwordController.text.isEmpty) {
      _addDebugOutput('❌ Please enter both email and password');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    _addDebugOutput('🔐 Starting login test...');
    _addDebugOutput('Email: ${_emailController.text.trim()}');
    _addDebugOutput('Password: ${'*' * _passwordController.text.length}');

    try {
      final result = await EnhancedAuthService.signInWithEmailPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );

      if (result != null) {
        _addDebugOutput('✅ Login successful!');
        _addDebugOutput('User ID: ${result.user?.uid}');
        _addDebugOutput('Email: ${result.user?.email}');
        _addDebugOutput('Email Verified: ${result.user?.emailVerified}');
        
        // Show success dialog
        _showSuccessDialog();
      } else {
        _addDebugOutput('❌ Login returned null result');
      }
    } catch (e) {
      _addDebugOutput('❌ Login failed: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _addDebugOutput(String message) {
    setState(() {
      _debugOutput += '${DateTime.now().toLocal().toString().substring(11, 19)}: $message\n';
    });
  }

  void _clearDebugOutput() {
    setState(() {
      _debugOutput = '';
    });
  }

  void _copyDebugOutput() {
    Clipboard.setData(ClipboardData(text: _debugOutput));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Debug output copied to clipboard')),
    );
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppTheme.cardColor,
        title: const Text(
          '🎉 Login Successful!',
          style: TextStyle(color: AppTheme.textPrimary),
        ),
        content: const Text(
          'Authentication is working correctly. You can now use the regular login page.',
          style: TextStyle(color: AppTheme.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: const Text('🔧 Debug Login'),
        backgroundColor: AppTheme.cardColor,
        foregroundColor: AppTheme.textPrimary,
        actions: [
          IconButton(
            onPressed: _runInitialTests,
            icon: const Icon(Icons.refresh),
            tooltip: 'Rerun Tests',
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Test Results Card
            Card(
              color: AppTheme.cardColor,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '🧪 System Status',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    ..._testResults.entries.map((entry) {
                      final isGood = entry.value == true || 
                                   (entry.value is String && !entry.value.toString().contains('error'));
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 2),
                        child: Row(
                          children: [
                            Icon(
                              isGood ? Icons.check_circle : Icons.error,
                              color: isGood ? AppTheme.successColor : AppTheme.dangerColor,
                              size: 16,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                '${entry.key}: ${entry.value}',
                                style: const TextStyle(
                                  color: AppTheme.textSecondary,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Login Form
            Card(
              color: AppTheme.cardColor,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '🔐 Test Login',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    TextField(
                      controller: _emailController,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        hintText: 'Enter your email address',
                        prefixIcon: Icon(Icons.email),
                      ),
                      keyboardType: TextInputType.emailAddress,
                    ),
                    
                    const SizedBox(height: 16),
                    
                    TextField(
                      controller: _passwordController,
                      decoration: const InputDecoration(
                        labelText: 'Password',
                        hintText: 'Enter your password',
                        prefixIcon: Icon(Icons.lock),
                      ),
                      obscureText: true,
                    ),
                    
                    const SizedBox(height: 16),
                    
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _testLogin,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryColor,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Text(
                                'Test Login',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Debug Output
            Expanded(
              child: Card(
                color: AppTheme.cardColor,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Row(
                        children: [
                          const Text(
                            '📋 Debug Output',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          const Spacer(),
                          IconButton(
                            onPressed: _copyDebugOutput,
                            icon: const Icon(Icons.copy),
                            tooltip: 'Copy Output',
                          ),
                          IconButton(
                            onPressed: _clearDebugOutput,
                            icon: const Icon(Icons.clear),
                            tooltip: 'Clear Output',
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Container(
                        width: double.infinity,
                        margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppTheme.backgroundColor,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppTheme.borderColor),
                        ),
                        child: SingleChildScrollView(
                          child: Text(
                            _debugOutput.isEmpty ? 'Debug output will appear here...' : _debugOutput,
                            style: const TextStyle(
                              fontFamily: 'monospace',
                              fontSize: 12,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}