
import * as path from "path";
import { take } from "rxjs/operators";
import * as vscode from "vscode";
import { ResourceType } from "../types/index";
import { Favorites } from "./favorites";

export type ViewItemContextValue = "FAVORITE_GROUP" | "FAVORITE_DIRECTORY" | "FAVORITE_FILE" | "FS_DIRECTORY" | "FS_FILE";

export class ViewItem extends vscode.TreeItem {
    public static favorites: Favorites;
    public static context: vscode.ExtensionContext;

    public resourceUri: vscode.Uri;
    public groupName: string;
    public parentViewItem: ViewItem = null;

    constructor(
        public label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public value: string,
        public contextValue: ViewItemContextValue,
        public resourceName: string,
        public resourceType: ResourceType,
        public icon?: string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri },
        public command?: vscode.Command,
        public id?: string,
        public parentId?: string,
        public tooltipText?: string,
    ) {
        super(label, collapsibleState);

        this.resourceUri = vscode.Uri.file(value);
        this.tooltip = value;
        this.iconPath = icon;
        this.tooltip = tooltipText;
    }
    public get isFavorite() {
        return this.contextValue === "FAVORITE_DIRECTORY" || this.contextValue === "FAVORITE_FILE";
    }
    public getParent(): Promise<ViewItem> {

        if (
            this.contextValue === "FAVORITE_DIRECTORY" ||
            this.contextValue === "FAVORITE_FILE" ||
            this.contextValue === "FAVORITE_GROUP"
        ) {

            if (this.parentId == null) {
                return null;
            }

            return this.getParentForFavorite(this.parentId);

        }

        return new Promise((resolve, reject) => {

            ViewItem.favorites.get()
                .then((stored) => {

                    this.getParentForFs(this.resourceUri.fsPath)
                        .then((result) => {

                            return Promise.all([
                                ViewItem.favorites.isPartOfFavorites(result.resourceUri.fsPath),
                                result,
                            ]);

                        }).then((res) => {

                            const check = res[0];
                            const item = res[1];

                            if (check) {
                                resolve(item);
                            } else {
                                resolve(null);
                            }

                        }).catch((e) => {
                            reject(e);
                        });

                }).catch((e) => {
                    reject(e);
                });

        });
    }
    private getParentForFs(fsPath: string): Promise<ViewItem> {
        return new Promise((resolve, reject) => {
            ViewItem.favorites.stateList.pipe(
                take(1),
            ).subscribe((list) => {

                const dir = path.dirname(fsPath);
                const sr = list.find((i) => i.name === dir && i.type === ResourceType.Directory);

                if (sr != null) {
                    const vi = ViewItem.favorites.asViewItem(sr);
                    resolve(vi);
                    return;
                }

                const pvi = ViewItem.favorites.viewItemForPath(dir);
                resolve(pvi);

            }, (e) => {
                reject(e);
            });
        });
    }
    private getParentForFavorite(parentId: string): Promise<ViewItem> {
        return new Promise((resolve, reject) => {
            ViewItem.favorites.stateList.pipe(
                take(1),
            ).subscribe((list) => {

                const p = list.find((item) => item.id === parentId);
                const vi = ViewItem.favorites.asViewItem(p);
                resolve(vi);
            }, (e) => {
                reject(e);
            });
        });
    }
}
