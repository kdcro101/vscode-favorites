import * as nconf from "nconf";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import { StoredResource } from "../types/index";

class Workspace {
    public eventEmitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();

    public get(key: string): any {
        const config = vscode.workspace.getConfiguration("favorites");
        const favoriterc = config.get("favoriterc") as boolean;

        if (this.isMultiRootWorkspace() || !favoriterc) {
            return config.get(key) as string[];
        }

        nconf.file({ file: path.resolve(this.getSingleRootPath(), ".favoriterc") });

        return nconf.get(key);
    }

    public save(key: string, value: any): Promise<void> {
        const config = vscode.workspace.getConfiguration("favorites");
        const favoriterc = config.get("favoriterc") as boolean;

        if (this.isMultiRootWorkspace() || !favoriterc) {
            config.update(key, value, false);
            return Promise.resolve();
        }

        nconf.file({ file: path.resolve(this.getSingleRootPath(), ".favoriterc") });

        nconf.set(key, value);

        return new Promise<void>((resolve, reject) => {
            nconf.save((err) => {
                if (err) {
                    return reject(err);
                }
                this.eventEmitter.fire();
                resolve();
            });
        });

    }

    get onDataChange(): vscode.Event<void> {
        return this.eventEmitter.event;
    }
    public getSingleRootPath(): string {
        return vscode.workspace.workspaceFolders[0].uri.fsPath;
    }

    public isMultiRootWorkspace(): boolean {
        return vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 1;
    }
    public storedResourcesWrite(list: StoredResource[]): Promise<void> {
        const config = vscode.workspace.getConfiguration("root");
        this.save("root", list);
        return Promise.resolve();
    }

    public pathResolve(filePath: string) {
        if (this.isMultiRootWorkspace()) {
            return filePath;
        }
        return path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, filePath);
    }
    public pathAsUri(fsPath: string): vscode.Uri {
        let uri = vscode.Uri.parse(`file://${this.pathResolve(fsPath)}`);
        if (os.platform().startsWith("win")) {
            uri = vscode.Uri.parse(`file:///${this.pathResolve(fsPath)}`.replace(/\\/g, "/"));
        }
        return uri;
    }

    public pathForWorkspace(fsPath: string) {
        const isMultiRoot = this.isMultiRootWorkspace();
        const wp = isMultiRoot ? fsPath : this.pathResolve(fsPath).substr(this.getSingleRootPath().length + 1);
        return wp;
    }
    public pathAbsolute(workspacePath: string) {
        if (this.isMultiRootWorkspace()) {
            return workspacePath;
        }
        return path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, workspacePath);
    }
}

export default new Workspace();
