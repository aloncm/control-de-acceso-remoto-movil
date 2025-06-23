import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import QRCode from 'react-native-qrcode-svg';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { registerUser } from '@/lib/supabase';
import { Car, Bike, CircleCheck as CheckCircle } from 'lucide-react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [vehicleType, setVehicleType] = useState('Carro');
  const [plate, setPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qrValue, setQrValue] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !plate.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    const result = await registerUser(name.trim(), vehicleType, plate.trim());
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setQrValue(plate.trim().toUpperCase());
      Alert.alert('Éxito', `${name} ha sido registrado correctamente`);
    } else {
      Alert.alert('Error', result.error || 'Error al registrar el usuario');
    }
  };

  const handleNewRegistration = () => {
    setName('');
    setPlate('');
    setVehicleType('Carro');
    setSuccess(false);
    setQrValue('');
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Card style={styles.successCard}>
            <View style={styles.successHeader}>
              <CheckCircle size={64} color="#1ECA3C" />
              <Text style={styles.successTitle}>¡Registro Exitoso!</Text>
              <Text style={styles.successSubtitle}>
                {name} ha sido registrado correctamente
              </Text>
            </View>

            <View style={styles.qrContainer}>
              <Text style={styles.qrTitle}>Código QR de Acceso</Text>
              <View style={styles.qrCodeWrapper}>
                <QRCode
                  value={qrValue}
                  size={200}
                  backgroundColor="white"
                  color="black"
                />
              </View>
              <Text style={styles.plateText}>Placa: {qrValue}</Text>
            </View>

            <Button onPress={handleNewRegistration} style={styles.newButton}>
              Nuevo Registro
            </Button>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Registro de Vehículo</Text>
          <Text style={styles.subtitle}>Registra un nuevo vehículo en el sistema</Text>
        </View>

        <Card>
          <Input
            label="Nombre completo"
            value={name}
            onChangeText={setName}
            placeholder="Ingresa el nombre del propietario"
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Tipo de vehículo</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={vehicleType}
                onValueChange={setVehicleType}
                style={styles.picker}
              >
                <Picker.Item label="🚗 Carro" value="Carro" />
                <Picker.Item label="🏍️ Moto" value="Moto" />
              </Picker>
            </View>
          </View>

          <Input
            label="Placa del vehículo"
            value={plate}
            onChangeText={setPlate}
            placeholder="Ej: ABC123"
            autoCapitalize="characters"
          />

          <Button
            onPress={handleRegister}
            disabled={loading}
            style={styles.registerButton}
          >
            {loading ? 'Registrando...' : 'Registrar Vehículo'}
          </Button>
        </Card>

        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>Información</Text>
          </View>
          <Text style={styles.infoText}>
            • El código QR se generará automáticamente después del registro
          </Text>
          <Text style={styles.infoText}>
            • Guarda o comparte el código QR para el acceso al vehículo
          </Text>
          <Text style={styles.infoText}>
            • La placa debe ser única en el sistema
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  pickerContainer: {
    marginVertical: 8,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 50,
  },
  registerButton: {
    marginTop: 16,
  },
  infoCard: {
    marginBottom: 32,
  },
  infoHeader: {
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
  successCard: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1ECA3C',
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  qrCodeWrapper: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  plateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  newButton: {
    width: '100%',
  },
});