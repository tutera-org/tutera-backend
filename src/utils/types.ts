/**
 * Utility type to create a deep partial version of a given type T.
 * This makes all properties optional, including nested objects.
 * @template T - The type to be made partially optional.
 * @return A new type with all properties of T made optional.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>> // handle arrays of nested objects
    : T[P] extends object
      ? DeepPartial<T[P]> // recurse into nested objects
      : T[P]; // primitive types stay as-is
};
