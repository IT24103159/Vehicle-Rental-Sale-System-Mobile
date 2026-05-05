import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert helper that works on both Web and Mobile (Expo Go)
 */
export const showAlert = (title, message, onOk) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}: ${message}`);
    if (onOk) onOk();
  } else {
    if (onOk) {
      Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
    } else {
      Alert.alert(title, message);
    }
  }
};

export const showConfirm = (title, message, onConfirm, onCancel) => {
  if (Platform.OS === 'web') {
    if (window.confirm(message)) {
      if (onConfirm) onConfirm();
    } else {
      if (onCancel) onCancel();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'OK', style: 'destructive', onPress: onConfirm }
    ]);
  }
};
