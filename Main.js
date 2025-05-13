import React, {useEffect, useState} from 'react';
import {Alert, Linking, ActivityIndicator, AppState} from 'react-native';
import {ImeiProvider} from './src/ImeiProvider';
import App from './App';
import VersionCheck from 'react-native-version-check';

const Main = () => {
 
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const checkForUpdate = async () => {
      try {
        const currentVersion = VersionCheck.getCurrentVersion();
        const latestVersion = await VersionCheck.getLatestVersion({
          forceUpdate: true,
        });
        const updateNeeded = await VersionCheck.needUpdate({forceUpdate: true});
 
        console.log('🔍 Current App Version:', currentVersion);
        console.log('🆕 Latest Store Version:', latestVersion);
        console.log('📲 Update Needed:', updateNeeded?.isNeeded);
 
        if (updateNeeded?.isNeeded) {
          Alert.alert(
            'Update Available',
            'A new version of the app is available. Please update to continue.',
            [
              {
                text: 'Update',
                onPress: () => Linking.openURL(updateNeeded.storeUrl),
              },
              {
                text: 'Later',
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );
        }
      } catch (error) {
        console.log('❌ Error checking for update:', error);
      }
    };

    checkForUpdate();

    const subscription = AppState.addEventListener('change', nextState => {
      if (appState.match(/inactive|background/) && nextState === 'active') {
        checkForUpdate(); // Also check when returning to app
      }
      setAppState(nextState);
    });

    return () => subscription.remove();
  }, []);

  // if (loading) return <ActivityIndicator size="large" style={{flex: 1}} />;

  return (
    <ImeiProvider>
      <App />
    </ImeiProvider>
  );
};

export default Main;
