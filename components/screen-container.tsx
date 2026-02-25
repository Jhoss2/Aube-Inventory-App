import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

export function ScreenContainer({ children, style }: { children: React.ReactNode, style?: any }) {
  return (
    <SafeAreaView style={[styles.container, style]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
});
