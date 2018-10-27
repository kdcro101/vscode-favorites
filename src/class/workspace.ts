import * as os from "os";
import * as path from "path";
import { fromEventPattern, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import * as vscode from "vscode";
import { WorkspaceConfiguration } from "../types/index";
import { ExcludeCheck } from "./exclude-check";
import { Global } from "./global";

export class Workspace {

    public eventConfigurationChange = new Subject<void>();
    public excludeCheck = new ExcludeCheck(this);

    public constructor() {

        fromEventPattern<vscode.ConfigurationChangeEvent>((f) => {
            return vscode.workspace.onDidChangeConfiguration(f as any);
        }, (f: any, d: vscode.Disposable) => {
            d.dispose();
        }).pipe(
            takeUntil(Global.eventDeactivate),
        ).subscribe((e) => {
            this.excludeCheck = new ExcludeCheck(this);
            this.eventConfigurationChange.next();
        });
    }

    public get<T extends keyof WorkspaceConfiguration>(key: T): WorkspaceConfiguration[T] {
        const config = vscode.workspace.getConfiguration("favorites");
        return config.get(key) as T;
    }
    public getGlobal(key: string): any {
        const config = vscode.workspace.getConfiguration();
        return config.get(key);
    }

    public save<T extends keyof WorkspaceConfiguration>(key: T, value: WorkspaceConfiguration[T]): Promise<void> {
        const config = vscode.workspace.getConfiguration("favorites");

        config.update(key, value, false);
        return Promise.resolve();

    }
    public getConfigurationRoot() {
        const workspaceIndex = this.get("useWorkspace");
        const rootPath = vscode.workspace.workspaceFolders[workspaceIndex] != null
            ? vscode.workspace.workspaceFolders[workspaceIndex].uri.fsPath
            : vscode.workspace.workspaceFolders[0].uri.fsPath;

        return rootPath;
    }
    public getSingleRootPath(): string {
        return vscode.workspace.workspaceFolders[0].uri.fsPath;
    }

    public isMultiRootWorkspace(): boolean {
        return vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 1;
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
