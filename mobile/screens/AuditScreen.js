import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl
} from 'react-native';
import { api } from '../api';

export default function AuditScreen() {
  const [logs, setLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = useCallback(async () => {
    try {
      const res = await api.get('/audit');
      setLogs(res.data.audit_trail);
    } catch (err) {
      console.error('Failed to load audit trail:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const formatTime = (ts) => {
    const date = new Date(ts);
    return date.toLocaleString();
  };

  return (
    <FlatList
      style={styles.container}
      data={logs}
      keyExtractor={(item, index) => index.toString()}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadLogs} />}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No audit activity yet</Text>}
      ListHeaderComponent={
        logs.length > 0 && <Text style={styles.count}>{logs.length} recorded actions</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.logItem}>
          <View style={styles.dot} />
          <View style={styles.logContent}>
            <Text style={styles.action}>{item.action}</Text>
            <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
            <Text style={styles.user}>By: {item.user}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  list: { padding: 16 },
  count: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  logItem: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 8, padding: 12, marginBottom: 8
  },
  dot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#2563eb', marginTop: 6, marginRight: 12
  },
  logContent: { flex: 1 },
  action: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
  time: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  user: { fontSize: 12, color: '#9ca3af' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 }
});
