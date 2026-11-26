import type { AudioSource } from 'expo-audio';

export type Animal = {
  id: string;
  name: string;
  emoji: string;
  sound: AudioSource;
};

// Gravações reais de animais (Wikimedia Commons, licenças livres).
// Autores e licenças: src/credits.ts — aparecem na tela de créditos.
export const ANIMALS: Animal[] = [
  { id: 'cachorro', name: 'Cachorro', emoji: '🐶', sound: require('../assets/sounds/cachorro.m4a') },
  { id: 'gato', name: 'Gato', emoji: '🐱', sound: require('../assets/sounds/gato.m4a') },
  { id: 'vaca', name: 'Vaca', emoji: '🐮', sound: require('../assets/sounds/vaca.m4a') },
  { id: 'leao', name: 'Leão', emoji: '🦁', sound: require('../assets/sounds/leao.m4a') },
  { id: 'porco', name: 'Porco', emoji: '🐷', sound: require('../assets/sounds/porco.m4a') },
  { id: 'sapo', name: 'Sapo', emoji: '🐸', sound: require('../assets/sounds/sapo.m4a') },
  { id: 'galinha', name: 'Galinha', emoji: '🐔', sound: require('../assets/sounds/galinha.m4a') },
  { id: 'pato', name: 'Pato', emoji: '🦆', sound: require('../assets/sounds/pato.m4a') },
  { id: 'ovelha', name: 'Ovelha', emoji: '🐑', sound: require('../assets/sounds/ovelha.m4a') },
  { id: 'cavalo', name: 'Cavalo', emoji: '🐴', sound: require('../assets/sounds/cavalo.m4a') },
  { id: 'elefante', name: 'Elefante', emoji: '🐘', sound: require('../assets/sounds/elefante.m4a') },
  { id: 'macaco', name: 'Macaco', emoji: '🐵', sound: require('../assets/sounds/macaco.m4a') },
  { id: 'lobo', name: 'Lobo', emoji: '🐺', sound: require('../assets/sounds/lobo.m4a') },
  { id: 'passarinho', name: 'Passarinho', emoji: '🐦', sound: require('../assets/sounds/passarinho.m4a') },
];

let lastIndex = -1;

/** Sorteia um bicho, evitando repetir o último. */
export function randomAnimal(): Animal {
  let i = Math.floor(Math.random() * ANIMALS.length);
  if (i === lastIndex) i = (i + 1) % ANIMALS.length;
  lastIndex = i;
  return ANIMALS[i];
}
