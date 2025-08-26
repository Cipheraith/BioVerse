import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter/foundation.dart';

class EnhancedAuthService {
  static final FirebaseAuth _auth = FirebaseAuth.instance;
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  static final GoogleSignIn _googleSignIn = GoogleSignIn();

  // Enhanced debugging
  static void _debugLog(String message) {
    if (kDebugMode) {
      print('🔐 AUTH DEBUG: $message');
    }
  }

  // Get current user
  static User? get currentUser => _auth.currentUser;

  // Listen to auth state changes
  static Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Check Firebase connection
  static Future<bool> checkFirebaseConnection() async {
    try {
      _debugLog('Checking Firebase connection...');
      
      // Try to access Firestore to test connection
      await _firestore.collection('test').limit(1).get();
      _debugLog('✅ Firebase connection successful');
      return true;
    } catch (e) {
      _debugLog('❌ Firebase connection failed: $e');
      return false;
    }
  }

  // Enhanced sign in with better error handling
  static Future<UserCredential?> signInWithEmailPassword({
    required String email,
    required String password,
  }) async {
    try {
      _debugLog('Starting email/password sign in for: $email');
      
      // Check Firebase connection first
      final isConnected = await checkFirebaseConnection();
      if (!isConnected) {
        throw Exception('No internet connection or Firebase is unreachable');
      }

      // Validate inputs
      if (email.trim().isEmpty) {
        throw Exception('Email cannot be empty');
      }
      if (password.isEmpty) {
        throw Exception('Password cannot be empty');
      }

      _debugLog('Attempting Firebase Auth sign in...');
      
      final UserCredential result = await _auth.signInWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );

      _debugLog('✅ Sign in successful for: ${result.user?.email}');
      
      // Update last login time
      if (result.user != null) {
        try {
          await _firestore.collection('users').doc(result.user!.uid).update({
            'lastLoginAt': FieldValue.serverTimestamp(),
          });
          _debugLog('✅ Updated last login time');
        } catch (e) {
          _debugLog('⚠️ Failed to update last login time: $e');
          // Don't throw error for this, it's not critical
        }
      }

      return result;
    } on FirebaseAuthException catch (e) {
      _debugLog('❌ FirebaseAuth error: ${e.code} - ${e.message}');
      throw _handleAuthException(e);
    } catch (e) {
      _debugLog('❌ General sign in error: $e');
      throw Exception('Failed to sign in: $e');
    }
  }

  // Enhanced sign up
  static Future<UserCredential?> signUpWithEmailPassword({
    required String email,
    required String password,
    required String fullName,
    String? phoneNumber,
  }) async {
    try {
      _debugLog('Starting email/password sign up for: $email');
      
      // Check Firebase connection first
      final isConnected = await checkFirebaseConnection();
      if (!isConnected) {
        throw Exception('No internet connection or Firebase is unreachable');
      }

      // Validate inputs
      if (email.trim().isEmpty) {
        throw Exception('Email cannot be empty');
      }
      if (password.length < 6) {
        throw Exception('Password must be at least 6 characters');
      }
      if (fullName.trim().isEmpty) {
        throw Exception('Full name cannot be empty');
      }

      _debugLog('Creating Firebase Auth account...');
      
      // Create user account
      final UserCredential result = await _auth.createUserWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );

      _debugLog('✅ Account created successfully');

      // Update display name
      if (result.user != null) {
        await result.user!.updateDisplayName(fullName.trim());
        _debugLog('✅ Display name updated');

        // Create user document in Firestore
        await _createUserDocument(
          user: result.user!,
          fullName: fullName.trim(),
          phoneNumber: phoneNumber?.trim(),
        );
        _debugLog('✅ User document created');
      }

      return result;
    } on FirebaseAuthException catch (e) {
      _debugLog('❌ FirebaseAuth error: ${e.code} - ${e.message}');
      throw _handleAuthException(e);
    } catch (e) {
      _debugLog('❌ General sign up error: $e');
      throw Exception('Failed to create account: $e');
    }
  }

  // Enhanced Google Sign In
  static Future<UserCredential?> signInWithGoogle() async {
    try {
      _debugLog('Starting Google sign in...');
      
      // Check Firebase connection first
      final isConnected = await checkFirebaseConnection();
      if (!isConnected) {
        throw Exception('No internet connection or Firebase is unreachable');
      }

      // Trigger the authentication flow
      _debugLog('Launching Google Sign In flow...');
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      
      if (googleUser == null) {
        _debugLog('ℹ️ User cancelled Google sign in');
        return null;
      }

      _debugLog('✅ Google account selected: ${googleUser.email}');

      // Obtain the auth details from the request
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      _debugLog('✅ Google authentication tokens obtained');

      // Create a new credential
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      _debugLog('Signing in to Firebase with Google credential...');
      
      // Sign in to Firebase with the Google credential
      final UserCredential result = await _auth.signInWithCredential(credential);
      _debugLog('✅ Firebase sign in successful');

      // Check if this is a new user and create user document if needed
      if (result.user != null) {
        final userDoc = await _firestore.collection('users').doc(result.user!.uid).get();
        
        if (!userDoc.exists) {
          _debugLog('Creating new user document for Google user...');
          await _createUserDocument(
            user: result.user!,
            fullName: result.user!.displayName ?? 'Google User',
            phoneNumber: result.user!.phoneNumber,
          );
          _debugLog('✅ New user document created');
        } else {
          _debugLog('Updating existing user login time...');
          await _firestore.collection('users').doc(result.user!.uid).update({
            'lastLoginAt': FieldValue.serverTimestamp(),
          });
          _debugLog('✅ Login time updated');
        }
      }

      return result;
    } catch (e) {
      _debugLog('❌ Google sign in error: $e');
      throw Exception('Failed to sign in with Google: $e');
    }
  }

  // Enhanced sign out
  static Future<void> signOut() async {
    try {
      _debugLog('Starting sign out process...');
      
      // Sign out from Google
      await _googleSignIn.signOut();
      _debugLog('✅ Google sign out successful');
      
      // Sign out from Firebase
      await _auth.signOut();
      _debugLog('✅ Firebase sign out successful');
      
    } catch (e) {
      _debugLog('❌ Sign out error: $e');
      throw Exception('Failed to sign out: $e');
    }
  }

  // Enhanced password reset
  static Future<void> resetPassword(String email) async {
    try {
      _debugLog('Sending password reset email to: $email');
      
      if (email.trim().isEmpty) {
        throw Exception('Email cannot be empty');
      }

      await _auth.sendPasswordResetEmail(email: email.trim());
      _debugLog('✅ Password reset email sent');
      
    } on FirebaseAuthException catch (e) {
      _debugLog('❌ Password reset error: ${e.code} - ${e.message}');
      throw _handleAuthException(e);
    } catch (e) {
      _debugLog('❌ General password reset error: $e');
      throw Exception('Failed to send reset email: $e');
    }
  }

  // Get user data with retry logic
  static Future<Map<String, dynamic>?> getUserData(String uid) async {
    try {
      _debugLog('Fetching user data for UID: $uid');
      
      final DocumentSnapshot doc = await _firestore
          .collection('users')
          .doc(uid)
          .get();
      
      if (doc.exists) {
        _debugLog('✅ User data retrieved successfully');
        return doc.data() as Map<String, dynamic>?;
      } else {
        _debugLog('⚠️ User document does not exist');
        return null;
      }
    } catch (e) {
      _debugLog('❌ Get user data error: $e');
      return null;
    }
  }

  // Create user document with enhanced error handling
  static Future<void> _createUserDocument({
    required User user,
    required String fullName,
    String? phoneNumber,
  }) async {
    try {
      _debugLog('Creating user document for: ${user.email}');
      
      final userData = {
        'uid': user.uid,
        'email': user.email,
        'displayName': fullName,
        'phoneNumber': phoneNumber,
        'role': null, // Will be set during role selection
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
        'isActive': true,
        'profileImageUrl': null,
        'lastLoginAt': FieldValue.serverTimestamp(),
        'emailVerified': user.emailVerified,
      };

      await _firestore.collection('users').doc(user.uid).set(userData);
      _debugLog('✅ User document created successfully');
      
    } catch (e) {
      _debugLog('❌ Create user document error: $e');
      throw Exception('Failed to create user profile: $e');
    }
  }

  // Enhanced error handling
  static Exception _handleAuthException(FirebaseAuthException e) {
    _debugLog('Handling FirebaseAuth exception: ${e.code}');
    
    switch (e.code) {
      case 'weak-password':
        return Exception('Password is too weak. Please use at least 6 characters.');
      case 'email-already-in-use':
        return Exception('An account already exists with this email address.');
      case 'user-not-found':
        return Exception('No account found with this email address.');
      case 'wrong-password':
        return Exception('Incorrect password. Please try again.');
      case 'invalid-email':
        return Exception('Please enter a valid email address.');
      case 'user-disabled':
        return Exception('This account has been disabled. Contact support.');
      case 'too-many-requests':
        return Exception('Too many failed attempts. Please try again later.');
      case 'operation-not-allowed':
        return Exception('Email/password sign-in is not enabled.');
      case 'network-request-failed':
        return Exception('Network error. Please check your internet connection.');
      case 'invalid-credential':
        return Exception('Invalid email or password. Please check your credentials.');
      case 'user-token-expired':
        return Exception('Your session has expired. Please sign in again.');
      case 'requires-recent-login':
        return Exception('Please sign out and sign in again to continue.');
      default:
        return Exception('Authentication failed: ${e.message ?? e.code}');
    }
  }

  // Test authentication setup
  static Future<Map<String, dynamic>> testAuthSetup() async {
    final results = <String, dynamic>{};
    
    try {
      _debugLog('🧪 Testing authentication setup...');
      
      // Test 1: Firebase connection
      results['firebase_connection'] = await checkFirebaseConnection();
      
      // Test 2: Auth instance
      results['auth_instance'] = _auth.app.name;
      
      // Test 3: Current user
      results['current_user'] = _auth.currentUser?.email ?? 'None';
      
      // Test 4: Firestore access
      try {
        await _firestore.collection('test').limit(1).get();
        results['firestore_access'] = true;
      } catch (e) {
        results['firestore_access'] = false;
        results['firestore_error'] = e.toString();
      }
      
      _debugLog('🧪 Test results: $results');
      return results;
      
    } catch (e) {
      _debugLog('❌ Test setup error: $e');
      results['error'] = e.toString();
      return results;
    }
  }
}