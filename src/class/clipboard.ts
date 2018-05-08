import { ClipboardBuffer } from "../types";
import { ViewItem } from "./view-item";

export class Clipboard {
    private static buffer: ClipboardBuffer = null;

    public copy(item: ViewItem) {
        Clipboard.buffer = {
            operation: "copy",
            item,
        };
    }
    public cut(item: ViewItem) {
        Clipboard.buffer = {
            operation: "cut",
            item,
        };
    }
    public reset() {
        Clipboard.buffer = null;
    }
    public get(): ClipboardBuffer {
        return Clipboard.buffer;
    }
}
