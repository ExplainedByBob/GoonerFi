/**
 * Position Manager - Handles leveraged long/short positions
 */

export type PositionType = "long" | "short";

export type Leverage = 2 | 5 | 10 | 20 | 50;

export type Position = {
  id: string;
  modelId: string;
  type: PositionType;
  leverage: Leverage;
  collateral: number; // SOL/USDC amount
  entryPrice: number; // Price when position was opened
  currentPrice: number; // Current market price
  size: number; // Position size = collateral * leverage
  liquidationPrice: number; // Price at which position gets liquidated
  pnl: number; // Profit/Loss in USD
  pnlPercent: number; // PnL as percentage
  openedAt: Date;
};

export class PositionManager {
  private positions: Map<string, Position> = new Map();

  /**
   * Calculate liquidation price for a position
   */
  calculateLiquidationPrice(
    entryPrice: number,
    leverage: Leverage,
    type: PositionType
  ): number {
    // Liquidation happens when loss = collateral
    // For long: liquidationPrice = entryPrice * (1 - 1/leverage)
    // For short: liquidationPrice = entryPrice * (1 + 1/leverage)
    if (type === "long") {
      return entryPrice * (1 - 1 / leverage);
    } else {
      return entryPrice * (1 + 1 / leverage);
    }
  }

  /**
   * Calculate PnL for a position
   */
  calculatePnL(
    entryPrice: number,
    currentPrice: number,
    size: number,
    type: PositionType
  ): { pnl: number; pnlPercent: number } {
    let pnl: number;
    let pnlPercent: number;

    if (type === "long") {
      pnl = (currentPrice - entryPrice) * size;
      pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100;
    } else {
      pnl = (entryPrice - currentPrice) * size;
      pnlPercent = ((entryPrice - currentPrice) / entryPrice) * 100;
    }

    return { pnl, pnlPercent };
  }

  /**
   * Open a new leveraged position
   */
  openPosition(
    modelId: string,
    type: PositionType,
    leverage: Leverage,
    collateral: number,
    entryPrice: number
  ): Position {
    const size = collateral * leverage;
    const liquidationPrice = this.calculateLiquidationPrice(
      entryPrice,
      leverage,
      type
    );

    const position: Position = {
      id: `${modelId}-${Date.now()}`,
      modelId,
      type,
      leverage,
      collateral,
      entryPrice,
      currentPrice: entryPrice,
      size,
      liquidationPrice,
      pnl: 0,
      pnlPercent: 0,
      openedAt: new Date(),
    };

    this.positions.set(position.id, position);
    return position;
  }

  /**
   * Update position with current price and recalculate PnL
   */
  updatePosition(positionId: string, currentPrice: number): Position | null {
    const position = this.positions.get(positionId);
    if (!position) return null;

    const { pnl, pnlPercent } = this.calculatePnL(
      position.entryPrice,
      currentPrice,
      position.size,
      position.type
    );

    position.currentPrice = currentPrice;
    position.pnl = pnl;
    position.pnlPercent = pnlPercent;

    // Check if liquidated
    if (
      (position.type === "long" && currentPrice <= position.liquidationPrice) ||
      (position.type === "short" && currentPrice >= position.liquidationPrice)
    ) {
      this.closePosition(positionId);
      return null; // Position liquidated
    }

    return position;
  }

  /**
   * Close a position
   */
  closePosition(positionId: string): Position | null {
    const position = this.positions.get(positionId);
    if (position) {
      this.positions.delete(positionId);
    }
    return position || null;
  }

  /**
   * Get all positions for a model
   */
  getPositionsByModel(modelId: string): Position[] {
    return Array.from(this.positions.values()).filter(
      (p) => p.modelId === modelId
    );
  }

  /**
   * Get all open positions
   */
  getAllPositions(): Position[] {
    return Array.from(this.positions.values());
  }

  /**
   * Get total PnL across all positions
   */
  getTotalPnL(): number {
    return Array.from(this.positions.values()).reduce(
      (sum, p) => sum + p.pnl,
      0
    );
  }
}
