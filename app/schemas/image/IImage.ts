export interface IImage extends Schema {
    title: string;
    /**
     * Contains image of type [fileType]
     */
    contents: Buffer;
    /**
     * Always of type 'image/png'
     */
    small: Buffer;
    width: number;
    height: number;
    fileType: string;
}