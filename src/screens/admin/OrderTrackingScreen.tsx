import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, StatusBar, Alert, ActivityIndicator, RefreshControl, ScrollView
} from 'react-native';
import { useFocusEffect, useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONT_SIZES, AdminTabParamList, RootStackParamList } from '../../../types';
import { OrderActionModal } from '../../components/OrderActionModal';
import { DataRepository } from '../../services/DataRepository'; 
import { useAuth } from '../../context/AuthContext'; 

type OrderTrackingNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AdminTabParamList, 'OrderTrackingTab'>,
  StackNavigationProp<RootStackParamList>
>;

const OrderTrackingScreen = () => {
  const navigation = useNavigation<OrderTrackingNavigationProp>();
  const { user } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadOrders = async () => {
    if (!refreshing) setLoading(true);
    try {
      const result = await DataRepository.getOrders();
      if (result.success) {
        setOrders((result as any).data);
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(
    useCallback(() => { loadOrders(); }, [])
  );

  const onRefresh = () => { setRefreshing(true); loadOrders(); };

  // HANDLERS 
  const handleUpdateOrder = async (orderId: string, data: any) => {
    const res = await DataRepository.updateOrder(Number(orderId), {
      status: data.status,
      deliveryTime: data.estimatedTime,
      notes: data.comment
    });
    if (res.success) {
      setIsModalVisible(false); setSelectedOrder(null); loadOrders();
      Alert.alert("Éxito", "Orden actualizada.");
    } else { Alert.alert("Error", res.error); }
  };

  const handleCompleteOrder = async (orderId: string) => {
    Alert.alert("Confirmar", "¿Marcar como entregada?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sí", onPress: async () => {
          const res = await DataRepository.updateOrder(Number(orderId), { status: 'completado' });
          if (res.success) { setIsModalVisible(false); loadOrders(); }
      }}
    ]);
  };

  const handleCancelOrder = async (orderId: string) => {
    Alert.alert("Confirmar", "¿Cancelar orden?", [
      { text: "No", style: "cancel" },
      { text: "Sí", style: 'destructive', onPress: async () => {
          const res = await DataRepository.updateOrder(Number(orderId), { status: 'cancelado' });
          if (res.success) { setIsModalVisible(false); loadOrders(); }
      }}
    ]);
  };

  const openActionModal = (order: any) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  // FILTROS 
  const activeOrders = orders.filter(o => o.status === 'Pendiente' || o.status === 'En proceso');
  const historyOrders = orders.filter(o => o.status?.toLowerCase() === 'completado' || o.status?.toLowerCase() === 'cancelado');

  // RENDER 
  const renderProductList = (items: any[]) => {
    if (!items || items.length === 0) return null;
    return (
      <View style={styles.productList}>
        {items.map((prod: any, index: number) => (
          <Text key={index} style={styles.productText}>
            • {prod.quantity}x {prod.product_details || 'Producto'} 
          </Text>
        ))}
      </View>
    );
  };

  const renderActiveItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <View style={{flexDirection:'row', justifyContent:'space-between'}}>
             <Text style={styles.cardTitle}>Orden #{item.id}</Text>
             <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.cardSubtitle}>Cliente: {item.user}</Text>
          
          {/*  LISTA DE PRODUCTOS */}
          {renderProductList(item.items)}

          <Text style={styles.cardPrice}>Total: ${item.total}</Text>
        </View>
      </View>

      <View style={styles.statusRow}>
         <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
           <Text style={styles.badgeText}>{item.status}</Text>
         </View>
         <TouchableOpacity style={styles.actionButton} onPress={() => openActionModal(item)}>
           <Text style={styles.actionButtonText}>GESTIONAR</Text>
         </TouchableOpacity>
      </View>
      {item.delivery_time && <Text style={styles.deliveryText}>Entrega: {item.delivery_time}</Text>}
    </View>
  );

  const renderHistoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.historyCard} activeOpacity={0.8} onPress={() => openActionModal(item)}>
      <View style={styles.historyHeader}>
        <View style={[styles.dot, { backgroundColor: getStatusColor(item.status) }]} />
        <View style={styles.historyInfo}>
          <Text style={styles.historyTitle}>Orden #{item.id} - {item.user}</Text>
          <Text style={styles.historyDate}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <Text style={styles.historyPrice}>${item.total}</Text>
      </View>
      
      {/*  LISTA DE PRODUCTOS */}
      {renderProductList(item.items)}

      <Text style={styles.historyStatus}>{item.status}</Text>
      {item.history_notes ? <Text style={styles.historyNotes} numberOfLines={1}>"{item.history_notes}"</Text> : null}
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendiente': return '#FF9800'; 
      case 'en proceso': return '#2196F3';
      case 'completado': return '#4CAF50';
      case 'cancelado': return '#F44336';
      default: return '#999';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <Text style={styles.mainTitle}>Administración de Pedidos</Text>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView 
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}> Activas ({activeOrders.length})</Text>
          </View>
          <FlatList
            data={activeOrders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderActiveItem}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>No hay órdenes pendientes.</Text>}
          />

          <View style={[styles.sectionHeader, { marginTop: 25 }]}>
            <Ionicons name="file-tray-full" size={20} color="#666" />
            <Text style={[styles.sectionTitle, {color: '#666'}]}> Historial ({historyOrders.length})</Text>
          </View>
          <FlatList
            data={historyOrders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderHistoryItem}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>Historial vacío.</Text>}
          />
        </ScrollView>
      )}

      <OrderActionModal
        visible={isModalVisible}
        order={selectedOrder}
        onClose={() => setIsModalVisible(false)}
        onUpdate={handleUpdateOrder}
        onComplete={handleCompleteOrder}
        onCancel={handleCancelOrder}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8', paddingTop: 10 },
  mainTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginVertical: 15, color: COLORS.text },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  listContent: { paddingHorizontal: 20 },
  emptyText: { textAlign: 'center', color: '#999', marginVertical: 10, fontStyle: 'italic', fontSize: 12 },
  card: { backgroundColor: COLORS.white, borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', marginBottom: 10 },
  cardInfo: { flex: 1 },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: COLORS.text },
  cardSubtitle: { fontSize: 12, color: '#666', marginBottom: 5 },
  dateText: { fontSize: 12, color: '#999' },
  cardPrice: { fontWeight: 'bold', color: COLORS.text, marginTop: 5, fontSize: 16, textAlign: 'right' },
  productList: { marginVertical: 8, paddingLeft: 5, borderLeftWidth: 2, borderLeftColor: '#EEE' },
  productText: { fontSize: 13, color: '#444', marginBottom: 2 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 10 },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeText: { color: 'white', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  actionButton: { backgroundColor: '#E0E0E0', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
  actionButtonText: { color: '#333', fontWeight: 'bold', fontSize: 11 },
  deliveryText: { fontSize: 11, color: COLORS.primary, marginTop: 5, fontStyle: 'italic', textAlign: 'center' },
  historyCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#DDD', elevation: 1 },
  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  historyInfo: { flex: 1 },
  historyTitle: { fontWeight: 'bold', color: '#555', fontSize: 14 },
  historyDate: { fontSize: 10, color: '#999' },
  historyPrice: { fontWeight: 'bold', color: '#333' },
  historyStatus: { fontSize: 11, color: '#888', marginTop: 5, textTransform: 'uppercase' },
  historyNotes: { fontSize: 11, color: '#AAA', marginTop: 2, fontStyle: 'italic' },
});

export default OrderTrackingScreen;