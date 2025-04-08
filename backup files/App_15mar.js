import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { NotificationProvider } from './src/context/NotificationsProvider'; // ✅ Import NotificationProvider
import LoginRegistrationScreen from './src/pages/LoginRegistrationScreen'; // Combined Login & Register
import DashboardScreen from './src/pages/DashboardScreen';
import UploadScreen from './src/pages/UploadScreen';
import FileDetailsScreen from './src/pages/FileDetailsScreen';
import ReportDetailsScreen from './src/pages/ReportDetailsScreen';
import TrendsScreen from './src/pages/TrendsScreen';
import ShareScreen from './src/pages/ShareScreen'; // ✅ Import ShareScreen

const Stack = createStackNavigator();

const App = () => {
  const [userId, setUserId] = useState(null); // Track user login status

  return (
    <NotificationProvider> {/* ✅ Wrap entire app with NotificationProvider */}
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LoginRegistrationScreen">
          {/* Login & Registration Combined */}
          <Stack.Screen
            name="LoginRegistrationScreen"
            options={{ title: 'Login or Register' }}
          >
            {(props) => <LoginRegistrationScreen {...props} setUserId={setUserId} />}
          </Stack.Screen>

          {/* Dashboard */}
          <Stack.Screen
            name="DashboardScreen"
            component={DashboardScreen}
            options={{ title: 'Dashboard' }}
          />

          {/* Other Screens */}
          <Stack.Screen
            name="UploadScreen"
            component={UploadScreen}
            options={{ title: 'Upload Report' }}
          />
          <Stack.Screen
            name="FileDetailsScreen"
            component={FileDetailsScreen}
            options={{ title: 'File Details' }}
          />
          <Stack.Screen
            name="ReportDetailsScreen"
            component={ReportDetailsScreen}
            options={{ title: 'Uploaded Reports' }}
          />
          <Stack.Screen
            name="TrendsScreen"
            component={TrendsScreen}
            options={{ title: 'Health Trends' }}
          />
          <Stack.Screen
            name="ShareScreen"
            component={ShareScreen}
            options={{ title: 'Shared Reports' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NotificationProvider>
  );
};

export default App;

