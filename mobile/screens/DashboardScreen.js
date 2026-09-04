import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { api } from '../api';

const KPI_CARD = ({ label, value, color = '#2563eb', sub }) => (
  <View style={[styles.kpiCard, { borderLeftColor: color }]}>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={[styles.kpiValue, { color }]}>{value}</Text>
    {sub && <Text style={styles.kpiSub}>{sub}</Text>}
  </View>
);

export default function DashboardScreen() {
  const [alerts, setAlerts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const [alertRes, txRes] = await Promise.all([
        api.get('/alerts'),
        api.get('/transactions')
      ]);
      setAlerts(alertRes.data.alerts);
      setTransactions(txRes.data.transactions);
      
      const balance = txRes.data.transactions.reduce((sum, t) => sum - t.amount, 100000);
      setTotalBalance(balance);
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
  const medium = alerts.filter(a => a.severity === 'MEDIUM').length;
  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
  const outgoing = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const incoming = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (loading) {
    return <ActivityIndicator size="large" color="#2563eb" style={styles.center} />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.overview}>Financial Overview</Text>
        <Text style={styles.updateTime}>Auto-refreshes every 10s</Text>
      </View>

      <View style={styles.kpiGrid}>
        <KPI_CARD label="Total Balance" value={`$${(totalBalance/1000).toFixed(1)}k`} color="#2563eb" sub={`${transactions.length} transactions`} />
        <KPI_CARD label="Total Volume" value={`$${(totalVolume/1000).toFixed(0)}k`} color="#16a34a" sub={`Out: $${(outgoing/1000).toFixed(0)}k`} />
        <KPI_CARD label="Critical" value={critical.toString()} color="#dc2626" sub="Immediate action" />
        <KPI_CARD label="High Risk" value={(high + medium).toString()} color="#f59e0b" sub="Needs review" />
      </View>

      <Text style={styles.sectionTitle}>🚨 Top Alerts</Text>
      {alerts && alerts.length > 0 ? alerts.slice(0, 3).map(alert => (
        <TouchableOpacity key={alert.id} style={[styles.alertItem, styles[`${alert.severity.toLowerCase()}Border`]]}>
          <View style={styles.alertRow}>
            <View style={[styles.severityDot, { backgroundColor: getColor(alert.severity) }]} />
            <Text style={styles.alertType}>{alert.type}</Text>
          </View>
          <Text style={styles.alertMessage}>{alert.message}</Text>
        </TouchableOpacity>
      )) : <Text style={styles.empty}>No active alerts</Text>}

      <Text style={styles.sectionTitle}>💰 Recent Transactions</Text>
      {transactions.slice(0, 5).map(tx => (
        <View key={tx.id} style={styles.txItem}>
          <View style={styles.txLeft}>
            <Text style={styles.txVendor}>{tx.vendor}</Text>
            <Text style={styles.txMeta}>{tx.category} · {tx.id}</Text>
          </View>
          <Text style={[styles.txAmount, tx.amount > 0 && styles.outgoing]}>
            {tx.amount > 0 ? '-' : '+'}${Math.abs(tx.amount).toLocaleString()}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

function getColor(severity) {
  switch(severity) {
    case 'CRITICAL': return '#dc2626';
    case 'HIGH': return '#f59e0b';
    case 'MEDIUM': return '#3b82f6';
    default: return '#10b981';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center' },
  header: { marginBottom: 20 },
  overview: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  updateTime: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  kpiCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 12,
    padding: 16, borderLeftWidth: 4, shadowColor: '#000',
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
  },
  kpiLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  kpiValue: { fontSize: 24, fontWeight: 'bold' },
  kpiSub: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#111827' },
  alertItem: {
    backgroundColor: '#fff', borderRadius: 8, padding: 12,
    marginBottom: 8, borderLeftWidth: 4
  },
  criticalBorder: { borderLeftColor: '#dc2626' },
  highBorder: { borderLeftColor: '#f59e0b' },
  mediumBorder: { borderLeftColor: '#3b82f6' },
  lowBorder: { borderLeftColor: '#10b981' },
  alertRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  severityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  alertType: { fontWeight: 'bold', color: '#111827' },
  alertMessage: { color: '#6b7280', fontSize: 13 },
  empty: { color: '#9ca3af', textAlign: 'center', marginVertical: 16 },
  txItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8
  },
  txLeft: { flex: 1 },
  txVendor: { fontWeight: '600', fontSize: 14 },
  txMeta: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  txAmount: { fontWeight: 'bold', color: '#16a34a' },
  outgoing: { color: '#dc2626' }
});
