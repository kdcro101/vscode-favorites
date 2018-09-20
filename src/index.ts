import * as vscode from "vscode";
import { DataProvider } from "./class/dataProvider";
import { Favorites } from "./class/favorites";
import { TreeViewManager } from "./class/tree";
import { ViewItem } from "./class/view-item";
import workspace from "./class/workspace";
import { Commands } from "./command";
import { TreeProviders } from "./types";

export function activate(context: vscode.ExtensionContext) {

    const configSort = workspace.get("sortDirection") as string;
    const sort = (configSort === "DESC" || configSort === "ASC") ? configSort : "ASC";
    const configGroupsFirst = workspace.get("groupsFirst");
    const groupsFirst = configGroupsFirst ? configGroupsFirst : true;

    vscode.commands.executeCommand("setContext", "sort", sort);
    // secure defaults...
    workspace.save("sortDirection", sort);
    workspace.save("groupsFirst", groupsFirst);

    const favorites = new Favorites(context);

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

    vscode.workspace.onDidChangeConfiguration(() => {
        providers.refresh();
    }, this, context.subscriptions);

    const c = new Commands(context, providers, favorites);

    workspace.onDataChange(() => {
        providers.refresh();
    });

}

export function deactivate() {

}
