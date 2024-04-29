import Processor from "../types/Processor";

export default function pipeline<T>(...steps: Processor<T>[]): Processor<T> {
  return (value) => {
    for (const step of steps) value = step(value);
    return value;
  };
}
