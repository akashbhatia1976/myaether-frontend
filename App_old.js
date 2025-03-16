import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Required for Reanimated
import Reanimated from 'react-native-reanimated';

// Import screens
import UploadScreen from './src/pages/UploadScreen';
import FileListScreen from './src/pages/FileListScreen';
import FileDetailsScreen from './src/pages/FileDetailsScreen';
import ComparisonScreen from './src/pages/ComparisonScreen';
import CompareFilesScreen from './src/pages/CompareFilesScreen';
import ComparisonResultsScreen from './src/pages/ComparisonResultsScreen';
import ManageCategoriesScreen from './src/pages/ManageCategoriesScreen';
import DashboardScreen from './src/pages/DashboardScreen';
import ProfileScreen from './src/pages/ProfileScreen';
import TrendsDashboardScreen from './src/pages/TrendsDashboardScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();


// Drawer Navigator Component
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#6200ee' },
        headerTintColor: '#fff',
        drawerStyle: { backgroundColor: '#f8f9fa', width: 240 },
        drawerActiveTintColor: '#6200ee',
        drawerInactiveTintColor: '#333',
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Trends" component={TrendsDashboardScreen} />
      <Drawer.Screen name="Upload" component={UploadScreen} />
      <Drawer.Screen name="Files" component={FileListScreen} />
      <Drawer.Screen name="Categories" component={ManageCategoriesScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}

// Main App Stack Navigator
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Drawer">
          <Stack.Screen
            name="Drawer"
            component={DrawerNavigator}
            options={{ headerShown: false }}
          />
          {/* Additional Screens for Navigation */}
          <Stack.Screen
            name="FileDetails"
            component={FileDetailsScreen}
            options={{ title: 'File Details' }}
          />
          <Stack.Screen
            name="CompareFiles"
            component={CompareFilesScreen}
            options={{ title: 'Compare Files' }}
          />
          <Stack.Screen
            name="Comparison"
            component={ComparisonScreen}
            options={{ title: 'Comparison Results' }}
          />
          <Stack.Screen
            name="ComparisonResults"
            component={ComparisonResultsScreen}
            options={{ title: 'Comparison Results' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

