export interface IImage extends Schema {
    title: string;
    contents: Buffer;
    small: Buffer;
    width: number;
    height: number;
}