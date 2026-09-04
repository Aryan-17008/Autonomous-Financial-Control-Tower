import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { api } from '../api';

const KPI_CARD = ({ label, value, color = '#2563eb' }) => (
  <View style={[styles.kpiCard, { borderLeftColor: color }]}>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={[styles.kpiValue, { color }]}>{value}</Text>
  </View>
);

export default function DashboardScreen() {
  const [alerts, setAlerts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [alertRes, txRes] = await Promise.all([
        api.get('/alerts'),
        api.get('/transactions')
      ]);
      setAlerts(alertRes.data.alerts);
      setTransactions(txRes.data.transactions);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const critical = alerts.filter(a => a.severity === 'CRITICAL').length;
  const high = alerts.filter(a => a.severity === 'HIGH').length;
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return <ActivityIndicator size="large" color="#2563eb" style={styles.center} />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
      contentContainerStyle={styles.content}
    >
      <View style={styles.kpiGrid}>
        <KPI_CARD label="Total Transactions" value={transactions.length.toString()} color="#2563eb" />
        <KPI_CARD label="Total Volume" value={`$${(totalAmount/1000).toFixed(1)}k`} color="#16a34a" />
        <KPI_CARD label="Critical Alerts" value={critical.toString()} color="#dc2626" />
        <KPI_CARD label="High Alerts" value={high.toString()} color="#f59e0b" />
      </View>

      <Text style={styles.sectionTitle}>Recent Alerts</Text>
      {alerts.slice(0, 5).map(alert => (
        <TouchableOpacity key={alert.id} style={[styles.alertItem, styles[`${alert.severity.toLowerCase()}Border`]]}>
          <Text style={styles.alertType}>{alert.type}</Text>
          <Text style={styles.alertMessage}>{alert.message}</Text>
        </TouchableOpacity>
      ))}
      {alerts.length === 0 && <Text style={styles.empty}>No active alerts</Text>}

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {transactions.slice(0, 5).map(tx => (
        <View key={tx.id} style={styles.txItem}>
          <View style={styles.txLeft}>
            <Text style={styles.txVendor}>{tx.vendor}</Text>
            <Text style={styles.txMeta}>{tx.category} · {tx.id}</Text>
          </View>
          <Text style={[styles.txAmount, tx.amount < 0 && styles.negative]}>
            {tx.amount > 0 ? '+' : ''}${tx.amount.toLocaleString()}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  kpiCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 12,
    padding: 16, borderLeftWidth: 4, shadowColor: '#000',
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
  },
  kpiLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  kpiValue: { fontSize: 24, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#111827' },
  alertItem: {
    backgroundColor: '#fff', borderRadius: 8, padding: 12,
    marginBottom: 8, borderLeftWidth: 4
  },
  criticalBorder: { borderLeftColor: '#dc2626' },
  highBorder: { borderLeftColor: '#f59e0b' },
  mediumBorder: { borderLeftColor: '#3b82f6' },
  lowBorder: { borderLeftColor: '#10b981' },
  alertType: { fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  alertMessage: { color: '#6b7280', fontSize: 13 },
  empty: { color: '#9ca3af', textAlign: 'center', marginVertical: 16 },
  txItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8
  },
  txVendor: { fontWeight: '600', fontSize: 14 },
  txMeta: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  txAmount: { fontWeight: 'bold', color: '#16a34a' },
  negative: { color: '#dc2626' }
});
