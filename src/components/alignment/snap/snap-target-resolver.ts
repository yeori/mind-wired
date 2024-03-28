/**
 * When dragging nodes, it's implementations help alignment of them.
 */
export interface ISnapLineResolver {
  /**
   *
   * @param hLines snap lines on axis-Y
   * @param vLines snap lines on axis-X
   */
  resolveLines(hLines: Set<number>, vLines: Set<number>): void;
}
