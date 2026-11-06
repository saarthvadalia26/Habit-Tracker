/**
 * Drop 6: Offline-First Engine
 * Hand-rolled IndexedDB wrapper — no external dependency.
 *
 * Object stores:
 *   habits       — local mirror of server habits (keyed by id)
 *   habit_logs   — local mirror of logs (keyed by [habit_id, date])
 *   pending_ops  — outbox queue of unsynced writes (auto-increment id)
 */

const DB_NAME = 'habit_tracker_offline';
const DB_VERSION = 1;

// ─── Types ────────────────────────────────────────────────────────────────────

export type PendingOpType = 'toggle' | 'numeric_log';

export interface PendingOp {
  /** Auto-incremented by IndexedDB — undefined before first insert */
  id?: number;
  type: PendingOpType;
  habitId: string;
  date: string; // YYYY-MM-DD
  payload: {
    isCompleted?: boolean;
    numericValue?: number;
    targetValue?: number;
  };
  createdAt: number; // Date.now()
  retryCount: number;
}

export interface LocalHabitLog {
  habit_id: string;
  date: string; // YYYY-MM-DD
  is_completed: boolean;
  numeric_value?: number;
  is_frozen?: boolean;
  synced: boolean;
}

// ─── DB singleton ─────────────────────────────────────────────────────────────

let _db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // habits store
      if (!db.objectStoreNames.contains('habits')) {
        db.createObjectStore('habits', { keyPath: 'id' });
      }

      // habit_logs store — compound key [habit_id, date]
      if (!db.objectStoreNames.contains('habit_logs')) {
        db.createObjectStore('habit_logs', { keyPath: ['habit_id', 'date'] });
      }

      // pending_ops outbox — auto-increment
      if (!db.objectStoreNames.contains('pending_ops')) {
        const ops = db.createObjectStore('pending_ops', {
          keyPath: 'id',
          autoIncrement: true,
        });
        // Index on (habitId, date) for deduplication lookups
        ops.createIndex('by_habit_date', ['habitId', 'date'], { unique: false });
      }
    };

    req.onsuccess = (event) => {
      _db = (event.target as IDBOpenDBRequest).result;
      resolve(_db);
    };

    req.onerror = () => reject(req.error);
  });
}

/** Returns the IDB database, or null if IndexedDB is unavailable (SSR / private mode). */
export async function getDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return null;
  try {
    return await openDB();
  } catch {
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tx(
  db: IDBDatabase,
  stores: string | string[],
  mode: IDBTransactionMode = 'readonly'
): IDBTransaction {
  return db.transaction(stores, mode);
}

function promisify<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ─── pending_ops ─────────────────────────────────────────────────────────────

/**
 * Adds or overwrites a pending op.
 * Deduplication: if an op for the same (habitId, date) already exists,
 * it is replaced by the newer one — only the latest state matters.
 */
export async function addPendingOp(op: Omit<PendingOp, 'id'>): Promise<void> {
  const db = await getDB();
  if (!db) return;

  const t = tx(db, 'pending_ops', 'readwrite');
  const store = t.objectStore('pending_ops');
  const idx = store.index('by_habit_date');

  // Find existing op for this (habitId, date) and delete it first
  const existing: PendingOp[] = await promisify(
    idx.getAll(IDBKeyRange.only([op.habitId, op.date]))
  );
  for (const old of existing) {
    if (old.id != null) store.delete(old.id);
  }

  // Insert the new op (id assigned by IDB)
  store.add({ ...op });

  return new Promise((resolve, reject) => {
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
  });
}

/** Returns all pending ops in insertion order (FIFO). */
export async function getPendingOps(): Promise<PendingOp[]> {
  const db = await getDB();
  if (!db) return [];
  const store = tx(db, 'pending_ops').objectStore('pending_ops');
  return promisify(store.getAll());
}

/** Marks a single op as synced by deleting it from the queue. */
export async function markOpSynced(id: number): Promise<void> {
  const db = await getDB();
  if (!db) return;
  const store = tx(db, 'pending_ops', 'readwrite').objectStore('pending_ops');
  await promisify(store.delete(id));
}

/** Increments retryCount on a failed op. Deletes it after maxRetries. */
export async function incrementOpRetry(id: number, maxRetries = 3): Promise<void> {
  const db = await getDB();
  if (!db) return;

  const t = tx(db, 'pending_ops', 'readwrite');
  const store = t.objectStore('pending_ops');
  const op: PendingOp | undefined = await promisify(store.get(id));
  if (!op) return;

  if (op.retryCount + 1 >= maxRetries) {
    store.delete(id);
  } else {
    store.put({ ...op, retryCount: op.retryCount + 1 });
  }

  return new Promise((resolve, reject) => {
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
  });
}

/** Drops ops older than maxAgeMs (default 72 h — matches server edit window). */
export async function pruneStaleOps(maxAgeMs = 72 * 60 * 60 * 1000): Promise<number> {
  const db = await getDB();
  if (!db) return 0;

  const cutoff = Date.now() - maxAgeMs;
  const ops = await getPendingOps();
  const stale = ops.filter((op) => op.createdAt < cutoff);

  if (stale.length === 0) return 0;

  const t = tx(db, 'pending_ops', 'readwrite');
  const store = t.objectStore('pending_ops');
  for (const op of stale) {
    if (op.id != null) store.delete(op.id);
  }

  return new Promise((resolve, reject) => {
    t.oncomplete = () => resolve(stale.length);
    t.onerror = () => reject(t.error);
  });
}

/** Returns the count of ops currently in the outbox. */
export async function getPendingOpsCount(): Promise<number> {
  const db = await getDB();
  if (!db) return 0;
  const store = tx(db, 'pending_ops').objectStore('pending_ops');
  return promisify(store.count());
}

// ─── habit_logs local mirror ──────────────────────────────────────────────────

/** Reads a single local log entry. Returns undefined if not found. */
export async function getLocalLog(
  habitId: string,
  date: string
): Promise<LocalHabitLog | undefined> {
  const db = await getDB();
  if (!db) return undefined;
  const store = tx(db, 'habit_logs').objectStore('habit_logs');
  return promisify(store.get([habitId, date]));
}

/** Writes (upserts) a local log entry. */
export async function setLocalLog(log: LocalHabitLog): Promise<void> {
  const db = await getDB();
  if (!db) return;
  const store = tx(db, 'habit_logs', 'readwrite').objectStore('habit_logs');
  await promisify(store.put(log));
}

/** Returns all local logs for a given habit. */
export async function getLocalLogsForHabit(habitId: string): Promise<LocalHabitLog[]> {
  const db = await getDB();
  if (!db) return [];
  const store = tx(db, 'habit_logs').objectStore('habit_logs');
  const all: LocalHabitLog[] = await promisify(store.getAll());
  return all.filter((l) => l.habit_id === habitId);
}

// ─── habits local mirror ──────────────────────────────────────────────────────

/** Bulk-writes the habits array to the local mirror (called on SSR hydration). */
export async function hydrateLocalHabits(
  habits: Array<{ id: string; [key: string]: unknown }>
): Promise<void> {
  const db = await getDB();
  if (!db) return;

  const t = tx(db, 'habits', 'readwrite');
  const store = t.objectStore('habits');
  for (const h of habits) {
    store.put(h);
  }

  return new Promise((resolve, reject) => {
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
  });
}
