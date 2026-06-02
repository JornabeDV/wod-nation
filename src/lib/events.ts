// Simple in-memory event emitter for SSE broadcasts
// In production with multiple instances, replace with Redis Pub/Sub

type Listener = (data: string) => void;

const channels = new Map<string, Set<Listener>>();

export function subscribe(competitionId: string, listener: Listener) {
  if (!channels.has(competitionId)) {
    channels.set(competitionId, new Set());
  }
  channels.get(competitionId)!.add(listener);

  return () => {
    channels.get(competitionId)?.delete(listener);
  };
}

export function broadcast(competitionId: string, data: unknown) {
  const listeners = channels.get(competitionId);
  if (!listeners) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  listeners.forEach((listener) => listener(payload));
}
