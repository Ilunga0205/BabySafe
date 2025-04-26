import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';

// Constants
import colors from '../../constants/colors';

const { width } = Dimensions.get('window');

const GrowthChart = ({ babyData, chartType = 'weight' }) => {
  const [loading, setLoading] = useState(true);
  const [activeChartType, setActiveChartType] = useState(chartType);
  const [chartData, setChartData] = useState(null);
  const [referenceData, setReferenceData] = useState(null);

  // Process the data when the component mounts or when chartType changes
  useEffect(() => {
    setLoading(true);
    
    // Generate chart data based on activeChartType
    generateChartData(activeChartType);
    
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [activeChartType, babyData]);

  // Generate chart data based on the selected type
  const generateChartData = (type) => {
    // In a real app, this would process actual baby data
    // For now, we'll generate sample data
    
    if (!babyData || !babyData.growthEntries || babyData.growthEntries.length === 0) {
      // Sample data if no real data is available
      const today = new Date();
      const labels = [];
      const dataPoints = [];
      const refLow = [];
      const refHigh = [];
      
      // Generate sample data for the last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleDateString('default', { month: 'short' }));
        
        // Different sample values based on chart type
        if (type === 'weight') {
          // Weight in kg
          const baseWeight = 3.5 + (0.5 * (5 - i)); // Starting from 3.5kg and growing
          dataPoints.push(baseWeight + (Math.random() * 0.3 - 0.15)); // Some random variation
          refLow.push(baseWeight - 0.5); // Lower reference bound
          refHigh.push(baseWeight + 0.5); // Upper reference bound
        } else if (type === 'height') {
          // Height in cm
          const baseHeight = 50 + (2 * (5 - i)); // Starting from 50cm and growing
          dataPoints.push(baseHeight + (Math.random() * 1 - 0.5)); // Some random variation
          refLow.push(baseHeight - 3); // Lower reference bound
          refHigh.push(baseHeight + 3); // Upper reference bound
        } else if (type === 'head') {
          // Head circumference in cm
          const baseCirc = 35 + (0.5 * (5 - i)); // Starting from 35cm and growing
          dataPoints.push(baseCirc + (Math.random() * 0.3 - 0.15)); // Some random variation
          refLow.push(baseCirc - 1); // Lower reference bound
          refHigh.push(baseCirc + 1); // Upper reference bound
        }
      }
      
      setChartData({
        labels: labels,
        datasets: [
          {
            data: dataPoints,
            color: () => colors.primary,
            strokeWidth: 2
          }
        ]
      });
      
      setReferenceData({
        low: refLow,
        high: refHigh
      });
    } else {
      // Process actual baby data (to be implemented when real data is available)
      // ...
    }
  };

  // Get the y-axis label based on active chart type
  const getYaxisLabel = () => {
    switch (activeChartType) {
      case 'weight':
        return 'kg';
      case 'height':
        return 'cm';
      case 'head':
        return 'cm';
      default:
        return '';
    }
  };

  // Get the chart title based on active chart type
  const getChartTitle = () => {
    switch (activeChartType) {
      case 'weight':
        return 'Weight';
      case 'height':
        return 'Height/Length';
      case 'head':
        return 'Head Circumference';
      default:
        return '';
    }
  };

  // Get min and max values for y-axis
  const getYaxisMinMax = () => {
    if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
      return { min: 0, max: 10 };
    }
    
    const data = chartData.datasets[0].data;
    const allValues = [...data];
    
    if (referenceData) {
      allValues.push(...referenceData.low, ...referenceData.high);
    }
    
    const min = Math.floor(Math.min(...allValues) - 1);
    const max = Math.ceil(Math.max(...allValues) + 1);
    
    return { min, max };
  };

  // Render chart options for switching between different measurements
  const renderChartOptions = () => {
    return (
      <View style={styles.chartOptions}>
        <TouchableOpacity
          style={[styles.chartOption, activeChartType === 'weight' && styles.activeChartOption]}
          onPress={() => setActiveChartType('weight')}
        >
          <MaterialIcons 
            name="line-weight" 
            size={18} 
            color={activeChartType === 'weight' ? colors.primary : '#666'} 
          />
          <Text style={[
            styles.chartOptionText,
            activeChartType === 'weight' && styles.activeChartOptionText
          ]}>
            Weight
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.chartOption, activeChartType === 'height' && styles.activeChartOption]}
          onPress={() => setActiveChartType('height')}
        >
          <MaterialIcons 
            name="straighten" 
            size={18} 
            color={activeChartType === 'height' ? colors.primary : '#666'} 
          />
          <Text style={[
            styles.chartOptionText,
            activeChartType === 'height' && styles.activeChartOptionText
          ]}>
            Height
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.chartOption, activeChartType === 'head' && styles.activeChartOption]}
          onPress={() => setActiveChartType('head')}
        >
          <MaterialIcons 
            name="face" 
            size={18} 
            color={activeChartType === 'head' ? colors.primary : '#666'} 
          />
          <Text style={[
            styles.chartOptionText,
            activeChartType === 'head' && styles.activeChartOptionText
          ]}>
            Head
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render reference range legend
  const renderReferenceLegend = () => {
    return (
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Your Baby</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#E0E0E0' }]} />
          <Text style={styles.legendText}>Reference Range</Text>
        </View>
      </View>
    );
  };

  // Render chart information and explanation
  const renderChartInfo = () => {
    const explanations = {
      weight: "Weight tracking helps monitor your baby's growth and nutrition status. Regular measurements ensure healthy development.",
      height: "Height/length measurements track your baby's growth pattern. Consistent growth is more important than exact numbers.",
      head: "Head circumference helps monitor brain growth. Regular tracking is important, especially in the first year."
    };

    return (
      <View style={styles.chartInfoContainer}>
        <Text style={styles.chartInfoTitle}>About This Chart</Text>
        <Text style={styles.chartInfoText}>
          {explanations[activeChartType]}
        </Text>
        <Text style={styles.chartInfoNote}>
          The shaded area represents the normal range based on WHO growth standards.
        </Text>
      </View>
    );
  };

  // When still loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading chart data...</Text>
      </View>
    );
  }

  // If no chart data available
  if (!chartData) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#888" />
        <Text style={styles.errorText}>No growth data available</Text>
      </View>
    );
  }

  const { min, max } = getYaxisMinMax();

  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>{getChartTitle()} Chart</Text>

      {renderChartOptions()}

      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#FFFFFF',
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            decimalPlaces: activeChartType === 'weight' ? 1 : 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: colors.primary
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: '#E0E0E0'
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
          withInnerLines={true}
          withOuterLines={false}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          withDots={true}
          yAxisLabel=""
          yAxisSuffix={` ${getYaxisLabel()}`}
          fromZero={false}
          yAxisMin={min}
          yAxisMax={max}
        />
      </View>

      {renderReferenceLegend()}
      {renderChartInfo()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  chartOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    padding: 4,
  },
  chartOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeChartOption: {
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartOptionText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#666',
  },
  activeChartOptionText: {
    color: colors.primary,
    fontWeight: '500',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  chartInfoContainer: {
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  chartInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: colors.text,
  },
  chartInfoText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#555',
    marginBottom: 5,
  },
  chartInfoNote: {
    fontSize: 11,
    color: '#777',
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  }
});

export default GrowthChart;