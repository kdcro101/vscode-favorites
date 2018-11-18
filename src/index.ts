import { merge } from "rxjs";
import { takeUntil, tap } from "rxjs/operators";
import * as vscode from "vscode";
import { DataProvider } from "./class/dataProvider";
import { Favorites } from "./class/favorites";
import { FsWatcher } from "./class/fs-watcher";
import { Global } from "./class/global";
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

    const configSort = workspace.get("sortDirection");
    let registryList = workspace.get("storageRegistry");
    const sort = (configSort === "DESC" || configSort === "ASC") ? configSort : "ASC";

    vscode.commands.executeCommand("setContext", "sort", sort);

    const storage = new FavoriteStorage(context);
    const favorites = new Favorites(context, storage);

    ViewItem.favorites = favorites;

    const provider = new DataProvider(favorites);
    const providerActivity = new DataProvider(favorites);

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

    const commands = new Commands(context, providers, favorites, storage);

    if (registryList.length > 0) {
        statusRegistryCreate();
        refreshStatus(storage);
    }

    workspace.eventConfigurationChange.pipe(
        takeUntil(Global.eventDeactivate),
        tap(() => {
            registryList = workspace.get("storageRegistry");
            if (registryList.length > 0) {
                statusRegistryCreate();
            } else {
                statusRegistryDestroy();
            }
        }),
    ).subscribe(() => {
        providers.refresh();
        storage.reloadStoragePath();
        refreshStatus(storage);
    });

    merge(storage.eventChange, fsWatcher.eventFs).pipe(
        takeUntil(Global.eventDeactivate),
    ).subscribe(() => {
        providers.refresh();
    });

}

function statusRegistryCreate() {

    const status = !Global.statusRegistry ? vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1) : Global.statusRegistry;
    Global.statusRegistry = status;

    status.command = "favorites.selectFromRegistry";
    status.show();
}
function statusRegistryDestroy() {

    const status = Global.statusRegistry;

    if (!status) {
        return;
    }

    status.hide();
    status.dispose();
    Global.statusRegistry = null;
}

function refreshStatus(storage: FavoriteStorage) {
    const status = Global.statusRegistry;

    if (!status) {
        return;
    }

    const name = storage.storageName();
    status.text = `$(heart) ${name}`;
    status.tooltip = `${storage.storageFilePath}`;
}

export function deactivate() {
    Global.eventDeactivate.next();
}
