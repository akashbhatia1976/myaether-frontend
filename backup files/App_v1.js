import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RegistrationScreen from './src/pages/RegistrationScreen';
import LoginScreen from './src/pages/LoginScreen'; // New Login Screen
import DashboardScreen from './src/pages/DashboardScreen';
import UploadScreen from './src/pages/UploadScreen';
import FileDetailsScreen from './src/pages/FileDetailsScreen';
import ReportDetailsScreen from './src/pages/ReportDetailsScreen';
import TrendsScreen from './src/pages/TrendsScreen';

const Stack = createStackNavigator();

const App = () => {
  const [userId, setUserId] = useState(null); // State to track user login

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={userId ? "DashboardScreen" : "LoginScreen"}>
        <Stack.Screen
          name="LoginScreen"
          options={{ title: 'Login' }}
        >
          {(props) => <LoginScreen {...props} setUserId={setUserId} />}
        </Stack.Screen>
        
        <Stack.Screen
          name="RegistrationScreen"
          options={{ title: 'Register' }}
        >
          {(props) => <RegistrationScreen {...props} setUserId={setUserId} />}
        </Stack.Screen>

        <Stack.Screen
          name="DashboardScreen"
          options={{ title: 'Dashboard' }}
        >
          {(props) => <DashboardScreen {...props} userId={userId} />}
        </Stack.Screen>

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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

