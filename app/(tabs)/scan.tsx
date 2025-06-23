import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { getUserByPlate, logAccess, getLastUserEvent } from '@/lib/supabase';
import { Car, Bike, CircleCheck as CheckCircle, Circle as XCircle, Camera } from 'lucide-react-native';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastScan, setLastScan] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [scanResult, setScanResult] = useState<'entrada' | 'salida' | null>(null);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || data === lastScan) return;
    
    setScanned(true);
    setLastScan(data);

    // Get user by plate
    const userResult = await getUserByPlate(data);
    
    if (!userResult.success || !userResult.data) {
      Alert.alert('Error', 'Vehículo no encontrado en el sistema');
      setTimeout(() => setScanned(false), 3000);
      return;
    }

    const user = userResult.data;
    setUserInfo(user);

    // Get last event
    const lastEventResult = await getLastUserEvent(user.id);
    const lastEvent = lastEventResult.data?.event;
    
    // Determine new event
    const newEvent = !lastEvent || lastEvent === 'salida' ? 'entrada' : 'salida';
    setScanResult(newEvent);

    // Log the access
    const logResult = await logAccess(user.id, newEvent);
    
    if (logResult.success) {
      const message = newEvent === 'entrada' 
        ? `✅ Entrada registrada para ${user.name}`
        : `🚪 Salida registrada para ${user.name}`;
      
      Alert.alert('Acceso Registrado', message);
    } else {
      Alert.alert('Error', 'Error al registrar el acceso');
    }

    // Reset after 5 seconds
    setTimeout(() => {
      setScanned(false);
      setUserInfo(null);
      setScanResult(null);
    }, 5000);
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Cargando cámara...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Card style={styles.permissionCard}>
          <Camera size={64} color="#6A1B9A" style={styles.permissionIcon} />
          <Text style={styles.permissionTitle}>Permiso de Cámara</Text>
          <Text style={styles.permissionText}>
            Necesitamos acceso a la cámara para escanear códigos QR
          </Text>
          <Button onPress={requestPermission} style={styles.permissionButton}>
            Conceder Permiso
          </Button>
        </Card>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Escaneo de Acceso</Text>
        <Text style={styles.subtitle}>
          {scanned ? 'Procesando...' : 'Apunta la cámara al código QR'}
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        </CameraView>
      </View>

      {userInfo && (
        <Card style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={styles.resultIcon}>
              {scanResult === 'entrada' ? (
                <CheckCircle size={32} color="#1ECA3C" />
              ) : (
                <XCircle size={32} color="#E53935" />
              )}
            </View>
            <Text style={[
              styles.resultTitle,
              { color: scanResult === 'entrada' ? '#1ECA3C' : '#E53935' }
            ]}>
              {scanResult === 'entrada' ? 'ENTRADA' : 'SALIDA'}
            </Text>
          </View>

          <View style={styles.userInfo}>
            <View style={styles.vehicleIcon}>
              {userInfo.vehicle_type === 'Carro' ? (
                <Car size={24} color="#6A1B9A" />
              ) : (
                <Bike size={24} color="#6A1B9A" />
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{userInfo.name}</Text>
              <Text style={styles.userVehicle}>
                {userInfo.vehicle_type} - {userInfo.plate}
              </Text>
            </View>
          </View>
        </Card>
      )}

      <Card style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>Instrucciones</Text>
        <Text style={styles.instructionsText}>
          • Mantén el código QR dentro del área de escaneo
        </Text>
        <Text style={styles.instructionsText}>
          • Asegúrate de que haya buena iluminación
        </Text>
        <Text style={styles.instructionsText}>
          • El sistema registrará automáticamente entrada o salida
        </Text>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  cameraContainer: {
    height: 300,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  permissionCard: {
    margin: 16,
    alignItems: 'center',
  },
  permissionIcon: {
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    width: '100%',
  },
  resultCard: {
    marginTop: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultIcon: {
    marginRight: 12,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  userVehicle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  instructionsCard: {
    marginTop: 16,
    marginBottom: 32,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
});