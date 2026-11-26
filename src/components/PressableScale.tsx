import { useState, type ReactNode } from 'react';
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { EASE_OUT } from '../motion';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  /** Quanto encolhe ao apertar (0.95–0.98). */
  pressedScale?: number;
};

/** Pressable que encolhe de leve ao toque, com transição curta (resposta imediata, sem tranco). */
export function PressableScale({ style, children, pressedScale = 0.97, onPressIn, onPressOut, ...rest }: Props) {
  const [scale] = useState(() => new Animated.Value(1));
  const to = (toValue: number) =>
    Animated.timing(scale, { toValue, duration: 160, easing: EASE_OUT, useNativeDriver: true }).start();

  return (
    <Pressable
      {...rest}
      onPressIn={(e) => {
        to(pressedScale);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        to(1);
        onPressOut?.(e);
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
