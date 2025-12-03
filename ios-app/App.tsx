/**
 * ClaudeScope iOS App
 * Claude 使用分析与优化平台
 */

import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {QueryProvider} from './src/providers/QueryProvider';
import RootNavigator from './src/navigation/RootNavigator';

function App() {
  return (
    <GestureHandlerRootView style={{flex: 1, backgroundColor: '#09090b'}}>
      <SafeAreaProvider>
        <QueryProvider>
          <StatusBar barStyle="light-content" backgroundColor="#09090b" />
          <RootNavigator />
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
