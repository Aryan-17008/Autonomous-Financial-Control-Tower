import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert
} from 'react-native';
import { api } from '../api';

export default function RecommendationsScreen() {
  const [recs, setRecs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecs = useCallback(async () => {
    try {
      const res = await api.get('/recommendations');
      setRecs(res.data.recommendations);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRecs();
  }, [loadRecs]);

  const execute = async (id, action) => {
    Alert.alert(
      'Execute Action',
      `Confirm execution of: ${action}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Execute',
          onPress: async () => {
            try {
              await api.post(`/execute/${id}`);
              Alert.alert('Success', 'Action executed and logged to audit trail');
              loadRecs();
            } catch (err) {
              Alert.alert('Error', 'Failed to execute action');
            }
          }
        }
      ]
    );
  };

  const riskColor = (score) => {
    if (score > 0.7) return '#dc2626';
    if (score > 0.4) return '#f59e0b';
    return '#10b981';
  };

  return (
    <FlatList
      style={styles.container}
      data={recs}
      keyExtractor={item => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadRecs} />}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No pending recommendations</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={[styles.riskBadge, { backgroundColor: riskColor(item.risk_score) }]}>
              <Text style={styles.riskText}>R{Math.round(item.risk_score * 100)}</Text>
            </View>
            <Text style={[styles.type, item.type === 'BLOCK' && styles.blockText]}>{item.type}</Text>
          </View>
          <Text style={styles.action}>{item.action}</Text>
          <Text style={styles.reason}>{item.reason}</Text>
          <TouchableOpacity style={styles.executeBtn} onPress={() => execute(item.id, item.action)}>
            <Text style={styles.executeText}>Execute Action</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 12, elevation: 2
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  riskText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  type: { fontSize: 14, fontWeight: 'bold', color: '#3b82f6' },
  blockText: { color: '#dc2626' },
  action: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 6 },
  reason: { color: '#6b7280', marginBottom: 12 },
  executeBtn: {
    backgroundColor: '#2563eb', paddingVertical: 10,
    borderRadius: 8, alignItems: 'center'
  },
  executeText: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 }
});
