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
                    resolve();
                    return;
                }
                if (val === base) {
                    vscode.window.showWarningMessage("New name must be different");
                    reject("not_different");
                    return;
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
    public delete(item: ViewItem) {
        return new Promise((resolve, reject) => {
            const aPath = item.value;
            const base = path.basename(aPath);
            const dir = path.dirname(aPath);
            vscode.window.showQuickPick(
                ["Yes", "No"], {
                    placeHolder: `Are you sure you want to delete '${base}'`,
                },
            ).then((val) => {
                if (val == null || val.toLocaleLowerCase() === "no") {
                    resolve();
                    return;
                }

                fs.remove(aPath)
                    .then((result) => {
                        resolve();
                    })
                    .catch((e) => {
                        vscode.window.showErrorMessage(`Error deleting ${base}`);
                        reject(e);
                    });

            });
        });
    }

    public rename(item: ViewItem) {
        return new Promise((resolve, reject) => {
            const aPath = item.value;
            const base = path.basename(aPath);
            const dir = path.dirname(aPath);
            vscode.window.showInputBox({
                prompt: "Enter new name",
                placeHolder: "Type new name",
                value: base,
            }).then((val) => {
                if (val == null || val.trim() === "") {
                    return;
                }
                if (val === base) {
                    vscode.window.showWarningMessage("New name must be different");
                    reject("not_different");
                    return;
                }
                const newBase = val.trim();
                const newPath = path.join(dir, newBase);
                fs.move(aPath, newPath, {
                    overwrite: true,
                }).then((result) => {
                    resolve();
                }).catch((e) => {
                    vscode.window.showErrorMessage(`Error renaming ${base}`);
                    reject(e);
                });

            });
        });
    }
    public createFile(item: ViewItem) {
        return new Promise((resolve, reject) => {
            const aPath = item.value;
            let newPath: string = null;
            let newName: string = null;

            vscode.window.showInputBox({
                prompt: "Enter file name",
                placeHolder: "Type file name",
            }).then((val) => {
                if (val == null || val.trim() === "") {
                    resolve();
                    return;
                }
                newName = val;
                newPath = path.join(aPath, val);
                return fs.pathExists(newPath);
            }).then((b) => {

                if (b === true) {
                    vscode.window.showWarningMessage("File exists");
                    reject("exists");
                    return;
                }

                fs.createFile(newPath)
                    .then((result) => {
                        resolve();
                    })
                    .catch((e) => {
                        vscode.window.showErrorMessage(`Error creating file ${newName}`);
                        reject(e);
                    });

            });

        });
    }
    public createDirectory(item: ViewItem) {
        return new Promise((resolve, reject) => {
            const aPath = item.value;
            let newPath: string = null;
            let newName: string = null;

            vscode.window.showInputBox({
                prompt: "Enter directory name",
                placeHolder: "Type directory name",
            }).then((val) => {
                if (val == null || val.trim() === "") {
                    resolve();
                    return;
                }
                newName = val;
                newPath = path.join(aPath, val);
                return fs.pathExists(newPath);
            }).then((b) => {

                if (b === true) {
                    vscode.window.showWarningMessage("Directory exists");
                    reject("exists");
                    return;
                }

                fs.ensureDir(newPath)
                    .then((result) => {
                        resolve();
                    })
                    .catch((e) => {
                        vscode.window.showErrorMessage(`Error creating directory ${newName}`);
                        reject(e);
                    });

            });

        });
    }
    public copy(clipboardItem: ViewItem, destination: ViewItem) {
        return new Promise((resolve, reject) => {
            const sPath = clipboardItem.value;
            const sBase = path.basename(clipboardItem.value);
            const dDir = destination.value;
            const dPath = path.join(dDir, sBase);

            Promise.all([
                fs.pathExists(dPath),
            ]).then((results) => {

                const exists = results[0];

                if (exists) {
                    return vscode.window.showQuickPick(
                        ["Yes", "No"], {
                            placeHolder: `Destination exists! Overwrite? '${dPath}'`,
                        },
                    );
                } else {
                    return Promise.resolve("Yes");
                }

            }).then((shouldCopy: string) => {

                if (shouldCopy !== "Yes") {
                    resolve();
                    return;
                }

                fs.copy(sPath, dPath, {
                    overwrite: true,
                }).then((result) => {
                    resolve();
                }).catch((e) => {
                    vscode.window.showErrorMessage(`Error copying ${sPath}`);
                    reject(e);
                });

            });

        });
    }
    public move(clipboardItem: ViewItem, destination: ViewItem) {

        return new Promise((resolve, reject) => {
            const sPath = clipboardItem.value;
            const sBase = path.basename(clipboardItem.value);
            const dDir = destination.value;
            const dPath = path.join(dDir, sBase);

            Promise.all([
                fs.pathExists(dPath),
            ]).then((results) => {

                const exists = results[0];

                if (exists) {
                    return vscode.window.showQuickPick(
                        ["Yes", "No"], {
                            placeHolder: `Destination exists! Overwrite? '${dPath}'`,
                        },
                    );
                } else {
                    return Promise.resolve("Yes");
                }

            }).then((shouldMove: string) => {

                if (shouldMove !== "Yes") {
                    resolve();
                    return;
                }

                fs.move(sPath, dDir, {
                    overwrite: true,
                }).then((result) => {
                    resolve();
                }).catch((e) => {
                    vscode.window.showErrorMessage(`Error moving ${sPath}`);
                    reject(e);
                });

            });

        });

    }

}
