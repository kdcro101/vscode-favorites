import { fromEventPattern, merge, Subject } from "rxjs";
import { catchError, debounceTime, filter, map, takeUntil } from "rxjs/operators";
import * as vscode from "vscode";
import { Global } from "./global";
import { FavoriteStorage } from "./storage";

export interface FileSystemEvent {
    type: "change" | "create" | "delete";
    fsPath: string;
}

export class FsWatcher {
    public eventFs = new Subject<void>();
    private watcher: vscode.FileSystemWatcher = null;
    constructor(private storage: FavoriteStorage) {

        this.watcher = vscode.workspace.createFileSystemWatcher("**/*.*", false, false, false);
        merge<FileSystemEvent>(
            fromEventPattern<vscode.Uri>((f) => {
                return this.watcher.onDidCreate(f as any);
            }, (f: any, d: vscode.Disposable) => {
                d.dispose();
            }).pipe(map((e) => {
                return {
                    fsPath: e.fsPath,
                    type: "create",
                } as FileSystemEvent;
            })),
            fromEventPattern<vscode.Uri>((f) => {
                return this.watcher.onDidDelete(f as any);
            }, (f: any, d: vscode.Disposable) => {
                d.dispose();
            }).pipe(map((e) => {
                return {
                    fsPath: e.fsPath,
                    type: "delete",
                } as FileSystemEvent;
            })),
            fromEventPattern<vscode.Uri>((f) => {
                return this.watcher.onDidChange(f as any);
            }, (f: any, d: vscode.Disposable) => {
                d.dispose();
            }).pipe(map((e) => {
                return {
                    fsPath: e.fsPath,
                    type: "change",
                } as FileSystemEvent;
            })),
        ).pipe(
            takeUntil(Global.eventDeactivate),
            filter((e) => e.fsPath !== this.storage.storageFilePath),
            debounceTime(1000),
            catchError((e, o) => o),
        ).subscribe((e) => {
            this.eventFs.next();
        });

    }
}
