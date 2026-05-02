import 'react-native-gesture-handler';
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { AuthProvider, AuthContext } from './context/AuthContext';
import LoginScreen from './app/screens/LoginScreen';
import RegisterScreen from './app/screens/RegisterScreen';
import HomeScreen from './app/screens/HomeScreen';
import CustomerDashboard from './app/screens/CustomerDashboard';
import AdminDashboard from './app/screens/AdminDashboard';
import UpdateProfileScreen from './app/screens/UpdateProfileScreen';
import UserManagementScreen from './app/screens/UserManagementScreen';
import RentGalleryScreen from './app/screens/RentGalleryScreen';
import BuyGalleryScreen from './app/screens/BuyGalleryScreen';
import AddVehicleScreen from './app/screens/AddVehicleScreen';
import FleetManagementScreen from './app/screens/FleetManagementScreen';
import RentBookingScreen from './app/screens/RentBookingScreen';
import PaymentScreen from './app/screens/PaymentScreen';
import PaymentHistoryScreen from './app/screens/PaymentHistoryScreen';
import AdminPaymentsScreen from './app/screens/AdminPaymentsScreen';
import AdminPromotionsScreen from './app/screens/AdminPromotionsScreen';
import CustomerNotificationsScreen from './app/screens/CustomerNotificationsScreen';
import RentalHistoryScreen from './app/screens/RentalHistoryScreen';
import AddSaleVehicleScreen from './app/screens/AddSaleVehicleScreen';

const Stack = createStackNavigator();

const Navigation = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c9a052" />
      </View>
    );
  }

  // Determine initial route based on login state and role
  let initialRoute = 'Home';
  if (user) {
    initialRoute = user.role === 'Admin' ? 'AdminHome' : 'CustomerHome';
  }

  // Configuration for Web Browser URL routing and Back Button support
  const linking = {
    prefixes: ['http://localhost:8081', 'https://your-app-url.com'],
    config: {
      screens: {
        Home: '',
        Login: 'login',
        Register: 'register',
        RentGallery: 'rent',
        BuyGallery: 'buy',
        CustomerHome: 'customer/dashboard',
        UpdateProfile: 'customer/profile',
        AdminHome: 'admin/dashboard',
        UserManagement: 'admin/users',
        AddVehicle: 'admin/add-vehicle',
        Fleet: 'admin/fleet',
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#f0ebe0' },
        }}
      >
        {/* Public Screens */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="RentGallery" component={RentGalleryScreen} />
        <Stack.Screen name="BuyGallery" component={BuyGalleryScreen} />
        <Stack.Screen name="RentBooking" component={RentBookingScreen} />

        {/* Customer Screens */}
        <Stack.Screen name="CustomerHome" component={CustomerDashboard} />
        <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
        <Stack.Screen name="RentalHistory" component={RentalHistoryScreen} />
        <Stack.Screen name="CustomerNotifications" component={CustomerNotificationsScreen} />

        {/* Admin Protected Screens */}
        <Stack.Screen name="AdminHome" component={AdminDashboard} />
        <Stack.Screen name="FleetManagement" component={FleetManagementScreen} />
        <Stack.Screen name="AdminPayments" component={AdminPaymentsScreen} />
        <Stack.Screen name="AdminPromotions" component={AdminPromotionsScreen} />
        <Stack.Screen name="AddSaleVehicle" component={AddSaleVehicleScreen} />
        <Stack.Screen name="UserManagement" component={UserManagementScreen} />
        <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
        <Stack.Screen name="Fleet" component={FleetManagementScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0ebe0',
  },
});

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
