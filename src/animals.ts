import type { AudioSource } from 'expo-audio';

/**
 * Jeito de cada bicho entrar na tela:
 * - bounce: quica e sobe devagar
 * - wiggle: chacoalha de um lado pro outro
 * - hop: dá dois pulinhos para o lado
 * - flutter: sobe balançando, como quem bate asas
 * - heavy: cai pesado e "amassa" ao tocar o chão
 */
export type AnimalMotion = 'bounce' | 'wiggle' | 'hop' | 'flutter' | 'heavy';

export type Animal = {
  id: string;
  name: string;
  emoji: string;
  motion: AnimalMotion;
  sound: AudioSource;
};

// Gravações reais de animais (Wikimedia Commons, licenças livres).
// Autores e licenças: src/credits.ts — aparecem na tela de créditos.
export const ANIMALS: Animal[] = [
  { id: 'cachorro', name: 'Cachorro', emoji: '🐶', motion: 'bounce', sound: require('../assets/sounds/cachorro.m4a') },
  { id: 'gato', name: 'Gato', emoji: '🐱', motion: 'wiggle', sound: require('../assets/sounds/gato.m4a') },
  { id: 'vaca', name: 'Vaca', emoji: '🐮', motion: 'heavy', sound: require('../assets/sounds/vaca.m4a') },
  { id: 'leao', name: 'Leão', emoji: '🦁', motion: 'heavy', sound: require('../assets/sounds/leao.m4a') },
  { id: 'porco', name: 'Porco', emoji: '🐷', motion: 'bounce', sound: require('../assets/sounds/porco.m4a') },
  { id: 'sapo', name: 'Sapo', emoji: '🐸', motion: 'hop', sound: require('../assets/sounds/sapo.m4a') },
  { id: 'galinha', name: 'Galinha', emoji: '🐔', motion: 'flutter', sound: require('../assets/sounds/galinha.m4a') },
  { id: 'pato', name: 'Pato', emoji: '🦆', motion: 'flutter', sound: require('../assets/sounds/pato.m4a') },
  { id: 'ovelha', name: 'Ovelha', emoji: '🐑', motion: 'bounce', sound: require('../assets/sounds/ovelha.m4a') },
  { id: 'cavalo', name: 'Cavalo', emoji: '🐴', motion: 'hop', sound: require('../assets/sounds/cavalo.m4a') },
  { id: 'elefante', name: 'Elefante', emoji: '🐘', motion: 'heavy', sound: require('../assets/sounds/elefante.m4a') },
  { id: 'macaco', name: 'Macaco', emoji: '🐵', motion: 'hop', sound: require('../assets/sounds/macaco.m4a') },
  { id: 'lobo', name: 'Lobo', emoji: '🐺', motion: 'wiggle', sound: require('../assets/sounds/lobo.m4a') },
  { id: 'passarinho', name: 'Passarinho', emoji: '🐦', motion: 'flutter', sound: require('../assets/sounds/passarinho.m4a') },
];

let lastIndex = -1;

/** Sorteia um bicho, evitando repetir o último. */
export function randomAnimal(): Animal {
  let i = Math.floor(Math.random() * ANIMALS.length);
  if (i === lastIndex) i = (i + 1) % ANIMALS.length;
  lastIndex = i;
  return ANIMALS[i];
}
