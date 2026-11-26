import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useReducedMotion } from '../motion';
import { colors } from '../theme';

const PHONE_W = 112;
const PHONE_H = 188;
const DOT = 30;

/**
 * Desenho do gesto de saída: um celular com os dois cantos de cima sendo
 * segurados, e o anel enchendo igual ao que aparece de verdade na brincadeira.
 */
export function ExitGestureDiagram() {
  const reduceMotion = useReducedMotion();
  const [fill] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) {
      fill.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(fill, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true }),
        Animated.delay(700),
        Animated.timing(fill, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [fill, reduceMotion]);

  return (
    <View style={styles.phone} accessibilityLabel="Desenho: dois dedos segurando os cantos de cima da tela">
      {(['left', 'right'] as const).map((side) => (
        <View key={side} style={[styles.dot, { [side]: 10 }]}>
          <Animated.View style={[styles.dotFill, { transform: [{ scale: fill }] }]} />
        </View>
      ))}
      <View style={styles.notch} />
    </View>
  );
}

const styles = StyleSheet.create({
  phone: {
    width: PHONE_W,
    height: PHONE_H,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.inkSoft,
    backgroundColor: colors.background,
    alignSelf: 'center',
  },
  notch: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
  },
  dot: {
    position: 'absolute',
    top: 10,
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 3,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFill: {
    width: DOT - 12,
    height: DOT - 12,
    borderRadius: (DOT - 12) / 2,
    backgroundColor: colors.accent,
  },
});
