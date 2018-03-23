import * as vscode from "vscode";
import { ResourceType } from "../types/index";

export class ViewItem extends vscode.TreeItem {
    public resourceUri: vscode.Uri;
    public groupName: string;

    constructor(
        public label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public value: string,
        public contextValue: string,
        public resourceName: string,
        public resourceType: ResourceType,
        public icon?: string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri },
        public command?: vscode.Command,
    ) {
        super(label, collapsibleState);

        this.resourceUri = vscode.Uri.file(value);
        this.tooltip = value;
        this.iconPath = icon;
    }
}
