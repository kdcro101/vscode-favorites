import * as fs from "fs";
import * as path from "path";

import * as vscode from "vscode";
import { DataProvider } from "../class/dataProvider";
import favorites from "../class/favorites";
import { ViewItem } from "../class/view-item";
import workspace from "../class/workspace";
import { ResourceType, StoredResource } from "../types/index";

export class Commands {
    constructor(private context: vscode.ExtensionContext, provider: DataProvider) {
        context.subscriptions.push(this.addToFavorites(provider));
        context.subscriptions.push(this.deleteFavorite(provider));
        context.subscriptions.push(this.setSortAsc(provider));
        context.subscriptions.push(this.setSortDesc(provider));
        context.subscriptions.push(this.collapse(provider));
        context.subscriptions.push(this.createGroup());
        context.subscriptions.push(this.addToFavoritesGroup(provider));
        context.subscriptions.push(this.deleteGroup(provider));
        context.subscriptions.push(this.deleteGroupItem(provider));
        context.subscriptions.push(this.addCurrentFile(provider));
        context.subscriptions.push(this.deleteAllFavorites(provider));
        context.subscriptions.push(this.addSubgroup(provider));
    }

    addSubgroup = (dataProvider: DataProvider) => {
        return vscode.commands.registerCommand("favorites.group.subgroup.create",
            (value: ViewItem) => {

                vscode.window.showInputBox({ prompt: "Enter subgroup name" })
                .then((name) => {
                    console.log(name);
                    if (!name || name.trim().length === 0) {
                        return;
                    }
                    const tname = name.trim();
                    vscode.window.showWarningMessage(tname);

                });

            });
    }
    addToFavorites = (dataProvider: DataProvider) => {
        return vscode.commands.registerCommand("favorites.addToFavorites", (fileUri?: vscode.Uri) => {
            if (!fileUri) {
                return vscode.window.showWarningMessage("You have to call this extension from explorer");
            }

            const itemPath = fileUri.fsPath;
            favorites.addPath(itemPath);
        });
    }
    addToFavoritesGroup = (dataProvider: DataProvider) => {
        return vscode.commands.registerCommand("favorites.addToFavoritesGroup", (fileUri?: vscode.Uri) => {
            if (!fileUri) {
                return vscode.window.showWarningMessage("You have to call this extension from explorer");
            }

            favorites.get()
                .then((result) => {

                    const names = result.filter((i) => i.type === ResourceType.Group);
                    if (names.length === 0) {
                        vscode.window.showWarningMessage("No group definition found. Create group first.");
                        return;
                    }
                    vscode.window.showQuickPick(names.map((i) => i.name))
                        .then((groupName) => {
                            console.log(groupName);
                            const itemPath = fileUri.fsPath;
                            favorites.addPathToGroup(groupName, itemPath);

                        });

                })
                .catch((e) => {
                    console.log(e);
                });

        });
    }
    collapse = (dataProvider: DataProvider) => {
        return vscode.commands.registerCommand("favorites.collapse", (value: ViewItem) => {

            dataProvider.returnEmpty = true;
            dataProvider.refresh();

            setTimeout(() => {
                dataProvider.returnEmpty = false;
                dataProvider.refresh();

            }, 400);

        });
    }
    deleteFavorite = (dataProvider: DataProvider) => {
        return vscode.commands.registerCommand("favorites.deleteFavorite", (value: ViewItem) => {

            favorites.removePath(value.resourceName);
            dataProvider.refresh();
        });
    }
    setSortAsc = (dataProvider: DataProvider) => {
        return vscode.commands.registerCommand("favorites.nav.sort.az", (value: ViewItem) => {
            const config = vscode.workspace.getConfiguration("favorites");

            vscode.commands.executeCommand("setContext", "sort", "ASC");
            return config.update("sortDirection", "ASC", false);

        });
    }
    setSortDesc = (dataProvider: DataProvider) => {
        return vscode.commands.registerCommand("favorites.nav.sort.za", (value: ViewItem) => {
            const config = vscode.workspace.getConfiguration("favorites");

            vscode.commands.executeCommand("setContext", "sort", "DESC");
            config.update("sortDirection", "DESC", false);

        });
    }
    createGroup = () => {
        return vscode.commands.registerCommand("favorites.group.create", () => {

            vscode.window.showInputBox({ prompt: "Enter group name" }).then((name) => {
                console.log(name);
                if (!name || name.trim().length === 0) {
                    return;
                }
                const tname = name.trim();
                favorites.addGroup(tname);

            });
        });
    }
    deleteGroup = (dataProvider: DataProvider) => {
        return vscode.commands.registerCommand("favorites.group.delete", (value: ViewItem) => {

            favorites.removeGroup(value.resourceName);

        });
    }
    deleteGroupItem = (dataProvider: DataProvider) => {
        return vscode.commands.registerCommand("favorites.group.item.delete", (value: ViewItem) => {

            favorites.removePathFromGroup(value.groupName, value.resourceName);

        });
    }
    addCurrentFile = (dataProvider: DataProvider) => {
        return vscode.commands.registerCommand("favorites.add.current", (value: any) => {
            const fsPath = vscode.window.activeTextEditor.document.fileName;
            favorites.addPath(fsPath)
                .then((result) => {
                    vscode.window.showInformationMessage(`${fsPath} added to favorites`);
                })
                .catch((e) => {
                    console.log(e);
                });
        });
    }
    deleteAllFavorites = (dataProvider: DataProvider) => {
        return vscode.commands.registerCommand("favorites.delete.all", (value: any) => {

            vscode.window.showInputBox({
                prompt: "Do you want to delete ALL favorites (including groups)?",
                placeHolder: "type 'yes' to delete everything",
            })
                .then((val) => {
                    if (val === "yes") {
                        workspace.save("root", [])
                            .then(() => {
                                vscode.window.showInformationMessage(`Everything is deleted`);

                            });

                    }
                });
            //

        });
    }
}
