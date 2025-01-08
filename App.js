import React from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginPage from './src/LoginPage';
import ForgetPassword from './src/ForgetPassword';
import BookingScreen from './src/BookingScreen';
import About from './src/About';
import Privacy from './src/Privacy';
import Profile from './src/Profile';
import IncService from './src/IncService';
import RevisitService from './src/RevisitService';
import AnyUpdate from './src/AnyUpdate';
import IncDone from './src/IncDone';
import IncNotClose from './src/IncNotClose';
import RevisiteDone from './src/RevisiteDone';
import RevisiteNotClose from './src/RevisiteNotClose';
import SiteDetail from './src/site/SiteDetail';
import RunHours from './src/run/RunHours';
import GraphView from './src/run/GraphView';
import IncScreen from './src/screen/IncScreen';
import Splash from './src/Splash';
import IncTeam from './src/screen/IncTeam';
import Location from './src/screen/Location';
import PendingRemark from './src/screen/PendingRemark';
const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Navigator>
        <Stack.Screen
            name="Splash"
            component={Splash}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ForgetPassword"
            component={ForgetPassword}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BookingScreen"
            component={BookingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="About"
            component={About}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Privacy"
            component={Privacy}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="IncService"
            component={IncService}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Revisit"
            component={RevisitService}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Update"
            component={AnyUpdate}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="INCDONE"
            component={IncDone}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="INCNOTCLOSE"
            component={IncNotClose}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="REVISITDONE"
            component={RevisiteDone}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="REVISITNOTCLOSE"
            component={RevisiteNotClose}
            options={{ headerShown: false }}
          />
            <Stack.Screen
            name="SiteDetail"
            component={SiteDetail}
            options={{ headerShown: false }}
          />
           <Stack.Screen
            name="RunHours"
            component={RunHours}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="GraphView"
            component={GraphView}
            options={{ headerShown: false }}
          />
           <Stack.Screen
            name="IncScreen"
            component={IncScreen}
            options={{ headerShown: false }}
          />
            <Stack.Screen
            name="IncTeam"
            component={IncTeam}
            options={{ headerShown: false }}
          />
            <Stack.Screen
            name="Location"
            component={Location}
            options={{ headerShown: false }}
          /> 
           <Stack.Screen
            name="Pending"
            component={PendingRemark}
            options={{ headerShown: false }}
          />  
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
};

export default App;
