import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import DashboardScreen from './screens/DashboardScreen';
import AlertsScreen from './screens/AlertsScreen';
import RecommendationsScreen from './screens/RecommendationsScreen';
import AuditScreen from './screens/AuditScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Dashboard') iconName = 'speedometer';
            else if (route.name === 'Alerts') iconName = 'notifications';
            else if (route.name === 'Actions') iconName = 'bulb';
            else if (route.name === 'Audit') iconName = 'document-text';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#gray',
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#fff',
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Alerts" component={AlertsScreen} />
        <Tab.Screen name="Actions" component={RecommendationsScreen} />
        <Tab.Screen name="Audit" component={AuditScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
