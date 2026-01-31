import React from 'react';
import { View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { RootStackParamList, TabParamList } from './src/types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function ScanTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Scanner') {
            iconName = focused ? 'scan' : 'scan-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Scanner" 
        component={ScanScreen}
        options={{ tabBarLabel: 'Scan' }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{ tabBarLabel: 'History' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#fff',
                elevation: 0,
                shadowOpacity: 0,
              },
              headerTintColor: '#333',
              headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 18,
              },
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'Nutrient Scanner' }}
            />
            <Stack.Screen 
              name="Scan" 
              component={ScanTabs}
              options={{ title: 'Barcode Scanner' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}