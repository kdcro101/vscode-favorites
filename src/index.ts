// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { DataProvider } from "./class/dataProvider";
import { Favorites } from "./class/favorites";
import { TreeViewManager } from "./class/tree";
import { ViewItem } from "./class/view-item";
import workspace from "./class/workspace";
import { Commands } from "./command";
import { TreeProviders } from "./types";

declare var global: any;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated

    const configSort = workspace.get("sortDirection") as string;
    const sort = (configSort === "DESC" || configSort === "ASC") ? configSort : "ASC";
    const configGroupsFirst = workspace.get("groupsFirst");
    const groupsFirst = configGroupsFirst ? configGroupsFirst : true;

    vscode.commands.executeCommand("setContext", "sort", sort);
    // secure defaults...
    workspace.save("sortDirection", sort);
    workspace.save("groupsFirst", groupsFirst);

    global.vscode = vscode;
    global.commands = [];

    vscode.commands.getCommands(false)
        .then((l) => global.commands = l);

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

    // const view = vscode.window.registerTreeDataProvider("favorites", provider);
    // const viewActivity = vscode.window.registerTreeDataProvider("favoritesActivity", providerActivity);
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

    setTimeout(() => {
        console.log(`favorites: ${managerExplorer.visible}`);
        console.log(`favoritesActivity: ${managerActivity.visible}`);
    }, 3000);

}

export function deactivate() {
    console.log("deactivating kdcro101.favorites");
}
