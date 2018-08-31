import FuzzyMatcher from "./FuzzyMatcher";

export default class LinearLevenshteinMatcher extends FuzzyMatcher {
  protected distance(s1: string, s2: string): number {
    let v0 = [];
    let v1 = [];

    for (let i = 0; i <= s1.length; ++i) {
      v0[i] = i;
    }

    for (let i = 0; i < s2.length; ++i) {
      v1[0] = i + 1;

      for (let j = 0; j < s1.length; ++j) {
        const d1 = v0[j + 1] + 1;
        const d2 = v0[j] + 1;
        const d3 = v0[j] + (s1[i] != s2[j]);

        v1[j + 1] = Math.min(d1, d2, d3);
      }

      let tmp = v0;
      v0 = v1;
      v1 = tmp;
    }

    return v0[s1.length];
  }
}
