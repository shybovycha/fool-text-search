export default class UUIDGenerator {
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
