export default class TermDescriptor {
    // documentId -> [ termIndex ]
    public occurrences: Map<string, Set<number>>;

    constructor(public term: string, documentId: string, termIndex: number) {
        this.occurrences = new Map();

        this.occurrences.set(documentId, new Set([termIndex]));
    }

    public addOccurrence(documentId: string, index: number) {
        let termOccurrences = this.occurrences.get(documentId);

        if (!termOccurrences) {
            termOccurrences = new Set();

            this.occurrences.set(documentId, termOccurrences);
        }

        termOccurrences.add(index);
    }
}
