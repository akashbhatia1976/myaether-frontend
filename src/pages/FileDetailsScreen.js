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
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getReportDetails, getCommentsForReport, analyzeReportWithAI, postCommentForReport } from '../api/apiService';



const FileDetailsScreen = ({ route, navigation }) => {
  const { userId, reportId: routeReportId } = route.params || {};
  const [reportId, setReportId] = useState(routeReportId);
  const [reportDetails, setReportDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState('parameters'); // parameters, aiAnalysis, comments

    const fetchReportDetails = async () => {
      setIsLoading(true);
      try {
        const data = await getReportDetails(userId, reportId);
        setReportDetails(data);
        setReportId(data.reportId); // fallback logic already handled in apiService
        if (data.aiAnalysis) {
          setAiAnalysis(data.aiAnalysis);
        }
        fetchComments();
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setIsLoading(false);
      }
    };



    const fetchComments = async () => {
      if (!reportId) return;
      try {
        const commentData = await getCommentsForReport(reportId);
        setComments(commentData);
      } catch (err) {
        console.error("❌ Failed to fetch comments:", err);
        Alert.alert("Error", "Could not fetch comments.");
      }
    };

    const fetchAIAnalysis = async () => {
      if (!userId || !reportId) return;
      setAnalyzing(true);
      try {
        const analysis = await analyzeReportWithAI(userId, reportId);
        setAiAnalysis(analysis);
        setActiveTab("aiAnalysis");
      } catch (err) {
        console.error("❌ AI analysis failed:", err);
        Alert.alert("Error", "Failed to fetch AI analysis.");
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
        await postCommentForReport({
          reportId,
          userId,
          commentText: comment
        });

        setComment("");
        fetchComments();
        Alert.alert("Success", "Comment added successfully");
      } catch (error) {
        console.error("Error adding comment:", error);
        Alert.alert("Error", error.message || "Failed to add comment.");
      }
    };

  useEffect(() => {
    fetchReportDetails();
  }, [userId, routeReportId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper function to get current date in nice format
  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderData = (data) => {
    if (!data) return null;
    
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      return Object.entries(data).map(([key, value], index) => (
        <View key={index} style={styles.nestedContainer}>
          <Text style={styles.parameterKey}>{key}:</Text>
          {typeof value === 'object' && value !== null ? renderData(value) : (
            <Text style={styles.parameterValue}>{String(value || 'N/A')}</Text>
          )}
        </View>
      ));
    }
    
    return <Text style={styles.parameterValue}>{String(data || 'N/A')}</Text>;
  };

  const renderParametersTab = () => {
    if (!reportDetails || !reportDetails.parameters || Object.keys(reportDetails.parameters).length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="document-outline" size={50} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>No parameters found in this report.</Text>
        </View>
      );
    }

    return (
      <View style={styles.parametersContainer}>
        {Object.entries(reportDetails.parameters).map(([category, values], index) => (
          <View key={index} style={styles.parameterBlock}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {renderData(values)}
          </View>
        ))}
      </View>
    );
  };

  const renderAIAnalysisTab = () => {
    if (analyzing) {
      return (
        <View style={styles.emptyStateContainer}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={styles.loadingText}>Analyzing report...</Text>
        </View>
      );
    }

      if (!aiAnalysis) {
        return (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="analytics-outline" size={50} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No AI analysis available yet.</Text>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={fetchAIAnalysis}
            >
              <Ionicons name="analytics" size={16} color="#FFFFFF" style={styles.generateButtonIcon} />
              <Text style={styles.generateButtonText}>Generate AI Analysis</Text>
            </TouchableOpacity>
          </View>
        );
      }

    // Function to parse and structure the AI analysis
    const renderStructuredAnalysis = () => {
      // Try to identify if the analysis contains sections
      const sections = parseAnalysisSections(aiAnalysis);
      
      if (sections.length > 0) {
        return (
          <View style={styles.structuredAnalysisContainer}>
            {sections.map((section, index) => (
              <View key={index} style={styles.analysisSection}>
                {section.title && (
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons
                      name={getSectionIcon(section.title)}
                      size={20}
                      color="#0D9488"
                      style={styles.sectionIcon}
                    />
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                  </View>
                )}
                <Text style={styles.sectionContent}>{section.content}</Text>
              </View>
            ))}
          </View>
        );
      } else {
        // If we can't identify clear sections, render with paragraph breaks
        const paragraphs = aiAnalysis.split('\n\n').filter(p => p.trim().length > 0);
        
        if (paragraphs.length > 1) {
          return (
            <View style={styles.structuredAnalysisContainer}>
              {paragraphs.map((paragraph, index) => (
                <View key={index} style={styles.analysisParagraph}>
                  <Text style={styles.paragraphText}>{paragraph}</Text>
                </View>
              ))}
            </View>
          );
        } else {
          // If there are no paragraphs, just render the raw text
          return (
            <View style={styles.aiAnalysisTextContainer}>
              <Text style={styles.aiAnalysisText}>{aiAnalysis}</Text>
            </View>
          );
        }
      }
    };

    // Helper function to parse sections from the analysis text
    const parseAnalysisSections = (text) => {
      const sections = [];
      
      // Common section headers in medical reports
      const sectionKeywords = [
        'Summary', 'Overview', 'Assessment', 'Diagnosis', 'Recommendations',
        'Findings', 'Interpretation', 'Results', 'Conclusion', 'Analysis',
        'Abnormalities', 'Normal Values', 'Follow-up', 'Concerns'
      ];
      
      // Try to split by section headers
      const lines = text.split('\n');
      let currentSection = { title: null, content: '' };
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check if this line is a section header
        const isSectionHeader = sectionKeywords.some(keyword =>
          line.startsWith(`${keyword}:`) ||
          line.startsWith(`${keyword}\n`) ||
          line === keyword ||
          line.toUpperCase() === keyword.toUpperCase() ||
          (line.endsWith(':') && sectionKeywords.includes(line.slice(0, -1)))
        );
        
        if (isSectionHeader) {
          // Save the previous section if it has content
          if (currentSection.content.trim().length > 0) {
            sections.push({ ...currentSection });
          }
          
          // Start a new section
          currentSection = {
            title: line.endsWith(':') ? line.slice(0, -1) : line,
            content: ''
          };
        } else if (currentSection.title !== null) {
          // Add to current section content
          currentSection.content += (currentSection.content ? '\n' : '') + line;
        } else {
          // No section title yet, this is introductory text
          currentSection.content += (currentSection.content ? '\n' : '') + line;
        }
      }
      
      // Add the last section
      if (currentSection.content.trim().length > 0) {
        sections.push(currentSection);
      }
      
      return sections;
    };

    // Get appropriate icon for section titles
    const getSectionIcon = (title) => {
      const titleLower = title.toLowerCase();
      
      if (titleLower.includes('summary') || titleLower.includes('overview')) {
        return 'document-text';
      } else if (titleLower.includes('findings') || titleLower.includes('results')) {
        return 'clipboard';
      } else if (titleLower.includes('recommendations') || titleLower.includes('follow-up')) {
        return 'checkmark-circle';
      } else if (titleLower.includes('concerns') || titleLower.includes('abnormalities')) {
        return 'alert-circle';
      } else if (titleLower.includes('normal')) {
        return 'checkmark-done-circle';
      } else if (titleLower.includes('assessment') || titleLower.includes('diagnosis')) {
        return 'medkit';
      } else if (titleLower.includes('conclusion')) {
        return 'flag';
      } else {
        return 'information-circle';
      }
    };

    return (
      <View style={styles.aiAnalysisContainer}>
        <View style={styles.aiAnalysisHeader}>
          <View style={styles.aiHeaderLeft}>
            <Ionicons name="medical" size={20} color="#0D9488" style={styles.aiHeaderIcon} />
            <Text style={styles.aiAnalysisTitle}>AI Health Insights</Text>
          </View>
          <Text style={styles.aiAnalysisDate}>Generated {getCurrentDate()}</Text>
        </View>
        
        {renderStructuredAnalysis()}
        
        <View style={styles.aiAnalysisFooter}>
          <Text style={styles.aiDisclaimer}>
            This analysis is generated by AI and should not replace professional medical advice.
          </Text>
          <TouchableOpacity
            style={styles.regenerateButton}
            onPress={fetchAIAnalysis}
          >
            <Ionicons name="refresh" size={16} color="#0D9488" />
            <Text style={styles.regenerateButtonText}>Regenerate Analysis</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCommentsTab = () => {
    return (
      <View style={styles.commentsContainer}>
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.commentButton,
              !comment.trim() && styles.commentButtonDisabled,
            ]}
            onPress={handleAddComment}
            disabled={!comment.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {comments.length === 0 ? (
          <View style={styles.emptyCommentsContainer}>
            <Ionicons name="chatbubble-outline" size={50} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No comments yet.</Text>
          </View>
        ) : (
          <View style={styles.commentsScrollView}>
            {comments.map((commentItem, index) => (
              <View key={index} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>
                    {commentItem.commenterId || 'User'}
                  </Text>
                  <Text style={styles.commentDate}>
                    {commentItem.createdAt ? formatDate(commentItem.createdAt) : 'Unknown date'}
                  </Text>
                </View>
                <Text style={styles.commentText}>{commentItem.text}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Loading report details...</Text>
      </SafeAreaView>
    );
  }

  if (!reportDetails) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
        <Text style={styles.errorText}>No report details found.</Text>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={fetchReportDetails}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{reportDetails.name || reportDetails.fileName || 'Report Details'}</Text>
      </View>
      
      <View style={styles.reportInfoContainer}>
        <Text style={styles.reportFileName}>{reportDetails.fileName || 'Unnamed Report'}</Text>
        <Text style={styles.reportDate}>{formatDate(reportDetails.date)}</Text>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'parameters' && styles.activeTabButton]}
          onPress={() => setActiveTab('parameters')}
        >
          <Ionicons
            name={activeTab === 'parameters' ? 'list' : 'list-outline'}
            size={20}
            color={activeTab === 'parameters' ? '#0D9488' : '#6B7280'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'parameters' && styles.activeTabButtonText,
            ]}
          >
            Parameters
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'aiAnalysis' && styles.activeTabButton]}
          onPress={() => setActiveTab('aiAnalysis')}
        >
          <Ionicons
            name={activeTab === 'aiAnalysis' ? 'analytics' : 'analytics-outline'}
            size={20}
            color={activeTab === 'aiAnalysis' ? '#0D9488' : '#6B7280'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'aiAnalysis' && styles.activeTabButtonText,
            ]}
          >
            AI Analysis
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'comments' && styles.activeTabButton]}
          onPress={() => setActiveTab('comments')}
        >
          <Ionicons
            name={activeTab === 'comments' ? 'chatbubbles' : 'chatbubbles-outline'}
            size={20}
            color={activeTab === 'comments' ? '#0D9488' : '#6B7280'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'comments' && styles.activeTabButtonText,
            ]}
          >
            Comments
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.contentContainer}>
        {activeTab === 'parameters' && renderParametersTab()}
        {activeTab === 'aiAnalysis' && renderAIAnalysisTab()}
        {activeTab === 'comments' && renderCommentsTab()}
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  reportInfoContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  reportFileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#0D9488',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  activeTabButtonText: {
    fontWeight: '500',
    color: '#0D9488',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  parametersContainer: {
    padding: 16,
  },
  parameterBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
  },
  nestedContainer: {
    marginVertical: 4,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E7EB',
  },
  parameterKey: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  parameterValue: {
    fontSize: 14,
    color: '#4B5563',
    paddingLeft: 12,
  },
  commentsContainer: {
    padding: 16,
  },
  commentInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  commentButton: {
    backgroundColor: '#0D9488',
    borderRadius: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#0D9488',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  commentButtonDisabled: {
    backgroundColor: '#D1FAE5',
  },
  emptyCommentsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  commentsScrollView: {
    marginTop: 8,
  },
  commentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  commentDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  commentText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  buttonContainer: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#0D9488',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // AI Analysis styles
  aiAnalysisContainer: {
    padding: 16,
  },
  aiAnalysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiHeaderIcon: {
    marginRight: 8,
  },
  aiAnalysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  aiAnalysisDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  structuredAnalysisContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  analysisSection: {
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },
  analysisParagraph: {
    marginBottom: 12,
  },
  paragraphText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },
  aiAnalysisTextContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  aiAnalysisText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },
  aiAnalysisFooter: {
    marginTop: 8,
  },
  aiDisclaimer: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
    
        
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#0D9488',
    borderRadius: 8,
    backgroundColor: '#E6F7F5',
    },
    regenerateButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0D9488',
    marginLeft: 8,
    },
    
    generateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#0D9488',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 10,
      marginTop: 16,
      shadowColor: '#0D9488',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 4,
    },
    generateButtonIcon: {
      marginRight: 8,
    },
    generateButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 16,
    },
});



export default FileDetailsScreen;
