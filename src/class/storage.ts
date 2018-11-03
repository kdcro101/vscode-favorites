import * as fs from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";

import { from, Subject } from "rxjs";
import { concatMap, tap } from "rxjs/operators";
import { ResourceType, StoredResource } from "../types";
import workspace from "./workspace";

export class FavoriteStorage {
    public defaultRelativePath = ".favorites.json";
    public storageFilePath: string = null;
    public eventChange = new Subject<void>();
    private eventDestroy = new Subject<void>();

    constructor(context: vscode.ExtensionContext) {

        this.reloadStoragePath();

    }
    public reloadStoragePath() {
        const configRelativePath = workspace.get("storageFilePath");
        const execRelativePath = configRelativePath || this.defaultRelativePath;
        this.storageFilePath = path.join(workspace.getConfigurationRoot(), execRelativePath);
    }
    public get(): Promise<StoredResource[]> {
        return new Promise((resolve, reject) => {

            if (!fs.existsSync(this.storageFilePath)) {
                resolve([]);
                return;
            }

            from(fs.readJson(this.storageFilePath)).pipe(
                concatMap((result) => this.___fixItems(result)),
            ).subscribe((result) => {
                resolve(result);
            }, (e) => {
                console.log(e);
                resolve([] as StoredResource[]);
            });

        });
    }
    public storageName(fromPath?: string) {
        const sp = fromPath == null ? this.storageFilePath : fromPath;
        const e = path.extname(sp);
        const b = path.basename(sp);
        const rx = new RegExp(`${e}$`, "i");
        const out = b.replace(rx, "");

        return out;
    }
    public save(list: StoredResource[], triggerChange: boolean = true): Promise<void> {
        return new Promise((resolve, reject) => {

            const data = !list ? [] : list;

            const dir = path.dirname(this.storageFilePath);

            from(fs.mkdirp(dir)).pipe(
                concatMap(() => fs.writeJson(this.storageFilePath, data, {
                    spaces: 4,
                })),
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

                const wRoot = workspace.workspaceRoot(item.name);
                const wPath = workspace.workspacePath(item.name);

                if (item.fsPath || item.type === ResourceType.Group) {
                    item.workspaceRoot = null;
                    item.workspacePath = null;
                    return item;
                }
                if (wRoot && item.workspaceRoot == null && item.workspacePath == null && item.fsPath == null) {
                    item.workspaceRoot = wRoot;
                    item.workspacePath = wPath;
                    return item;
                }
                if (!wRoot && item.workspaceRoot == null && item.workspacePath == null && item.fsPath == null) {
                    item.fsPath = item.name;
                    item.workspacePath = null;
                    item.workspaceRoot = null;
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
