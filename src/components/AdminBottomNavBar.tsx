import React from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { COLORS } from '../../types';

// Definimos qué pestañas pueden estar activas
type AdminTab = 'Home' | 'Orders' | 'Settings' | 'Profile' | null;

interface Props {
  activeRoute: AdminTab; // La pantalla actual
}

export const AdminBottomNavBar: React.FC<Props> = ({ activeRoute }) => {
  const navigation = useNavigation<any>();

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", onPress: () => 
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Login" }],
            })
          ) 
      }
    ]);
  };

  const handleNavigation = (route: string) => {
    navigation.navigate(route);
  };

  const handleComingSoon = () => {
    Alert.alert("En desarrollo", "Módulo de configuración próximamente.");
  };

  return (
    <View style={styles.container}>
      
      {/* 1. Botón Salir */}
      <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={28} color="#C4C4C4" />
      </TouchableOpacity>

      {/* 2. Botón Seguimiento (Orders) */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'Orders' && styles.activeItem]} 
        onPress={() => handleNavigation('OrderTracking')}
      >
        <Ionicons 
          name="receipt-outline" 
          size={26} 
          color={activeRoute === 'Orders' ? COLORS.primary : "#C4C4C4"} 
        />
        {/* Badge de notificación simulado como en la imagen */}
        {activeRoute !== 'Orders' && (
             <View style={styles.badge} />
        )}
      </TouchableOpacity>

      {/* 3. Botón Home (Central) */}
      <View style={styles.centerButtonContainer}>
        <TouchableOpacity style={styles.centerButton} onPress={() => handleNavigation('HomeAdmin')}>
          <Ionicons name="home" size={30} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* 4. Botón Configuración */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'Settings' && styles.activeItem]} 
        onPress={handleComingSoon}
      >
        <Ionicons name="settings-outline" size={28} color="#C4C4C4" />
      </TouchableOpacity>

      {/* 5. Botón Perfil */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'Profile' && styles.activeItem]} 
        onPress={() => handleNavigation('AdminProfile')}
      >
        <Ionicons 
            name="person-circle-outline" 
            size={30} 
            color={activeRoute === 'Profile' ? COLORS.primary : "#C4C4C4"} 
        />
      </TouchableOpacity>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 20,
    paddingBottom: Platform.OS === 'ios' ? 15 : 0,
  },
  navItem: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  activeItem: {
    backgroundColor: '#F0F0F0', // El rectángulo grisáceo para indicar activo
  },
  centerButtonContainer: {
    marginTop: -40, // Para que sobresalga hacia arriba
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: COLORS.primary, // Naranja
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#f2f2f2' // Borde sutil para separar del fondo
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  }
});