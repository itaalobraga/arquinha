import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SOUND_CREDITS } from '../credits';

type Props = { onBack: () => void };

export function CreditsScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <Pressable onPress={onBack} hitSlop={12}>
        <Text style={styles.back}>‹ Voltar</Text>
      </Pressable>
      <Text style={styles.title}>Créditos dos sons</Text>
      <Text style={styles.intro}>
        Gravações reais do Wikimedia Commons, cortadas e com volume ajustado para o app.
      </Text>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24, gap: 10 }}>
        {SOUND_CREDITS.map((c) => (
          <Pressable key={c.animal} style={styles.row} onPress={() => Linking.openURL(c.source)}>
            <Text style={styles.animal}>{c.animal}</Text>
            <Text style={styles.meta}>
              {c.author} · {c.license}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF4D6', paddingHorizontal: 24 },
  back: { fontSize: 17, color: '#7A5532', fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '900', color: '#5B3A1A', marginTop: 12 },
  intro: { fontSize: 14, color: '#7A5532', marginTop: 4, marginBottom: 16 },
  row: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 14, padding: 12 },
  animal: { fontSize: 16, fontWeight: '800', color: '#5B3A1A' },
  meta: { fontSize: 13, color: '#7A5532', marginTop: 2 },
});
