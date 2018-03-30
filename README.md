<img align="left" width="32" height="32" src="https://raw.githubusercontent.com/kdcro101/vscode-favorite-items/master/images/icon-small.png">
# Favorites

[![Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/v/kdcro101.favorites.svg)](https://marketplace.visualstudio.com/items?itemName=kdcro101.favorites)
[![Installs](https://img.shields.io/vscode-marketplace/d/kdcro101.favorites.svg)](https://marketplace.visualstudio.com/items?itemName=kdcro101.favorites)
[![Rating](https://img.shields.io/vscode-marketplace/r/kdcro101.favorites.svg)](https://marketplace.visualstudio.com/items?itemName=kdcro101.favorites)

Extension provides ability to add files and directories to favorites enabling quick access.
You can create groups of favorite items with files and folders.
Time saver for complex projects.

![](https://raw.githubusercontent.com/kdcro101/vscode-favorite-items/master/preview/preview.gif)

## Install

Open Visual Studio Code press CTRL+p and type or copy and paste:

`ext install kdcro101.favorites`


## Configuration
`favorites.groupsFirst` : boolean
- If set to `true`, groups will be listed before directories and files, if `false`, groups will appear after directories and files.

`favorites.sortDirection ` : string, `ASC` or `DESC`

## Usage

To add active (opened and focused in editor) file to favorites, press `CTRL+ALT+F`

### Adding to favorites
Right-click item in File explorer and select `Add to favorites`.
### Removing from favorites
Right-click item in Favorites view and select `Delete favorite`
### Create favorites group
Click on folder icon on Favorites view title, type unique name and press enter
### Delete favorites group
Right-click group item in Favorites view and select `Delete group`
### Delete item in favorites group
Right-click item inside group in Favorites view and select `Delete item`
### Delete everything 
Click on trash bin icon on Favorites view title, type "yes" to confirm

## LICENSE

[GPL v3 License](https://raw.githubusercontent.com/kdcro101/vscode-favorite-items/master/LICENSE)
