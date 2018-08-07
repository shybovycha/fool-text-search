namespace FoolTextSearch {
  // abstract class FieldType {
  //     constructor() {}

  //     public isStored(): boolean {}

  //     public isIndexed() : boolean {}
  // }

  // enum FieldType {
  //     STORED_AND_INDEXED,
  //     STORED_NOT_INDEXED,
  //     INDEXED_NOT_STORED,
  // }

  // class FieldDescriptor {
  //     constructor(public name: string, public value: string, public type: FieldType) {}
  // }

  export class Document {
    // public fields: Array<FieldDescriptor>;
    public id: string;

    // TODO: replace the generic "value" with fields & field processing & boolean queries to search among them
    constructor(public value: string) {
      // this.fields = [];
      this.id = UUIDGenerator.generate();
    }

    // public addField(fieldName: string, value: string, type: FieldType) {
    //     this.fields.push(new FieldDescriptor(fieldName, value, type));
    // }
  }

  class TermDescriptor {
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

  class Analyzer {
    constructor() {}

    // TODO: added this to be able to change terms retrieval algorithm
    public getTerms(value: string): Array<string> {
      return value.split(/\W/);
    }
  }

  class UUIDGenerator {
    private static DEFAULT_LENGTH = 32;

    private static dec2hex(dec: number): string {
      return ("0" + dec.toString(16)).substr(-2);
    }

    public static generate(length = UUIDGenerator.DEFAULT_LENGTH): string {
      const arr = new Uint8Array(length / 2);

      window.crypto.getRandomValues(arr);

      return Array.from(arr, UUIDGenerator.dec2hex).join("");
    }
  }

  export interface TermMatcher {
    match(term: string): boolean;
  }

  export class ExactMatcher implements TermMatcher {
    constructor(public query: string) {}

    match(term: string): boolean {
      return term === this.query;
    }
  }

  export class PrefixMatcher implements TermMatcher {
    constructor(public query: string) {}

    match(term: string): boolean {
      return term.startsWith(this.query);
    }
  }

  // TODO: create matchers for compound (boolean), fuzzy, prefix/suffix/postfix matching

  // class FuzzyMatcher implements TermMatcher {
  //     constructor(public query: string, public maxDistance = 2) { }

  //     match(term: string): boolean {
  //         return FuzzyMatcher.distance(term, this.query) <= this.maxDistance;
  //     }

  //     private static distance(term1: string, term2: string): number {
  //         return 0;
  //     }
  // }

  // TODO: add ranking interface
  export class Query {
    constructor(public matchers = new Array<TermMatcher>()) {}

    public addExactClause(term: string) {
      this.addClause(new ExactMatcher(term));
    }

    public addPrefixClause(term: string) {
      this.addClause(new PrefixMatcher(term));
    }

    // TODO: add optional and required clauses
    public addClause(matcher: TermMatcher): Query {
      this.matchers.push(matcher);

      return this;
    }
  }

  export class Index {
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

    public search(query: Query): Set<Document> {
      const matchingDocumentIds = new Set();

      for (let matcher of query.matchers) {
          debugger;
        const matchingIndexTerms = Array.from(this.termDescriptors.keys())
            .filter(term => matcher.match(term));

        matchingIndexTerms
          .map(term => this.termDescriptors.get(term))
          .map(descriptor => Array.from(descriptor.occurrences.keys()).forEach(documentId => matchingDocumentIds.add(documentId)));
      }

      const results = new Set();

      matchingDocumentIds.forEach(documentId => results.add(this.documentById.get(documentId)));

      return results;
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
}

const doc1 = new FoolTextSearch.Document("hello and goodbye");
const doc2 = new FoolTextSearch.Document("goodbye beautiful morning");
const doc3 = new FoolTextSearch.Document("beautiful morning with you");

const index = new FoolTextSearch.Index();

index.index(doc1);
index.index(doc2);
index.index(doc3);

const query1 = new FoolTextSearch.Query();
query1.addExactClause("goodbye");

const query2 = new FoolTextSearch.Query();
query2.addPrefixClause("o");

console.log("searching for `goodbye`:", index.search(query1));
console.log("searching for `o`:", index.search(query2));
