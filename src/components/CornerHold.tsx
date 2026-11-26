import { Animated, StyleSheet, View } from 'react-native';

const RING = 56;

type Props = {
  /** 0..1: quanto já segurou. Em 0 fica invisível (a criança não vê nada). */
  progress: Animated.Value;
  cornerSize: number;
};

/**
 * Retorno visual da saída dos pais: um anel em cada canto de cima que vai
 * enchendo enquanto os dois cantos estão pressionados.
 */
export function CornerHold({ progress, cornerSize }: Props) {
  const visible = progress.interpolate({ inputRange: [0, 0.03], outputRange: [0, 1], extrapolate: 'clamp' });
  const fill = { transform: [{ scale: progress }] };
  const offset = (cornerSize - RING) / 2;

  return (
    <>
      {(['left', 'right'] as const).map((side) => (
        <Animated.View
          key={side}
          pointerEvents="none"
          style={[styles.ring, { top: offset, [side]: offset, opacity: visible }]}
        >
          <View style={styles.track} />
          <Animated.View style={[styles.fill, fill]} />
        </Animated.View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    ...StyleSheet.absoluteFill,
    borderRadius: RING / 2,
    borderWidth: 3,
    borderColor: 'rgba(91,58,26,0.35)',
  },
  fill: {
    width: RING - 12,
    height: RING - 12,
    borderRadius: (RING - 12) / 2,
    backgroundColor: 'rgba(91,58,26,0.55)',
  },
});
