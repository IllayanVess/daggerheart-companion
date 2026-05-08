// components/DiceRoller.types.ts

/**
 * Represents a complete roll result stored in history
 */
export type RollEntry = {
  id: number;               // Unique identifier for the roll
  formula: string;          // Original formula string (e.g., "2d6+1d8+3")
  total: number;            // Final total = sum of all dice rolls + modifier
  modifier: number;         // Numeric modifier added to dice sum
  rolls: number[];          // Flat array of all individual dice results
  diceGroups: DiceGroup[];  // Structured groups of dice (preserves grouping)
  hopeFear?: HopeFearResult; // Special result for 2d12 duality dice (if applicable)
};

/**
 * Represents a single group of dice (e.g., "3d6" = 3 six-sided dice)
 */
export type DiceGroup = {
  count: number;      // Number of dice in this group
  sides: number;      // Number of sides per die
  rolls: number[];    // Actual rolled values for each die
  isDuality?: boolean; // True if this is a 2d12 special "hope/fear" dice pair
  hopeRoll?: number;   // First die value (Hope) for duality dice
  fearRoll?: number;   // Second die value (Fear) for duality dice
  sign: number;       // 1 for positive, -1 for negative
};

/**
 * Result of rolling a duality dice pair (2d12 with special meaning)
 */
export type HopeFearResult = {
  type: 'hope' | 'fear' | 'critical';  // Which force dominated
  hopeValue: number;  // Value of the Hope die (1-12)
  fearValue: number;  // Value of the Fear die (1-12)
};