/**
 * Type-level mirror of {@link deepFreeze}. Marks every own property
 * readonly, recursing only into plain objects and arrays (object literals
 * and `Object.create(null)` both count). `Date`, `RegExp`, `Map`, `Set`,
 * functions, and other class instances are left as-is, since freezing them
 * wouldn't stop mutation through their own methods anyway.
 */
type DeepReadonly<T> = T extends
  | Date
  | RegExp
  // eslint-disable-next-line typescript/no-explicit-any -- structural check for a built-in we intentionally don't recurse into
  | Map<any, any>
  // eslint-disable-next-line typescript/no-explicit-any -- structural check for a built-in we intentionally don't recurse into
  | Set<any>
  | ((...args: never[]) => unknown)
  ? T
  : T extends readonly (infer Item)[]
    ? readonly DeepReadonly<Item>[]
    : T extends object
      ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
      : T;

/**
 * Freezes `value` and every plain object/array reachable from it. Non-plain
 * values (class instances, `Date`, `Map`, ...) are frozen at their own
 * level but not descended into.
 *
 * Guards against circular references with a `seen` set, so it's safe to
 * call on arbitrary schema output.
 */
const deepFreeze = <T>(value: T, seen = new WeakSet()): DeepReadonly<T> => {
  if (value === null || typeof value !== "object" || seen.has(value)) {
    // eslint-disable-next-line typescript/no-unsafe-type-assertion -- narrowed to a non-object here, so this is just T
    return value as DeepReadonly<T>;
  }

  seen.add(value);

  const isPlainObjectOrArray =
    Array.isArray(value) ||
    Object.getPrototypeOf(value) === Object.prototype ||
    Object.getPrototypeOf(value) === null;

  if (isPlainObjectOrArray) {
    for (const key of Reflect.ownKeys(value)) {
      deepFreeze(Reflect.get(value, key) as unknown, seen);
    }
  }

  // eslint-disable-next-line typescript/no-unsafe-type-assertion -- Object.freeze widens the input type; DeepReadonly<T> can't be proven from it structurally
  return Object.freeze(value) as DeepReadonly<T>;
};

export type { DeepReadonly };
export { deepFreeze };
