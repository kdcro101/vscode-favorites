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
- basic filesystem operations within Favorites explorer:
    - copy/cut -> paste
    - create file
    - delete file/directory
    - rename file/directory
    - duplicate file/directory
- favorite items can have alias (different label)
- items are accesible via activity bar and, optionally, as File explorer subview (see [Using Favorites explorer section](#using))


## Adding to favorites
<p align="center">
   <img  src="https://raw.githubusercontent.com/kdcro101/vscode-favorite-items/master/preview/adding.jpg?121233" />
</p>

- to add file/directory to favorites, right-click item in file explorer and select:
- `add to favorites` - to add item to root of favorites tree.
- `add to group of favorites` to add item to group of favorites you previously created.

 
##  <a name="using"></a><a name="user-content-using"></a> Using Favorites explorer
<p align="center">
   <img  src="https://raw.githubusercontent.com/kdcro101/vscode-favorite-items/master/preview/using.jpg?232321" />
</p>

 

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
