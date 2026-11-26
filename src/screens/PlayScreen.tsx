import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  GestureResponderEvent,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { randomAnimal, type Animal, type AnimalMotion } from '../animals';
import { playAnimalSound } from '../sounds';
import { AnimalPop } from '../components/AnimalPop';
import { ColorRipple } from '../components/ColorRipple';
import { CornerHold } from '../components/CornerHold';
import { EASE_OUT, useReducedMotion } from '../motion';

const MAX_ON_SCREEN = 12;
const BACKGROUNDS = ['#FFF4D6', '#E3F6E8', '#E6F1FF', '#FDE7EF', '#F1EAFE', '#FFEBD9'];

// Saída dos pais: segurar os DOIS cantos de cima ao mesmo tempo por 2 segundos.
export const CORNER_SIZE = 110;
export const CORNER_HOLD_MS = 2000;

// Vibração combina com o peso do bicho.
const HAPTIC: Record<AnimalMotion, Haptics.ImpactFeedbackStyle> = {
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
  flutter: Haptics.ImpactFeedbackStyle.Light,
  hop: Haptics.ImpactFeedbackStyle.Light,
  bounce: Haptics.ImpactFeedbackStyle.Medium,
  wiggle: Haptics.ImpactFeedbackStyle.Medium,
};

type Pop = { key: number; animal: Animal; x: number; y: number };
type Ripple = { key: number; color: string; x: number; y: number };
type Point = { pageX: number; pageY: number };

type Props = { onExit: () => void };

export function PlayScreen({ onExit }: Props) {
  useKeepAwake();
  const reduceMotion = useReducedMotion();
  const { width } = useWindowDimensions();
  const [pops, setPops] = useState<Pop[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [baseColor, setBaseColor] = useState(BACKGROUNDS[0]);
  const colorIndex = useRef(0);
  const nextKey = useRef(0);
  const cornerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [holdProgress] = useState(() => new Animated.Value(0));

  // Android: o botão "voltar" não sai do modo brincadeira.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => {
      sub.remove();
      if (cornerTimer.current) clearTimeout(cornerTimer.current);
    };
  }, []);

  const checkCorners = useCallback(
    (touches: readonly Point[]) => {
      const inLeft = touches.some((t) => t.pageX < CORNER_SIZE && t.pageY < CORNER_SIZE);
      const inRight = touches.some((t) => t.pageX > width - CORNER_SIZE && t.pageY < CORNER_SIZE);

      if (inLeft && inRight) {
        if (!cornerTimer.current) {
          // Enquanto segura: enche devagar e de forma constante.
          Animated.timing(holdProgress, {
            toValue: 1,
            duration: CORNER_HOLD_MS,
            easing: Easing.linear,
            useNativeDriver: true,
          }).start();
          cornerTimer.current = setTimeout(() => {
            cornerTimer.current = null;
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            onExit();
          }, CORNER_HOLD_MS);
        }
      } else if (cornerTimer.current) {
        clearTimeout(cornerTimer.current);
        cornerTimer.current = null;
        // Ao soltar: volta rápido.
        Animated.timing(holdProgress, {
          toValue: 0,
          duration: 200,
          easing: EASE_OUT,
          useNativeDriver: true,
        }).start();
      }
    },
    [width, onExit, holdProgress],
  );

  const handleTouchStart = useCallback(
    (e: GestureResponderEvent) => {
      checkCorners(e.nativeEvent.touches ?? []);
      const changed = e.nativeEvent.changedTouches?.length ? e.nativeEvent.changedTouches : [e.nativeEvent];
      const newPops: Pop[] = changed.map((t) => {
        const animal = randomAnimal();
        playAnimalSound(animal.id);
        return { key: nextKey.current++, animal, x: t.pageX, y: t.pageY };
      });
      Haptics.impactAsync(HAPTIC[newPops[0].animal.motion]).catch(() => {});

      // A nova cor nasce do primeiro dedo deste toque.
      colorIndex.current = (colorIndex.current + 1) % BACKGROUNDS.length;
      const first = newPops[0];
      const ripple = { key: nextKey.current++, color: BACKGROUNDS[colorIndex.current], x: first.x, y: first.y };
      setRipples((prev) => [...prev, ripple]);
      setPops((prev) => [...prev, ...newPops].slice(-MAX_ON_SCREEN));
    },
    [checkCorners],
  );

  const handleTouchChange = useCallback(
    (e: GestureResponderEvent) => checkCorners(e.nativeEvent.touches ?? []),
    [checkCorners],
  );

  const removePop = useCallback((key: number) => {
    setPops((prev) => prev.filter((p) => p.key !== key));
  }, []);

  // Quando um círculo cobre a tela, a cor dele vira o fundo e ele (e os de baixo) saem.
  const settleRipple = useCallback((ripple: Ripple) => {
    setBaseColor(ripple.color);
    setRipples((prev) => prev.filter((r) => r.key > ripple.key));
  }, []);

  return (
    <View
      style={[styles.container, { backgroundColor: baseColor }]}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchChange}
      onTouchEnd={handleTouchChange}
      onTouchCancel={handleTouchChange}
    >
      <StatusBar hidden />
      {ripples.map((r) => (
        <ColorRipple
          key={r.key}
          color={r.color}
          x={r.x}
          y={r.y}
          reduceMotion={reduceMotion}
          onDone={() => settleRipple(r)}
        />
      ))}
      {pops.map((p) => (
        <AnimalPop
          key={p.key}
          animal={p.animal}
          x={p.x}
          y={p.y}
          reduceMotion={reduceMotion}
          onDone={() => removePop(p.key)}
        />
      ))}
      <CornerHold progress={holdProgress} cornerSize={CORNER_SIZE} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
