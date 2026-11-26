import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = { onStart: () => void; onCredits: () => void };

const PIN_TIP =
  Platform.OS === 'ios'
    ? 'Para travar de verdade, ative o Acesso Guiado: Ajustes › Acessibilidade › Acesso Guiado. Depois, com o app aberto, clique 3 vezes no botão lateral.'
    : 'Para travar de verdade, ative a Fixação de tela: Configurações › Segurança › Fixar app. Depois fixe o Arquinha pela tela de apps recentes.';

export function HomeScreen({ onStart, onCredits }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.parade}>🦁 🐘 🐮</Text>
        <Text style={styles.parade}>🐶 🐸 🦆 🐷</Text>
        <Text style={styles.title}>Arquinha</Text>
        <Text style={styles.subtitle}>Toque na tela e ouça os bichos!</Text>
      </View>

      <Pressable
        onPress={onStart}
        style={({ pressed }) => [styles.startButton, pressed && styles.startButtonPressed]}
      >
        <Text style={styles.startText}>Começar a brincar</Text>
      </Pressable>

      <View style={styles.tips}>
        <Text style={styles.tipTitle}>Para os pais</Text>
        <Text style={styles.tip}>
          • Para sair, segure com dois dedos os dois cantos de cima da tela ao mesmo tempo por 2 segundos.
        </Text>
        <Text style={styles.tip}>• {PIN_TIP}</Text>
        <Pressable onPress={onCredits} hitSlop={8}>
          <Text style={styles.creditsLink}>Créditos dos sons</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4D6',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: { alignItems: 'center', marginTop: 24 },
  title: { fontSize: 48, fontWeight: '900', color: '#5B3A1A', marginTop: 16 },
  subtitle: { fontSize: 18, color: '#7A5532', marginTop: 4 },
  parade: { fontSize: 56, lineHeight: 72, letterSpacing: 6 },
  creditsLink: { fontSize: 13, color: '#7A5532', textDecorationLine: 'underline', marginTop: 4 },
  startButton: {
    backgroundColor: '#FF8A3D',
    paddingVertical: 22,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  startButtonPressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
  startText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  tips: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: 16, gap: 6 },
  tipTitle: { fontSize: 16, fontWeight: '800', color: '#5B3A1A' },
  tip: { fontSize: 14, color: '#5B3A1A', lineHeight: 20 },
});
