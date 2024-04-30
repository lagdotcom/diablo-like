interface Math {
  /**
   * Returns the angle (in radians) from the X axis to a point.
   * @param y A numeric expression representing the cartesian y-coordinate.
   * @param x A numeric expression representing the cartesian x-coordinate.
   */
  atan2<T extends number>(y: T, x: T): import("./flavours").Radians;

  /**
   * Returns the cosine of a number.
   * @param x A numeric expression that contains an angle measured in radians.
   */
  cos(angle: import("./flavours").Radians): number;

  /**
   * Returns the larger of a set of supplied numeric expressions.
   * @param values Numeric expressions to be evaluated.
   */
  max<T extends number>(...values: T[]): T;

  /**
   * Returns the smaller of a set of supplied numeric expressions.
   * @param values Numeric expressions to be evaluated.
   */
  min<T extends number>(...values: T[]): T;

  /**
   * Returns the sine of a number.
   * @param x A numeric expression that contains an angle measured in radians.
   */
  sin(angle: import("./flavours").Radians): number;
}

interface Window {
  g: import("./Engine").default;
}
