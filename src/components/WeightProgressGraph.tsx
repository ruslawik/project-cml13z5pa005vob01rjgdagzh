import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

const WeightProgressGraph: React.FC = () => {
  // Sample weight loss data
  const weightData = [
    { week: 'Week 1', weight: 180 },
    { week: 'Week 2', weight: 178 },
    { week: 'Week 3', weight: 176 },
    { week: 'Week 4', weight: 174 },
    { week: 'Week 5', weight: 172 },
    { week: 'Week 6', weight: 170 },
  ];

  const startWeight = weightData[0].weight;
  const currentWeight = weightData[weightData.length - 1].weight;
  const totalLoss = startWeight - currentWeight;
  const maxWeight = Math.max(...weightData.map(d => d.weight));
  const minWeight = Math.min(...weightData.map(d => d.weight));
  const weightRange = maxWeight - minWeight;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trending-down" size={32} color={theme.colors.text} />
        <Text style={styles.title}>Weight Loss Progress</Text>
        <Text style={styles.subtitle}>-{totalLoss} lbs in 6 weeks</Text>
      </View>

      <View style={styles.graphContainer}>
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>{maxWeight}</Text>
          <Text style={styles.axisLabel}>{Math.round((maxWeight + minWeight) / 2)}</Text>
          <Text style={styles.axisLabel}>{minWeight}</Text>
        </View>

        <View style={styles.chartArea}>
          <View style={styles.gridLines}>
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
          </View>

          <View style={styles.dataPoints}>
            {weightData.map((point, index) => {
              const heightPercentage = ((maxWeight - point.weight) / weightRange) * 100;
              const leftPercentage = (index / (weightData.length - 1)) * 100;
              
              return (
                <View key={index}>
                  <View
                    style={[
                      styles.dataPoint,
                      {
                        left: `${leftPercentage}%`,
                        top: `${heightPercentage}%`,
                      },
                    ]}
                  />
                  {index > 0 && (
                    <View
                      style={[
                        styles.connectionLine,
                        {
                          left: `${((index - 1) / (weightData.length - 1)) * 100}%`,
                          width: `${(100 / (weightData.length - 1))}%`,
                          top: `${((maxWeight - weightData[index - 1].weight) / weightRange) * 100}%`,
                          transform: [
                            {
                              rotate: `${Math.atan2(
                                ((weightData[index - 1].weight - point.weight) / weightRange) * 120,
                                120 / (weightData.length - 1)
                              ) * (180 / Math.PI)}deg`,
                            },
                          ],
                        },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.xAxis}>
            {weightData.map((point, index) => (
              <Text key={index} style={styles.xAxisLabel}>
                W{index + 1}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{startWeight} lbs</Text>
          <Text style={styles.statLabel}>Starting</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{currentWeight} lbs</Text>
          <Text style={styles.statLabel}>Current</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>-{totalLoss} lbs</Text>
          <Text style={styles.statLabel}>Lost</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 24,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  graphContainer: {
    flexDirection: 'row',
    height: 120,
    marginBottom: 24,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  axisLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
    marginLeft: 8,
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  gridLine: {
    height: 1,
    backgroundColor: theme.colors.border,
    opacity: 0.5,
  },
  dataPoints: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.text,
    marginLeft: -4,
    marginTop: -4,
  },
  connectionLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: theme.colors.text,
    transformOrigin: '0% 50%',
  },
  xAxis: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xAxisLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default WeightProgressGraph;