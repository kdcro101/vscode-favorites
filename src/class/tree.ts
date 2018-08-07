import { fromEventPattern, merge, Subject } from "rxjs";
import { filter } from "rxjs/operators";
import * as vscode from "vscode";
import { StoredResource } from "../types/index";
import { Favorites } from "./favorites";
import { ViewItem } from "./view-item";

export class TreeViewManager {
    public visible: boolean = false;
    public activeEditor: vscode.TextEditor = null;
    private eventVisibility = new Subject<boolean>();
    private eventReveal = new Subject<string>();
    private eventActiveEditor = new Subject<vscode.TextEditor>();

    constructor(private treeView: vscode.TreeView<ViewItem>, private context: vscode.ExtensionContext, private favorites: Favorites) {

        this.visible = this.treeView.visible;
        this.activeEditor = vscode.window.activeTextEditor;

        fromEventPattern<vscode.TreeViewVisibilityChangeEvent>((f: (e: any) => any) => {
            return this.treeView.onDidChangeVisibility(f, null, context.subscriptions);
        }, (f: any, d: vscode.Disposable) => {
            d.dispose();
        }).pipe().subscribe((m) => {
            this.visible = m.visible;
            this.eventVisibility.next(m.visible);
        });

        fromEventPattern<vscode.TextEditor>((f: (e: any) => any) => {
            return vscode.window.onDidChangeActiveTextEditor(f, null, context.subscriptions);
        }, (f: any, d: vscode.Disposable) => {
            d.dispose();
        }).pipe().subscribe((m) => {
            console.log(`Active Editor: [${m.document.uri.fsPath}]`);
            this.activeEditor = m;
            this.eventActiveEditor.next(m);
        });

        merge(
            this.eventActiveEditor.pipe(),
            this.eventVisibility.pipe(),
        ).pipe(
            filter(() => {
                return (
                    this.activeEditor != null &&
                    this.activeEditor.document != null &&
                    this.activeEditor.document.uri.fsPath != null
                );
            }),
            filter(() => this.visible === true),
        ).subscribe((editor) => {
            this.reveal(this.activeEditor.document.uri.fsPath);
        });

        this.eventActiveEditor.next(this.activeEditor);
    }
    public reveal(fsPath: string) {
        console.log(`###############################`);
        console.log(`revealing: ${fsPath}`);
        console.log(`###############################`);
        this.favorites.get()
        .then((listOfFavorites: StoredResource[]) => {

        }).catch((e) => {
           console.error(e);
        });
    }
    private revealRecursive() {

    }
}
