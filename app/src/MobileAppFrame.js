import { Platform, StyleSheet, View } from 'react-native';

// Keep every web screen in the same mobile-width column, including loading states.
export function MobileAppFrame({ children }) {
  if (Platform.OS !== 'web') return children;

  return (
    <View style={styles.viewport}>
      <View style={styles.screen}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    backgroundColor: '#E4E0D6',
  },
  screen: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#F5F1E9',
  },
});
