import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Import screens
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import HealthTwinScreen from "../screens/health/HealthTwinScreen";
import IoTDevicesScreen from "../screens/health/IoTDevicesScreen";
import ARVRScreen from "../screens/health/ARVRScreen";
import EmergencyScreen from "../screens/emergency/EmergencyScreen";
import TelemedicineScreen from "../screens/telemedicine/TelemedicineScreen";
import VoiceAnalysisScreen from "../screens/VoiceAnalysisScreen";
import TokenWalletScreen from "../screens/tokens/TokenWalletScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import AuthScreen from "../screens/auth/AuthScreen";
import OnboardingScreen from "../screens/auth/OnboardingScreen";

// Import theme
import { colors, gradients, typography, spacing } from "../constants/theme";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Custom Tab Bar Icon Component
const TabIcon = ({ name, focused, color, size }) => {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: focused ? "rgba(59, 130, 246, 0.2)" : "transparent",
      }}
    >
      <Ionicons
        name={name}
        size={size}
        color={focused ? colors.primary[400] : color}
      />
    </View>
  );
};

// Main Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "home" : "home-outline";
              break;
            case "HealthTwin":
              iconName = focused ? "body" : "body-outline";
              break;
            case "IoTDevices":
              iconName = focused ? "phone-portrait" : "phone-portrait-outline";
              break;
            case "Emergency":
              iconName = focused ? "medical" : "medical-outline";
              break;
            case "Tokens":
              iconName = focused ? "wallet" : "wallet-outline";
              break;
          }

          return (
            <TabIcon
              name={iconName}
              focused={focused}
              color={color}
              size={size}
            />
          );
        },
        tabBarActiveTintColor: colors.primary[400],
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: typography.fontSizes.xs,
          fontWeight: typography.fontWeights.medium,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="HealthTwin"
        component={HealthTwinScreen}
        options={{ tabBarLabel: "Health Twin" }}
      />
      <Tab.Screen
        name="IoTDevices"
        component={IoTDevicesScreen}
        options={{ tabBarLabel: "Devices" }}
      />
      <Tab.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{ tabBarLabel: "Emergency" }}
      />
      <Tab.Screen
        name="Tokens"
        component={TokenWalletScreen}
        options={{ tabBarLabel: "Wallet" }}
      />
    </Tab.Navigator>
  );
}

// Drawer Navigator for additional screens
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: colors.background,
          width: 280,
        },
        drawerActiveTintColor: colors.primary[400],
        drawerInactiveTintColor: colors.textSecondary,
        drawerLabelStyle: {
          fontSize: typography.fontSizes.md,
          fontWeight: typography.fontWeights.medium,
        },
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          drawerLabel: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="ARVR"
        component={ARVRScreen}
        options={{
          drawerLabel: "AR/VR Medical",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="glasses-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Telemedicine"
        component={TelemedicineScreen}
        options={{
          drawerLabel: "Telemedicine",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="videocam-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="VoiceAnalysis"
        component={VoiceAnalysisScreen}
        options={{
          drawerLabel: "Voice Analysis",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="mic-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerLabel: "Settings",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

// Main Stack Navigator
function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Main" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
