import React, { useEffect, useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NotificationContext } from '../context/NotificationsProvider';
import { fetchUserDetailsByHealthID } from '../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardScreen = ({ navigation, route }) => {
  const userId = route?.params?.userId;
  const healthId = route?.params?.healthId;
  const { notifications } = useContext(NotificationContext);
  const [userHealthId, setUserHealthId] = useState(healthId);
  const [loading, setLoading] = useState(!healthId);
  const [queryText, setQueryText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!userId) {
      navigation.replace('LoginRegistrationScreen');
    } else if (!healthId) {
      fetchHealthId(userId);
    }
  }, [userId]);

  const fetchHealthId = async (userId) => {
    setLoading(true);
    try {
      const userDetails = await fetchUserDetailsByHealthID(userId);
      if (userDetails && userDetails.healthId) {
        setUserHealthId(userDetails.healthId);
      }
    } catch (error) {
      console.error("❌ Error fetching Health ID:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (screen) => {
    navigation.navigate(screen, { userId, healthId: userHealthId });
  };

  const handleLogout = async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem("loggedInUserId");
          navigation.replace("LoginRegistrationScreen");
        },
      },
    ]);
  };

  const handleNlpSearch = async () => {
    if (!queryText.trim()) return;
    setSearching(true);
    try {
      const res = await fetch('http://localhost:3000/api/search/nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, queryText })
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.reports);
      } else {
        Alert.alert('Search failed', 'Try a different query.');
      }
    } catch (err) {
      console.error("❌ NLP Search error:", err);
      Alert.alert('Error', 'Something went wrong during search.');
    } finally {
      setSearching(false);
    }
  };

  const MenuButton = ({ iconName, label, targetScreen }) => (
    <TouchableOpacity
      style={styles.button}
      onPress={() => handleNavigation(targetScreen)}
      accessibilityLabel={`Navigate to ${label}`}
    >
      <Ionicons name={iconName} size={24} color="#fff" style={styles.icon} />
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );

  const listData = [
    <Text style={styles.header} key="header">Welcome, {userId}!</Text>,
    loading
      ? <ActivityIndicator size="large" color="#6200ee" key="loading" />
      : <Text style={styles.subHeader} key="healthId">Health ID: {userHealthId}</Text>,
    <Text style={styles.subHeader} key="desc">Manage and analyze your health reports</Text>,
    <TextInput
      key="searchInput"
      style={styles.searchInput}
      placeholder="Search your reports (e.g. 'Hb in October')"
      value={queryText}
      onChangeText={setQueryText}
    />,
    <TouchableOpacity style={styles.searchButton} onPress={handleNlpSearch} key="searchBtn">
      <Ionicons name="search-outline" size={20} color="#fff" />
      <Text style={styles.searchButtonText}>Search</Text>
    </TouchableOpacity>,
    searching ? <ActivityIndicator size="small" color="#6200ee" key="searching" /> : null,
    ...(searchResults.length > 0
      ? [
          <Text style={styles.resultHeader} key="resultHeader">Search Results</Text>,
          ...searchResults.map((item, index) => (
            <View style={styles.resultCard} key={`result-${index}`}>
              <Text style={styles.resultText}><Text style={styles.bold}>Test:</Text> {item.testName}</Text>
              <Text style={styles.resultText}><Text style={styles.bold}>Value:</Text> {item.value} {item.unit}</Text>
              <Text style={styles.resultText}><Text style={styles.bold}>Date:</Text> {new Date(item.date).toDateString()}</Text>
              <Text style={styles.resultText}><Text style={styles.bold}>Report:</Text> {item.fileName}</Text>
            </View>
          ))
        ]
      : []),
    <MenuButton iconName="cloud-upload-outline" label="Upload New Report" targetScreen="UploadScreen" key="uploadBtn" />,
    <MenuButton iconName="document-text-outline" label="View Uploaded Reports" targetScreen="ReportDetailsScreen" key="viewReports" />,
    <MenuButton iconName="eye-outline" label="View Shared Reports" targetScreen="ShareScreen" key="sharedReports" />,
    <MenuButton iconName="trending-up-outline" label="View Health Trends" targetScreen="TrendsScreen" key="trends" />,
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} key="logout">
      <Ionicons name="log-out-outline" size={24} color="#fff" />
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>,
    notifications.length > 0 ? (
      <Text style={styles.notificationHeader} key="notificationHeader">Notifications</Text>
    ) : <Text style={styles.noNotifications} key="noNotif">No notifications available</Text>,
    ...notifications.map((item, index) => (
      <View key={`notif-${index}`} style={[styles.notification, item.type === 'shared' ? styles.shared : styles.revoked]}>
        <Text style={styles.notificationText}>{item.message}</Text>
      </View>
    )),
  ];

  return (
    <FlatList
      data={listData}
      renderItem={({ item }) => item}
      keyExtractor={(_, index) => `item-${index}`}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#6200ee' },
  subHeader: { fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#666' },
  button: { backgroundColor: '#6200ee', padding: 15, borderRadius: 8, marginVertical: 10, flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  logoutButton: { backgroundColor: 'red', padding: 15, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  logoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  notificationHeader: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10, textAlign: 'center' },
  notification: { padding: 10, marginVertical: 5, borderRadius: 5 },
  shared: { backgroundColor: '#D4EDDA' },
  revoked: { backgroundColor: '#F8D7DA' },
  notificationText: { fontSize: 16 },
  noNotifications: { textAlign: 'center', marginTop: 10, color: '#999', fontSize: 16 },
  searchInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 16, backgroundColor: '#fff' },
  searchButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6200ee', padding: 10, borderRadius: 8, justifyContent: 'center', marginBottom: 15 },
  searchButtonText: { color: '#fff', fontSize: 16, marginLeft: 8 },
  resultHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  resultCard: { backgroundColor: '#fff', padding: 12, marginBottom: 10, borderRadius: 8, borderColor: '#ddd', borderWidth: 1 },
  resultText: { fontSize: 15 },
  bold: { fontWeight: 'bold' }
});

export default DashboardScreen;

