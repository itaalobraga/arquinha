import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, useWindowDimensions } from 'react-native';
import { EASE_OUT } from '../motion';

export const RIPPLE_MS = 450;

type Props = {
  color: string;
  x: number;
  y: number;
  reduceMotion: boolean;
  onDone: () => void;
};

/** Círculo da nova cor que cresce a partir do dedo até cobrir a tela toda. */
export function ColorRipple({ color, x, y, reduceMotion, onDone }: Props) {
  const { width, height } = useWindowDimensions();
  // Raio até o canto mais distante do toque: garante que cobre a tela inteira.
  const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));

  const [progress] = useState(() => new Animated.Value(0));
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: reduceMotion ? 300 : RIPPLE_MS,
      easing: EASE_OUT,
      useNativeDriver: true,
    });
    anim.start(({ finished }) => finished && onDoneRef.current());
    return () => anim.stop();
  }, [progress, reduceMotion]);

  const motionStyle = reduceMotion
    ? { opacity: progress } // Reduzir movimento: só troca a cor, com fade.
    : { transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.02, 1] }) }] };

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.circle,
        {
          backgroundColor: color,
          left: x - radius,
          top: y - radius,
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
        },
        motionStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  circle: { position: 'absolute' },
});
