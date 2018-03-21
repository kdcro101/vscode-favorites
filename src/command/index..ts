import * as fs from "fs";
import * as path from "path";

import * as vscode from "vscode";

import { DataProvider } from "../class/dataProvider";

import workspace from "../class/workspace";

import { ResourceType, StoredResource } from "../types/index";

import favorites from "../class/favorites";
import { ViewItem } from "../class/view-item";

function pathResolve(filePath: string) {
    if (workspace.isMultiRootWorkspace()) {
        return filePath;
    }
    return path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, filePath);
}
export function addToFavorites(dataProvider: DataProvider) {
    return vscode.commands.registerCommand("favorites.addToFavorites", (fileUri?: vscode.Uri) => {
        if (!fileUri) {
            return vscode.window.showWarningMessage("You have to call this extension from explorer");
        }

        const itemPath = fileUri.fsPath;
        favorites.addPath(itemPath);
    });
}
export function addToFavoritesGroup(dataProvider: DataProvider) {
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
export function collapse(dataProvider: DataProvider) {
    return vscode.commands.registerCommand("favorites.collapse", (value: ViewItem) => {

        dataProvider.returnEmpty = true;
        dataProvider.refresh();

        setTimeout(() => {
            dataProvider.returnEmpty = false;
            dataProvider.refresh();

        }, 400);

    });
}
export function deleteFavorite(dataProvider: DataProvider) {
    return vscode.commands.registerCommand("favorites.deleteFavorite", (value: ViewItem) => {

        favorites.removePath(value.resourceName);
        dataProvider.refresh();
    });
}
export function setSortAsc(dataProvider: DataProvider) {
    return vscode.commands.registerCommand("favorites.nav.sort.az", (value: ViewItem) => {
        const config = vscode.workspace.getConfiguration("favorites");

        vscode.commands.executeCommand("setContext", "sort", "ASC");
        return config.update("sortDirection", "ASC", false);

    });
}
export function setSortDesc(dataProvider: DataProvider) {
    return vscode.commands.registerCommand("favorites.nav.sort.za", (value: ViewItem) => {
        const config = vscode.workspace.getConfiguration("favorites");

        vscode.commands.executeCommand("setContext", "sort", "DESC");
        config.update("sortDirection", "DESC", false);

    });
}
export function createGroup() {
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
export function deleteGroup(dataProvider: DataProvider) {
    return vscode.commands.registerCommand("favorites.group.delete", (value: ViewItem) => {

        favorites.removeGroup(value.resourceName);

    });
}
export function deleteGroupItem(dataProvider: DataProvider) {
    return vscode.commands.registerCommand("favorites.group.item.delete", (value: ViewItem) => {

        favorites.removePathFromGroup(value.groupName, value.resourceName);

    });
}
