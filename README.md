# Favorites

[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/version/kdcro101.favorites.svg)](https://marketplace.visualstudio.com/items?itemName=kdcro101.favorites)
[![Installs](https://vsmarketplacebadge.apphb.com/installs-short/kdcro101.favorites.svg)](https://marketplace.visualstudio.com/items?itemName=kdcro101.favorites)
[![Rating](https://vsmarketplacebadge.apphb.com/rating-short/kdcro101.favorites.svg)](https://marketplace.visualstudio.com/items?itemName=kdcro101.favorites#review-details)


Add files and directories to **workspace** favorites. You can create groups (and subgroups) of favorite items with files and folders.
Time saver for complex projects.


## Features

- [browsing using keyboard](#keyboard-browsing) only via `Favorites: Browse` palette command
- add resources within workspace
- add external resources (files or directories out of workspace)
- organize favorites in groups and subgroups (nesting not limited)
- have  [multiple sets](#multiple-sets) of favorites, per workspace, depending of context, using setting `favorites.storageRegistry`
- group icons can have their color changed
- basic file system operations within Favorites explorer:
    - copy/cut -> paste
    - create file
    - delete file/directory
    - rename file/directory
    - duplicate file/directory
- favorite items can have alias (different label)
- items are accesible via activity bar and, optionally, as File explorer subview (see [Using Favorites explorer section](#using))
- `files.exclude` supported (see [configuration](#configuration)) 
- language independent


## Adding to favorites
<p align="center">
   <img  src="https://raw.githubusercontent.com/kdcro101/vscode-favorites/master/preview/adding.jpg?121233" />
</p>

- to add file or directory to favorites, right-click item in ***File explorer*** and select:
- `add to favorites` - to add item to root of favorites tree.
- `add to group of favorites` - to add item to group of favorites you previously created.

 
<a id="using"></a><a name="user-content-using"></a>
## Using Favorites explorer

<p align="center">
   <img  src="https://raw.githubusercontent.com/kdcro101/vscode-favorites/master/preview/using.jpg?232321" />
</p>

you can **turn off** subview in **File explorer** by clicking on its header and deselecting it.
 

## Install

Open Visual Studio Code press CTRL+p and type or copy and paste:

`ext install kdcro101.favorites`

 <a id="configuration"></a><a name="user-content-configuration"></a>
## Configuration

`favorites.useWorkspace` : number - default is `0`
- index of workspace to use as root when composing storage file path

`favorites.useFilesExclude` : boolean
- should `files.exclude` setting be used. Default is `true`

`favorites.storageFilePath` : string
- overrride storage file path relative to workspace. Default is `.favorites.json`

`favorites.storageRegistry` : string[]
- List of storage file paths relative to workspace to make available for switching using command `Favorites: Select alternative storage from registry`. ([multiple sets](#multiple-sets)). Default is `[]`

`favorites.groupsFirst` : boolean
- if set to `true`, groups will be listed before directories and files, if `false`, groups will appear after directories and files.

`favorites.sortDirection ` : string, `ASC` or `DESC`

`favorites.useTrash`: boolean (default `false`)
- if set to `true`, extension will try to use system trash when resource (file or directory is deleted)

`favorites.includeInDocumentBodyContextMenu` : boolean (default `false`)
- if set to `true`, the two "Add to * favorites" commands will be included in the editor context menu that appears when right-clicking the body of an open document.

`favorites.includeInEditorTabContextMenu` : boolean (default `true`)
- if set to `true`, the two "Add to * favorites" commands will be included in the context menu for the tab of a specific file (e.g. the menu that appears when right-clicking the tab of an open document).

## Keyboard browsing

You can browse favorites using **keyboard only** by executing command `Favorites: Browse` command from palette. Assign keyboard shortcut if needed.

<p align="center">
   <img  src="https://raw.githubusercontent.com/kdcro101/vscode-favorites/master/preview/browsing.gif?3212" />
</p>

## Usage

#### Adding to favorites
Right-click item in File explorer, an open file tab, or the background of an open editor and select `Add to favorites`.
#### Adding to favorites group or subgroup
Right-click item in File explorer, an open file tab, or the background of an open editor and select `Add to favorites group`, then select group from list.
#### Removing from favorites
Right-click item in Favorites view and select `Remove from favorites`
#### Create favorites group
Right-click on empty area and select `Create group`
#### Create favorites subgroup
Right-click on group item and choose `Create group`
#### Delete favorites group
Right-click group item in Favorites view and select `Remove group`
#### Remove everything from favorites
Click on trash bin icon on Favorites view title, type "yes" to confirm

## Multiple sets

You can have multiple sets of favorites per workspace. This allows you to build independent set of favorites, depending on context.
To achieve this you need to setup storage registry.

Add favorites.storageRegistry to your workspace settings, for example:
```ts
// paths are relative to workspace
 "favorites.storageRegistry": [
            "favorites/system.json",
            "favorites/classes.json",
            "favorites/services.json",
],
```

Select active storage file from registry  by clicking status bar element ![select](https://raw.githubusercontent.com/kdcro101/vscode-favorites/master/preview/statusRegistry.jpg) or by executing command `Favorites: Select alternative storage from registry` from command palette and then selecting item from list:

![list](https://raw.githubusercontent.com/kdcro101/vscode-favorites/master/preview/selectRegistry.jpg) 

All `add favorite` operations will be written in currently selected storage file.


## LICENSE

[GPL v3 License](https://raw.githubusercontent.com/kdcro101/vscode-favorites/master/LICENSE)
