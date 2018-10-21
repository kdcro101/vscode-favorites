//
import * as minimatch from "minimatch";
import { Workspace } from "./workspace";

export class ExcludeCheck {
    private excludeList: string[] = [];
    private useExclude: boolean = true;

    constructor(private workspace: Workspace) {
        this.collectExcludeList();
        this.useExclude = workspace.get("useFilesExclude");
    }

    public isExcluded(fsPath: string): boolean {

        if (!this.useExclude) {
            return false;
        }

        let relative = this.workspace.workspacePath(fsPath);
        if (!relative) {
            relative = fsPath;
        }

        const excluded = this.excludeList.reduce((acc, cur) => {
            const res = minimatch(relative, cur, {
                dot: true,
            });
            if (res) {
                acc = true;
                return acc;
            }
            return acc;
        }, false);

        return excluded;
    }
    private collectExcludeList() {
        const filesExclude = this.workspace.getGlobal("files.exclude");
        const filesExcludeList = Object.keys(filesExclude);

        this.excludeList = filesExcludeList.reduce((acc, cur, i) => {
            const val = filesExclude[cur];
            if (val === true) {
                acc.push(cur);
                return acc;
            }
            return acc;
        }, []);

    }

}
