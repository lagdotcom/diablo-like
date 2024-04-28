import {
  AnimationID,
  AnimationTriggerID,
  Milliseconds,
  Pixels,
  ResourceURL,
  SpriteID,
} from "../flavours";
import XY from "./XY";

export interface SpriteFrame {
  id: SpriteID;
  duration: Milliseconds;
  trigger?: AnimationTriggerID;
}

export interface SpriteAnimation {
  loopTo?: number;
  frames: SpriteFrame[];
  endTrigger?: AnimationTriggerID;
  offset?: XY<Pixels>;
}

export interface SpriteData {
  position: XY<Pixels>;
  size: XY<Pixels>;
}

export interface SpriteSheet {
  url: ResourceURL;
  globalOffset: XY<Pixels>;
  sprites: Record<SpriteID, SpriteData>;
  animations: Record<AnimationID, SpriteAnimation>;
}
