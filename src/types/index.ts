export enum ResourceType {
    File = "File",
    Group = "Group",
    Directory = "Directory",
    GroupItem = "GroupItem",
}

export interface StoredResource {
    name: string;
    type: ResourceType;
    contents?: string[];

}

export interface FilesystemResource {
    path: string;
    type: ResourceType;
}
