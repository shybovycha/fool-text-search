import {
  Document,
  Index,
  Query,
  Matchers,
  UUIDGenerator
} from "../src/FoolTextSearch";

const getRandomValuesMock = jest.fn();

getRandomValuesMock
  .mockReturnValueOnce("id1")
  .mockReturnValueOnce("id2")
  .mockReturnValueOnce("id3")
  .mockReturnValueOnce("id4");

UUIDGenerator.getRandomValues = getRandomValuesMock;

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
        query.addClause(new Matchers.ExactMatcher("goodbye"));
      });

      describe("with PrefixMatcher", () => {
        it("for matching query", () => {
          const query = new Query();
          query.addClause(new Matchers.PrefixMatcher("mo"));

          const results = index.search(query);

          expect(results).toContain(doc2);
          expect(results).toContain(doc3);
          expect(results).toContain(doc4);
        });

        it("for non-matching query", () => {
          const query = new Query();
          query.addClause(new Matchers.PrefixMatcher("o"));

          expect(index.search(query)).toEqual([]);
        });
      });

      it("with DamerauLevenshteinMatcher", () => {
        const query = new Query();
        query.addClause(new Matchers.DamerauLevenshteinMatcher("cast"));

        expect(index.search(query)).toContain(doc4);
      });

      it("with LinearLevenshteinMatcher", () => {
        const query = new Query();
        query.addClause(new Matchers.LinearLevenshteinMatcher("cast"));

        expect(index.search(query)).toContain(doc4);
      });

      it("with RecursiveLevenshteinMatcher", () => {
        const query = new Query();
        query.addClause(new Matchers.RecursiveLevenshteinMatcher("cast"));

        expect(index.search(query)).toContain(doc4);
      });
    });
  });
});
