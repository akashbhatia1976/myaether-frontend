import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shareReport, shareAllReports } from '../api/apiService';
import Ionicons from "react-native-vector-icons/Ionicons";
import { getReports } from '../api/apiService';


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
          const data = await getReports(userId);
          if (Array.isArray(data)) {
            setReports(data);
          } else {
            console.warn("⚠️ Expected array of reports but got:", data);
            setReports([]);
          }
        } catch (error) {
          console.error("❌ Error fetching reports:", error);
          Alert.alert("Error", "Failed to fetch reports. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchReports();
    }, [userId]);


  const shareReportHandler = async () => {
    if (!shareWith) {
      Alert.alert("Error", "Please enter the recipient's ID or email.");
      return;
    }

    try {
      setIsSharing(true);
      await shareReport({
        ownerId: userId,
        sharedWith: shareWith,
        reportId: selectedReportId,
        permissionType: "view"
      });

      Alert.alert("Success", `Report shared with ${shareWith}!`);
      setShareModalVisible(false);
    } catch (error) {
      console.error("❌ Error sharing report:", error.message);
      Alert.alert("Error", error.message || "Failed to share the report.");
    } finally {
      setIsSharing(false);
    }
  };

  const shareAllReportsHandler = async () => {
    if (!shareWith) {
      Alert.alert("Error", "Please enter the recipient's ID or email.");
      return;
    }

    try {
      setIsSharing(true);
      await shareAllReports({
        ownerId: userId,
        sharedWith: shareWith,
        permissionType: "view"
      });

      Alert.alert("Success", `All reports shared with ${shareWith}!`);
      setShareModalVisible(false);
    } catch (error) {
      console.error("❌ Error sharing all reports:", error.message);
      Alert.alert("Error", error.message || "Failed to share all reports.");
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
            <Text style={styles.reportTitle}>{displayName}</Text>
            <Text style={styles.reportDate}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.reportIconContainer}>
            <Ionicons name="document-text-outline" size={24} color="#0D9488" />
          </View>
        </View>

        {item.extractedParameters && (
          <View style={styles.parametersContainer}>
            {Object.keys(item.extractedParameters).slice(0, 2).map((key, index) => (
              <View key={index} style={styles.parameterRow}>
                <Text style={styles.parameterName}>{key}</Text>
                <Text style={styles.parameterValue}>
                  {typeof item.extractedParameters[key] === 'object'
                    ? JSON.stringify(item.extractedParameters[key]).substring(0, 25) + '...'
                    : item.extractedParameters[key]}
                </Text>
              </View>
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
            <Ionicons name="share-outline" size={16} color="#0D9488" style={styles.buttonIcon} />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => navigation.navigate('FileDetailsScreen', {
              userId,
              reportId: item._id,
            })}
          >
            <Ionicons name="eye-outline" size={16} color="#1F2937" style={styles.buttonIcon} />
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={60} color="#D1D5DB" />
      <Text style={styles.emptyText}>No reports found</Text>
      <Text style={styles.emptySubtext}>Reports you upload or receive will appear here</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reports</Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reports by name or date"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          renderItem={renderReport}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
        />
      )}

      {/* Share Modal */}
      <Modal
        visible={shareModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Report</Text>
              <TouchableOpacity
                onPress={() => setShareModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Recipient ID or Email</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter user ID or email"
              value={shareWith}
              onChangeText={setShareWith}
            />

            <TouchableOpacity
              style={styles.modalPrimaryButton}
              onPress={shareReportHandler}
              disabled={isSharing}
            >
              {isSharing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalPrimaryButtonText}>
                  Share This Report
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSecondaryButton}
              onPress={shareAllReportsHandler}
              disabled={isSharing}
            >
              <Text style={styles.modalSecondaryButtonText}>
                Share All Reports
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShareModalVisible(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  headerRight: {
    width: 32,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  reportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F7F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  parametersContainer: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  parameterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  parameterName: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  parameterValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    flex: 2,
    textAlign: 'right',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E6F7F5',
    borderRadius: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 6,
  },
  shareButtonText: {
    color: '#0D9488',
    fontWeight: '500',
    fontSize: 14,
  },
  viewButtonText: {
    color: '#1F2937',
    fontWeight: '500',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalPrimaryButton: {
    backgroundColor: '#0D9488',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#0D9488',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  modalPrimaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalSecondaryButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalSecondaryButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  modalCancelButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#6B7280',
    fontSize: 16,
  },
});

export default ReportDetailsScreen;
