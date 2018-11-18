import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { FilesystemResource, ResourceType } from "../types";
import { Favorites } from "./favorites";
import { ViewItem } from "./view-item";
import workspace from "./workspace";

export class FavoritesBrowser {
    constructor(private favorites: Favorites) {

    }
    public getChildren(item: ViewItem): Promise<ViewItem[]> {
        return new Promise((resolve, reject) => {

            if (!item) {
                this.favorites.groupViewItems(null)
                .then((result) => {
                    resolve(result);
                }).catch((e) => {
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
                    .catch((e) => {
                        reject(e);
                    });

                return;
            }

            resolve([]);

        });
    }
    public getParent(item: ViewItem): Promise<ViewItem> {
        if (item == null) {
            return null;
        }
        return item.getParent();
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

                const resolved = items.map((i) => workspace.pathResolve(path.join(fsPath, i)))
                    .filter((item) => {
                        return !workspace.excludeCheck.isExcluded(item);
                    });

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
}
