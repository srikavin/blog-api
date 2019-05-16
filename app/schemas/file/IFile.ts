export interface IFile extends Schema {
    title: string;
    slug: string;
    contents: Buffer;
    filetype: string;
}