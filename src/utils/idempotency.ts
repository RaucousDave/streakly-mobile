/**
 * Idempotency keys let the sync worker replay a queued completion as many
 * times as the network demands without creating duplicate check-ins.
 */
export function newIdempotencyKey(): string {
  const cryptoRef = globalThis.crypto as Crypto | undefined;

  if (cryptoRef?.randomUUID) {
    return cryptoRef.randomUUID();
  }

  const random = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
  return `${random()}-${random()}-4${random().slice(1)}-${random()}-${random()}${random()}`;
}
