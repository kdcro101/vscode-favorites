// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { DataProvider } from "./class/dataProvider";
import workspace from "./class/workspace";
import { Commands } from "./command";

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

    workspace.onDataChange(() => {
        provider.refresh();
    });

    const provider = new DataProvider(context);

    const view = vscode.window.registerTreeDataProvider("favorites", provider);

    vscode.workspace.onDidChangeConfiguration(() => {
        provider.refresh();
    }, this, context.subscriptions);

    vscode.window.onDidChangeActiveTextEditor((e: vscode.TextEditor) => {
        console.log(e.document.uri.fsPath);
    });

    const c = new Commands(context, provider);

}

// this method is called when your extension is deactivated
export function deactivate() {
    //
}
