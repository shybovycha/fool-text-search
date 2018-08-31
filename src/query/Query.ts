import TermMatcher from "./matchers/TermMatcher";

// TODO: add ranking interface
export default class Query {
    constructor(public matchers = new Array<TermMatcher>()) { }

    // TODO: add optional and required clauses
    public addClause(matcher: TermMatcher): Query {
        this.matchers.push(matcher);

        return this;
    }
}
