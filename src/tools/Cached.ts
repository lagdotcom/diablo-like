import isDefined from "./isDefined";

export default class Cached<T> {
  computed?: T;

  constructor(private generator: () => T) {}

  get isComputed() {
    return isDefined(this.computed);
  }

  get() {
    const { computed, generator } = this;

    if (isDefined(computed)) return computed;

    const value = generator();
    this.computed = value;
    return value;
  }

  clear() {
    this.computed = undefined;
  }
}
