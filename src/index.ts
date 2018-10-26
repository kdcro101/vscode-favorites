import * as vscode from "vscode";
import { DataProvider } from "./class/dataProvider";
import { Favorites } from "./class/favorites";
import { FsWatcher } from "./class/fs-watcher";
import { FavoriteStorage } from "./class/storage";
import { TreeViewManager } from "./class/tree";
import { ViewItem } from "./class/view-item";
import workspace from "./class/workspace";
import { Commands } from "./command";
import { TreeProviders } from "./types";

export function activate(context: vscode.ExtensionContext) {

    if (vscode.workspace.workspaceFolders == null || vscode.workspace.workspaceFolders.length === 0) {
        return;
    }

    const configSort = workspace.get("sortDirection") as string;
    const sort = (configSort === "DESC" || configSort === "ASC") ? configSort : "ASC";
    const configGroupsFirst = workspace.get("groupsFirst");
    const groupsFirst = configGroupsFirst ? configGroupsFirst : true;

    vscode.commands.executeCommand("setContext", "sort", sort);
    // secure defaults...
    workspace.save("sortDirection", sort);
    workspace.save("groupsFirst", groupsFirst);

    const storage = new FavoriteStorage(context);
    const favorites = new Favorites(context, storage);

    ViewItem.favorites = favorites;

    const provider = new DataProvider(context, favorites);
    const providerActivity = new DataProvider(context, favorites);

    const providers: TreeProviders = {
        explorer: provider,
        activity: providerActivity,
        refresh: () => {
            provider.refresh();
            providerActivity.refresh();
        },
    };

    const treeExplorer = vscode.window.createTreeView<ViewItem>("favorites", { treeDataProvider: providers.explorer });
    const treeActivity = vscode.window.createTreeView<ViewItem>("favoritesActivity", { treeDataProvider: providers.activity });

    const managerExplorer = new TreeViewManager(treeExplorer, context, favorites, providers.explorer);
    const managerActivity = new TreeViewManager(treeActivity, context, favorites, providers.activity);
    const fsWatcher = new FsWatcher(storage);

    const c = new Commands(context, providers, favorites, storage);
    let status: vscode.StatusBarItem = null;

    if (vscode.workspace.workspaceFolders.length > 1) {

        status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        context.subscriptions.push(status);
        status.command = "favorites.selectWorkspace";
        status.show();
        refreshStatus(status);

    }

    workspace.eventConfigurationChange.pipe(
    ).subscribe(() => {
        providers.refresh();
        storage.reloadStoragePath();
        refreshStatus(status);
    });

    vscode.workspace.onDidChangeConfiguration(() => {
        providers.refresh();
    }, this, context.subscriptions);

    storage.eventChange.pipe().subscribe(() => {
        providers.refresh();
    });

    fsWatcher.eventFs.pipe().subscribe(() => {
        providers.refresh();
    });

}

function refreshStatus(status: vscode.StatusBarItem) {

    if (!status) {
        return;
    }

    const wi = workspace.get("useWorkspace");
    status.text = `$(heart) ${wi}`;
    status.tooltip = `Favorites using ${vscode.workspace.workspaceFolders[wi].uri.fsPath} (click to switch)`;
}

export function deactivate() {

}
