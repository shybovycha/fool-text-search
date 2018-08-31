const generate = jest.fn();

generate
  .mockReturnValueOnce("id1")
  .mockReturnValueOnce("id2")
  .mockReturnValueOnce("id3")
  .mockReturnValueOnce("id4");

export default class UUIDGenerator {
  static generate = generate
}
