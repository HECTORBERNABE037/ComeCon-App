import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Image, 
  TouchableOpacity, 
  StatusBar,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { AdminBottomNavBar } from '../../components/AdminBottomNavBar';
import { COLORS, FONT_SIZES, AdminProfile } from '../../../types';
import { RootStackParamList } from '../../navigation/StackNavigator';

// Definimos el tipo de navegación específico
type AdminProfileNavigationProp = StackNavigationProp<RootStackParamList, 'AdminProfile'>;

// Datos Simulados del Perfil
const adminData: AdminProfile = {
  fullName: 'Samantha Rios',
  nickname: 'Sam',
  email: 'Sami@gmail.com',
  phone: '+52 351 204 0011',
  gender: 'Femenino',
  country: 'Mexico',
  address: '',
  image: require('../../../assets/logoApp.png'), // Usando logo como placeholder
};

export const AdminProfileScreen = () => {
  const navigation = useNavigation<AdminProfileNavigationProp>();

  const handleEditProfile = () => {
    navigation.navigate('EditAdminProfile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header Estilo Tarjeta Superior */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Informacion Personal</Text>
        <View style={styles.headerUnderline} />
      </View>

      <View style={styles.content}>
        
        {/* Imagen de Perfil con Botón Editar (Visual) */}
        <View style={styles.profileImageContainer}>
          <Image source={adminData.image} style={styles.profileImage} />
          <View style={styles.editIconContainer}>
             <Feather name="edit-2" size={16} color={COLORS.text} />
          </View>
        </View>

        {/* Campos de Información */}
        
        <View style={styles.infoGroup}>
          <Text style={styles.label}>Nombre</Text>
          <Text style={styles.value}>{adminData.fullName}</Text>
          <View style={styles.separator} />
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Telefono</Text>
          <Text style={styles.value}>{adminData.phone}</Text>
          <View style={styles.separator} />
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{adminData.email}</Text>
          <View style={styles.separator} />
        </View>

        {/* Botón para ir a Editar */}
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>EDITAR PERFIL</Text>
        </TouchableOpacity>

      </View>

      {/* Barra de Navegación (Activo: Profile) */}
      <AdminBottomNavBar activeRoute="Profile" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2', // Fondo gris claro
  },
  headerCard: {
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 40 : 10,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerUnderline: {
    height: 3,
    width: 250,
    backgroundColor: COLORS.primary,
    marginTop: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 30,
    marginTop: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DDD',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  infoGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  value: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    marginBottom: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#CCC',
    width: '100%',
  },
  editButton: {
    backgroundColor: COLORS.primary,
    width: '100%',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    elevation: 3,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  }
});