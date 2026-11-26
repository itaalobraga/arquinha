import { useEffect, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '../components/PressableScale';
import { ParentsSheet } from '../components/ParentsSheet';
import { useReducedMotion } from '../motion';
import { colors, fonts } from '../theme';

// A arte da splash é um quadrado com folga em volta; recortamos só a faixa da arca.
const ARK_IMAGE = require('../../assets/splash-icon.png');
const ARK_CROP = { width: 680, height: 460, source: 1024 };

type Props = { onStart: () => void; onCredits: () => void };

export function HomeScreen({ onStart, onCredits }: Props) {
  const insets = useSafeAreaInsets();
  const [parentsOpen, setParentsOpen] = useState(false);

  const openCredits = () => {
    setParentsOpen(false);
    onCredits();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }]}>
      <StatusBar style="dark" />

      <View style={styles.hero}>
        <FloatingArk />
        <Text style={styles.title}>Arquinha</Text>
        <Text style={styles.subtitle}>Toque na tela e ouça os bichos</Text>
      </View>

      <View style={styles.actions}>
        <PressableScale onPress={onStart} style={styles.startButton} accessibilityRole="button">
          <Text style={styles.startText}>Começar a brincar</Text>
        </PressableScale>
        <Pressable
          onPress={() => setParentsOpen(true)}
          hitSlop={12}
          accessibilityRole="button"
          style={styles.parentsButton}
        >
          <Text style={styles.parentsLink}>Para os pais</Text>
        </Pressable>
      </View>

      <ParentsSheet visible={parentsOpen} onClose={() => setParentsOpen(false)} onCredits={openCredits} />
    </View>
  );
}

/** A arca balança devagar, como quem está na água. */
function FloatingArk() {
  const { width: screenW } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const [wave] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) return;
    const half = { duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true };
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wave, { toValue: 1, ...half }),
        Animated.timing(wave, { toValue: 0, ...half }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [wave, reduceMotion]);

  const w = Math.min(screenW - 96, 260);
  const h = (w * ARK_CROP.height) / ARK_CROP.width;
  const imageSize = (w * ARK_CROP.source) / ARK_CROP.width;

  return (
    <Animated.View
      style={{
        width: w,
        height: h,
        overflow: 'hidden',
        transform: [
          { translateY: wave.interpolate({ inputRange: [0, 1], outputRange: [-4, 4] }) },
          { rotate: wave.interpolate({ inputRange: [0, 1], outputRange: ['-1.5deg', '1.5deg'] }) },
        ],
      }}
    >
      <Image
        source={ARK_IMAGE}
        style={{ position: 'absolute', width: imageSize, height: imageSize, left: (w - imageSize) / 2, top: (h - imageSize) / 2 }}
        accessibilityIgnoresInvertColors
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.bold, fontSize: 56, color: colors.ink, marginTop: 20, letterSpacing: -0.5 },
  subtitle: { fontFamily: fonts.regular, fontSize: 19, color: colors.inkSoft, marginTop: 2 },
  actions: { gap: 20 },
  parentsButton: { alignSelf: 'center' },
  startButton: {
    backgroundColor: colors.accent,
    paddingVertical: 20,
    borderRadius: 999,
    alignItems: 'center',
    // Base sólida mais escura em vez de sombra difusa: parece um botão de brinquedo.
    borderBottomWidth: 5,
    borderBottomColor: colors.accentDeep,
  },
  startText: { fontFamily: fonts.semibold, fontSize: 24, color: colors.surface },
  parentsLink: { fontFamily: fonts.medium, fontSize: 16, color: colors.inkSoft, paddingVertical: 4 },
});
