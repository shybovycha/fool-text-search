# Full Text Search engine experiment

## Overview

This is a sample and rather overly-simple implementation of a full text search engine, similar to Lucene, described [here](https://www.youtube.com/watch?v=yst6VQ7Lwpo)

Written in Typescript.

## Building

```
yarn install
yarn build
```

## Using

The core entities of a library are:

* `Document` - contains the **text** _(separate fields are coming soon)_ you want to search for
* `Index` - holds the documents and the information to allow searching for them quickly
* `*Matcher` - defines how a part of a document should be matched against the text you are looking for
* `Query` - contains **search clauses** _(matchers)_

There are a few matchers which come handy:

* `ExactMatcher` - searches for exactly the text passed in
* `PrefixMatcher` - searches for words, starting with the text being passed in
* `LinearLevenshteinMatcher` and `RecursiveLevenshteinMatcher` - match the words taking typos in consideration; the amount of typos is also known as the distance between two strings _(the one you are looking for and the one which is being matched against)_; the classes differ by the distance calculation algorithm implementation only, feel free to compare the performance of both
* `DamerauLevenshteinMatcher` - compared to `*LevenshteinMatcher`, which handles **insertions**, **deletions** or **substitutions** of characters in strings compared, this matcher also handles **transpositioning** _(swapping two neighbour characters)_

Typical workflow when using the library looks like this:

1. create an empty `Index` object
2. create one or more `Document` objects, passing each the text to be indexed
3. index the documents by calling `Index#indexAll(Array<Document>)` or `Index#index(Document)` method
4. create an empty `Query` object
5. add some `*Matcher`s to the `Query` by calling `Query#addClause(TermMatcher)` method
6. call `Index#search(Query)` to obtain a list of `Document`s which match your query

See the following example:

```ts
import Document from "./document/Document";
import Query from "./query/Query";
import Index from "./index/Index";

import DamerauLevenshteinMatcher from "./query/matchers/DamerauLevenshteinMatcher";
import LinearLevenshteinMatcher from "./query/matchers/LinearLevenshteinMatcher";
import RecursiveLevenshteinMatcher from "./query/matchers/RecursiveLevenshteinMatcher";
import PrefixMatcher from "./query/matchers/PrefixMatcher";
import ExactMatcher from "./query/matchers/ExactMatcher";

const doc1 = new Document("hello and goodbye");
const doc2 = new Document("goodbye beautiful morning");
const doc3 = new Document("beautiful morning with you");
const doc4 = new Document("beautiful morning with cats");

const index = new Index();

index.indexAll([doc1, doc2, doc3, doc4]);

const query1 = new Query();
query1.addClause(new ExactMatcher("goodbye"));

const query2 = new Query();
query2.addClause(new PrefixMatcher("o"));

const query3 = new Query();
query3.addClause(new DamerauLevenshteinMatcher("cats"));

const query4 = new Query();
query4.addClause(new LinearLevenshteinMatcher("cats"));

const query5 = new Query();
query5.addClause(new RecursiveLevenshteinMatcher("cats"));

console.log("searching for `goodbye`:", index.search(query1));
console.log("searching for `o`:", index.search(query2));
```

## Testing

The core logic is covered by the functional tests, which you can run using

```
yarn test
```

## TODO

* implement compound queries (handling **AND** and **OR** operations)
* add ranking to the search results
* add sorting functionality (sorting by score or custom comparator / collector)
* implement fields for documents (and refactor the matchers and analyzer and indexer APIs correspondingly)
* bundle the whole thing for browser-ready environment
