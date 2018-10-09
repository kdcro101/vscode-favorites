# Favorites

[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/version/kdcro101.favorites.svg)](https://marketplace.visualstudio.com/items?itemName=kdcro101.favorites)
[![Installs](https://vsmarketplacebadge.apphb.com/installs-short/kdcro101.favorites.svg)](https://marketplace.visualstudio.com/items?itemName=kdcro101.favorites)
[![Rating](https://vsmarketplacebadge.apphb.com/rating-short/kdcro101.favorites.svg)](https://marketplace.visualstudio.com/items?itemName=kdcro101.favorites)


Add files and directories to favorites. You can create groups (and subgroups) of favorite items with files and folders.
Time saver for complex projects.


## Features

- add resources within workspace
- add external resources (files or directories out of workspace)
- organize favorites in groups and subgroups (nesting not limited)
- group icons can have their colors changed
- basic file system operations within Favorites explorer:
    - copy/cut -> paste
    - create file
    - delete file/directory
    - rename file/directory
    - duplicate file/directory
- favorite items can have alias (different label)
- items are accesible via activity bar and, optionally, as File explorer subview (see [Using Favorites explorer section](#using))
- language independent


## Adding to favorites
<p align="center">
   <img  src="https://raw.githubusercontent.com/kdcro101/vscode-favorite-items/master/preview/adding.jpg?121233" />
</p>

- to add file or directory to favorites, right-click item in ***File explorer*** and select:
- `add to favorites` - to add item to root of favorites tree.
- `add to group of favorites` - to add item to group of favorites you previously created.

 
 <a id="using"></a><a name="user-content-using"></a>
## Using Favorites explorer

<p align="center">
   <img  src="https://raw.githubusercontent.com/kdcro101/vscode-favorite-items/master/preview/using.jpg?232321" />
</p>

you can **turn off** subview in ***File explorer*** by clicking on its header and deselecting it.
 

## Install

Open Visual Studio Code press CTRL+p and type or copy and paste:

`ext install kdcro101.favorites`


## Configuration
`favorites.groupsFirst` : boolean
- if set to `true`, groups will be listed before directories and files, if `false`, groups will appear after directories and files.

`favorites.sortDirection ` : string, `ASC` or `DESC`

`favorites.useTrash`: boolean (default `false`)
- if set to `true`, extension will try to use system trash when resource (file or directory is deleted)


## Usage


#### Adding to favorites
Right-click item in File explorer and select `Add to favorites`.
#### Adding to favorites group or subgroup
Right-click item in File explorer and select `Add to favorites group`, then select group from list.
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

## LICENSE

[GPL v3 License](https://raw.githubusercontent.com/kdcro101/vscode-favorite-items/master/LICENSE)
