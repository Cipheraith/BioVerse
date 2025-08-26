# 🔧 Firebase Authentication Troubleshooting Guide

## 🚨 **Common Issues & Solutions**

### **Issue 1: Firebase Not Initialized Properly**

**Symptoms:**
- App crashes on startup
- "Firebase not initialized" errors
- Authentication methods don't work

**Solution:**
```dart
// Ensure Firebase is initialized before using auth
await Firebase.initializeApp(
  options: DefaultFirebaseOptions.currentPlatform,
);
```

### **Issue 2: Google Services Configuration**

**Check these files:**
1. `android/app/google-services.json` ✅ (Present)
2. `android/app/build.gradle.kts` ✅ (Has google-services plugin)
3. `android/build.gradle` (Check if it has Google Services classpath)

### **Issue 3: Internet Permissions**

**Add to `android/app/src/main/AndroidManifest.xml`:**
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### **Issue 4: Firebase Auth Domain Configuration**

**Current Configuration:**
- Project ID: `bioverse-ai`
- Auth Domain: `bioverse-ai.firebaseapp.com`
- Package Name: `com.bioverse.bioverse_mobile`

## 🛠️ **Step-by-Step Fix**

### **Step 1: Update Android Manifest**
Add internet permissions to your AndroidManifest.xml

### **Step 2: Check Firebase Console Settings**
1. Go to Firebase Console → Authentication
2. Enable Email/Password authentication
3. Add your app's SHA-1 fingerprint for Google Sign-In

### **Step 3: Verify Dependencies**
Check that these are in your `pubspec.yaml`:
```yaml
dependencies:
  firebase_core: ^2.24.2
  firebase_auth: ^4.15.3
  google_sign_in: ^6.2.1
```

### **Step 4: Debug Authentication Flow**
Add debug logging to see what's happening:

```dart
// In your login method
print('Attempting login with email: ${email}');
try {
  final result = await AuthService.signInWithEmailPassword(
    email: email,
    password: password,
  );
  print('Login successful: ${result?.user?.email}');
} catch (e) {
  print('Login error: $e');
}
```

## 🔍 **Debugging Commands**

Run these commands to check your setup:

```bash
# Check if Firebase is properly configured
flutter packages get
flutter clean
flutter build apk --debug

# Check Firebase project
firebase projects:list
firebase use bioverse-ai
```

## 📱 **Testing Steps**

1. **Test with a simple email/password:**
   - Email: `test@bioverse.com`
   - Password: `Test123!`

2. **Check Firebase Console:**
   - Go to Authentication → Users
   - Verify your account exists

3. **Test Network Connection:**
   - Ensure device has internet
   - Try on different networks (WiFi vs Mobile)

## 🚀 **Quick Fix Implementation**

I'll create an enhanced authentication service with better error handling and debugging.