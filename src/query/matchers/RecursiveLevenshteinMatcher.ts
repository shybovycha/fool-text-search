import FuzzyMatcher from "./FuzzyMatcher";

export default class RecursiveLevenshteinMatcher extends FuzzyMatcher {
  protected distance(s1: string, s2: string): number {
    return this.levenshteinRec(s1, s1.length, s2, s2.length);
  }

  protected levenshteinRec(s1: string, i: number, s2: string, j: number): number {
    if (!i) {
      return j;
    }

    if (!j) {
      return i;
    }

    if (s1[i - 1] == s2[j - 1]) {
      return this.levenshteinRec(s1, i - 1, s2, j - 1);
    }

    const d1 = this.levenshteinRec(s1, i - 1, s2, j) + 1;
    const d2 = this.levenshteinRec(s1, i, s2, j - 1) + 1;
    const d3 = this.levenshteinRec(s1, i - 1, s2, j - 1) + (s1[i - 1] != s2[j - 1] ? 1 : 0);

    return Math.min(d1, d2, d3);
  }
}
