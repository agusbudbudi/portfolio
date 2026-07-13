// Coalesces overlapping calls to the same async action into one in-flight
// promise — used by admin store load() actions so React 19 StrictMode's
// double-invoked effects, plus independent mount points (e.g. a dashboard
// shell prefetch + a tab's own load), don't each fire a separate fetch.
//
// Leading+trailing: a call that arrives while one is already in flight
// doesn't just reuse that promise's (possibly stale) result — it flags a
// rerun, so the wrapped fn() is invoked again immediately after the current
// call settles. This matters for store actions that call load() right after
// a mutation (create/update/remove) to refresh their list: without the
// rerun, that refresh could silently coalesce onto an older load() that
// started before the mutation and not reflect it.
export interface InFlightHolder<T> {
  promise: Promise<T> | null;
  rerun: boolean;
}

export function dedupeInFlight<T>(holder: InFlightHolder<T>, fn: () => Promise<T>): Promise<T> {
  if (holder.promise) {
    holder.rerun = true;
    return holder.promise;
  }

  const run = (): Promise<T> => {
    holder.rerun = false;
    return fn().then(
      (result): Promise<T> | T => (holder.rerun ? run() : ((holder.promise = null), result)),
      (err) => {
        holder.promise = null;
        throw err;
      }
    );
  };

  holder.promise = run();
  return holder.promise;
}
