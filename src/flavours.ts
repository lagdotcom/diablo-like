// https://spin.atomicobject.com/typescript-flexible-nominal-typing/
interface Flavouring<FlavourT> {
  _type?: FlavourT;
}
type Flavour<T, FlavourT> = T & Flavouring<FlavourT>;

export type ButtonIndex = Flavour<number, "ButtonIndex">;
export type Milliseconds = Flavour<number, "Milliseconds">;
export type Pixels = Flavour<number, "Pixels">;
export type Radians = Flavour<number, "Radians">;
export type RequestID = Flavour<number, "RequestID">;
export type WorldU = Flavour<number, "WorldU">;
export type WorldUsPerMillisecond = Flavour<number, "WorldUsPerMillisecond">;

export type AnimationID = Flavour<string, "AnimationID">;
export type AnimationTriggerID = Flavour<string, "AnimationTriggerID">;
export type Colour = Flavour<string, "Colour">;
export type ResourceURL = Flavour<string, "ResourceURL">;
export type SpriteID = Flavour<string, "SpriteID">;
