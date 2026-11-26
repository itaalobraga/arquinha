import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { ANIMALS } from './animals';

// Cada bicho tem alguns players "armados": já carregados e parados no início do som.
// O toque só chama play(), sem esperar seek — isso evita atraso e som que não sai.
const PLAYERS_PER_ANIMAL = 2;

type Slot = { player: AudioPlayer; ready: boolean; startedAt: number };
const pools = new Map<string, Slot[]>();

function rearm(slot: Slot) {
  slot.player.pause();
  slot.player
    .seekTo(0, 0, 0)
    .then(() => {
      slot.ready = true;
    })
    .catch(() => {
      slot.ready = true;
    });
}

export async function setupSounds() {
  await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' });
  for (const animal of ANIMALS) {
    if (pools.has(animal.id)) continue;
    const slots: Slot[] = [];
    for (let i = 0; i < PLAYERS_PER_ANIMAL; i++) {
      const player = createAudioPlayer(animal.sound, { updateInterval: 100 });
      const slot: Slot = { player, ready: true, startedAt: 0 };
      player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) rearm(slot);
      });
      slots.push(slot);
    }
    pools.set(animal.id, slots);
  }
}

export function playAnimalSound(id: string) {
  const slots = pools.get(id);
  if (!slots) {
    // Sons ainda não preparados (ex.: recarga do código em desenvolvimento).
    setupSounds().catch(() => {});
    return;
  }

  const free = slots.find((s) => s.ready && s.player.isLoaded);
  if (free) {
    free.ready = false;
    free.startedAt = Date.now();
    free.player.play();
    return;
  }

  // Todos tocando: reinicia o que começou há mais tempo.
  const oldest = slots.reduce((a, b) => (a.startedAt <= b.startedAt ? a : b));
  oldest.ready = false;
  oldest.startedAt = Date.now();
  oldest.player.pause();
  oldest.player
    .seekTo(0, 0, 0)
    .catch(() => {})
    .finally(() => oldest.player.play());
}
