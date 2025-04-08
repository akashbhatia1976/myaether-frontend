import React, { useEffect, useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NotificationContext } from '../context/NotificationsProvider';
import { fetchUserDetailsByHealthID } from '../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchReportsWithNLP } from '../api/apiService'; // ⬅️ make sure this is imported

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
        const results = await searchReportsWithNLP(userId, queryText);
        setSearchResults(results);
      } catch (err) {
        Alert.alert('Search failed', 'Try a different query.');
      } finally {
        setSearching(false);
      }
    };
    
  const QuickActionButton = ({ iconName, label, targetScreen }) => (
    <TouchableOpacity
      style={styles.quickActionButton}
      onPress={() => handleNavigation(targetScreen)}
      accessibilityLabel={`Navigate to ${label}`}
    >
      <View style={styles.quickActionIconContainer}>
        <Ionicons name={iconName} size={24} color="#0D9488" />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const NotificationItem = ({ message, type }) => (
    <View style={[styles.notificationItem, type === 'shared' ? styles.sharedNotification : styles.revokedNotification]}>
      <View style={[
        styles.notificationIconContainer,
        type === 'shared' ? styles.sharedIcon : styles.revokedIcon
      ]}>
        <Ionicons
          name={type === 'shared' ? 'arrow-redo-outline' : 'close-circle-outline'}
          size={20}
          color={type === 'shared' ? '#0D9488' : '#EF4444'}
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationMessage}>{message}</Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.logoBox}>
          <Ionicons name="flash" size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.appTitle}>Aether Health</Text>
      </View>
      
      <View style={styles.headerRight}>
        <View style={styles.userAvatar}>
          <Text style={styles.userInitials}>{userId ? userId.charAt(0).toUpperCase() : "U"}</Text>
        </View>
      </View>
    </View>
  );

  const renderWelcomeSection = () => (
    <View style={styles.welcomeSection}>
      <Text style={styles.welcomeTitle}>Welcome, {userId || 'User'}!</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#0D9488" />
      ) : (
        <Text style={styles.welcomeSubtitle}>
          Health ID: {userHealthId || 'Not available'} • Manage and analyze your health reports
        </Text>
      )}
    </View>
  );

  const renderSearchSection = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your reports (e.g. 'Hb in October')"
          value={queryText}
          onChangeText={setQueryText}
        />
      </View>
      <TouchableOpacity
        style={styles.searchButton}
        onPress={handleNlpSearch}
        disabled={searching || !queryText.trim()}
      >
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchResults = () => {
    if (searching) {
      return (
        <ActivityIndicator size="small" color="#0D9488" style={styles.searchingIndicator} />
      );
    }
    
    if (searchResults.length === 0) return null;
    
    return (
      <View style={styles.searchResultsContainer}>
        <Text style={styles.sectionTitle}>Search Results</Text>
        {searchResults.map((item, index) => (
          <View style={styles.resultCard} key={`result-${index}`}>
            <Text style={styles.resultText}>
              <Text style={styles.resultLabel}>Test:</Text> {item.testName}
            </Text>
            <Text style={styles.resultText}>
              <Text style={styles.resultLabel}>Value:</Text> {item.value} {item.unit}
            </Text>
            <Text style={styles.resultText}>
              <Text style={styles.resultLabel}>Date:</Text> {new Date(item.date).toDateString()}
            </Text>
            <Text style={styles.resultText}>
              <Text style={styles.resultLabel}>Report:</Text> {item.fileName}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsRow}>
        <QuickActionButton
          iconName="cloud-upload-outline"
          label="Upload New Report"
          targetScreen="UploadScreen"
        />
        <QuickActionButton
          iconName="document-text-outline"
          label="View Reports"
          targetScreen="ReportDetailsScreen"
        />
      </View>
      <View style={styles.quickActionsRow}>
        <QuickActionButton
          iconName="eye-outline"
          label="Shared Reports"
          targetScreen="ShareScreen"
        />
        <QuickActionButton
          iconName="trending-up-outline"
          label="Health Trends"
          targetScreen="TrendsScreen"
        />
      </View>
    </View>
  );

  const renderNotifications = () => (
    <View style={styles.notificationsContainer}>
      <Text style={styles.sectionTitle}>Notifications</Text>
      {notifications.length === 0 ? (
        <View style={styles.emptyNotificationsContainer}>
          <Ionicons name="notifications-outline" size={50} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>No notifications available</Text>
        </View>
      ) : (
        notifications.map((item, index) => (
          <NotificationItem
            key={`notif-${index}`}
            message={item.message}
            type={item.type}
          />
        ))
      )}
    </View>
  );

  const renderLogoutButton = () => (
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={styles.logoutIcon} />
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {renderHeader()}
      
      <FlatList
        data={[1]} // Just need one item to render everything
        renderItem={() => (
          <View>
            {renderWelcomeSection()}
            {renderSearchSection()}
            {renderSearchResults()}
            {renderQuickActions()}
            {renderNotifications()}
            {renderLogoutButton()}
          </View>
        )}
        keyExtractor={(item) => `dashboard-${item}`}
        contentContainerStyle={styles.scrollViewContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollViewContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 32,
    height: 32,
    backgroundColor: '#0D9488',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6F7F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitials: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488',
  },
  welcomeSection: {
    padding: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#0D9488',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0D9488',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  searchingIndicator: {
    marginVertical: 10,
    alignSelf: 'center',
  },
  searchResultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  resultText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 6,
  },
  resultLabel: {
    fontWeight: '600',
    color: '#1F2937',
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#E6F7F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  notificationsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyNotificationsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sharedNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#0D9488',
  },
  revokedNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  notificationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sharedIcon: {
    backgroundColor: '#E6F7F5',
  },
  revokedIcon: {
    backgroundColor: '#FEE2E2',
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#1F2937',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen;
