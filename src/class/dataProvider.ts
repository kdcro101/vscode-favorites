import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { ResourceType } from "../types";
import { FilesystemResource } from "../types/index";
import { Favorites } from "./favorites";
import { ViewItem } from "./view-item";
import workspace from "./workspace";

export class DataProvider implements vscode.TreeDataProvider<ViewItem> {
    public onDidChangeTreeDataEmmiter = new vscode.EventEmitter<ViewItem | undefined>();
    public readonly onDidChangeTreeData: vscode.Event<ViewItem | undefined> = this.onDidChangeTreeDataEmmiter.event;
    public returnEmpty: boolean = false;

    constructor(private context: vscode.ExtensionContext, private favorites: Favorites) {
    }

    public getParent(element: ViewItem): Thenable<ViewItem> {

        if (element == null) {
            return null;
        }
        return element.getParent();
    }
    public refresh(): void {
        this.onDidChangeTreeDataEmmiter.fire();
    }
    public getTreeItem(item: ViewItem): vscode.TreeItem {
        return item;
    }

    public getChildren(item?: ViewItem): Thenable<ViewItem[]> {
        return new Promise((resolve, reject) => {

            if (this.returnEmpty && !item) {
                resolve([]);
            }

            if (!item) {
                this.getRoot()
                    .then((result) => {

                        resolve(result);
                    })
                    .catch((e) => {
                        reject(e);
                    });

                return;
            }

            if (item.resourceType === ResourceType.Group) {
                this.favorites.groupViewItems(item)
                    .then((result) => {

                        resolve(result);
                    })
                    .catch((e) => {
                        reject(e);
                    });
                return;
            }
            if (item.resourceType === ResourceType.Directory) {
                this.getDirectoryItems(item)
                    .then((result) => {

                        resolve(result);
                    })
                    .catch((e) => reject(e));
                return;
            }

            resolve([]);

        });
    }

    private getDirectoryItems(parentItem: ViewItem): Promise<ViewItem[]> {
        return new Promise((resolve, reject) => {
            const fsPath = parentItem.resourceName;
            const sortDirection = workspace.get("sortDirection");

            fs.readdir(workspace.pathResolve(fsPath), (err, items) => {
                if (err) {
                    resolve([]);
                    return;
                }

                const resolved = items.map((i) => workspace.pathResolve(path.join(fsPath, i)));

                Promise.all(resolved.map((i) => this.favorites.identify(i)))
                    .then((result) => {

                        const typed = resolved.map((p, i) => {
                            const o: FilesystemResource = {
                                path: p,
                                type: result[i],
                            };
                            return o;
                        });

                        const dirs = typed.filter((i) => i.type === ResourceType.Directory);
                        const files = typed.filter((i) => i.type === ResourceType.File);

                        const dirsAZ = dirs.sort((a, b) => {
                            const aBasename = path.basename(a.path).toLocaleLowerCase();
                            const bBasename = path.basename(b.path).toLocaleLowerCase();
                            if (aBasename < bBasename) { return -1; }
                            if (aBasename === bBasename) { return 0; }
                            if (aBasename > bBasename) { return 1; }

                        });
                        const filesAZ = files.sort((a, b) => {
                            const aBasename = path.basename(a.path).toLocaleLowerCase();
                            const bBasename = path.basename(b.path).toLocaleLowerCase();
                            if (aBasename < bBasename) { return -1; }
                            if (aBasename === bBasename) { return 0; }
                            if (aBasename > bBasename) { return 1; }

                        });
                        let fsItems: FilesystemResource[];
                        if (sortDirection === "ASC") {
                            fsItems = dirsAZ.concat(filesAZ);
                        } else {
                            fsItems = dirsAZ.reverse().concat(filesAZ.reverse());
                        }

                        Promise.all(fsItems.map((i) => this.favorites.viewItemForPath(i.path)))
                            .then((views) => {
                                resolve(views);
                                return;
                            })
                            .catch((e) => {
                                reject(e);
                            });

                    })
                    .catch((e) => {
                        reject(e);
                    });

            });

        });
    }
    private getRoot(): Promise<ViewItem[]> {
        return this.favorites.groupViewItems(null);
    }

}
