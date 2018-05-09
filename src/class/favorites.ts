import * as fs from "fs";

import * as _ from "lodash";

import * as path from "path";
import * as vscode from "vscode";
import { GroupQuickPick, ResourceType, StoredResource } from "../types/index";
import { ViewItem } from "./view-item";
import workspace from "./workspace";

export class Favorites {
    constructor(private context: vscode.ExtensionContext) {

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
                const n = _.cloneDeep(o);
                delete n.label;

                n.id = this.generateId();
                n.workspacePath = workspace.pathForWorkspace(absPath);

                all.push(n);
                return this.save(all);

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
                    resolve();
                    return;
                }

                return this.identify(itemPath);

            }).then((t) => {

                const o = this.createResource(groupId, itemPath, t);
                all.push(o);
                return workspace.save("root", all);

            }).then(() => {
                resolve();
            }).catch((e) => {
                reject(e);
            });

        });
    }
    public removePathFromGroup(groupName: string, itemPath: string) {
        return new Promise((resolve, reject) => {

            Promise.all([
                this.get(),
                this.hasGroup(groupName),
            ])
                .then((result) => {
                    const all = result[0];
                    const has = result[1];

                    if (!has) {
                        resolve();
                        return;
                    }
                    const rPath = itemPath;
                    const index = all.findIndex((i) => i.name === groupName && i.type === ResourceType.Group);
                    const oPaths = all[index].contents ? all[index].contents : [];

                    if (!oPaths.find((i) => i === rPath)) {
                        resolve();
                        return;
                    }

                    const newPaths = oPaths.filter((i) => i !== rPath);

                    all[index].contents = newPaths.filter((i) => i.trim() !== "");

                    return workspace.save("root", all);

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
                return workspace.save("root", all);

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
                return workspace.save("root", all);

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

                const o = this.createResource(parent_id, name, ResourceType.Group);
                const newList: StoredResource[] = all.concat([o]);

                return workspace.save("root", newList);

            }).then(() => {
                resolve();
            }).catch((e) => {
                reject(e);
            });

        });
    }
    public removeGroup(name: string) {
        return new Promise((resolve, reject) => {

            this.get()
                .then((all) => {

                    const index = all.findIndex((i) => {
                        return i.name === name && i.type === ResourceType.Group;
                    });

                    if (index < 0) {
                        resolve();
                        return;
                    }

                    all.splice(index, 1);

                    workspace.save("root", all)
                        .then(() => {
                            resolve();
                        }).catch((e) => {
                            reject(e);
                        });

                })
                .catch((e) => {
                    reject(e);
                });

        });
    }

    public get(): Promise<StoredResource[]> {
        return new Promise((resolve, reject) => {
            const resources = workspace.get("root") as StoredResource[];
            const shouldAddId: boolean = resources.find((i) => i.id == null) == null ? false : true;
            const shouldConvertPath: boolean = resources.filter((i) => {
                return (i.type === ResourceType.Directory || i.type === ResourceType.File) && i.workspacePath == null;
            }).length === 0 ? false : true;

            if (shouldAddId === false && shouldConvertPath === false) {
                resolve(resources);
                return;
            }

            const proms: Array<Promise<any>> = [];
            if (shouldAddId) {
                resources.forEach((e, i) => {
                    resources[i].id = this.generateId();
                    if (e.contents != null && e.contents.length > 0) {
                        e.contents.forEach((c, ci) => {

                            proms.push(this.identify(c)
                                .then((t) => {
                                    const ce: StoredResource = {
                                        id: this.generateId(),
                                        name: c,
                                        parent_id: resources[i].id,
                                        type: t,
                                    };
                                    resources.push(ce);

                                }));
                        });

                        delete resources[i].contents;
                    }
                });
            }
            if (shouldConvertPath) {
                resources.forEach((e, i) => {
                    if (e.type === ResourceType.Directory || e.type === ResourceType.File) {
                        resources[i].workspacePath = workspace.pathForWorkspace(e.name);
                    }
                });
            }

            Promise.all(proms)
                .then(() => {
                    this.save(resources);
                    resolve(resources);

                }).catch((error) => {
                    console.log(error);
                });

        });
    }
    public save(list: StoredResource[]): Promise<void> {

        return workspace.save("root", list);
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
    public groupViewItems(parentId: string): Promise<ViewItem[]> {
        const enablePreview = vscode.workspace.getConfiguration("workbench.editor").get("enablePreview") as boolean;
        const sortDirection = workspace.get("sortDirection");

        return new Promise((resolve, reject) => {
            Promise.all([
                this.get(),
            ]).then((result) => {
                const all = result[0];
                // tslint:disable-next-line:triple-equals
                const list: StoredResource[] = all.filter((i) => i.parent_id == parentId);

                this.sortStoredResources(list)
                    .then((sorted) => {
                        Promise.all(sorted.map((i) => this.asViewItem(i, this.context)))
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
    public asViewItem(i: StoredResource, context: vscode.ExtensionContext): ViewItem {
        const enablePreview = vscode.workspace.getConfiguration("workbench.editor").get("enablePreview") as boolean;

        let o: ViewItem = null;
        switch (i.type) {
            case ResourceType.File:
                const fPath = workspace.pathAbsolute(i.workspacePath);
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

                break;
            case ResourceType.Directory:
                const dPath = workspace.pathAbsolute(i.workspacePath);
                o = new ViewItem(
                    (i.label != null) ? i.label : path.basename(dPath),
                    vscode.TreeItemCollapsibleState.Collapsed,
                    dPath,
                    "FAVORITE_DIRECTORY",
                    dPath,
                    i.type,
                    null,
                    null,
                    i.id,
                    i.parent_id,
                    (i.label != null) ? `[alias] ${i.name}` : null,
                )
                    ;

                break;
            case ResourceType.Group:
                const iconLight: string = i.iconColor == null ?
                    context.asAbsolutePath(path.join("images", "group_light.svg")) : i.iconPath;
                const iconDark: string = i.iconColor == null ?
                    context.asAbsolutePath(path.join("images", "group_dark.svg")) : i.iconPath;

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
        return o;
    }
    private hasPath(itemPath): Promise<boolean> {
        return new Promise((resolve, reject) => {

            this.get()
                .then((all) => {
                    const item = all
                        .find((i) => i.name === itemPath && (i.type === ResourceType.File || i.type === ResourceType.Directory));

                    if (item) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }

                })
                .catch((e) => {
                    reject(e);
                });

        });
    }
    private hasGroup(name: string): Promise<boolean> {
        return new Promise((resolve, reject) => {

            this.get()
                .then((all) => {
                    const item = all
                        .find((i) => i.name === name && i.type === ResourceType.Group);

                    if (item) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }

                })
                .catch((e) => {
                    reject(e);
                });

        });
    }
    private createResource(parent_id: string, name: string, type: ResourceType): StoredResource {
        const o: StoredResource = {
            type,
            name,
            parent_id,
            id: this.generateId(),
        };

        return o;
    }
    private generateId(): string {
        return _.sampleSize("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 16).join("");
    }

}
