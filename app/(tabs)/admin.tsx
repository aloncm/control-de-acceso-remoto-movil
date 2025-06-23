import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { getAllUsers, getAccessLogs, deleteUser, User, AccessLog } from '@/lib/supabase';
import { Users, Activity, Trash2, Car, Bike, LogIn, LogOut } from 'lucide-react-native';

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    
    if (activeTab === 'users') {
      const result = await getAllUsers();
      if (result.success) {
        setUsers(result.data || []);
      }
    } else {
      const result = await getAccessLogs();
      if (result.success) {
        setLogs(result.data || []);
      }
    }
    
    setLoading(false);
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar a ${userName}? Esta acción eliminará también todos sus registros de acceso.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteUser(userId);
            if (result.success) {
              Alert.alert('Éxito', 'Usuario eliminado correctamente');
              loadData();
            } else {
              Alert.alert('Error', result.error || 'Error al eliminar usuario');
            }
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemIcon}>
          {item.vehicle_type === 'Carro' ? (
            <Car size={24} color="#6A1B9A" />
          ) : (
            <Bike size={24} color="#6A1B9A" />
          )}
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDetails}>
            {item.vehicle_type} - {item.plate}
          </Text>
          <Text style={styles.itemDate}>
            Registrado: {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <Button
          onPress={() => handleDeleteUser(item.id, item.name)}
          variant="danger"
          style={styles.deleteButton}
        >
          <Trash2 size={16} color="#FFFFFF" />
        </Button>
      </View>
    </Card>
  );

  const renderLogItem = ({ item }: { item: AccessLog }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={[
          styles.itemIcon,
          { backgroundColor: item.event === 'entrada' ? '#E8F5E8' : '#FFF3E0' }
        ]}>
          {item.event === 'entrada' ? (
            <LogIn size={24} color="#1ECA3C" />
          ) : (
            <LogOut size={24} color="#FF9800" />
          )}
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.users?.name || 'Usuario desconocido'}</Text>
          <Text style={[
            styles.itemEvent,
            { color: item.event === 'entrada' ? '#1ECA3C' : '#FF9800' }
          ]}>
            {item.event.toUpperCase()}
          </Text>
          <Text style={styles.itemDate}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Administración</Text>
        <Text style={styles.subtitle}>Gestión de usuarios y accesos</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <Button
          onPress={() => setActiveTab('users')}
          variant={activeTab === 'users' ? 'primary' : 'secondary'}
          style={[styles.tabButton, activeTab === 'users' && styles.activeTab]}
        >
          <Users size={20} color="#FFFFFF" style={styles.tabIcon} />
          Usuarios
        </Button>
        <Button
          onPress={() => setActiveTab('logs')}
          variant={activeTab === 'logs' ? 'primary' : 'secondary'}
          style={[styles.tabButton, activeTab === 'logs' && styles.activeTab]}
        >
          <Activity size={20} color="#FFFFFF" style={styles.tabIcon} />
          Registros
        </Button>
      </View>

      {/* Stats */}
      <Card style={styles.statsCard}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{users.length}</Text>
            <Text style={styles.statLabel}>Usuarios</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{logs.length}</Text>
            <Text style={styles.statLabel}>Accesos</Text>
          </View>
        </View>
      </Card>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'users' ? (
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id.toString()}
            refreshing={loading}
            onRefresh={loadData}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No hay usuarios registrados</Text>
              </Card>
            }
          />
        ) : (
          <FlatList
            data={logs}
            renderItem={renderLogItem}
            keyExtractor={(item) => item.id.toString()}
            refreshing={loading}
            onRefresh={loadData}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No hay registros de acceso</Text>
              </Card>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#6A1B9A',
  },
  tabIcon: {
    marginRight: 8,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A1B9A',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
  },
  itemCard: {
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  itemDetails: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  itemEvent: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  itemDate: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});