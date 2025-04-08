import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ Ensure this import is present
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const ReportDetailsScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [shareWith, setShareWith] = useState('');
  const [searchQuery, setSearchQuery] = useState('');


      useEffect(() => {
          const fetchReports = async () => {
            try {
              if (!userId) throw new Error('User ID is missing.');

              const token = await AsyncStorage.getItem("token");
              if (!token) throw new Error("Token missing");

              const response = await fetch(`http://192.168.2.6:3000/api/reports/${userId}`, {
                method: "GET",
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Accept": "application/json",
                  "Content-Type": "application/json",
                },
              });

              if (!response.ok) throw new Error('Failed to fetch reports');

              const data = await response.json();
              
              // ✅ Updated logic
              if (Array.isArray(data)) {
                setReports(data);
              } else {
                console.warn("⚠️ Expected array of reports but got:", data);
                setReports([]);
              }

              console.log("📦 Reports response from backend:", data);

            } catch (error) {
              console.error('❌ Error fetching reports:', error);
              Alert.alert('Error', 'Failed to fetch reports. Please try again later.');
            } finally {
              setIsLoading(false);
            }
          };

          fetchReports();

      }, [userId]);


  const shareReport = async () => {
    if (!shareWith) {
      Alert.alert("Error", "Please enter the recipient's ID or email.");
      return;
    }

    try {
      setIsSharing(true);
      const response = await fetch("http://localhost:3000/api/share/share-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: userId,
          sharedWith: shareWith,
          reportId: selectedReportId,
          permissionType: "view",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", `Report ${selectedReportId} shared with ${shareWith}!`);
        setShareModalVisible(false);
      } else {
        Alert.alert("Error", data.error || "Failed to share the report.");
      }
    } catch (error) {
      console.error("Error sharing report:", error);
      Alert.alert("Error", "Could not share the report. Try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const shareAllReports = async () => {
    if (!shareWith) {
      Alert.alert("Error", "Please enter the recipient's ID or email.");
      return;
    }

    try {
      setIsSharing(true);
      const response = await fetch("http://localhost:3000/api/share/share-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: userId,
          sharedWith: shareWith,
          permissionType: "view",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", `All reports shared with ${shareWith}!`);
        setShareModalVisible(false);
      } else {
        Alert.alert("Error", data.error || "Failed to share all reports.");
      }
    } catch (error) {
      console.error("Error sharing all reports:", error);
      Alert.alert("Error", "Could not share all reports. Try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const openShareModal = (reportId = null) => {
    setSelectedReportId(reportId);
    setShareWith('');
    setShareModalVisible(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filteredReports = reports.filter(report => {
    const name = (report.name || '').toLowerCase();
    const reportId = (report._id || '').toLowerCase();
    const date = report.date ? formatDate(report.date).toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || reportId.includes(query) || date.includes(query);
  });

    const renderReport = ({ item }) => {
      const displayName = item.name?.trim()
        || item.fileName?.split('-').slice(1).join('-')?.replace('.pdf', '')?.trim()
        || 'Unnamed Report';

      return (
        <TouchableOpacity
          style={styles.reportCard}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('FileDetailsScreen', {
            userId,
            reportId: item._id,
          })}
        >
          <View style={styles.reportHeader}>
            <View style={styles.reportInfo}>
              <Text style={styles.reportId}>{displayName}</Text>
              <Text style={styles.reportDate}>{formatDate(item.date)}</Text>
            </View>
            <View style={styles.reportIconContainer}>
              <Text style={styles.reportIcon}>📋</Text>
            </View>
          </View>

          {item.extractedParameters && (
            <View style={styles.parametersContainer}>
              {Object.keys(item.extractedParameters).slice(0, 2).map((key, index) => (
                <Text key={index} style={styles.parameterText}>
                  {key}: {typeof item.extractedParameters[key] === 'object'
                    ? JSON.stringify(item.extractedParameters[key]).substring(0, 25) + '...'
                    : item.extractedParameters[key]}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={(e) => {
                e.stopPropagation();
                openShareModal(item._id);
              }}
              disabled={isSharing}
            >
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => navigation.navigate('FileDetailsScreen', {
                userId,
                reportId: item._id,
              })}
            >
              <Text style={styles.viewButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    };


  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4361ee" />
        <Text style={styles.loadingText}>Loading your reports...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredReports}
        renderItem={renderReport}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#4361ee' },
  reportCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 15, padding: 15, elevation: 2 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  reportInfo: { flex: 1 },
  reportId: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  reportDate: { fontSize: 14, color: '#888', marginTop: 2 },
  reportIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f5ff', alignItems: 'center', justifyContent: 'center' },
  reportIcon: { fontSize: 20 },
  parametersContainer: { marginVertical: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  parameterText: { fontSize: 14, color: '#666', marginBottom: 3 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  shareButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#e6f0ff', borderRadius: 15 },
  shareButtonText: { color: '#4361ee', fontWeight: '500', fontSize: 14 },
  viewButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#f0f0f0', borderRadius: 15 },
  viewButtonText: { color: '#555', fontWeight: '500', fontSize: 14 },
});

export default ReportDetailsScreen;

