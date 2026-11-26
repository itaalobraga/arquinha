import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import type { Animal } from '../animals';

const SIZE = 170;
const LIFETIME_MS = 2200;

type Props = {
  animal: Animal;
  x: number;
  y: number;
  onDone: () => void;
};

export function AnimalPop({ animal, x, y, onDone }: Props) {
  // Valores de animação criados uma vez só (inicialização preguiçosa do useState).
  const [{ scale, opacity, lift, wiggle, rotate }] = useState(() => {
    const wiggleValue = new Animated.Value(0);
    return {
      scale: new Animated.Value(0),
      opacity: new Animated.Value(1),
      lift: new Animated.Value(0),
      wiggle: wiggleValue,
      rotate: wiggleValue.interpolate({ inputRange: [-1, 1], outputRange: ['-15deg', '15deg'] }),
    };
  });

  // Guarda o onDone mais recente sem reiniciar a animação quando o pai re-renderiza.
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(wiggle, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: -1, duration: 240, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: 0, duration: 120, useNativeDriver: true }),
      ]),
      Animated.timing(lift, {
        toValue: -80,
        duration: LIFETIME_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(LIFETIME_MS - 600),
        Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ]);
    anim.start(({ finished }) => finished && onDoneRef.current());
    return () => anim.stop();
  }, [scale, opacity, lift, wiggle]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          left: x - SIZE / 2,
          top: y - SIZE / 2,
          opacity,
          transform: [{ translateY: lift }, { scale }, { rotate }],
        },
      ]}
    >
      <Text style={styles.emoji}>{animal.emoji}</Text>
      <Text style={styles.name}>{animal.name}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: SIZE,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 88,
    lineHeight: 104,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#5B3A1A',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
