import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import type { Animal, AnimalMotion } from '../animals';
import { EASE_OUT } from '../motion';

const SIZE = 170;
const LIFETIME_MS = 2200;
const EXIT_MS = 260;

type Props = {
  animal: Animal;
  x: number;
  y: number;
  reduceMotion: boolean;
  onDone: () => void;
};

type Values = {
  opacity: Animated.Value;
  scale: Animated.Value;
  exitScale: Animated.Value;
  x: Animated.Value;
  y: Animated.Value;
  sway: Animated.Value; // -1..1, vira rotação (e balanço lateral no flutter)
  squash: Animated.Value; // 0..1, achata o bicho pesado ao cair
};

// Escala inicial de cada jeito: nada surge do nada, mas o pesado já chega "grande".
const START_SCALE: Record<AnimalMotion, number> = {
  bounce: 0.5,
  wiggle: 0.6,
  hop: 0.6,
  flutter: 0.6,
  heavy: 0.85,
};

const SWAY_DEG: Record<AnimalMotion, number> = {
  bounce: 0,
  wiggle: 15,
  hop: 6,
  flutter: 8,
  heavy: 0,
};

const fall = Easing.in(Easing.quad); // gravidade: cai acelerando
const rise = Easing.out(Easing.quad); // sobe desacelerando
const drift = (v: Animated.Value, toValue: number, duration: number) =>
  Animated.timing(v, { toValue, duration, easing: rise, useNativeDriver: true });

function entrance(motion: AnimalMotion, v: Values): Animated.CompositeAnimation {
  const t = (value: Animated.Value, toValue: number, duration: number, easing = EASE_OUT) =>
    Animated.timing(value, { toValue, duration, easing, useNativeDriver: true });

  switch (motion) {
    case 'bounce':
      return Animated.parallel([
        Animated.spring(v.scale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
        drift(v.y, -70, LIFETIME_MS),
      ]);

    case 'wiggle':
      return Animated.parallel([
        Animated.spring(v.scale, { toValue: 1, friction: 5, tension: 140, useNativeDriver: true }),
        Animated.sequence([
          t(v.sway, 1, 110),
          t(v.sway, -0.8, 200, Easing.inOut(Easing.sin)),
          t(v.sway, 0.4, 160, Easing.inOut(Easing.sin)),
          t(v.sway, 0, 140),
        ]),
        drift(v.y, -60, LIFETIME_MS),
      ]);

    case 'hop': {
      const dir = Math.random() < 0.5 ? -1 : 1;
      return Animated.parallel([
        Animated.spring(v.scale, { toValue: 1, friction: 6, tension: 160, useNativeDriver: true }),
        Animated.sequence([
          t(v.y, -90, 230, rise),
          t(v.y, 0, 230, fall),
          t(v.y, -45, 170, rise),
          t(v.y, 0, 170, fall),
          drift(v.y, -40, LIFETIME_MS - 800),
        ]),
        t(v.x, dir * 56, 800, Easing.linear),
        Animated.sequence([t(v.sway, dir, 230), t(v.sway, 0, 400)]),
      ]);
    }

    case 'flutter': {
      const flap = Animated.sequence([
        t(v.sway, 1, 190, Easing.inOut(Easing.sin)),
        t(v.sway, -1, 190, Easing.inOut(Easing.sin)),
      ]);
      return Animated.parallel([
        Animated.spring(v.scale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
        drift(v.y, -150, LIFETIME_MS),
        Animated.loop(flap, { iterations: Math.floor(LIFETIME_MS / 380) }),
      ]);
    }

    case 'heavy':
      return Animated.parallel([
        t(v.scale, 1, 220),
        Animated.sequence([t(v.y, 0, 220, fall), Animated.delay(250), drift(v.y, -30, LIFETIME_MS - 470)]),
        Animated.sequence([
          Animated.delay(220),
          t(v.squash, 1, 80),
          Animated.spring(v.squash, { toValue: 0, friction: 4, tension: 160, useNativeDriver: true }),
        ]),
      ]);
  }
}

export function AnimalPop({ animal, x, y, reduceMotion, onDone }: Props) {
  const { motion } = animal;

  // Valores criados uma vez só (inicialização preguiçosa do useState).
  const [v] = useState<Values>(() => ({
    opacity: new Animated.Value(0),
    scale: new Animated.Value(reduceMotion ? 1 : START_SCALE[motion]),
    exitScale: new Animated.Value(1),
    x: new Animated.Value(0),
    y: new Animated.Value(!reduceMotion && motion === 'heavy' ? -50 : 0),
    sway: new Animated.Value(0),
    squash: new Animated.Value(0),
  }));

  // Guarda o onDone mais recente sem reiniciar a animação quando o pai re-renderiza.
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    const t = (value: Animated.Value, toValue: number, duration: number) =>
      Animated.timing(value, { toValue, duration, easing: EASE_OUT, useNativeDriver: true });

    const anim = reduceMotion
      ? // Reduzir movimento: só aparece e some, sem deslocamento.
        Animated.sequence([t(v.opacity, 1, 200), Animated.delay(LIFETIME_MS - 500), t(v.opacity, 0, 300)])
      : Animated.parallel([
          entrance(motion, v),
          Animated.sequence([
            t(v.opacity, 1, 120),
            Animated.delay(LIFETIME_MS - 120 - EXIT_MS),
            // Saída mais curta que a entrada: some encolhendo de leve.
            Animated.parallel([t(v.opacity, 0, EXIT_MS), t(v.exitScale, 0.85, EXIT_MS)]),
          ]),
        ]);

    anim.start(({ finished }) => finished && onDoneRef.current());
    return () => anim.stop();
  }, [v, motion, reduceMotion]);

  const deg = SWAY_DEG[motion];
  const transform = [
    { translateX: motion === 'flutter' ? Animated.add(v.x, Animated.multiply(v.sway, 10)) : v.x },
    { translateY: v.y },
    { scale: v.scale },
    { scaleX: v.squash.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] }) },
    { scaleY: v.squash.interpolate({ inputRange: [0, 1], outputRange: [1, 0.86] }) },
    { rotate: v.sway.interpolate({ inputRange: [-1, 1], outputRange: [`-${deg}deg`, `${deg}deg`] }) },
    { scale: v.exitScale },
  ];

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { left: x - SIZE / 2, top: y - SIZE / 2, opacity: v.opacity, transform }]}
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
