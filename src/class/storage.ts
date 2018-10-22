import * as fs from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";

import { from, Subject } from "rxjs";
import { tap } from "rxjs/operators";
import { ResourceType, StoredResource } from "../types";
import workspace from "./workspace";

export class FavoriteStorage {
    public defaultRelativePath = ".favorites.json";
    public storageFilePath: string = null;
    public eventChange = new Subject<void>();
    private eventDestroy = new Subject<void>();

    constructor(context: vscode.ExtensionContext) {
        const configRelativePath = workspace.get("storageFilePath");
        const execRelativePath = configRelativePath || this.defaultRelativePath;

        this.storageFilePath = path.join(workspace.getSingleRootPath(), execRelativePath);

        const legacy = workspace.get("root") as StoredResource[];
        const storageFileExists = fs.existsSync(this.storageFilePath);

        if (!storageFileExists && legacy.length && legacy.length > 0) {
            this.convertLegacy(legacy);
        }
    }
    public get(): Promise<StoredResource[]> {
        return new Promise((resolve, reject) => {

            if (!fs.existsSync(this.storageFilePath)) {
                resolve([]);
                return;
            }

            fs.readJson(this.storageFilePath)
                .then((result) => {
                    return this.___fixItems(result);
                })
                .then((result) => {
                    resolve(result as StoredResource[]);
                }).catch((e) => {
                    reject(e);
                });

        });
    }
    public save(list: StoredResource[], triggerChange: boolean = true): Promise<void> {
        return new Promise((resolve, reject) => {

            const data = !list ? [] : list;

            from(fs.writeJson(this.storageFilePath, data, {
                spaces: 4,
            })).pipe(
                tap(() => {
                    if (triggerChange) {
                        this.eventChange.next();
                    }
                }),
            ).subscribe(() => {
                resolve();
            }, (e) => {
                console.log(e);
                reject(e);
            });

        });
    }
    public destroy() {
        this.eventDestroy.next();
    }
    private convertLegacy(list: StoredResource[]) {
        fs.writeJsonSync(this.storageFilePath, list, {
            spaces: 4,
        });
    }
    private ___fixItems(list: StoredResource[]): Promise<StoredResource[]> {
        return new Promise((resolve, reject) => {

            const result = list.map((item) => {
                if (item.fsPath || item.type === ResourceType.Group) {
                    item.workspaceRoot = null;
                    item.workspacePath = null;
                    return item;
                }
                if (item.workspaceRoot == null && item.workspacePath == null && item.fsPath == null) {
                    item.fsPath = item.name;
                    return item;
                }
                if (item.workspaceRoot == null && item.fsPath == null) {
                    const itemFsPath = workspace.pathAbsolute(item.workspacePath || item.name);
                    item.workspaceRoot = workspace.workspaceRoot(itemFsPath);
                    item.workspacePath = workspace.workspacePath(itemFsPath);
                    return item;

                }

                return item;

            });

            this.save(result, false)
                .then(() => {
                    resolve(result);
                }).catch((e) => {
                    reject(e);
                });

        });
    }

}
