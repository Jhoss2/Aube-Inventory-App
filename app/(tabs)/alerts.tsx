import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppContext } from '@/lib/app-context';
import { Ionicons } from '@expo/vector-icons';

export default function AlertsScreen() {
  const router = useRouter();
  const { appData, deleteAlert } = useAppContext();

  const sortedAlerts = useMemo(() => {
    return [...appData.alerts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appData.alerts]);

  return (
    <ScreenContainer className="bg-[#fde7f3]">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <Text className="text-gray-700 font-semibold">Alertes</Text>
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="close" size={24} color="#4b5563" />
        </TouchableOpacity>
      </View>

      {/* Alerts List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {sortedAlerts.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
            <Text className="text-gray-500 mt-4">Aucune alerte</Text>
          </View>
        ) : (
          <View className="gap-2">
            {sortedAlerts.map((alert) => (
              <View
                key={alert.id}
                className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${
                  alert.read ? 'border-gray-300 opacity-75' : 'border-red-500'
                } flex-row justify-between items-start`}
              >
                <View className="flex-1">
                  <Text className="text-gray-800 font-bold">
                    {alert.type === 'expiration' ? '⚠️ Attention' : 'ℹ️ Info'}
                  </Text>
                  <Text className="text-gray-600 text-sm mt-1">{alert.message}</Text>
                  <Text className="text-gray-400 text-xs mt-2">{new Date(alert.date).toLocaleDateString()}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => deleteAlert(alert.id)}
                  className="ml-2 p-2"
                >
                  <Ionicons name="close" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
