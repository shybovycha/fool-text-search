import Document from "../document/document";
import TermDescriptor from "../document/TermDescriptor";
import Analyzer from "../document/Analyzer";
import Query from "../query/Query";

export default class Index {
    private termDescriptors: Map<string, TermDescriptor>; // term -> descriptor
    private documentById: Map<string, Document>; // documentId -> document
    private analyzer: Analyzer;

    constructor() {
        this.termDescriptors = new Map();
        this.documentById = new Map();
        this.analyzer = new Analyzer();
    }

    public index(document: Document) {
        const terms = this.analyzer.getTerms(document.value);

        this.processTerms(document.id, terms);

        this.documentById.set(document.id, document);
    }

    public indexAll(documents: Array<Document>) {
        documents.forEach(doc => this.index(doc));
    }

    public search(query: Query): Array<Document> {
        const matchingDocumentIds = new Set();

        for (let matcher of query.matchers) {
            const matchingIndexTerms = Array.from(this.termDescriptors.keys()).filter(
                term => matcher.match(term)
            );

            matchingIndexTerms
                .map(term => this.termDescriptors.get(term))
                .map(descriptor =>
                    Array.from(descriptor.occurrences.keys()).forEach(documentId =>
                        matchingDocumentIds.add(documentId)
                    )
                );
        }

        const results = new Set();

        matchingDocumentIds.forEach(documentId =>
            results.add(this.documentById.get(documentId))
        );

        return Array.from(results);
    }

    private processTerms(documentId: string, terms: Array<string>) {
        // not using functional interfaces here for better performance
        for (let termIndex = 0; termIndex < terms.length; termIndex++) {
            const term = terms[termIndex];

            let termDescriptor: TermDescriptor;

            if (!this.termDescriptors.has(term)) {
                termDescriptor = new TermDescriptor(term, documentId, termIndex);
            } else {
                termDescriptor = this.termDescriptors.get(term);
                termDescriptor.addOccurrence(documentId, termIndex);
            }

            this.termDescriptors.set(term, termDescriptor);
        }

        // TODO: eliminate terms, which occur in 75%+ of documents
    }
}
