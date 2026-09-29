import { ScrollView } from 'react-native';

// iOS adjusts the scrollable area and scrolls the focused input above its keyboard.
export function KeyboardAwareScrollView(props) {
  return <ScrollView automaticallyAdjustKeyboardInsets keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled" {...props} />;
}
