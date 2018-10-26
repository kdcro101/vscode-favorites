import { fromEventPattern, Subject } from "rxjs";
import { catchError, filter } from "rxjs/operators";
import * as vscode from "vscode";
import { FavoriteStorage } from "./storage";

export class FsWatcher {
    public eventFs = new Subject<void>();
    private watcher: vscode.FileSystemWatcher = null;
    constructor(private storage: FavoriteStorage) {

        this.watcher = vscode.workspace.createFileSystemWatcher("**/*.*", false, false, false);

        fromEventPattern<vscode.Uri>((f) => {
            return this.watcher.onDidCreate(f as any);
        }, (f: any, d: vscode.Disposable) => {
            d.dispose();
        }).pipe(
            filter((e) => e.fsPath !== this.storage.storageFilePath),
            catchError((e, o) => o),
        ).subscribe((e) => {
            this.eventFs.next();
        });

        fromEventPattern<vscode.Uri>((f) => {
            return this.watcher.onDidDelete(f as any);
        }, (f: any, d: vscode.Disposable) => {
            d.dispose();
        }).pipe(
            filter((e) => e.fsPath !== this.storage.storageFilePath),
            catchError((e, o) => o),
        ).subscribe((e) => {
            this.eventFs.next();
        });

        fromEventPattern<vscode.Uri>((f) => {
            return this.watcher.onDidChange(f as any);
        }, (f: any, d: vscode.Disposable) => {
            d.dispose();
        }).pipe(
            filter((e) => e.fsPath !== this.storage.storageFilePath),
            catchError((e, o) => o),
        ).subscribe((e) => {
            this.eventFs.next();
        });
    }
}
