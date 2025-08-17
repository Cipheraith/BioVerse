import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import DemoMenuScreen from './src/screens/demo/DemoMenuScreen';
import OnboardingScreen from './src/screens/auth/OnboardingScreen';
import LogoDemoScreen from './src/screens/demo/LogoDemoScreen';
import EmergencyScreen from './src/screens/emergency/EmergencyScreen';

// Theme
import { colors } from './src/constants/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={colors.background} />
      <Stack.Navigator
        initialRouteName="DemoMenu"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="DemoMenu" 
          component={DemoMenuScreen}
          options={{
            title: 'BioVerse Demo',
          }}
        />
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{
            title: 'Welcome to BioVerse',
          }}
        />
        <Stack.Screen 
          name="LogoDemo" 
          component={LogoDemoScreen}
          options={{
            title: 'Logo Demo',
          }}
        />
        <Stack.Screen 
          name="Emergency" 
          component={EmergencyScreen}
          options={{
            title: 'Emergency',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}