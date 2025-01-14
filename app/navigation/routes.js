import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import Channel1Screen from '../screens/Channel1Screen';
import TabsNavigator from './tabNavigation'
import AppInfoScreen from '../screens/AppInfoScreen';

const Stack = createStackNavigator();

const Routes = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
          name="Channel1"
          component={Channel1Screen}
          options={{ title: 'Canal 1',
            headerStyle: {
              backgroundColor: '#1e90ff',        
            },
            headerTintColor: '#fff',
            headerBackButtonDisplayMode: 'minimal',
             headerTitleAlign: 'center'
           }}
        />
        <Stack.Screen
          name="Tabs"
          component={TabsNavigator}
          options={{ headerShown: false }}

        />

      <Stack.Screen
          name="AppInfo"
          component={AppInfoScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
      
    </NavigationContainer>
  );
};

export default Routes;
