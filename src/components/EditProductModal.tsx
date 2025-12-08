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
  ScrollView 
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Platillo, ProductFormData, COLORS, FONT_SIZES } from '../../types';
import { useForm } from '../hooks/useForm';
import { validateProductForm } from '../utils/validationRules';

interface Props {
  visible: boolean;
  product: Platillo | null;
  onClose: () => void;
  onSave: (updatedProduct: Platillo) => void;
  onDelete: (id: string) => void;
}

// CORRECCIÓN: Usamos 'export const' para evitar el error de importación
export const EditProductModal: React.FC<Props> = ({ 
  visible, 
  product, 
  onClose, 
  onSave, 
  onDelete 
}) => {
  
  const [isVisible, setIsVisible] = useState(true);

  const { formData, errors, updateFormData, validate, setFormData } = useForm<ProductFormData>(
    { title: '', subtitle: '', price: '', description: '' },
    validateProductForm
  );

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        subtitle: product.subtitle,
        // Al editar, queremos el precio base original.
        // Gracias a tu nueva lógica, 'product.price' SIEMPRE es el precio base.
        price: product.price,
        description: product.description || '',
      });
      
      setIsVisible(product.visible !== false);
    }
  }, [product, visible]);

  const handleSave = () => {
    if (validate() && product) {
      const updatedProduct: Platillo = { 
        ...product, 
        ...formData,
        visible: isVisible 
      };
      onSave(updatedProduct);
    } else {
      Alert.alert("Error", "Por favor, revisa los campos del formulario.");
    }
  };

  const handleToggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleDelete = () => {
    if (!product) return;
    Alert.alert(
      "Borrar Producto",
      `¿Estás seguro de que quieres borrar "${product.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Borrar", style: "destructive", onPress: () => onDelete(product.id.toString()) }
      ]
    );
  };
  
  const handleEditImage = () => {
    Alert.alert("Cambiar Imagen", "Próximamente...");
  };

  if (!product) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={{alignItems: 'center', paddingBottom: 20}} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Edita tu Producto</Text>
            
            <View style={styles.imageContainer}>
              <Image source={product.image} style={[
                styles.productImage, 
                !isVisible && { opacity: 0.4 } 
              ]} />
              <TouchableOpacity style={styles.editImageButton} onPress={handleEditImage}>
                <Feather name="edit-2" size={18} color={COLORS.text} />
              </TouchableOpacity>
              
              {!isVisible && (
                <View style={styles.hiddenBadge}>
                  <Text style={styles.hiddenText}>OCULTO</Text>
                </View>
              )}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor={COLORS.placeholder}
              value={formData.title}
              onChangeText={(text) => updateFormData('title', text)}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Subtítulo"
              placeholderTextColor={COLORS.placeholder}
              value={formData.subtitle}
              onChangeText={(text) => updateFormData('subtitle', text)}
            />

            <TextInput
              style={styles.input}
              placeholder="Precio Base (Sin Promoción)"
              placeholderTextColor={COLORS.placeholder}
              value={formData.price}
              onChangeText={(text) => updateFormData('price', text)}
              keyboardType="numeric"
            />
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}

            <View style={styles.descriptionContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descripción"
                placeholderTextColor={COLORS.placeholder}
                value={formData.description}
                onChangeText={(text) => updateFormData('description', text)}
                multiline
                maxLength={100}
              />
              <Text style={styles.charCounter}>{formData.description.length} / 100</Text>
            </View>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleToggleVisibility}>
                <Ionicons 
                  name={isVisible ? "eye-outline" : "eye-off-outline"} 
                  size={32} 
                  color={isVisible ? COLORS.text : COLORS.textSecondary} 
                />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSave}>
                <Feather name="check" size={32} color={COLORS.white} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={32} color={COLORS.error} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={{marginTop: 15}} onPress={onClose}>
              <Text style={{color: COLORS.textSecondary, textDecorationLine:'underline'}}>Cancelar</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  input: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    borderBottomWidth: 1,
    borderColor: COLORS.placeholder,
    marginBottom: 5,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  descriptionContainer: {
    width: '100%',
  },
  charCounter: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: -5,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    padding: 10,
    borderRadius: 30,
    backgroundColor: COLORS.surface,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.small,
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginBottom: 5,
  },
});