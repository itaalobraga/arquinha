import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SOUND_CREDITS } from '../credits';
import { colors, fonts } from '../theme';

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
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 },
  back: { fontFamily: fonts.medium, fontSize: 17, color: colors.accent },
  title: { fontFamily: fonts.bold, fontSize: 30, color: colors.ink, marginTop: 12 },
  intro: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: colors.inkSoft, marginTop: 4, marginBottom: 16 },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  animal: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  meta: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, marginTop: 2 },
});
