import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import '../../../core/services/auth_service.dart';
import '../../../core/services/app_initialization_service.dart';

class User {
  final String id;
  final String email;
  final String? name;
  final String? role;
  final String? phoneNumber;
  
  User({
    required this.id,
    required this.email,
    this.name,
    this.role,
    this.phoneNumber,
  });
  
  factory User.fromFirebaseUser(firebase_auth.User firebaseUser, Map<String, dynamic>? userData) {
    return User(
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: userData?['displayName'] ?? firebaseUser.displayName,
      role: userData?['role'],
      phoneNumber: userData?['phoneNumber'],
    );
  }
}

class AuthState {
  final bool isAuthenticated;
  final User? user;
  final bool isLoading;
  final String? error;
  
  AuthState({
    this.isAuthenticated = false,
    this.user,
    this.isLoading = false,
    this.error,
  });
  
  AuthState copyWith({
    bool? isAuthenticated,
    User? user,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final Ref _ref;
  
  AuthNotifier(this._ref) : super(AuthState(isLoading: false, isAuthenticated: false)) {
    _init();
  }
  
  void _init() {
    // Wait for Firebase to be initialized before accessing Auth
    _waitForFirebaseAndInitAuth();
  }
  
  Future<void> _waitForFirebaseAndInitAuth() async {
    // Listen to initialization state
    _ref.listen(appInitializationProvider, (previous, next) {
      if (next.isFirebaseReady && !_isListeningToAuth) {
        _startAuthStateListener();
      }
    });
    
    // Check if Firebase is already ready
    final initState = _ref.read(appInitializationProvider);
    if (initState.isFirebaseReady) {
      _startAuthStateListener();
    }
  }
  
  bool _isListeningToAuth = false;
  
  void _startAuthStateListener() {
    if (_isListeningToAuth) return;
    _isListeningToAuth = true;
    
    try {
      // Listen to Firebase Auth state changes
      AuthService.authStateChanges.listen((firebase_auth.User? user) async {
        print('Auth state changed: user = ${user?.email}');
        
        if (user != null) {
          try {
            // User is signed in, get additional data from Firestore
            final userData = await AuthService.getUserData(user.uid);
            final appUser = User.fromFirebaseUser(user, userData);
            
            state = state.copyWith(
              isAuthenticated: true,
              user: appUser,
              isLoading: false,
            );
          } catch (e) {
            // If getting user data fails, still mark as authenticated but without additional data
            final appUser = User.fromFirebaseUser(user, null);
            state = state.copyWith(
              isAuthenticated: true,
              user: appUser,
              isLoading: false,
            );
          }
        } else {
          // User is signed out
          state = state.copyWith(
            isAuthenticated: false,
            user: null,
            isLoading: false,
          );
        }
      }).onError((error) {
        // Handle auth state stream errors
        state = state.copyWith(
          isLoading: false,
          error: 'Authentication error: $error',
        );
      });
    } catch (e) {
      // Handle initialization errors
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to initialize authentication: $e',
      );
    }
  }
  
  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      await AuthService.signInWithEmailPassword(
        email: email,
        password: password,
      );
      // The auth state will be updated automatically by the listener
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }
  
  Future<void> register({
    required String email,
    required String password,
    required String fullName,
    String? phoneNumber,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      await AuthService.signUpWithEmailPassword(
        email: email,
        password: password,
        fullName: fullName,
        phoneNumber: phoneNumber,
      );
      // The auth state will be updated automatically by the listener
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }
  
  Future<void> loginWithGoogle() async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      await AuthService.signInWithGoogle();
      // The auth state will be updated automatically by the listener
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    
    try {
      await AuthService.signOut();
      // The auth state will be updated automatically by the listener
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }
  
  Future<void> updateUserRole(String role) async {
    final currentUser = state.user;
    if (currentUser == null) return;
    
    state = state.copyWith(isLoading: true);
    
    try {
      await AuthService.updateUserRole(currentUser.id, role);
      
      // Update local state
      final updatedUser = User(
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        role: role,
        phoneNumber: currentUser.phoneNumber,
      );
      
      state = state.copyWith(
        user: updatedUser,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }
  
  void clearError() {
    state = state.copyWith(error: null);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref);
});
