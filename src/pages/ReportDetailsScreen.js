import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Button,
  TextInput,
  Modal,
} from 'react-native';

const ReportDetailsScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [shareWith, setShareWith] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        if (!userId) throw new Error('User ID is missing.');

        const response = await fetch(`http://localhost:3000/api/reports/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch reports');

        const data = await response.json();
        setReports(data.reports || []);
      } catch (error) {
        console.error('Error fetching reports:', error);
        Alert.alert('Error', 'Failed to fetch reports. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [userId]);

  // ✅ Share a single report
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

  // ✅ Share all reports
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

  const renderReport = ({ item }) => (
    <View style={styles.reportItem}>
      <TouchableOpacity
        onPress={() => navigation.navigate('FileDetailsScreen', {
          userId,
          reportId: item.reportId,
        })}
      >
        <Text style={styles.reportText}>Report ID: {item.reportId}</Text>
        <Text style={styles.reportDate}>Date: {item.date}</Text>
      </TouchableOpacity>

      {/* Share Button for Individual Report */}
      <Button title="Share" onPress={() => openShareModal(item.reportId)} disabled={isSharing} />
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!reports.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No reports available. Please upload a report.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Uploaded Reports</Text>

      {/* Share All Reports Button */}
      <View style={styles.shareAllContainer}>
        <Button title="Share All Reports" onPress={() => openShareModal(null)} disabled={isSharing} />
      </View>

          <View style={styles.shareAllContainer}>
            <Button
              title="View Shared Reports"
              onPress={() => navigation.navigate("ShareScreen", { userId })}
            />
          </View>

          
      <FlatList
        data={reports}
        renderItem={renderReport}
        keyExtractor={(item) => item.reportId}
        contentContainerStyle={styles.list}
      />

      {/* Share Modal */}
      <Modal visible={shareModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedReportId ? `Share Report ${selectedReportId}` : "Share All Reports"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter User ID or Email"
              value={shareWith}
              onChangeText={setShareWith}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setShareModalVisible(false)} />
              <Button title="Share" onPress={selectedReportId ? shareReport : shareAllReports} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#6200ee',
  },
  list: {
    marginTop: 10,
  },
  reportItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  reportText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reportDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  shareAllContainer: {
    marginBottom: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default ReportDetailsScreen;

