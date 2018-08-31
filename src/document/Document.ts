import UUIDGenerator from "./UUIDGenerator";

export default class Document {
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
