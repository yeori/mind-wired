import { ISnapLineResolver } from "./snap-target-resolver";

export class CompositeSnapResolver implements ISnapLineResolver {
  constructor(readonly resolvers: ISnapLineResolver[]) {}
  resolveLines(hLines: Set<number>, vLines: Set<number>): void {
    this.resolvers.forEach((resolver) => {
      resolver.resolveLines(hLines, vLines);
    });
  }
}
