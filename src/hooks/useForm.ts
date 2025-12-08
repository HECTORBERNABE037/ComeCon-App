import { useState } from 'react';

// T es un tipo genérico, representa la forma del formulario 
// ValidationRules es una función que recibe el formulario y devuelve un objeto de errores
export const useForm = <T extends Object>(
  initialState: T,
  validationRules: (formData: T) => Partial<Record<keyof T, string>>
) => {
  
  // 1. El estado del formulario vive aquí
  const [formData, setFormData] = useState<T>(initialState);
  
  // 2. El estado de los errores vive aquí
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  // 3. La lógica para actualizar el formulario vive aquí
  const updateFormData = (field: keyof T, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpia el error del campo específico al empezar a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // 4. La lógica de validación vive aquí
  const validate = (): boolean => {
    // Llama a la función de reglas que nos pasaron
    const tempErrors = validationRules(formData);
    setErrors(tempErrors);
    
    // Si el objeto de errores está vacío, el formulario es válido
    return Object.keys(tempErrors).length === 0;
  };

  // 5. Devolvemos todo lo que las pantallas necesitan
  return {
    formData,
    errors,
    updateFormData,
    validate,
    setFormData
  };
};