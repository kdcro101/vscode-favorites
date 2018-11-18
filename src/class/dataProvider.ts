import * as vscode from "vscode";
import { Favorites } from "./favorites";
import { FavoritesBrowser } from "./favorites-browser";
import { ViewItem } from "./view-item";

export class DataProvider implements vscode.TreeDataProvider<ViewItem> {
    public onDidChangeTreeDataEmmiter = new vscode.EventEmitter<ViewItem | undefined>();
    public readonly onDidChangeTreeData: vscode.Event<ViewItem | undefined> = this.onDidChangeTreeDataEmmiter.event;
    public returnEmpty: boolean = false;
    private browser: FavoritesBrowser = null;

    constructor(private favorites: Favorites) {
        this.browser = new FavoritesBrowser(favorites);
    }

    public getParent(item: ViewItem): Thenable<ViewItem> {
        return this.browser.getParent(item);
    }
    public refresh(): void {
        this.onDidChangeTreeDataEmmiter.fire();
    }
    public getTreeItem(item: ViewItem): vscode.TreeItem {
        return item;
    }

    public getChildren(item?: ViewItem): Thenable<ViewItem[]> {
        if (this.returnEmpty) {
            return Promise.resolve([]);
        }
        return this.browser.getChildren(item);
    }

}
