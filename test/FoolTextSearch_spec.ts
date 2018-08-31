import "./helpers/contains_all_matcher";

jest.mock("../src/document/UUIDGenerator");

import Document from "../src/document/Document";
import Query from "../src/query/Query";
import Index from "../src/index/Index";

import DamerauLevenshteinMatcher from "../src/query/matchers/DamerauLevenshteinMatcher";
import LinearLevenshteinMatcher from "../src/query/matchers/LinearLevenshteinMatcher";
import RecursiveLevenshteinMatcher from "../src/query/matchers/RecursiveLevenshteinMatcher";
import PrefixMatcher from "../src/query/matchers/PrefixMatcher";
import ExactMatcher from "../src/query/matchers/ExactMatcher";

describe("FoolTextSearch", () => {
  let index;

  let doc1 = new Document("hello and goodbye");
  let doc2 = new Document("goodbye beautiful morning");
  let doc3 = new Document("beautiful morning with you");
  let doc4 = new Document("beautiful morning with cats");

  describe("Index", () => {
    describe("#search", () => {
      beforeEach(() => {
        index = new Index();

        index.indexAll([doc1, doc2, doc3, doc4]);
      });

      it("with ExactMatcher", () => {
        const query = new Query();
        query.addClause(new ExactMatcher("goodbye"));
      });

      describe("with PrefixMatcher", () => {
        it("for matching query", () => {
          const query = new Query();
          query.addClause(new PrefixMatcher("mo"));

          const results = index.search(query);

          expect(results).toContainAll(doc2, doc3, doc4);
        });

        it("for non-matching query", () => {
          const query = new Query();
          query.addClause(new PrefixMatcher("o"));

          expect(index.search(query)).toEqual([]);
        });
      });

      it("with DamerauLevenshteinMatcher", () => {
        const query = new Query();
        query.addClause(new DamerauLevenshteinMatcher("cast"));

        expect(index.search(query)).toContain(doc4);
      });

      it("with LinearLevenshteinMatcher", () => {
        const query = new Query();
        query.addClause(new LinearLevenshteinMatcher("cast"));

        expect(index.search(query)).toContain(doc4);
      });

      it("with RecursiveLevenshteinMatcher", () => {
        const query = new Query();
        query.addClause(new RecursiveLevenshteinMatcher("cast"));

        expect(index.search(query)).toContain(doc4);
      });
    });
  });
});
