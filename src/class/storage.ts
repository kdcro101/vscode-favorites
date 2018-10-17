import * as fs from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";

import { from, Subject } from "rxjs";
import { tap } from "rxjs/operators";
import { StoredResource } from "../types";
import workspace from "./workspace";

export class FavoriteStorage {
    public storageFilename = "favorites.json";
    public storageFilePath: string = null;
    public eventChange = new Subject<void>();
    private eventDestroy = new Subject<void>();

    constructor(context: vscode.ExtensionContext) {

        this.storageFilePath = path.join(workspace.getSingleRootPath(), ".vscode", this.storageFilename);

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
                    resolve(result as StoredResource[]);
                }).catch((e) => {
                    reject(e);
                });

        });
    }
    public save(list: StoredResource[]): Promise<void> {
        return new Promise((resolve, reject) => {

            const data = !list ? [] : list;

            from(fs.writeJson(this.storageFilePath, data, {
                spaces: 4,
            })).pipe(
                tap(() => this.eventChange.next()),
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

}
