import React, { useEffect } from 'react';
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
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Order, OrderFormData, COLORS, FONT_SIZES } from '../../types';
import { useForm } from '../hooks/useForm';
import { validateOrderForm } from '../utils/validationRules';

interface Props {
  visible: boolean;
  order: any; // any para flexibilidad con snake_case
  onClose: () => void;
  onUpdate: (orderId: string, data: OrderFormData) => void;
  onComplete: (orderId: string) => void;
  onCancel: (orderId: string) => void;
}

export const OrderActionModal: React.FC<Props> = ({ 
  visible, 
  order, 
  onClose, 
  onUpdate, 
  onComplete, 
  onCancel 
}) => {
  
  const { formData, errors, updateFormData, validate, setFormData } = useForm<OrderFormData>(
    { status: '', estimatedTime: '', comment: '' },
    validateOrderForm
  );

  useEffect(() => {
    if (order && visible) {
      setFormData({
        status: order.status || '', 
        estimatedTime: order.delivery_time || order.deliveryTime || '',
        comment: order.history_notes || order.historyNotes || ''
      });
    }
  }, [order, visible]);

  const handleSave = () => {
    if (validate() && order) {
      onUpdate(order.id.toString(), formData);
    } else {
      Alert.alert("Atención", "Revisa los campos requeridos.");
    }
  };

  const handleCompleteAction = () => {
    if(order) onComplete(order.id.toString());
  };

  const handleCancelAction = () => {
    if(order) onCancel(order.id.toString());
  };

  if (!order) return null;

  // Resolvemos la imagen para mostrar 
  const imageSource = (order.image && typeof order.image === 'number') 
    ? order.image 
    : { uri: order.image }; // Si viene URL o es null, manejamos default fuera 

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
            
            <Text style={styles.modalTitle}>Acciones de Orden</Text>
            <Text style={{fontSize: 12, color: '#888', marginBottom: 10}}>ID: #{order.id}</Text>
            
            {/* Input Estatus */}
            <Text style={styles.label}>Estatus Actual</Text>
            <TextInput
              style={styles.input}
              value={formData.status}
              onChangeText={(text) => updateFormData('status', text)}
              placeholder="ej. En proceso"
            />
            {errors.status && <Text style={styles.errorText}>{errors.status}</Text>}

            {/* Input Hora Estimada */}
            <Text style={styles.label}>Tiempo de Entrega / Info</Text>
            <TextInput
              style={styles.input}
              value={formData.estimatedTime}
              onChangeText={(text) => updateFormData('estimatedTime', text)}
              placeholder="ej. 30 min / 7:30 PM"
            />
            {errors.estimatedTime && <Text style={styles.errorText}>{errors.estimatedTime}</Text>}

            {/* Input Comentario */}
            <Text style={styles.label}>Notas / Razón de cancelación</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.comment}
              onChangeText={(text) => updateFormData('comment', text)}
              placeholder="Escribe una nota..."
              multiline
              textAlignVertical="top"
              maxLength={150}
            />
            <Text style={styles.charCounter}>{formData.comment.length} / 150</Text>

            {/* Botones de Acción */}
            <View style={styles.footerIcons}>
              
              <TouchableOpacity style={styles.iconButton} onPress={handleCompleteAction}>
                 <MaterialCommunityIcons name="check-circle-outline" size={40} color={"#4CAF50"} />
                 <Text style={styles.iconLabel}>Completar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconButton} onPress={handleSave}>
                <View style={styles.saveBtnCircle}>
                   <Feather name="save" size={24} color="white" />
                </View>
                <Text style={styles.iconLabel}>Guardar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconButton} onPress={handleCancelAction}>
                 <MaterialCommunityIcons name="close-circle-outline" size={40} color={COLORS.error || "#F44336"} />
                 <Text style={styles.iconLabel}>Cancelar</Text>
              </TouchableOpacity>

            </View>

          </ScrollView>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
             <Ionicons name="close" size={28} color="#666" />
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center',
  },
  modalContainer: {
    width: '85%', backgroundColor: COLORS.white, borderRadius: 20, padding: 20, elevation: 10,
  },
  scrollContent: { alignItems: 'center', paddingBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  
  label: { alignSelf: 'flex-start', fontSize: 12, fontWeight: 'bold', color: '#555', marginBottom: 5, marginTop: 15 },
  input: { width: '100%', height: 45, backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 15, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: '#EEE' },
  textArea: { height: 80, paddingTop: 10 },
  charCounter: { fontSize: 10, color: '#999', alignSelf: 'flex-end', marginTop: 2 },
  errorText: { color: 'red', fontSize: 10, alignSelf: 'flex-start' },

  footerIcons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 25, paddingHorizontal: 10 },
  iconButton: { alignItems: 'center', justifyContent: 'center', width: 70 },
  iconLabel: { fontSize: 10, color: '#555', marginTop: 4 },
  saveBtnCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  
  closeButton: { position: 'absolute', top: 10, right: 10, padding: 5 }
});