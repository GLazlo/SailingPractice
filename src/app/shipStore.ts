import {
  EMPTY_CONTEXT,
  EMPTY_IDENTITY,
  type CallContext,
  type ShipIdentity
} from "../domain/shipIdentity";

// The vessel's own details are shared state: the Calls page uses them now and
// the Ship page will read the same store.
const IDENTITY_KEY = "sailing-practice.ship-identity";
// Situational details belong to the Calls page alone.
const CONTEXT_KEY = "sailing-practice.call-context";

function read<T extends object>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...fallback };
    const parsed = JSON.parse(raw) as Partial<T>;
    return { ...fallback, ...parsed };
  } catch {
    // Private browsing, disabled storage or corrupt JSON: start from blank.
    return { ...fallback };
  }
}

function write(key: string, value: object): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Nothing we can do; the page still works for this session.
  }
}

export function loadIdentity(): ShipIdentity {
  return read(IDENTITY_KEY, EMPTY_IDENTITY);
}

export function saveIdentity(identity: ShipIdentity): void {
  write(IDENTITY_KEY, identity);
}

export function loadCallContext(): CallContext {
  return read(CONTEXT_KEY, EMPTY_CONTEXT);
}

export function saveCallContext(context: CallContext): void {
  write(CONTEXT_KEY, context);
}
