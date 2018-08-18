# Favorites

[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/version/kdcro101.favorites.svg)](https://marketplace.visualstudio.com/items?itemName=kdcro101.favorites)
[![Installs](https://vsmarketplacebadge.apphb.com/installs-short/kdcro101.favorites.svg)](https://marketplace.visualstudio.com/items?itemName=kdcro101.favorites)
[![Rating](https://vsmarketplacebadge.apphb.com/rating-short/kdcro101.favorites.svg)](https://marketplace.visualstudio.com/items?itemName=kdcro101.favorites)

<!-- [![Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/v/kdcro101.favorites.svg)](https://marketplace.visualstudio.com/items?itemName=kdcro101.favorites)
[![Installs](https://img.shields.io/vscode-marketplace/d/kdcro101.favorites.svg)](https://marketplace.visualstudio.com/items?itemName=kdcro101.favorites)
[![Rating](https://img.shields.io/vscode-marketplace/r/kdcro101.favorites.svg)](https://marketplace.visualstudio.com/items?itemName=kdcro101.favorites) -->


Add files and directories to favorites. You can create groups (and subgroups) of favorite items with files and folders.
Time saver for complex projects.


## Features

### NEW 2018/08/15

External resources (files/directories out of workspace) can be added to favorites
- to add external resource to group, right click on group item and select `Add external resource`, when input box pops out, enter file or directory path
- to add external resource to root level of favorites, right click on empty area of favorites explorer and select `Add external resource`, when input box pops out, enter file or directory path


### NEW 2018/08/08

when active editor changes, file gets revealed in "favorites" view (if visible) 

 
<p align="center">
   <img  src="https://raw.githubusercontent.com/kdcro101/vscode-favorite-items/master/preview/operations.jpg" />
</p>

- group icon color can be changed. Right-click on group in favorites view and select `Group color`.
- copy / cut / paste operations are available
- basic filesystem operations:
    - create file
    - delete file/directory
    - rename file/directory
    - duplicate file/directory
- favorite items can have alias (different label)
- groups can be renamed
- favorites can be accesed via activity bar




<p align="center">
   <img  src="https://raw.githubusercontent.com/kdcro101/vscode-favorite-items/master/preview/adding-favorite.jpg?1213" />
</p>

- to add file/directory to favorites, right-click item in file explorer and select:
    - `add to favorites` - to add item to root of favorites tree.
    - `add to group of favorites` to add item to group of favorites you previously created.


## Preview
![](https://raw.githubusercontent.com/kdcro101/vscode-favorite-items/master/preview/preview-promo.gif)

## Install

Open Visual Studio Code press CTRL+p and type or copy and paste:

`ext install kdcro101.favorites`


## Configuration
`favorites.groupsFirst` : boolean
- if set to `true`, groups will be listed before directories and files, if `false`, groups will appear after directories and files.

`favorites.sortDirection ` : string, `ASC` or `DESC`

## Usage


### Adding to favorites
Right-click item in File explorer and select `Add to favorites`.
### Adding to favorites group or subgroup
Right-click item in File explorer and select `Add to favorites group`, then select group from list.
### Removing from favorites
Right-click item in Favorites view and select `Delete favorite`
### Create favorites group
Click on folder icon on Favorites view title, type unique name and press enter
### Create favorites subgroup
Right-click on group item and choose "Create subgroup"
### Delete favorites group
Right-click group item in Favorites view and select `Delete group`
### Delete item in favorites group
Right-click item inside group in Favorites view and select `Delete item`
### Delete everything 
Click on trash bin icon on Favorites view title, type "yes" to confirm

## LICENSE

[GPL v3 License](https://raw.githubusercontent.com/kdcro101/vscode-favorite-items/master/LICENSE)
