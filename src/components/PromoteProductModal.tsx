import React, { useEffect, useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Platform,
  KeyboardAvoidingView,
  Switch,
  ScrollView
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Platillo, PromotionFormData, COLORS, FONT_SIZES } from '../../types';
import { useForm } from '../hooks/useForm';
import { validatePromotionForm } from '../utils/validationRules';
import DatabaseService from '../services/DatabaseService'; 

interface Props {
  visible: boolean;
  product: Platillo | null;
  onClose: () => void;
  onSave: (productId: string, promoData: any) => void;
  onDelete: (productId: string) => void;
}

export const PromoteProductModal: React.FC<Props> = ({ 
  visible, 
  product, 
  onClose, 
  onSave, 
  onDelete 
}) => {
  
  // Estado para la visibilidad (Switch)
  const [isActive, setIsActive] = useState(true);

  // Hook de formulario con validación
  const { formData, errors, updateFormData, validate, setFormData } = useForm<PromotionFormData>(
    { promotionalPrice: '', startDate: '', endDate: '' },
    (data) => validatePromotionForm(data, product ? parseFloat(product.price) : 0)
  );

  // EFECTO: Cargar datos cuando se abre el modal
  useEffect(() => {
    const loadData = async () => {
      if (product && visible) {
        // 1. Calcular fechas por defecto (Hoy y +15 días)
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
        
        const future = new Date();
        future.setDate(now.getDate() + 15);
        const defaultEndDate = future.toISOString().split('T')[0];

        try {
          // 2. Buscar si ya existe una promoción en BD para este producto
          const existingPromo = await DatabaseService.getPromotionByProductId(Number(product.id));

          if (existingPromo) {
            // CASO A: Ya existe -> Cargar datos guardados
            console.log("Cargando promoción existente:", existingPromo);
            setFormData({
              promotionalPrice: existingPromo.promotionalPrice.toString(),
              startDate: existingPromo.startDate,
              endDate: existingPromo.endDate
            });
            // SQLite guarda 1/0, convertimos a boolean
            setIsActive(existingPromo.visible === 1);
          } else {
            // CASO B: Nueva promoción -> Valores por defecto
            console.log("Nueva promoción, estableciendo defaults");
            setFormData({
              promotionalPrice: '',
              startDate: currentDate, // FECHA DE HOY AUTOMÁTICA
              endDate: defaultEndDate
            });
            // Switch activado por defecto para nuevas promos
            setIsActive(true);
          }
        } catch (error) {
          console.error("Error cargando promoción:", error);
          Alert.alert("Error", "No se pudieron cargar los datos de la promoción.");
        }
      }
    };

    loadData();
  }, [product, visible]);

  const handleSave = () => {
    if (validate() && product) {
      const promoData = { 
        ...formData, 
        visible: isActive, 
        id: product.id 
      };
      onSave(product.id.toString(), promoData);
    } else {
      Alert.alert("Atención", "Revisa los errores en el formulario.");
    }
  };

  const handleDelete = () => {
    if (!product) return;
    Alert.alert(
      "Eliminar Promoción",
      "¿Deseas quitar la promoción de este producto?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => onDelete(product.id.toString()) }
      ]
    );
  };

  const handleEditImage = () => {
    Alert.alert("Cambiar Imagen", "Próximamente...");
  };

  if (!product) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            <Text style={styles.modalTitle}>Edita tu Promoción</Text>
            
            <View style={styles.headerContent}>
              <Text style={styles.productTitle}>{product.title}</Text>
              
              <View style={styles.imageContainer}>
                <Image source={product.image} style={[
                  styles.productImage,
                  !isActive && { opacity: 0.5 }
                ]} />
                
                <TouchableOpacity style={styles.editImageButton} onPress={handleEditImage}>
                  <Feather name="edit-2" size={18} color={COLORS.text} />
                </TouchableOpacity>

                {!isActive && (
                  <View style={styles.hiddenBadge}>
                    <Text style={styles.hiddenText}>OCULTO</Text>
                  </View>
                )}
              </View>
            </View>

            <Text style={styles.label}>Precio normal</Text>
            <View style={[styles.inputContainer, styles.readOnlyInput]}>
              <Text style={styles.readOnlyText}>${product.price}</Text>
            </View>

            <Text style={styles.label}>Precio promocional</Text>
            <TextInput
              style={styles.input}
              value={formData.promotionalPrice}
              onChangeText={(text) => updateFormData('promotionalPrice', text)}
              keyboardType="numeric"
              placeholder="Ej. 120.99"
            />
            {errors.promotionalPrice && <Text style={styles.errorText}>{errors.promotionalPrice}</Text>}

            <Text style={styles.label}>Fecha inicio</Text>
            <TextInput
              style={styles.input}
              value={formData.startDate}
              onChangeText={(text) => updateFormData('startDate', text)}
              placeholder="YYYY-MM-DD"
            />
            {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}

            <Text style={styles.label}>Fecha fin</Text>
            <TextInput
              style={styles.input}
              value={formData.endDate}
              onChangeText={(text) => updateFormData('endDate', text)}
              placeholder="YYYY-MM-DD"
            />
            {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}

            <View style={styles.footerControls}>
              <Switch
                trackColor={{ false: "#767577", true: COLORS.primary }}
                thumbColor={isActive ? "#f4f3f4" : "#f4f3f4"}
                onValueChange={setIsActive}
                value={isActive}
                style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
              />

              <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
                <View style={styles.iconBorderGreen}>
                   <Feather name="check" size={28} color="#00C853" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
                 <Ionicons name="trash-outline" size={32} color="#D50000" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeTextButton} onPress={onClose}>
              <Text style={styles.closeText}>Cancelar</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 15,
  },
  productTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 4,
  },
  hiddenBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  hiddenText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
    marginTop: 10,
  },
  inputContainer: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F5F5F5', 
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
  },
  readOnlyInput: {
    backgroundColor: '#EEEEEE',
  },
  readOnlyText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.medium,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.small,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  footerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  actionButton: {
    padding: 5,
  },
  iconBorderGreen: {
    borderWidth: 2,
    borderColor: '#00C853',
    borderRadius: 8,
    padding: 2,
  },
  closeTextButton: {
    marginTop: 20,
  },
  closeText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.medium,
    textDecorationLine: 'underline',
  }
});