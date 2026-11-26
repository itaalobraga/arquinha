import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, useWindowDimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import * as SplashScreen from 'expo-splash-screen';
import { EASE_OUT, useReducedMotion } from '../motion';
import { colors, fonts } from '../theme';

// Mantém a splash nativa até a animação estar pronta para assumir o lugar dela.
SplashScreen.preventAutoHideAsync().catch(() => {});

const BACKGROUND = '#FFF4D6';
// A splash nativa mostra a arca a 240dp (imageWidth no app.json). O quadro do Lottie
// é 1,5x maior que a imagem nativa, então 360dp deixa o 1º quadro idêntico a ela.
const NATIVE_IMAGE_WIDTH = 240;
const LOTTIE_SIZE = NATIVE_IMAGE_WIDTH * 1.5;
const FADE_MS = 380;
const FAILSAFE_MS = 5000;

type Props = { onDone: () => void };

export function AnimatedSplash({ onDone }: Props) {
  const { width } = useWindowDimensions();
  const size = Math.min(LOTTIE_SIZE, width);
  const reducedMotion = useReducedMotion();
  const lottie = useRef<LottieView>(null);
  const [opacity] = useState(() => new Animated.Value(1));
  const [title] = useState(() => new Animated.Value(0));
  const [titleY] = useState(() => title.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }));
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    SplashScreen.hide();
    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_MS,
      easing: EASE_OUT,
      useNativeDriver: true,
    }).start(() => onDone());
  }, [onDone, opacity]);

  const start = useCallback(() => {
    SplashScreen.hide();
    if (reducedMotion) {
      title.setValue(1);
      setTimeout(finish, 700);
      return;
    }
    lottie.current?.play();
    Animated.timing(title, {
      toValue: 1,
      duration: 500,
      delay: 1100,
      easing: EASE_OUT,
      useNativeDriver: true,
    }).start();
  }, [finish, reducedMotion, title]);

  // Se algo der errado com o Lottie, o app não fica preso na abertura.
  useEffect(() => {
    const t = setTimeout(finish, FAILSAFE_MS);
    return () => clearTimeout(t);
  }, [finish]);

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      <LottieView
        ref={lottie}
        source={require('../../assets/lottie/splash.json')}
        style={{ width: size, height: size }}
        autoPlay={false}
        loop={false}
        resizeMode="contain"
        onAnimationLoaded={start}
        onAnimationFinish={finish}
        onAnimationFailure={finish}
      />
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: title,
            transform: [{ translateY: titleY }],
          },
        ]}
      >
        Arquinha
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Fica abaixo da arca sem empurrar o Lottie do centro (o centro precisa bater com a splash nativa).
  title: {
    position: 'absolute',
    top: '50%',
    marginTop: LOTTIE_SIZE * 0.36,
    fontSize: 46,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
});
