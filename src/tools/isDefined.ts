export default function isDefined<T>(object?: T): object is T {
  return typeof object !== "undefined";
}
