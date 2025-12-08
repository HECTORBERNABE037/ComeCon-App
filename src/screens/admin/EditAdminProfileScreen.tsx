import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/StackNavigator';
import { COLORS, FONT_SIZES, AdminProfileFormData } from '../../../types';

type Props = StackScreenProps<RootStackParamList, 'EditAdminProfile'>;

export const EditAdminProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  
  // En un caso real, estos datos vendrían de route.params o un contexto global
  // Por ahora inicializamos con datos simulados
  const [formData, setFormData] = useState<AdminProfileFormData>({
    fullName: 'Samantha Rios Bosques',
    nickname: 'Samantha Rios',
    email: 'Sami@gmail.com',
    phone: '3512040011',
    gender: 'Femenino',
    country: 'Mexico',
    address: 'Av. Virrey de Almanza #500'
  });

  const handleChange = (field: keyof AdminProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdate = () => {
    // Aquí iría la lógica para guardar en backend
    console.log("Datos actualizados:", formData);
    Alert.alert("Éxito", "Información actualizada correctamente", [
      { text: "OK", onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header con Flecha Atrás */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <View>
            <Text style={styles.headerTitle}>Edita Perfil</Text>
            <View style={styles.headerUnderline} />
        </View>
        <View style={{ width: 28 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionTitle}>Editar Información</Text>

        {/* Nombre Completo */}
        <Text style={styles.label}>Nombre Completo</Text>
        <TextInput
          style={styles.input}
          value={formData.fullName}
          onChangeText={(text) => handleChange('fullName', text)}
        />

        {/* Nickname */}
        <Text style={styles.label}>Nickname</Text>
        <TextInput
          style={styles.input}
          value={formData.nickname}
          onChangeText={(text) => handleChange('nickname', text)}
        />

        {/* Email (Solo Lectura) */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.readOnlyInput]}
          value={formData.email}
          editable={false}
        />

        {/* Telefono (Solo Lectura) */}
        <Text style={styles.label}>Telefono</Text>
        <TextInput
          style={[styles.input, styles.readOnlyInput]}
          value={formData.phone}
          editable={false}
        />

        {/* Fila: Genero y País */}
        <View style={styles.rowContainer}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Genero</Text>
            <TextInput
              style={styles.input}
              value={formData.gender}
              onChangeText={(text) => handleChange('gender', text)}
            />
          </View>
          <View style={[styles.halfInputContainer, { marginLeft: 15 }]}>
            <Text style={styles.label}>País</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={formData.country}
              editable={false}
            />
          </View>
        </View>

        {/* Direccion */}
        <Text style={styles.label}>Direccion</Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={(text) => handleChange('address', text)}
        />

        {/* Botón Actualizar */}
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Text style={styles.updateButtonText}>ACTUALIZAR</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2', // Fondo gris claro general
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  headerUnderline: {
    height: 3,
    backgroundColor: COLORS.primary,
    width: '100%',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
  },
  readOnlyInput: {
    backgroundColor: '#EAEAEA', // Gris para indicar deshabilitado
    color: COLORS.textSecondary,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    flex: 1,
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  updateButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
  }
});