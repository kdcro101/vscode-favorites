import { QuickPickItem } from "vscode";

export enum ResourceType {
    File = "File",
    Group = "Group",
    Directory = "Directory",
    GroupItem = "GroupItem",
}

export interface StoredResource {
    id?: string;
    name: string;
    type: ResourceType;
    parent_id?: string;
    contents?: string[];

}

export interface FilesystemResource {
    path: string;
    type: ResourceType;
}

export interface GroupQuickPick extends QuickPickItem {
    id: string;
}
