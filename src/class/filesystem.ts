import * as fs from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { ViewItem } from "./view-item";
import workspace from "./workspace";

export class FilesystemUtils {

    public duplicate(item: ViewItem) {
        return new Promise((resolve, reject) => {
            const aPath = item.value;
            const base = path.basename(aPath);
            const dir = path.dirname(aPath);
            vscode.window.showInputBox({
                prompt: "Enter name for duplicate",
                placeHolder: "Type duplicate name",
                value: base,
            }).then((val) => {
                if (val == null || val.trim() === "") {
                    return;
                }
                if (val === base) {
                    vscode.window.showWarningMessage("New name must be different");
                }
                const newBase = val.trim();
                const newPath = path.join(dir, newBase);
                fs.copy(aPath, newPath)
                    .then((result) => {
                        vscode.window.showInformationMessage(`Duplication successful`);
                        resolve();
                    })
                    .catch((e) => {
                        vscode.window.showErrorMessage(`Error duplicating ${base}`);
                        reject(e);
                    });

            });
        });
    }

}
