import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useRouter } from 'expo-router';
import { Car, Bike, QrCode, Shield, Users, Activity } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();

  const features = [
    {
      title: 'Registrar Vehículo',
      description: 'Registra nuevos autos y motos con código QR',
      icon: Car,
      onPress: () => router.push('/register'),
      color: '#6A1B9A'
    },
    {
      title: 'Escanear Acceso',
      description: 'Escanea códigos QR para control de entrada',
      icon: QrCode,
      onPress: () => router.push('/scan'),
      color: '#1ECA3C'
    },
    {
      title: 'Administración',
      description: 'Gestiona usuarios y revisa logs de acceso',
      icon: Shield,
      onPress: () => router.push('/admin'),
      color: '#2196F3'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Image source={require('../../assets/images/icon.jpg')} style={styles.logoImage} />
            </View>
          </View>
          <Text style={styles.title}>Control de Accesos</Text>
          <Text style={styles.subtitle}>Sistema de gestión vehicular</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <Card key={index} style={styles.featureCard}>
              <View style={styles.featureContent}>
                <View style={[styles.iconContainer, { backgroundColor: `${feature.color}15` }]}>
                  <feature.icon size={32} color={feature.color} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
              <Button onPress={feature.onPress} style={styles.featureButton}>
                Acceder
              </Button>
            </Card>
          ))}
        </View>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Estado del Sistema</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Users size={24} color="#6A1B9A" />
              <Text style={styles.statLabel}>Usuarios</Text>
              <Text style={styles.statValue}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Activity size={24} color="#1ECA3C" />
              <Text style={styles.statLabel}>Accesos</Text>
              <Text style={styles.statValue}>Hoy</Text>
            </View>
          </View>
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
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    // backgroundColor: '#6A1B9A', // Elimina o comenta esta línea
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  featuresContainer: {
    paddingHorizontal: 0,
  },
  featureCard: {
    marginBottom: 8,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666666',
  },
  featureButton: {
    marginTop: 8,
  },
  statsCard: {
    marginBottom: 32,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 4,
  },
  logoImage: {
    width: 80, // o el tamaño que prefieras
    height: 80,
    resizeMode: 'contain'
  },
});