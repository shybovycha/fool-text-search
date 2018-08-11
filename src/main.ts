import { Document, Index, Query, Matchers } from "./FoolTextSearch";

const doc1 = new Document("hello and goodbye");
const doc2 = new Document("goodbye beautiful morning");
const doc3 = new Document("beautiful morning with you");
const doc4 = new Document("beautiful morning with cats");

const index = new Index();

index.indexAll([doc1, doc2, doc3, doc4]);

const query1 = new Query();
query1.addClause(new Matchers.ExactMatcher("goodbye"));

const query2 = new Query();
query2.addClause(new Matchers.PrefixMatcher("o"));

const query3 = new Query();
query3.addClause(new Matchers.DamerauLevenshteinMatcher("cats"));

const query4 = new Query();
query4.addClause(new Matchers.LinearLevenshteinMatcher("cats"));

const query5 = new Query();
query5.addClause(new Matchers.RecursiveLevenshteinMatcher("cats"));

console.log("searching for `goodbye`:", index.search(query1));
console.log("searching for `o`:", index.search(query2));
