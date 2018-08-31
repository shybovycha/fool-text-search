import TermMatcher from "./TermMatcher";

export default class ExactMatcher implements TermMatcher {
    constructor(public query: string) { }

    match(term: string): boolean {
        return term === this.query;
    }
}
