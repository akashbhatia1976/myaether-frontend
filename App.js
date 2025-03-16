import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { NotificationProvider } from "./src/context/NotificationsProvider";
import LoginRegistrationScreen from "./src/pages/LoginRegistrationScreen";
import VerifyScreen from "./src/pages/VerifyScreen"; // ✅ Added VerifyScreen
import DashboardScreen from "./src/pages/DashboardScreen";
import UploadScreen from "./src/pages/UploadScreen";
import FileDetailsScreen from "./src/pages/FileDetailsScreen";
import ReportDetailsScreen from "./src/pages/ReportDetailsScreen";
import TrendsScreen from "./src/pages/TrendsScreen";
import ShareScreen from "./src/pages/ShareScreen";

const Stack = createStackNavigator();

const App = () => {
  const [userId, setUserId] = useState(null); // Track user login status

  return (
    <NotificationProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LoginRegistrationScreen">
          <Stack.Screen
            name="LoginRegistrationScreen"
            options={{ title: "Login or Register" }}
          >
            {(props) => <LoginRegistrationScreen {...props} setUserId={setUserId} />}
          </Stack.Screen>

          {/* ✅ Added Verification Screen */}
          <Stack.Screen
            name="VerifyScreen"
            component={VerifyScreen}
            options={{ title: "Verify Account" }}
          />

          <Stack.Screen
            name="DashboardScreen"
            component={DashboardScreen}
            options={{ title: "Dashboard" }}
          />

          <Stack.Screen name="UploadScreen" component={UploadScreen} />
          <Stack.Screen name="FileDetailsScreen" component={FileDetailsScreen} />
          <Stack.Screen name="ReportDetailsScreen" component={ReportDetailsScreen} />
          <Stack.Screen name="TrendsScreen" component={TrendsScreen} />
          <Stack.Screen name="ShareScreen" component={ShareScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </NotificationProvider>
  );
};

export default App;

