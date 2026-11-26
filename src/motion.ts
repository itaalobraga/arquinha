import { useEffect, useState } from 'react';
import { AccessibilityInfo, Easing } from 'react-native';

/** Ease-out forte: começa rápido (resposta imediata) e assenta suave. */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

/** Respeita o "Reduzir movimento" do sistema e acompanha se mudar com o app aberto. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => active && setReduced(value))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);

  return reduced;
}
