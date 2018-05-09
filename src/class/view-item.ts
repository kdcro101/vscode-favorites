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
        public id?: string,
        public parentId?: string,
        public tooltipText?: string,
    ) {
        super(label, collapsibleState);

        this.resourceUri = vscode.Uri.file(value);
        this.tooltip = value;
        this.iconPath = icon;
        this.tooltip = tooltipText;
    }
    public get isFavorite() {
        return this.contextValue === "FAVORITE_DIRECTORY" || this.contextValue === "FAVORITE_FILE";
    }
}
