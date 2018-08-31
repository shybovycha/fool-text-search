export default class Analyzer {
    constructor() { }

    // TODO: added this to be able to change terms retrieval algorithm
    public getTerms(value: string): Array<string> {
        return value.split(/\W/);
    }
}
