import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import { FileStat } from "../enum";
import { Item } from "../model";
import { ResourceType } from "../types";
import { FilesystemResource, StoredResource } from "../types/index";
import favorites from "./favorites";
import { ViewItem } from "./view-item";
import workspace from "./workspace";

export class DataProvider implements vscode.TreeDataProvider<ViewItem> {
    public onDidChangeTreeDataEmmiter = new vscode.EventEmitter<ViewItem | undefined>();
    public readonly onDidChangeTreeData: vscode.Event<ViewItem | undefined> = this.onDidChangeTreeDataEmmiter.event;
    public returnEmpty: boolean = false;
    constructor(private context: vscode.ExtensionContext) {
        // vscode.window.onDidChangeActiveTextEditor(() => this.onActiveEditorChanged());
        // vscode.workspace.onDidChangeTextDocument(e => this.onDocumentChanged(e));

        console.log("Treeview constructed");
    }
    public refresh(): void {
        this.onDidChangeTreeDataEmmiter.fire();
    }
    public getTreeItem(item: ViewItem): vscode.TreeItem {
        return item;
    }

    public getChildren(item?: ViewItem): Thenable<ViewItem[]> {
        return new Promise((resolve, reject) => {

            if (this.returnEmpty) {
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
                favorites.groupViewItems(item.resourceName)
                    .then((result) => {
                        resolve(result);

                    })
                    .catch((e) => {
                        reject(e);
                    });
                return;
            }
            if (item.resourceType === ResourceType.Directory) {
               this.getDirectoryItems(item.resourceName)
               .then((views) => {
                   resolve(views);
                })
                .catch((e) => reject(e));
               return;
            }

            resolve([]);
            // return this.getChildrenViewItems(element.value);

        });
    }

    private getDirectoryItems(fsPath: string): Promise<ViewItem[]> {
        return new Promise((resolve, reject) => {

            const sortDirection = workspace.get("sortDirection");

            fs.readdir(workspace.pathResolve(fsPath), (err, items) => {
                if (err) {
                    resolve([]);
                    return;
                }

                const resolved = items.map((i) => workspace.pathResolve(path.join(fsPath, i)));

                Promise.all(resolved.map((i) => favorites.identify(i)))
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

                        Promise.all(fsItems.map((i) => favorites.viewItemForPath(i.path)))
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
        return new Promise((resolve, reject) => {
            favorites.get()
                .then((result) => {

                    const dirs = result.filter((i) => i.type === ResourceType.Directory);
                    const files = result.filter((i) => i.type === ResourceType.File);
                    const groups = result.filter((i) => i.type === ResourceType.Group);

                    const sortDirection = workspace.get("sortDirection");
                    const groupsFirst = workspace.get("groupsFirst");

                    const groupsAZ = groups.sort((a, b) => {
                        const aBasename = a.name;
                        const bBasename = b.name;
                        if (aBasename < bBasename) { return -1; }
                        if (aBasename === bBasename) { return 0; }
                        if (aBasename > bBasename) { return 1; }
                    });

                    const dirsAZ = dirs.sort((a, b) => {
                        const aBasename = path.basename(a.name).toLocaleLowerCase();
                        const bBasename = path.basename(b.name).toLocaleLowerCase();
                        if (aBasename < bBasename) { return -1; }
                        if (aBasename === bBasename) { return 0; }
                        if (aBasename > bBasename) { return 1; }
                    });

                    const filesAZ = files.sort((a, b) => {
                        const aBasename = path.basename(a.name).toLocaleLowerCase();
                        const bBasename = path.basename(b.name).toLocaleLowerCase();
                        if (aBasename < bBasename) { return -1; }
                        if (aBasename === bBasename) { return 0; }
                        if (aBasename > bBasename) { return 1; }

                    });

                    let fsItems: StoredResource[];
                    let groupsPrepared: StoredResource[];

                    if (sortDirection === "ASC") {
                        fsItems = dirsAZ.concat(filesAZ);
                        groupsPrepared = groupsAZ;
                    } else {
                        fsItems = dirsAZ.reverse().concat(filesAZ.reverse());
                        groupsPrepared = groupsAZ.reverse();
                    }
                    let final: StoredResource[];

                    if (groupsFirst) {
                        final = groupsPrepared.concat(fsItems);
                    } else {
                        final = fsItems.concat(groupsPrepared);
                    }

                    const items = final.map((i) => favorites.asViewItem(i, this.context));
                    resolve(items);

                }).catch((e) => {
                    reject(e);
                });
        });
    }
    private getChildrenViewItems(filePath: string): Thenable<ViewItem[]> {
        const sort = vscode.workspace.getConfiguration("favorites").get("sortDirection") as string;

        return new Promise<ViewItem[]>((resolve, reject) => {
            fs.readdir(workspace.pathResolve(filePath), (err, files) => {
                if (err) {
                    return resolve([]);
                }

                this.sortViewItems(files.map((f) => path.join(filePath, f)), sort);
                // .then((data) => this.data2ViewItem(data, "ViewItemChild"))
                // .then(resolve);
            });
        });
    }

    private getSortedFavoriteViewItems(): Thenable<string[]> {
        const ViewItems = workspace.get("ViewItems");
        const sort = vscode.workspace.getConfiguration("favorites").get("sortDirection") as string;

        return this.sortViewItems(ViewItems, sort).then((res) => res.map((r) => r.filePath));
    }

    private sortViewItems(ViewItems: string[], sort: string): Thenable<Item[]> {
        return Promise.all(ViewItems.map((r) => this.getViewItemStat(r))).then((ViewItemStats) => {
            const isAsc = sort === "ASC";

            const dirs = ViewItemStats.filter((i) => i.stat === FileStat.DIRECTORY);
            const files = ViewItemStats.filter((i) => i.stat === FileStat.FILE);

            const dirsAZ = dirs.sort((a, b) => {
                const aBasename = path.basename(a.filePath).toLocaleLowerCase();
                const bBasename = path.basename(b.filePath).toLocaleLowerCase();
                if (aBasename < bBasename) { return -1; }
                if (aBasename === bBasename) { return 0; }
                if (aBasename > bBasename) { return 1; }
            });

            const filesAZ = files.sort((a, b) => {
                const aBasename = path.basename(a.filePath).toLocaleLowerCase();
                const bBasename = path.basename(b.filePath).toLocaleLowerCase();
                if (aBasename < bBasename) { return -1; }
                if (aBasename === bBasename) { return 0; }
                if (aBasename > bBasename) { return 1; }

            });

            if (isAsc) {
                return dirsAZ.concat(filesAZ);
            } else {
                return dirsAZ.reverse().concat(filesAZ.reverse());
            }

        });
    }

    private getViewItemStat(filePath: string): Thenable<Item> {
        return new Promise((resolve) => {
            fs.stat(workspace.pathResolve(filePath), (err, stat: fs.Stats) => {
                if (err) {
                    return resolve({
                        filePath,
                        stat: FileStat.NEITHER,
                    });
                }
                if (stat.isDirectory()) {
                    return resolve({
                        filePath,
                        stat: FileStat.DIRECTORY,
                    });
                }
                if (stat.isFile()) {
                    return resolve({
                        filePath,
                        stat: FileStat.FILE,
                    });
                }
                return resolve({
                    filePath,
                    stat: FileStat.NEITHER,
                });
            });
        });
    }

}
