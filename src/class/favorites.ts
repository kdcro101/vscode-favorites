import * as fs from "fs";
import * as _ from "lodash";
import * as path from "path";
import { from, ReplaySubject, zip } from "rxjs";
import { tap } from "rxjs/operators";
import * as vscode from "vscode";
import { GroupQuickPick, ResourceType, StoredResource } from "../types/index";
import { GroupColor } from "./group-color";
import { FavoriteStorage } from "./storage";
import { ViewItem } from "./view-item";
import workspace from "./workspace";

export class Favorites {
    public stateList = new ReplaySubject<StoredResource[]>(1);
    public groupColor: GroupColor;

    constructor(private context: vscode.ExtensionContext, private storage: FavoriteStorage) {
        this.groupColor = new GroupColor(this, context);
        this.get()
            .then((result) => {
                console.log(`kdcro101.favorites > loaded ${result.length} stored items`);
            }).catch((e) => {
                console.log(e);
            });
    }

    public updateWithPath(id: string, absPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.get(),
            ]).then((results) => {
                const all = results[0];
                const i = all.findIndex((d) => d.id === id);

                if (i < 0) {
                    reject("no_item");
                    return;
                }
                all[i].workspacePath = workspace.pathForWorkspace(absPath);

                return this.save(all);

            }).then(() => {
                resolve();
            }).catch((e) => {
                reject(e);
            });
        });
    }
    public duplicateWithPath(id: string, absPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.get(),
            ]).then((results) => {
                const all = results[0];
                const i = all.findIndex((d) => d.id === id);

                if (i < 0) {
                    reject("no_item");
                    return;
                }
                const o = all[i];

                const workspaceRoot = workspace.workspaceRoot(absPath);
                if (workspaceRoot) {
                    return this.addPathToGroup(o.parent_id, absPath);
                } else {
                    return this.addExternalPathToGroup(o.parent_id, absPath);
                }

            }).then(() => {
                resolve();
            }).catch((e) => {
                reject(e);
            });
        });
    }
    public generateGroupQuickPickList(): Promise<GroupQuickPick[]> {
        return new Promise((resolve, reject) => {

            const out: GroupQuickPick[] = [];

            Promise.all([
                this.get(),
            ]).then((result) => {
                const all = result[0];
                const root = all.filter((i) => i.type === ResourceType.Group && i.parent_id == null);

                const addChildren = (lastDepth: number, parentId: string) => {
                    const children = all.filter((i) => i.type === ResourceType.Group && i.parent_id === parentId);
                    const paddingLen: number = lastDepth + 1;
                    const padding = "".padStart(paddingLen * 2, " ") + "▹";

                    children.forEach((c, i) => {
                        const label = `${padding} ${c.name}`;
                        const o: GroupQuickPick = {
                            id: c.id,
                            label,
                            description: "",
                        };
                        out.push(o);
                        addChildren(lastDepth + 1, c.id);
                    });
                };

                root.forEach((g, i) => {
                    const o: GroupQuickPick = {
                        id: g.id,
                        label: g.name,
                        description: "",
                    };
                    out.push(o);
                    addChildren(0, g.id);
                });

                resolve(out);
            });
        });
    }
    public removeResource(id: string) {
        this.get()
            .then((result) => {

                const toDelete: string[] = [];
                toDelete.push(id);

                const collectChildren = (resourceId: string) => {
                    toDelete.push(resourceId);
                    const cc = result.filter((i) => i.parent_id === resourceId);
                    cc.forEach((sc) => {
                        collectChildren(sc.id);
                    });
                };

                const c = result.filter((i) => i.parent_id === id);

                c.forEach((e) => {
                    collectChildren(e.id);
                });

                const final = result.filter((i) => toDelete.find((x) => x === i.id) == null);

                this.save(final);

            })
            .catch((e) => {
                console.log(e);
            });
    }
    public addExternalPathToGroup(groupId: string, itemPath: string) {
        return new Promise((resolve, reject) => {

            let all: StoredResource[] = null;
            Promise.all([
                this.get(),
            ]).then((result) => {
                all = result[0];

                const groupContents = all.filter((i) => i.parent_id === groupId);
                const hasPath = groupContents.filter((i) => i.type !== ResourceType.Group && i.name === itemPath);

                if (hasPath.length > 0) {
                    resolve();
                    return;
                }

                return this.identify(itemPath);

            }).then((t) => {

                if (t == null) {
                    vscode.window.showErrorMessage(`Unable to identify type of ${itemPath}`);
                    reject("identify_error");
                    return;
                }

                const o = this.createStoredResource(groupId, itemPath, t, true);
                all.push(o);
                return this.save(all);

            }).then(() => {
                resolve();
            }).catch((e) => {
                reject(e);
            });

        });
    }
    public addPathToGroup(groupId: string, itemPath: string) {
        return new Promise((resolve, reject) => {

            let all: StoredResource[] = null;
            Promise.all([
                this.get(),
            ]).then((result) => {
                all = result[0];
                const isMultiRoot = workspace.isMultiRootWorkspace();
                const rPath = isMultiRoot ? itemPath : itemPath.substr(workspace.getSingleRootPath().length + 1);
                const groupContents = all.filter((i) => i.parent_id === groupId);
                const hasPath = groupContents.filter((i) => i.type !== ResourceType.Group && i.name === itemPath);

                if (hasPath.length > 0) {
                    return Promise.resolve("exists");
                }

                return this.identify(itemPath);

            }).then((t: ResourceType) => {

                if ((t as string) === "exists") {
                    vscode.window.showWarningMessage(`${itemPath} already in favorites`);
                    resolve();
                    return;
                }

                if (t == null) {
                    vscode.window.showErrorMessage(`Unable to identify type of ${itemPath}`);
                    reject("identify_error");
                    return;
                }

                const o = this.createStoredResource(groupId, itemPath, t);
                all.push(o);
                return this.save(all);

            }).then(() => {
                resolve();
            }).catch((e) => {
                reject(e);
            });

        });
    }
    public labelModify(id: string, name: string) {
        return new Promise((resolve, reject) => {

            Promise.all([
                this.get(),
            ]).then((result) => {
                const all = result[0];
                const i = all.findIndex((r) => r.id === id);
                if (i === -1) {
                    resolve();
                }
                all[i].label = name;
                return this.save(all);

            }).then(() => {
                resolve();
            }).catch((e) => {
                reject(e);
            });

        });
    }
    public groupRename(id: string, name: string) {
        return new Promise((resolve, reject) => {

            Promise.all([
                this.get(),
            ]).then((result) => {
                const all = result[0];
                const i = all.findIndex((r) => r.id === id);
                if (i === -1) {
                    resolve();
                }
                all[i].name = name;
                return this.save(all);

            }).then(() => {
                resolve();
            }).catch((e) => {
                reject(e);
            });

        });
    }
    public addGroup(parent_id: string, name: string) {
        return new Promise((resolve, reject) => {

            Promise.all([
                this.get(),
            ]).then((result) => {
                const all = result[0];

                const o = this.createStoredResource(parent_id, name, ResourceType.Group);
                const newList: StoredResource[] = all.concat([o]);
                return this.save(newList);

            }).then(() => {
                resolve();
            }).catch((e) => {
                reject(e);
            });

        });
    }
    public get(): Promise<StoredResource[]> {
        return new Promise((resolve, reject) => {

            from(this.storage.get()).pipe(
                tap((list) => this.stateList.next(list)),
            ).subscribe((list) => {
                resolve(list);
            }, (e) => {
                console.log(e);
            });

        });
    }

    public save(list: StoredResource[]): Promise<void> {
        this.stateList.next(list);
        return this.storage.save(list);
    }
    public identify(itemPath: string): Promise<ResourceType> {
        return new Promise((resolve, reject) => {
            fs.stat(workspace.pathResolve(itemPath), (err, stat: fs.Stats) => {

                if (err) {
                    resolve(null);
                    return;
                }

                const isDir = stat.isDirectory();
                const isFile = stat.isFile();

                if (isDir) {
                    resolve(ResourceType.Directory);
                    return;
                }
                if (isFile) {
                    resolve(ResourceType.File);
                    return;
                }

                resolve(null);

            });
        });
    }
    public groupViewItems(parentItem: ViewItem): Promise<ViewItem[]> {

        const parentId = parentItem == null ? null : parentItem.id;

        return new Promise((resolve, reject) => {
            Promise.all([
                this.get(),
            ]).then((result) => {
                const all = result[0];
                // tslint:disable-next-line:triple-equals
                const list: StoredResource[] = all.filter((i) => i.parent_id == parentId)
                    .filter((item) => {
                        if (item.type === ResourceType.Group) {
                            return true;
                        }
                        const checkPath = item.fsPath || path.join(item.workspaceRoot, item.workspacePath);
                        return !workspace.excludeCheck.isExcluded(checkPath);
                    });

                this.sortStoredResources(list)
                    .then((sorted) => {
                        Promise.all(sorted.map((i) => this.asViewItem(i)))
                            .then((views) => {
                                resolve(views);
                            })
                            .catch((e) => {
                                reject(e);
                            });
                    })
                    .catch((e) => {
                        reject(e);
                    });

            }).catch((e) => {
                reject(e);
            });
        });
    }
    public sortStoredResources(list: StoredResource[]): Promise<StoredResource[]> {
        return new Promise((resolve, reject) => {
            try {

                const dirs = list.filter((i) => i.type === ResourceType.Directory);
                const files = list.filter((i) => i.type === ResourceType.File);
                const groups = list.filter((i) => i.type === ResourceType.Group);

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

                resolve(final);
            } catch (e) {
                reject(e);
            }

        });
    }

    public viewItemForPath(fsPath: string): Promise<ViewItem> {
        return new Promise((resolve, reject) => {
            const enablePreview = vscode.workspace.getConfiguration("workbench.editor").get("enablePreview") as boolean;
            Promise.all([this.identify(fsPath)])
                .then((result) => {
                    let o: ViewItem;
                    switch (result[0]) {
                        case ResourceType.File:
                            const fUri = workspace.pathAsUri(fsPath);
                            o = new ViewItem(
                                path.basename(fsPath),
                                vscode.TreeItemCollapsibleState.None,
                                fsPath,
                                "FS_FILE",
                                fsPath,
                                ResourceType.File
                                , null,
                                {
                                    command: "vscode.open",
                                    title: "",
                                    arguments: [fUri, { preview: enablePreview }],
                                },
                            );
                            break;
                        case ResourceType.Directory:
                            o = new ViewItem(
                                path.basename(fsPath),
                                vscode.TreeItemCollapsibleState.Collapsed,
                                fsPath,
                                "FS_DIRECTORY",
                                fsPath,
                                ResourceType.Directory
                                , null);
                            break;
                    }

                    resolve(o);
                })
                .catch((e) => {
                    reject(e);
                });

        });
    }
    public asViewItem(i: StoredResource): ViewItem {
        const enablePreview = vscode.workspace.getConfiguration("workbench.editor").get("enablePreview") as boolean;

        let o: ViewItem = null;
        switch (i.type) {
            case ResourceType.File:

                if (i.fsPath == null) {

                    // const fPath = workspace.pathAbsolute(i.workspacePath);
                    const fPath = path.join(i.workspaceRoot, i.workspacePath);
                    const fUri = workspace.pathAsUri(fPath);
                    o = new ViewItem(
                        (i.label != null) ? i.label : path.basename(i.workspacePath),
                        vscode.TreeItemCollapsibleState.None,
                        fPath,
                        "FAVORITE_FILE",
                        fPath,
                        i.type,
                        null, // NO ICON
                        {
                            command: "vscode.open",
                            title: "",
                            arguments: [fUri, { preview: enablePreview }],
                        },
                        i.id,
                        i.parent_id,
                        (i.label != null) ? `[alias] ${path.basename(i.name)}` : null,
                    );
                } else {
                    const fPath = i.fsPath;
                    const fUri = vscode.Uri.file(fPath);
                    o = new ViewItem(
                        (i.label != null) ? i.label : path.basename(fPath),
                        vscode.TreeItemCollapsibleState.None,
                        fPath,
                        "FAVORITE_FILE",
                        fPath,
                        i.type,
                        null, // NO ICON
                        {
                            command: "vscode.open",
                            title: "",
                            arguments: [fUri, { preview: enablePreview }],
                        },
                        i.id,
                        i.parent_id,
                        (i.label != null) ? `[alias] ${path.basename(i.name)}` : null,
                    );
                }

                break;
            case ResourceType.Directory:

                if (i.fsPath == null) {
                    // const wPath = workspace.pathAbsolute(i.workspacePath);
                    const wPath = path.join(i.workspaceRoot, i.workspacePath);
                    o = new ViewItem(
                        (i.label != null) ? i.label : path.basename(wPath),
                        vscode.TreeItemCollapsibleState.Collapsed,
                        wPath,
                        "FAVORITE_DIRECTORY",
                        wPath,
                        i.type,
                        null,
                        null,
                        i.id,
                        i.parent_id,
                        (i.label != null) ? `[alias] ${i.name}` : null,
                    );

                } else {
                    const fsPath = i.fsPath;
                    o = new ViewItem(
                        (i.label != null) ? i.label : path.basename(fsPath),
                        vscode.TreeItemCollapsibleState.Collapsed,
                        fsPath,
                        "FAVORITE_DIRECTORY",
                        fsPath,
                        i.type,
                        null,
                        null,
                        i.id,
                        i.parent_id,
                        (i.label != null) ? `[alias] ${i.name}` : null,
                    );
                }

                break;
            case ResourceType.Group:
                const iconLight: string = i.iconColor == null ?
                    // this.context.asAbsolutePath(path.join("images", "group_light.svg")) : i.iconPath;
                    this.context.asAbsolutePath(path.join("images", "group_light.svg")) : this.groupColor.getIconPath(i.iconColor);
                const iconDark: string = i.iconColor == null ?
                    // this.context.asAbsolutePath(path.join("images", "group_dark.svg")) : i.iconPath;
                    this.context.asAbsolutePath(path.join("images", "group_dark.svg")) : this.groupColor.getIconPath(i.iconColor);

                o = new ViewItem(
                    i.name,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    i.name,
                    "FAVORITE_GROUP",
                    i.name,
                    i.type,
                    {
                        light: iconLight,
                        dark: iconDark,
                    },
                    null,
                    i.id,
                    i.parent_id,

                );
                break;
        }

        // o.parentViewItem = parentItem;
        return o;
    }

    public isPartOfFavorites(fsPath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {

            if (!fsPath) {
                resolve(false);
                return;
            }

            zip(this.stateList, this.identify(fsPath))
                .subscribe((result) => {
                    const list = result[0];
                    const type = result[1];

                    if (!fsPath || !list || list.length === 0) {
                        resolve(false);
                        return;
                    }

                    let dir: string = "";

                    if (type === ResourceType.Directory) {
                        dir = fsPath;
                    }
                    if (type === ResourceType.File) {
                        dir = path.dirname(fsPath);
                    }

                    const splits = dir.split(path.sep);
                    const findDirect = list.find((sr) => sr.name === dir && sr.type === ResourceType.Directory);

                    if (findDirect) {
                        resolve(true);
                    }
                    let currentDir = dir;
                    for (let i = 0; i < splits.length; i++) {
                        const p = path.join(currentDir, "..");
                        const f = list.find((sr) => sr.name === p && sr.type === ResourceType.Directory);
                        if (f) {
                            resolve(true);
                        }
                        currentDir = p;
                    }

                    resolve(false);

                }, (e) => {
                    reject(e);
                });

        });
    }

    private createStoredResource(parent_id: string, name: string, type: ResourceType, external: boolean = false): StoredResource {
        let o: StoredResource = null;
        switch (type) {
            case ResourceType.Group:
                o = {
                    type,
                    name,
                    parent_id,
                    workspaceRoot: null,
                    workspacePath: null,
                    id: this.generateId(),
                };
                break;
            case ResourceType.Directory:
                if (external) {
                    o = {
                        type,
                        name,
                        parent_id,
                        fsPath: name,
                        workspaceRoot: null,
                        workspacePath: null,
                        id: this.generateId(),
                    };
                } else {
                    o = {
                        type,
                        name,
                        parent_id,
                        // workspacePath: workspace.pathForWorkspace(name),
                        workspaceRoot: workspace.workspaceRoot(name),
                        workspacePath: workspace.workspacePath(name),
                        id: this.generateId(),
                    };

                }
                break;
            case ResourceType.File:
                if (external) {
                    o = {
                        type,
                        name,
                        parent_id,
                        fsPath: name,
                        workspaceRoot: null,
                        workspacePath: null,
                        id: this.generateId(),
                    };
                } else {
                    o = {
                        type,
                        name,
                        parent_id,
                        // workspacePath: workspace.pathForWorkspace(name),
                        workspaceRoot: workspace.workspaceRoot(name),
                        workspacePath: workspace.workspacePath(name),
                        id: this.generateId(),
                    };

                }
                break;
        }

        return o;
    }
    private generateId(): string {
        return _.sampleSize("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 16).join("");
    }
}
