import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, GestureResponderEvent, StyleSheet, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { randomAnimal, type Animal } from '../animals';
import { playAnimalSound } from '../sounds';
import { AnimalPop } from '../components/AnimalPop';

const MAX_ON_SCREEN = 12;
const BACKGROUNDS = ['#FFF4D6', '#E3F6E8', '#E6F1FF', '#FDE7EF', '#F1EAFE', '#FFEBD9'];

// Saída dos pais: segurar os DOIS cantos de cima ao mesmo tempo por 2 segundos.
export const CORNER_SIZE = 110;
export const CORNER_HOLD_MS = 2000;

type Pop = { key: number; animal: Animal; x: number; y: number };
type Point = { pageX: number; pageY: number };

type Props = { onExit: () => void };

export function PlayScreen({ onExit }: Props) {
  useKeepAwake();
  const { width } = useWindowDimensions();
  const [pops, setPops] = useState<Pop[]>([]);
  const [bg, setBg] = useState(0);
  const nextKey = useRef(0);
  const cornerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          cornerTimer.current = setTimeout(() => {
            cornerTimer.current = null;
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            onExit();
          }, CORNER_HOLD_MS);
        }
      } else if (cornerTimer.current) {
        clearTimeout(cornerTimer.current);
        cornerTimer.current = null;
      }
    },
    [width, onExit],
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setBg((b) => (b + 1) % BACKGROUNDS.length);
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

  return (
    <View
      style={[styles.container, { backgroundColor: BACKGROUNDS[bg] }]}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchChange}
      onTouchEnd={handleTouchChange}
      onTouchCancel={handleTouchChange}
    >
      <StatusBar hidden />
      {pops.map((p) => (
        <AnimalPop key={p.key} animal={p.animal} x={p.x} y={p.y} onDone={() => removePop(p.key)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
