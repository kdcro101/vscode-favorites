import * as os from "os";
import * as path from "path";
import { fromEventPattern, Subject } from "rxjs";
import * as vscode from "vscode";
import { StoredResource } from "../types/index";
import { ExcludeCheck } from "./exclude-check";

export class Workspace {
    // public eventEmitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public eventConfigurationChange = new Subject<void>();
    public excludeCheck = new ExcludeCheck(this);

    public constructor() {

        fromEventPattern<vscode.ConfigurationChangeEvent>((f) => {
            return vscode.workspace.onDidChangeConfiguration(f as any);
        }, (f: any, d: vscode.Disposable) => {
            d.dispose();
        }).pipe(

        ).subscribe((e) => {
            this.excludeCheck = new ExcludeCheck(this);
            this.eventConfigurationChange.next();
        });
    }

    public get(key: string): any {
        const config = vscode.workspace.getConfiguration("favorites");
        return config.get(key);
    }
    public getGlobal(key: string): any {
        const config = vscode.workspace.getConfiguration();
        return config.get(key);
    }

    public save(key: string, value: any): Promise<void> {
        const config = vscode.workspace.getConfiguration("favorites");

        config.update(key, value, false);
        return Promise.resolve();

    }

    // get onDataChange(): vscode.Event<void> {
    //     return this.eventEmitter.event;
    // }
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
    // -----------------------------------------------------------------------
    public workspaceRoot(fsPath): string {
        const roots = vscode.workspace.workspaceFolders.map((i) => i.uri.fsPath);
        for (let i = 0; i < roots.length; i++) {
            const p = roots[i];
            const r = fsPath.search(p);
            if (r === 0) {
                return p;
            }
        }

        return null;

    }
    public workspacePath(fsPath): string {
        const w = this.workspaceRoot(fsPath);

        if (w) {
            return path.relative(w, fsPath);
        }

        return null;
    }

}

export default new Workspace();
