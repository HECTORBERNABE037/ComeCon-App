import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StatusBar, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, Order } from '../../../types';
import { AdminBottomNavBar } from '../../components/AdminBottomNavBar';
import { OrderActionModal } from '../../components/OrderActionModal';

// DATOS SIMULADOS INICIALES
const initialOrders: Order[] = [
  // --- EN PROCESO ---
  { 
    id: '1', 
    title: 'Bowl con Frutas', 
    subtitle: 'Fresa, Kiwi, Avena', 
    price: '120.99', 
    image: require('../../../assets/bowlFrutas.png'), 
    status: 'process' ,
    date:"27/11/2025"
  },
  { 
    id: '2', 
    title: 'Tostada', 
    subtitle: 'Aguacate', 
    price: '150.80', 
    image: require('../../../assets/tostadaAguacate.png'), 
    status: 'process' ,
    date:"27/11/2025"
  },
  // --- HISTORIAL (Completadas / Canceladas) ---
  { 
    id: '3', 
    title: 'Cafe Panda', 
    subtitle: 'Latte', 
    price: '110.00', 
    image: require('../../../assets/cafePanda.png'), 
    status: 'completed',
    deliveryTime: 'Entregado a las 7:30pm',
    historyNotes: 'Fueron a comprar la leche',
    date:"27/11/2025"
  },
  { 
    id: '4', 
    title: 'Bowl con Frutas', 
    subtitle: 'Fresa, Kiwi, Avena', 
    price: '120.99', 
    image: require('../../../assets/bowlFrutas.png'), 
    status: 'cancelled',
    deliveryTime: 'Cerrado a las 8:00pm',
    historyNotes: 'Falta de ingredientes',
    date:"27/11/2025"
  },
];

export const OrderTrackingScreen = () => {
  // Estado para las pestañas: 'process' o 'history'
  const [activeTab, setActiveTab] = useState<'process' | 'history'>('process');
  
  // Estado para la lista de órdenes
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  
  // Estados para el Modal de Acciones
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // --- FILTRADO DE ÓRDENES ---
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'process') {
      return order.status === 'process' || order.status === 'pending';
    } else {
      return order.status === 'completed' || order.status === 'cancelled';
    }
  });

  // --- MANEJADORES DE ACCIONES ---

  const handleOpenActionModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleUpdateOrder = (orderId: string, data: any) => {
    // Simulación de actualización
    Alert.alert("Éxito", "La orden ha sido actualizada.");
    // Aquí actualizarías los datos en el estado local 'orders' si fuera necesario
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  const handleCompleteOrder = (orderId: string) => {
    Alert.alert("Completar", "¿Marcar orden como entregada?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sí", onPress: () => {
        // Mover a historial (status: completed)
        setOrders(prev => prev.map(o => 
          o.id === orderId 
            ? { ...o, status: 'completed', deliveryTime: 'Entregado ahora', historyNotes: 'Completado por Admin' } 
            : o
        ));
        setIsModalVisible(false);
        setSelectedOrder(null);
      }}
    ]);
  };

  const handleCancelOrder = (orderId: string) => {
    Alert.alert("Cancelar", "¿Estás seguro de cancelar esta orden?", [
      { text: "No", style: "cancel" },
      { text: "Sí", style: 'destructive', onPress: () => {
        // Mover a historial (status: cancelled)
        setOrders(prev => prev.map(o => 
          o.id === orderId 
            ? { ...o, status: 'cancelled', deliveryTime: 'Cancelado ahora', historyNotes: 'Cancelado por Admin' } 
            : o
        ));
        setIsModalVisible(false);
        setSelectedOrder(null);
      }}
    ]);
  };

  // --- RENDERIZADO DE ITEMS ---
  const renderOrderItem = ({ item }: { item: Order }) => {
    
    // CASO 1: EN PROCESO (Tarjeta simple con Megáfono)
    if (activeTab === 'process') {
      return (
        <View style={styles.card}>
          <Image source={item.image} style={styles.cardImage} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            <Text style={styles.cardPrice}>${item.price}</Text>
          </View>
          
          <TouchableOpacity style={styles.cardAction} onPress={() => handleOpenActionModal(item)}>
            <Ionicons name="megaphone-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      );
    } 
    
    // CASO 2: HISTORIAL (Tarjeta detallada sin Megáfono)
    else {
      const isCancelled = item.status === 'cancelled';
      return (
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Image source={item.image} style={styles.historyImage} />
            <View style={styles.historyInfo}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              <Text style={styles.cardPriceOrange}>${item.price}</Text>
            </View>
          </View>
          
          <View style={styles.historyDetails}>
            <Text style={styles.statusTitle}>
              {isCancelled ? 'Cancelado' : 'Terminado'}
            </Text>
            <Text style={styles.statusTime}>
              {item.deliveryTime || 'Sin hora registrada'}
            </Text>
            
            <View style={styles.separator} />
            
            <Text style={styles.historyNotes}>
              {item.historyNotes || 'Sin notas adicionales'}
            </Text>
          </View>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8"/>
      
      <Text style={styles.mainTitle}>Ordenes Recibidas</Text>

      {/* PESTAÑAS (TABS) */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'process' && styles.activeTabBorder]} 
          onPress={() => setActiveTab('process')}
        >
          <Text style={[styles.tabText, activeTab === 'process' && styles.activeTabText]}>En proceso</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'history' && styles.activeTabBorder]} 
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Historial</Text>
        </TouchableOpacity>
      </View>

      {/* BUSCADOR */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput 
          placeholder="Search" 
          placeholderTextColor="#999" 
          style={styles.searchInput} 
        />
      </View>

      {/* LISTA DE ÓRDENES */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {activeTab === 'process' ? 'No hay órdenes pendientes' : 'Historial vacío'}
          </Text>
        }
      />

      {/* BARRA DE NAVEGACIÓN INFERIOR */}
      <AdminBottomNavBar activeRoute="Orders" />

      {/* MODAL DE ACCIONES */}
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
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8', // Fondo gris claro
    paddingTop: 10,
  },
  mainTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: COLORS.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tabButton: {
    marginHorizontal: 20,
    paddingBottom: 5,
  },
  activeTabBorder: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary, // Línea naranja activa
  },
  tabText: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.text, // Negro cuando activo
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAEAEA',
    marginHorizontal: 20,
    borderRadius: 15,
    height: 50,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Espacio para la navbar inferior
  },
  emptyText: {
    textAlign: 'center', 
    marginTop: 50, 
    color: '#999',
    fontSize: FONT_SIZES.medium
  },
  
  // --- ESTILOS TARJETA EN PROCESO ---
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 35, // Circular
    marginRight: 15,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  cardPrice: {
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.primary, // Precio naranja
  },
  cardAction: {
    padding: 10,
  },

  // --- ESTILOS TARJETA HISTORIAL ---
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  historyImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  historyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardPriceOrange: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary, // Precio más grande
    marginTop: 5,
  },
  historyDetails: {
    paddingLeft: 10,
  },
  statusTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusTime: {
    fontSize: FONT_SIZES.small,
    fontWeight: 'bold',
    color: COLORS.text, 
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
    width: '100%',
  },
  historyNotes: {
    fontSize: FONT_SIZES.small,
    color: '#666',
    fontStyle: 'italic',
  }
});