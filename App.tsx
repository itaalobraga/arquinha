import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setupSounds } from './src/sounds';
import { HomeScreen } from './src/screens/HomeScreen';
import { PlayScreen } from './src/screens/PlayScreen';
import { CreditsScreen } from './src/screens/CreditsScreen';

type Screen = 'home' | 'play' | 'credits';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');

  useEffect(() => {
    setupSounds().catch((e) => console.warn('Falha ao carregar sons', e));
  }, []);

  return (
    <SafeAreaProvider>
      {screen === 'play' && <PlayScreen onExit={() => setScreen('home')} />}
      {screen === 'credits' && <CreditsScreen onBack={() => setScreen('home')} />}
      {screen === 'home' && (
        <HomeScreen onStart={() => setScreen('play')} onCredits={() => setScreen('credits')} />
      )}
    </SafeAreaProvider>
  );
}
