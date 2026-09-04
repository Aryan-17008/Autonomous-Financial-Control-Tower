import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity
} from 'react-native';
import { api } from '../api';

const SEVERITY_COLORS = {
  CRITICAL: '#dc2626',
  HIGH: '#f59e0b',
  MEDIUM: '#3b82f6',
  LOW: '#10b981'
};

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const loadAlerts = useCallback(async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data.alerts);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const filtered = filter === 'ALL' ? alerts : alerts.filter(a => a.severity === filter);

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadAlerts} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No alerts found</Text>}
        renderItem={({ item }) => (
          <View style={[styles.alert, { borderLeftColor: SEVERITY_COLORS[item.severity] }]}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertType}>{item.type}</Text>
              <View style={[styles.badge, { backgroundColor: SEVERITY_COLORS[item.severity] }]}>
                <Text style={styles.badgeText}>{item.severity}</Text>
              </View>
            </View>
            <Text style={styles.alertMessage}>{item.message}</Text>
            <Text style={styles.alertTime}>TX: {item.transaction_id || 'N/A'}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  filters: { flexDirection: 'row', padding: 12, gap: 8, flexWrap: 'wrap' },
  filterBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#fff'
  },
  filterActive: { backgroundColor: '#2563eb' },
  filterText: { color: '#4b5563', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  list: { padding: 16 },
  alert: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    marginBottom: 10, borderLeftWidth: 4
  },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  alertType: { fontWeight: 'bold', fontSize: 14, color: '#111827' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  alertMessage: { color: '#374151', fontSize: 13, marginBottom: 4 },
  alertTime: { color: '#6b7280', fontSize: 11 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 }
});
