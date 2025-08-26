import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter/foundation.dart';

class AuthService {
  static final FirebaseAuth _auth = FirebaseAuth.instance;
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  static final GoogleSignIn _googleSignIn = GoogleSignIn();

  // Get current user
  static User? get currentUser => _auth.currentUser;

  // Listen to auth state changes
  static Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Sign up with email and password
  static Future<UserCredential?> signUpWithEmailPassword({
    required String email,
    required String password,
    required String fullName,
    String? phoneNumber,
  }) async {
    try {
      // Create user account
      final UserCredential result = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      // Update display name
      await result.user?.updateDisplayName(fullName);

      // Create user document in Firestore
      if (result.user != null) {
        await _createUserDocument(
          user: result.user!,
          fullName: fullName,
          phoneNumber: phoneNumber,
        );
      }

      debugPrint('User created successfully: ${result.user?.email}');
      return result;
    } on FirebaseAuthException catch (e) {
      debugPrint('Sign up error: ${e.code} - ${e.message}');
      throw _handleAuthException(e);
    } catch (e) {
      debugPrint('Sign up error: $e');
      throw Exception('Failed to create account. Please try again.');
    }
  }

  // Sign in with email and password
  static Future<UserCredential?> signInWithEmailPassword({
    required String email,
    required String password,
  }) async {
    try {
      final UserCredential result = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      debugPrint('User signed in successfully: ${result.user?.email}');
      return result;
    } on FirebaseAuthException catch (e) {
      debugPrint('Sign in error: ${e.code} - ${e.message}');
      throw _handleAuthException(e);
    } catch (e) {
      debugPrint('Sign in error: $e');
      throw Exception('Failed to sign in. Please try again.');
    }
  }

  // Sign in with Google
  static Future<UserCredential?> signInWithGoogle() async {
    try {
      // Trigger the authentication flow
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      
      if (googleUser == null) {
        // User cancelled the sign-in
        return null;
      }

      // Obtain the auth details from the request
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      // Create a new credential
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // Sign in to Firebase with the Google credential
      final UserCredential result = await _auth.signInWithCredential(credential);

      // Check if this is a new user and create user document if needed
      if (result.user != null) {
        final userDoc = await _firestore.collection('users').doc(result.user!.uid).get();
        
        if (!userDoc.exists) {
          // Create user document for new Google user
          await _createUserDocument(
            user: result.user!,
            fullName: result.user!.displayName ?? 'Google User',
            phoneNumber: result.user!.phoneNumber,
          );
        } else {
          // Update last login time for existing user
          await _firestore.collection('users').doc(result.user!.uid).update({
            'lastLoginAt': FieldValue.serverTimestamp(),
          });
        }
      }

      debugPrint('Google sign in successful: ${result.user?.email}');
      return result;
    } catch (e) {
      debugPrint('Google sign in error: $e');
      throw Exception('Failed to sign in with Google. Please try again.');
    }
  }

  // Sign out
  static Future<void> signOut() async {
    try {
      // Sign out from Google
      await _googleSignIn.signOut();
      // Sign out from Firebase
      await _auth.signOut();
      debugPrint('User signed out successfully');
    } catch (e) {
      debugPrint('Sign out error: $e');
      throw Exception('Failed to sign out. Please try again.');
    }
  }

  // Reset password
  static Future<void> resetPassword(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email);
      debugPrint('Password reset email sent to: $email');
    } on FirebaseAuthException catch (e) {
      debugPrint('Reset password error: ${e.code} - ${e.message}');
      throw _handleAuthException(e);
    } catch (e) {
      debugPrint('Reset password error: $e');
      throw Exception('Failed to send reset email. Please try again.');
    }
  }

  // Get user data from Firestore
  static Future<Map<String, dynamic>?> getUserData(String uid) async {
    try {
      final DocumentSnapshot doc = await _firestore.collection('users').doc(uid).get();
      
      if (doc.exists) {
        return doc.data() as Map<String, dynamic>?;
      }
      return null;
    } catch (e) {
      debugPrint('Get user data error: $e');
      return null;
    }
  }

  // Update user role
  static Future<void> updateUserRole(String uid, String role) async {
    try {
      await _firestore.collection('users').doc(uid).update({
        'role': role,
        'updatedAt': FieldValue.serverTimestamp(),
      });
      debugPrint('User role updated: $role');
    } catch (e) {
      debugPrint('Update user role error: $e');
      throw Exception('Failed to update user role.');
    }
  }

  // Create user document in Firestore
  static Future<void> _createUserDocument({
    required User user,
    required String fullName,
    String? phoneNumber,
  }) async {
    try {
      await _firestore.collection('users').doc(user.uid).set({
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
      });
      
      debugPrint('User document created for: ${user.email}');
    } catch (e) {
      debugPrint('Create user document error: $e');
      throw Exception('Failed to create user profile.');
    }
  }

  // Handle Firebase Auth exceptions
  static Exception _handleAuthException(FirebaseAuthException e) {
    switch (e.code) {
      case 'weak-password':
        return Exception('The password provided is too weak.');
      case 'email-already-in-use':
        return Exception('An account already exists with that email.');
      case 'user-not-found':
        return Exception('No user found with that email.');
      case 'wrong-password':
        return Exception('Incorrect password.');
      case 'invalid-email':
        return Exception('The email address is not valid.');
      case 'user-disabled':
        return Exception('This user account has been disabled.');
      case 'too-many-requests':
        return Exception('Too many attempts. Please try again later.');
      case 'operation-not-allowed':
        return Exception('Email/password accounts are not enabled.');
      case 'network-request-failed':
        return Exception('Network error. Please check your connection.');
      default:
        return Exception('An error occurred: ${e.message}');
    }
  }

  // Verify email
  static Future<void> sendEmailVerification() async {
    try {
      final user = _auth.currentUser;
      if (user != null && !user.emailVerified) {
        await user.sendEmailVerification();
        debugPrint('Email verification sent');
      }
    } catch (e) {
      debugPrint('Send email verification error: $e');
      throw Exception('Failed to send verification email.');
    }
  }

  // Delete account
  static Future<void> deleteAccount() async {
    try {
      final user = _auth.currentUser;
      if (user != null) {
        // Delete user document from Firestore
        await _firestore.collection('users').doc(user.uid).delete();
        
        // Delete user account
        await user.delete();
        debugPrint('User account deleted');
      }
    } catch (e) {
      debugPrint('Delete account error: $e');
      throw Exception('Failed to delete account.');
    }
  }

  // Update user profile
  static Future<void> updateProfile({
    String? displayName,
    String? phoneNumber,
  }) async {
    try {
      final user = _auth.currentUser;
      if (user != null) {
        // Update Firebase Auth profile
        if (displayName != null) {
          await user.updateDisplayName(displayName);
        }

        // Update Firestore document
        final updateData = <String, dynamic>{
          'updatedAt': FieldValue.serverTimestamp(),
        };
        
        if (displayName != null) {
          updateData['displayName'] = displayName;
        }
        if (phoneNumber != null) {
          updateData['phoneNumber'] = phoneNumber;
        }

        await _firestore.collection('users').doc(user.uid).update(updateData);
        debugPrint('User profile updated');
      }
    } catch (e) {
      debugPrint('Update profile error: $e');
      throw Exception('Failed to update profile.');
    }
  }
}
