import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'firebase_options.dart';

class FirebaseTestApp extends StatelessWidget {
  const FirebaseTestApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Firebase Test',
      home: const FirebaseTestScreen(),
    );
  }
}

class FirebaseTestScreen extends StatefulWidget {
  const FirebaseTestScreen({super.key});

  @override
  State<FirebaseTestScreen> createState() => _FirebaseTestScreenState();
}

class _FirebaseTestScreenState extends State<FirebaseTestScreen> {
  String _status = 'Initializing...';
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _initializeFirebase();
  }

  Future<void> _initializeFirebase() async {
    try {
      setState(() {
        _status = 'Initializing Firebase...';
      });

      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );

      setState(() {
        _status = 'Firebase initialized successfully!';
        _isInitialized = true;
      });

      // Test Firebase Auth
      final auth = FirebaseAuth.instance;
      setState(() {
        _status += '\nFirebase Auth instance: ${auth.app.name}';
        _status += '\nCurrent user: ${auth.currentUser?.email ?? 'None'}';
      });

    } catch (e) {
      setState(() {
        _status = 'Firebase initialization failed: $e';
      });
    }
  }

  Future<void> _testLogin() async {
    if (!_isInitialized) {
      setState(() {
        _status += '\nFirebase not initialized yet!';
      });
      return;
    }

    try {
      setState(() {
        _status += '\nTesting login...';
      });

      // Try to sign in with test credentials
      final auth = FirebaseAuth.instance;
      final result = await auth.signInWithEmailAndPassword(
        email: 'test@bioverse.com',
        password: 'test123',
      );

      setState(() {
        _status += '\nLogin successful: ${result.user?.email}';
      });

    } catch (e) {
      setState(() {
        _status += '\nLogin failed: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Firebase Test'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Firebase Setup Test',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            
            Expanded(
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                child: SingleChildScrollView(
                  child: Text(
                    _status,
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
            ),
            
            const SizedBox(height: 20),
            
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _initializeFirebase,
                    child: const Text('Reinitialize Firebase'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _testLogin,
                    child: const Text('Test Login'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// Simple main function to run this test
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const FirebaseTestApp());
}