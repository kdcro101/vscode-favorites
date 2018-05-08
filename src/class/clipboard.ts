import * as vscode from "vscode";
import { ClipboardBuffer } from "../types";
import { ViewItem } from "./view-item";

export class Clipboard {
    private static buffer: ClipboardBuffer = null;

    public copy(item: ViewItem) {
        Clipboard.buffer = {
            operation: "copy",
            item,
        };
        vscode.commands.executeCommand("setContext", "clipboard", true);
    }
    public cut(item: ViewItem) {
        Clipboard.buffer = {
            operation: "cut",
            item,
        };
        vscode.commands.executeCommand("setContext", "clipboard", true);
    }
    public reset() {
        Clipboard.buffer = null;
        vscode.commands.executeCommand("setContext", "clipboard", false);
    }
    public get(): ClipboardBuffer {
        return Clipboard.buffer;
    }
}
