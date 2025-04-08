import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  getSharedReportsByUser,
  getReportsSharedWithUser,
  revokeSharedReport
} from '../api/apiService';





const ShareScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [sharedReports, setSharedReports] = useState([]);
  const [receivedReports, setReceivedReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("shared"); // "shared" or "received"

  useEffect(() => {
    fetchSharedReports();
    fetchReceivedReports();
  }, [userId]);

  // Fetch reports that the user has SHARED
    const fetchSharedReports = async () => {
      try {
        console.log("🔍 Fetching reports shared BY user:", userId);
        const data = await getSharedReportsByUser(userId);
        console.log("✅ Shared Reports Response:", JSON.stringify(data, null, 2));
        setSharedReports(data || []);
      } catch (error) {
        console.error("❌ Error fetching shared reports:", error);
        Alert.alert("Error", "Could not load shared reports. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };


  // Fetch reports that have been SHARED *WITH* the user
    const fetchReceivedReports = async () => {
      try {
        console.log("🔍 Fetching reports shared WITH user:", userId);
        const data = await getReportsSharedWithUser(userId);
        console.log("✅ Received Reports Response:", JSON.stringify(data, null, 2));
        setReceivedReports(data || []);
      } catch (error) {
        console.error("❌ Error fetching received reports:", error);
        Alert.alert("Error", "Could not load received reports. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };


  // Helper function to format date correctly
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error("❌ Error formatting date:", error);
      return "Invalid date";
    }
  };


  const renderReport = ({ item }) => {
    const displayName =
      item.sharedWithId || item.sharedWithEmail || item.recipientPhone || "Unknown recipient";

    const relationship = item.relationshipType || "Not specified";

    const sharedLabel =
      viewMode === "shared"
        ? displayName + (!item.sharedWithId && (item.sharedWithEmail || item.recipientPhone) ? " (invite sent)" : "")
        : item.ownerId || "Unknown owner";

    const reportDisplayName =
      item.name?.trim() ||
      item.fileName?.split("-").slice(1).join("-")?.replace(".pdf", "")?.trim() ||
      item.fileName ||
      item.reportId ||
      "Unnamed Report";

    const handleRevoke = async () => {
      try {
        Alert.alert(
          "Confirm Revoke",
          `Are you sure you want to revoke access to report "${reportDisplayName}"?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Revoke",
              style: "destructive",
              onPress: async () => {
                const payload = {
                  ownerId: userId,
                  reportId: item.reportId,
                  sharedWithId: item.sharedWithId || undefined,
                  sharedWithEmail: item.sharedWithEmail || undefined,
                };
                await revokeSharedReport(payload);
                Alert.alert("Access Revoked", `Access to "${reportDisplayName}" has been revoked.`);
                fetchSharedReports(); // Refresh list
              },
            },
          ]
        );
      } catch (error) {
        console.error("❌ Error revoking access:", error);
        Alert.alert("Error", error.message || "Failed to revoke access.");
      }
    };

    return (
      <TouchableOpacity
        style={styles.reportCard}
        activeOpacity={0.7}
        onPress={() => {
          if (!item.reportId) {
            console.warn("⚠️ Report ID missing:", item);
            Alert.alert("Error", "This report is missing a valid ID.");
            return;
          }
          navigation.navigate("FileDetailsScreen", { userId, reportId: item.reportId });
        }}
      >
        <View style={styles.reportHeader}>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>{reportDisplayName}</Text>
            <Text style={styles.reportDate}>Shared on {formatDate(item.sharedAt)}</Text>
          </View>
          <View style={styles.reportIconContainer}>
            <Ionicons
              name={viewMode === "shared" ? "share-outline" : "download-outline"}
              size={24}
              color="#0D9488"
            />
          </View>
        </View>
        
        <View style={styles.reportDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Ionicons
                name={viewMode === "shared" ? "person-outline" : "person-circle-outline"}
                size={16}
                color="#0D9488"
              />
            </View>
            <Text style={styles.detailLabel}>
              {viewMode === "shared" ? "Shared with:" : "Shared by:"}
            </Text>
            <Text style={styles.detailValue}>{sharedLabel}</Text>
          </View>
          
          {viewMode === "shared" && (
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="people-outline" size={16} color="#0D9488" />
              </View>
              <Text style={styles.detailLabel}>Relationship:</Text>
              <Text style={styles.detailValue}>{relationship}</Text>
            </View>
          )}
        </View>
        
        {viewMode === "shared" && (
          <View style={styles.reportFooter}>
            <TouchableOpacity
              onPress={handleRevoke}
              style={styles.revokeButton}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" style={styles.revokeIcon} />
              <Text style={styles.revokeButtonText}>Revoke Access</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name={viewMode === "shared" ? "share-outline" : "download-outline"} size={60} color="#D1D5DB" />
      <Text style={styles.emptyText}>
        {viewMode === "shared"
          ? "You haven't shared any reports yet"
          : "No reports have been shared with you"
        }
      </Text>
      {viewMode === "received" && (
        <Text style={styles.emptySubtext}>
          When someone shares a report with you, it will appear here
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Loading shared reports...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shared Reports</Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === "shared" && styles.activeToggleButton]}
          onPress={() => setViewMode("shared")}
        >
          <Ionicons
            name="share-social"
            size={16}
            color={viewMode === "shared" ? "#FFFFFF" : "#6B7280"}
            style={styles.toggleIcon}
          />
          <Text style={[
            styles.toggleText,
            viewMode === "shared" && styles.activeToggleText,
          ]}>
            Shared by me
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === "received" && styles.activeToggleButton]}
          onPress={() => setViewMode("received")}
        >
          <Ionicons
            name="download"
            size={16}
            color={viewMode === "received" ? "#FFFFFF" : "#6B7280"}
            style={styles.toggleIcon}
          />
          <Text style={[
            styles.toggleText,
            viewMode === "received" && styles.activeToggleText,
          ]}>
            Shared with me
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={viewMode === "shared" ? sharedReports : receivedReports}
        renderItem={renderReport}
        keyExtractor={(item, index) => item._id || `report-${index}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
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
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeToggleButton: {
    backgroundColor: "#0D9488",
  },
  toggleIcon: {
    marginRight: 6,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeToggleText: {
    color: "#FFFFFF",
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
  reportDetails: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E6F7F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    width: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  reportFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    padding: 16,
    alignItems: 'flex-end',
  },
  revokeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  revokeIcon: {
    marginRight: 6,
  },
  revokeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
});

export default ShareScreen;
