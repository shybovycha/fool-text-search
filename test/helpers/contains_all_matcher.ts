declare namespace jest {
  interface Matchers<R> {
    toContainAll(...args: any[]): R;
  }
}

expect.extend({
  toContainAll(received: Array<any>, ...args: Array<any>) {
    const notMatched = args.filter(e => !received.includes(e));

    const actual = received.map(e => JSON.stringify(e)).join(', ');
    const expected = args.map(e => JSON.stringify(e)).join(', ');
    const diff = notMatched.map(e => JSON.stringify(e)).join(', ');

    const pass = notMatched.length === 0;

    return {
      message: () =>
        `expected\n\t${actual}\nto contain all elements of\n\t${expected}\nelements not matched:\n\t${diff}`,
      pass
    };
  }
});
