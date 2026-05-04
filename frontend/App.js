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
import SaleVehicleDetailsScreen from './app/screens/SaleVehicleDetailsScreen';
import AdminInquiriesScreen from './app/screens/AdminInquiriesScreen';
import AdminBookingsScreen from './app/screens/AdminBookingsScreen';
import AccountScreen from './app/screens/AccountScreen';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- HOME STACK (Public) ---
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#f0ebe0' } }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="RentGallery" component={RentGalleryScreen} />
    <Stack.Screen name="BuyGallery" component={BuyGalleryScreen} />
    <Stack.Screen name="RentBooking" component={RentBookingScreen} />
    <Stack.Screen name="SaleVehicleDetails" component={SaleVehicleDetailsScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
  </Stack.Navigator>
);

// --- DASHBOARD STACK (Protected) ---
const DashboardStack = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#f0ebe0' } }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  if (user.role === 'Admin') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#f0ebe0' } }}>
        <Stack.Screen name="AdminHome" component={AdminDashboard} />
        <Stack.Screen name="FleetManagement" component={FleetManagementScreen} />
        <Stack.Screen name="AdminPayments" component={AdminPaymentsScreen} />
        <Stack.Screen name="AdminPromotions" component={AdminPromotionsScreen} />
        <Stack.Screen name="AddSaleVehicle" component={AddSaleVehicleScreen} />
        <Stack.Screen name="UserManagement" component={UserManagementScreen} />
        <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
        <Stack.Screen name="Fleet" component={FleetManagementScreen} />
        <Stack.Screen name="AdminInquiries" component={AdminInquiriesScreen} />
        <Stack.Screen name="AdminBookings" component={AdminBookingsScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#f0ebe0' } }}>
      <Stack.Screen name="CustomerHome" component={CustomerDashboard} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
      <Stack.Screen name="RentalHistory" component={RentalHistoryScreen} />
      <Stack.Screen name="CustomerNotifications" component={CustomerNotificationsScreen} />
    </Stack.Navigator>
  );
};

// --- ACCOUNT STACK (Protected) ---
const AccountStack = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#f0ebe0' } }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#f0ebe0' } }}>
      <Stack.Screen name="AccountMain" component={AccountScreen} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} />
    </Stack.Navigator>
  );
};

const Navigation = () => {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c9a052" />
      </View>
    );
  }

  const linking = {
    prefixes: ['http://localhost:8081', 'https://your-app-url.com'],
    config: {
      screens: {
        HomeTab: '',
        DashboardTab: 'dashboard',
        AccountTab: 'account',
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#c9a052',
          tabBarInactiveTintColor: '#888',
          tabBarStyle: { 
            backgroundColor: '#fff', 
            borderTopColor: '#e0e0e0',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            elevation: 5,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' }
        }}
      >
        <Tab.Screen 
          name="HomeTab" 
          component={HomeStack} 
          options={{ 
            tabBarLabel: 'Home', 
            tabBarIcon: ({ color }) => <Text style={{color, fontSize: 20}}>🏠</Text> 
          }} 
        />
        <Tab.Screen 
          name="DashboardTab" 
          component={DashboardStack} 
          options={{ 
            tabBarLabel: 'Dashboard', 
            tabBarIcon: ({ color }) => <Text style={{color, fontSize: 20}}>🎛️</Text> 
          }} 
        />
        <Tab.Screen 
          name="AccountTab" 
          component={AccountStack} 
          options={{ 
            tabBarLabel: 'Account', 
            tabBarIcon: ({ color }) => <Text style={{color, fontSize: 20}}>👤</Text> 
          }} 
        />
      </Tab.Navigator>
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
