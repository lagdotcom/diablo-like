// https://spin.atomicobject.com/typescript-flexible-nominal-typing/
interface Flavouring<FlavourT> {
  _type?: FlavourT;
}
type Flavour<T, FlavourT> = T & Flavouring<FlavourT>;

export type ButtonIndex = Flavour<number, "ButtonIndex">;
export type Milliseconds = Flavour<number, "Milliseconds">;
export type Pixels = Flavour<number, "Pixels">;
export type PixelsPerMillisecond = Flavour<number, "PixelsPerMillisecond">;
export type Radians = Flavour<number, "Radians">;
export type RequestID = Flavour<number, "RequestID">;

export type Colour = Flavour<string, "Colour">;
