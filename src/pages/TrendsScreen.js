import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const TrendsScreen = ({ route }) => {
  const { userId } = route.params;
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/reports/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch reports.');
        const data = await response.json();
        console.log("Fetched Reports:", data); // Debugging
        const reportsArray = Array.isArray(data.reports) ? data.reports : [];
        console.log("Processed Reports (Ensured Array):", reportsArray);
        setReports(reportsArray);
      } catch (error) {
        console.error('Error fetching reports:', error);
        Alert.alert('Error', 'Failed to fetch reports. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [userId]);

  useEffect(() => {
    if (reports.length > 0) {
      const extractedCategories = extractCategories(reports);
      setCategories(extractedCategories);
    }
  }, [reports]);

  const extractCategories = (reports) => {
    const categoryMap = {};

    reports.forEach((report) => {
      const parameters = report.extractedParameters || {}; // Use extractedParameters directly
      Object.keys(parameters).forEach((categoryOrParam) => {
        const categoryData = parameters[categoryOrParam];

        if (typeof categoryData === "object" && !Array.isArray(categoryData)) {
          // Case: Category exists (e.g., "Complete Blood Count", "Kidney Function Tests")
          if (!categoryMap[categoryOrParam]) {
            categoryMap[categoryOrParam] = {};
          }
          Object.keys(categoryData).forEach((subParam) => {
            if (!categoryMap[categoryOrParam][subParam]) {
              categoryMap[categoryOrParam][subParam] = [];
            }
            categoryMap[categoryOrParam][subParam].push(subParam);
          });
        } else {
          // Case: Parameter exists at the top level (e.g., "Haemoglobin" directly under extractedParameters)
          if (!categoryMap["General"]) {
            categoryMap["General"] = {};
          }
          if (!categoryMap["General"][categoryOrParam]) {
            categoryMap["General"][categoryOrParam] = [];
          }
          categoryMap["General"][categoryOrParam].push(categoryOrParam);
        }
      });
    });

    return categoryMap;
  };

  const extractTrendData = (category, parameter) => {
    console.log("Extracting trend data for:", category, parameter);
    console.log("Current Reports:", reports);

    if (!Array.isArray(reports) || reports.length === 0) {
      console.warn("extractTrendData called with invalid reports array.");
      return []; // Return empty data if reports are not loaded
    }

    return reports.map((report, index) => {
      let value = null;

      if (report.extractedParameters?.[category]?.[parameter]?.Value) {
        value = report.extractedParameters[category][parameter].Value;
      } else if (report.extractedParameters?.[parameter]?.Value) {
        value = report.extractedParameters[parameter].Value;
      }

      if (typeof value === "string") {
        value = parseFloat(value.replace(/[^\d.]/g, "")) || 0;
      }

      return { label: `Report ${index + 1}`, value: value || 0 };
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!Object.keys(categories).length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No categories available. Please upload reports to view trends.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Health Trends</Text>

      <View style={styles.buttonContainer}>
        {Object.keys(categories).map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedButton,
            ]}
            onPress={() => setSelectedCategory(category === selectedCategory ? null : category)}
          >
            <Text style={styles.buttonText}>{category}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedCategory && (
        <View>
          {Object.keys(categories[selectedCategory]).map((subcategory, index) => (
            <View key={index} style={styles.chartContainer}>
              <Text style={styles.subHeader}>{subcategory}</Text>
              {categories[selectedCategory][subcategory].map((parameter, idx) => {
                const trendData = extractTrendData(selectedCategory, parameter);
                if (trendData.some((d) => d.value > 0)) {
                  return (
                    <View key={idx} style={styles.parameterChart}>
                      <Text style={styles.chartTitle}>{parameter}</Text>
                      <LineChart
                        data={{
                          labels: trendData.map((d) => d.label),
                          datasets: [{ data: trendData.map((d) => d.value) }],
                        }}
                        width={Dimensions.get('window').width - 40}
                        height={220}
                        chartConfig={chartConfig}
                        bezier
                      />
                    </View>
                  );
                }
                return null;
              })}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
  strokeWidth: 2,
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#6200ee',
  },
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  categoryButton: {
    backgroundColor: '#6200ee',
    padding: 10,
    margin: 5,
    borderRadius: 8,
  },
  selectedButton: {
    backgroundColor: '#3700b3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  chartContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  parameterChart: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
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
    marginHorizontal: 20,
  },
});

export default TrendsScreen;

