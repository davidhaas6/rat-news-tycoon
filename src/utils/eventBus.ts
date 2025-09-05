type EventMap = {
  openPublish: undefined;
  closePublish: undefined;
  // extend with more UI events as needed, e.g. subscriberPlus: { amount: number }
};

/**
 * Minimal, practical event bus implementation with safe internal storage.
 * We accept a small amount of casting internally to keep the public API typed.
 * This avoids complex generic constraints that cause assignment errors in TS.
 */
type ListenerAny = (payload: any) => void;
const listeners: Partial<Record<keyof EventMap, ListenerAny[]>> = {};

export const bus = {
  on<K extends keyof EventMap>(evt: K, fn: (payload: EventMap[K]) => void) {
    listeners[evt] = listeners[evt] ?? [];
    (listeners[evt] as ListenerAny[]).push(fn as ListenerAny);
    return () => {
      bus.off(evt, fn);
    };
  },

  off<K extends keyof EventMap>(evt: K, fn: (payload: EventMap[K]) => void) {
    listeners[evt] = (listeners[evt] ?? []).filter((l) => l !== (fn as ListenerAny));
  },

  emit<K extends keyof EventMap>(evt: K, payload: EventMap[K]) {
    (listeners[evt] ?? []).slice().forEach((fn) => (fn as (p: EventMap[K]) => void)(payload));
  },
};
