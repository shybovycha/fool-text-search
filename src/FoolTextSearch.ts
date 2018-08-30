export class UUIDGenerator {
  private static DEFAULT_LENGTH = 32;

  private static dec2hex(dec: number): string {
    return ("0" + dec.toString(16)).substr(-2);
  }

  public static generate(length = UUIDGenerator.DEFAULT_LENGTH): string {
    const arr = UUIDGenerator.getRandomValues(length);

    return Array.from(arr, UUIDGenerator.dec2hex).join("");
  }

  public static getRandomValues(length: number): Array<number> {
    const arr = new Uint8Array(length / 2);

    return Array.from(window.crypto.getRandomValues(arr));
  }
}

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

export namespace Matchers {
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

  abstract class FuzzyMatcher implements TermMatcher {
    constructor(public query: string, public minDistance = 2) {}

    match(term: string): boolean {
      return this.distance(term, this.query) <= this.minDistance;
    }

    protected abstract distance(s1: string, s2: string): number;
  }

  export class RecursiveLevenshteinMatcher extends FuzzyMatcher {
    protected distance(s1: string, s2: string): number {
      return this.levenshteinRec(s1, s1.length, s2, s2.length);
    }

    protected levenshteinRec(
      s1: string,
      i: number,
      s2: string,
      j: number
    ): number {
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
      const d3 =
        this.levenshteinRec(s1, i - 1, s2, j - 1) +
        (s1[i - 1] != s2[j - 1] ? 1 : 0);

      return Math.min(d1, d2, d3);
    }
  }

  export class LinearLevenshteinMatcher extends FuzzyMatcher {
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

  export class DamerauLevenshteinMatcher extends FuzzyMatcher {
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
          const d3 = v0[j] + (s1[i] != s2[j] ? 1 : 0);

          v1[j + 1] = Math.min(d1, d2, d3);

          if (i > 0 && j > 0 && s1[i] == s2[j - 1] && s1[i - 1] == s2[j]) {
            v1[j + 1] = Math.min(v1[j + 1], v0[j] + (s1[i] != s2[j] ? 1 : 0));
          }
        }

        let tmp = v0;
        v0 = v1;
        v1 = tmp;
      }

      return v0[s1.length];
    }
  }
}

// TODO: create matchers for compound (boolean), prefix/suffix/postfix matching

// TODO: add ranking interface
export class Query {
  constructor(public matchers = new Array<Matchers.TermMatcher>()) {}

  // TODO: add optional and required clauses
  public addClause(matcher: Matchers.TermMatcher): Query {
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

  public indexAll(documents: Array<Document>) {
    documents.forEach(doc => this.index(doc));
  }

  public search(query: Query): Array<Document> {
    const matchingDocumentIds = new Set();

    for (let matcher of query.matchers) {
      debugger;
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
