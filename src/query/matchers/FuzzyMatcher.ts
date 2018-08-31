import TermMatcher from "./TermMatcher";

export default abstract class FuzzyMatcher implements TermMatcher {
  constructor(public query: string, public minDistance = 2) {}

  match(term: string): boolean {
    return this.distance(term, this.query) <= this.minDistance;
  }

  protected abstract distance(s1: string, s2: string): number;
}
