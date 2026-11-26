import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import { setupSounds } from './src/sounds';
import { HomeScreen } from './src/screens/HomeScreen';
import { PlayScreen } from './src/screens/PlayScreen';
import { CreditsScreen } from './src/screens/CreditsScreen';
import { AnimatedSplash } from './src/components/AnimatedSplash';

type Screen = 'home' | 'play' | 'credits';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [showSplash, setShowSplash] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  useEffect(() => {
    setupSounds().catch((e) => console.warn('Falha ao carregar sons', e));
  }, []);

  // A splash nativa continua na tela (AnimatedSplash segura ela) até a fonte carregar.
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      {screen === 'play' && <PlayScreen onExit={() => setScreen('home')} />}
      {screen === 'credits' && <CreditsScreen onBack={() => setScreen('home')} />}
      {screen === 'home' && (
        <HomeScreen onStart={() => setScreen('play')} onCredits={() => setScreen('credits')} />
      )}
      {showSplash && <AnimatedSplash onDone={() => setShowSplash(false)} />}
    </SafeAreaProvider>
  );
}
