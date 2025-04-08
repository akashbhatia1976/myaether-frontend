import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = "http://localhost:3000";

const FileDetailsScreen = ({ route, navigation }) => {
  const { userId, reportId: routeReportId } = route.params || {};
  const [reportId, setReportId] = useState(routeReportId);
  const [reportDetails, setReportDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const fetchReportDetails = async () => {
    if (!userId || !reportId) {
      setIsLoading(false);
      Alert.alert("Error", "Missing report ID or user ID.");
      return;
    }

    setIsLoading(true);
    try {
      let token = await AsyncStorage.getItem("token");

      // Retry if token not found yet
      let attempts = 0;
      while (!token && attempts < 3) {
        await new Promise(res => setTimeout(res, 500));
        token = await AsyncStorage.getItem("token");
        attempts++;
      }

      if (!token) throw new Error("No token found");

      console.log(`🔍 Fetching report details for User: ${userId}, Report: ${reportId}`);
      const response = await fetch(`${API_BASE_URL}/api/reports/${userId}/${reportId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (!data || Object.keys(data).length === 0) throw new Error('No report details found.');

      const extractedParameters = data.extractedParameters || data.parameters;
      if (!extractedParameters || Object.keys(extractedParameters).length === 0) {
        console.warn("⚠️ No extracted parameters found in the report.");
      }

      setReportDetails({
        userId: data.userId,
        reportId: data._id || data.reportId,
        date: data.date,
        fileName: data.fileName,
        name: data.name,
        parameters: extractedParameters,
      });

      setReportId(data._id || data.reportId);

      if (data.aiAnalysis) {
        setAiAnalysis(data.aiAnalysis);
      }

      fetchComments();
    } catch (error) {
      console.error('🚨 Error fetching report details:', error);
      Alert.alert('Error', 'Failed to fetch report details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!reportId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/${reportId}`);
      const data = await response.json();
      if (response.ok) {
        setComments(data.comments || []);
      } else {
        console.error('Error fetching comments');
      }
    } catch (err) {
      console.error('❌ Error fetching comments:', err);
      Alert.alert('Error', 'Failed to fetch comments.');
    }
  };

  const fetchAIAnalysis = async () => {
    if (!userId || !reportId) return;
    setAnalyzing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-analysis/analyze-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, reportId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze report");

      if (data?.analysis) {
        setAiAnalysis(data.analysis);
      } else {
        Alert.alert('Error', 'AI analysis could not be generated.');
      }
    } catch (err) {
      console.error('❌ AI analysis error:', err);
      Alert.alert('Error', 'Failed to fetch AI analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment || !reportId || !userId) {
      Alert.alert("Error", "Missing required fields for comment.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          userId,
          sharedBy: userId,
          commenterId: userId,
          commentType: "parameter",
          parameterPath: "Report Level",
          text: comment,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setComment("");
        fetchComments();
      } else {
        Alert.alert("Error", result.error || "Failed to add comment.");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment.");
    }
  };

  useEffect(() => {
    fetchReportDetails();
  }, [userId, reportId]);

  const renderData = (data) => {
    if (typeof data === 'object' && !Array.isArray(data)) {
      return Object.entries(data).map(([key, value], index) => (
        <View key={index} style={styles.nestedContainer}>
          <Text style={styles.parameterKey}>{key}:</Text>
          {typeof value === 'object' ? renderData(value) : (
            <Text style={styles.parameterValue}>{String(value)}</Text>
          )}
        </View>
      ));
    }
    return <Text style={styles.parameterValue}>{String(data)}</Text>;
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading Report Details...</Text>
      </View>
    );
  }

  if (!reportDetails) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No report details found.</Text>
        <TouchableOpacity style={styles.button} onPress={fetchReportDetails}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{reportDetails.name || 'Report Details'}</Text>
      <Text style={styles.subHeader}>User ID: {userId}</Text>
      <Text style={styles.subHeader}>Report ID: {reportId || 'N/A'}</Text>

      <View style={styles.parametersContainer}>
        {reportDetails.parameters && Object.entries(reportDetails.parameters).map(([category, values], index) => (
          <View key={index} style={styles.parameterBlock}>
            <Text style={styles.category}>{category}</Text>
            {renderData(values)}
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={fetchAIAnalysis} disabled={analyzing}>
        <Text style={styles.buttonText}>
          {analyzing ? 'Analyzing with AI...' : 'Analyze with AI'}
        </Text>
      </TouchableOpacity>

      {aiAnalysis && (
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>🧠 AI Health Analysis</Text>
          <Text style={styles.analysisText}>{aiAnalysis}</Text>
        </View>
      )}

      <View style={styles.commentSection}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment"
          value={comment}
          onChangeText={setComment}
        />
        <TouchableOpacity style={styles.button} onPress={handleAddComment}>
          <Text style={styles.buttonText}>Add Comment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.commentsContainer}>
        {comments.length === 0 ? (
          <Text>No comments available.</Text>
        ) : (
          comments.map((item) => (
            <View key={item._id} style={styles.commentBlock}>
              <Text style={styles.commentUser}>
                {item.commenterId} ({item.relationshipType || "Unknown"})
              </Text>
              <Text style={styles.commentText}>{item.text}</Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DashboardScreen')}>
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#6200ee' },
  subHeader: { fontSize: 16, textAlign: 'center', marginBottom: 10, color: '#333' },
  parametersContainer: { marginTop: 20 },
  parameterBlock: { marginBottom: 15, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 },
  category: { fontSize: 18, fontWeight: 'bold', color: '#6200ee', marginBottom: 5 },
  nestedContainer: { marginLeft: 10, marginBottom: 5 },
  parameterKey: { fontSize: 16, fontWeight: 'bold' },
  parameterValue: { fontSize: 16, marginLeft: 10 },
  button: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  analysisContainer: { backgroundColor: '#f8f8f8', padding: 15, marginTop: 20, borderRadius: 5 },
  analysisTitle: { fontSize: 18, fontWeight: 'bold', color: '#6200ee', marginBottom: 10 },
  analysisText: { fontSize: 16, lineHeight: 22, color: '#333' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  commentSection: { marginTop: 20 },
  commentInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10 },
  commentBlock: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5, marginBottom: 10 },
  commentUser: { fontWeight: 'bold' },
  commentText: { marginTop: 5 },
});

export default FileDetailsScreen;

