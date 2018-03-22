import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { ResourceType, StoredResource } from "../types/index";
import { ViewItem } from "./view-item";
import workspace from "./workspace";
class Favorites {

    public addPathToGroup(groupName: string, itemPath: string) {
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
                    const rPath = workspace.isMultiRootWorkspace() ? itemPath : itemPath.substr(workspace.getSingleRootPath().length + 1);
                    const index = all.findIndex((i) => i.name === groupName && i.type === ResourceType.Group);
                    const oPaths = all[index].contents ? all[index].contents : [];

                    if (oPaths.find((i) => i === rPath)) {
                        resolve();
                        return;
                    }

                    const newPaths = oPaths.concat([rPath]);

                    all[index].contents = newPaths;

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

    public addGroup(name: string) {
        return new Promise((resolve, reject) => {

            Promise.all([
                this.get(),
                this.hasGroup(name),
            ])
                .then((result) => {
                    const all = result[0];
                    const has = result[1];

                    if (has) {
                        resolve();
                        return;
                    }

                    const o = this.createResource(name, ResourceType.Group);
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
    public addPath(itemPath: string) {
        return new Promise((resolve, reject) => {

            const rPath = workspace.isMultiRootWorkspace() ? itemPath : itemPath.substr(workspace.getSingleRootPath().length + 1);

            Promise.all([
                this.get(),
                this.hasPath(rPath),
                this.identify(itemPath),
            ])
                .then((result) => {
                    const all = result[0];
                    const has = result[1];
                    const type = result[2];

                    if (has) {
                        resolve();
                        return;
                    }
                    if (!type) {
                        vscode.window.showWarningMessage("Can't add path. Item is not file or directory");
                        resolve();
                    }

                    const o = this.createResource(rPath, type);
                    const newList: StoredResource[] = all.concat([o]);

                    return workspace.save("root", newList);

                }).then(() => {
                    resolve();
                }).catch((e) => {
                    reject(e);
                });

        });
    }
    public removePath(itemPath: string) {
        return new Promise((resolve, reject) => {

            this.get()
                .then((all) => {

                    const index = all.findIndex((i) => {
                        return i.name === itemPath && (i.type === ResourceType.File || i.type === ResourceType.Directory);
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

            const old = workspace.get("resources") as string[];
            const resources = workspace.get("root") as StoredResource[];

            if (!old || old.length === 0) {
                resolve(resources);
                return;
            }
            const converted: StoredResource[] = [];
            Promise.all(old.map((i) => this.identify(i)))
                .then((results) => {

                    results.forEach((t, i) => {
                        if (t) {
                            const r = this.createResource(old[i], t);
                            converted.push(r);
                        }
                    });

                    if (converted.length === 0) {
                        workspace.save("resources", []);
                        resolve(resources);
                    } else {
                        const newList: StoredResource[] = resources.concat(converted);
                        this.save(newList)
                            .then((result) => {
                                workspace.save("resources", []);
                                resolve();
                            })
                            .catch((e) => reject(e));
                    }

                })
                .catch((e) => {
                    reject(e);
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
    public groupViewItems(name: string): Promise<ViewItem[]> {
        const enablePreview = vscode.workspace.getConfiguration("workbench.editor").get("enablePreview") as boolean;
        const sortDirection = workspace.get("sortDirection");

        return new Promise((resolve, reject) => {
            Promise.all([
                this.get(),
            ])
                .then((result) => {
                    const all = result[0];
                    const g = all.find((i) => i.name === name && i.type === ResourceType.Group);

                    if (!g.contents || g.contents.length === 0) {
                        resolve([]);
                        return;
                    }

                    const contentsAZ = g.contents.sort((a, b) => {
                        const aBasename = path.basename(a).toLocaleLowerCase();
                        const bBasename = path.basename(b).toLocaleLowerCase();
                        if (aBasename < bBasename) { return -1; }
                        if (aBasename === bBasename) { return 0; }
                        if (aBasename > bBasename) { return 1; }

                    });

                    const contents = sortDirection === "ASC" ? contentsAZ : contentsAZ.reverse();

                    Promise.all(contents.map((i) => this.viewItemForPath(i, "FAVORITE_GROUP_ITEM")))
                        .then((views) => {

                            resolve(views.map((i) => {

                                i.groupName = name;
                                return i;
                            }));

                        })
                        .catch((e) => {
                            reject(e);
                        });

                })
                .catch((e) => {
                    reject(e);
                });
        });
    }
    public viewItemForPath(fsPath: string, context: string): Promise<ViewItem> {
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
                                context,
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
                                context,
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
                const fUri = workspace.pathAsUri(i.name);
                o = new ViewItem(
                    path.basename(i.name),
                    vscode.TreeItemCollapsibleState.None,
                    i.name,
                    "FAVORITE",
                    i.name,
                    i.type,
                    null, // NO ICON
                    {
                        command: "vscode.open",
                        title: "",
                        arguments: [fUri, { preview: enablePreview }],
                    },
                );

                break;
            case ResourceType.Directory:
                o = new ViewItem(
                    path.basename(i.name),
                    vscode.TreeItemCollapsibleState.Collapsed,
                    i.name,
                    "FAVORITE",
                    i.name,
                    i.type);

                break;
            case ResourceType.Group:
                o = new ViewItem(
                    i.name,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    i.name,
                    "FAVORITE_GROUP",
                    i.name,
                    i.type,
                    {
                        light: context.asAbsolutePath(path.join("images", "group_light.svg")),
                        dark: context.asAbsolutePath(path.join("images", "group_dark.svg")),
                    });
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
    private createResource(name: string, type: ResourceType): StoredResource {
        const o: StoredResource = {
            type,
            name,
        };

        if (type === ResourceType.Group) {
            o.contents = [];
        }
        return o;
    }

}

export default new Favorites();
