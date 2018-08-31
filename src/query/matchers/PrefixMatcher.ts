import TermMatcher from "./TermMatcher";

export default class PrefixMatcher implements TermMatcher {
    constructor(public query: string) { }

    match(term: string): boolean {
        return term.startsWith(this.query);
    }
}
