## 2.4.6 | 2022/09/15

- enabled the "Add to Favorites" and "Add to Favorites Group" context menu items in additional context menus such as when right clicking an open file tab, or in the text of an open editor. 


## 2.4.5 | 2018/11/29

- fixed vulnerability issue

## 2.4.4 | 2018/11/25

- repo rename

## 2.4.3 | 2018/11/18

- added browsing using keyboard only (mouseless) of favorites via palette `Favorites: Browse`. [#31](https://github.com/kdcro101/vscode-favorites/issues/31)

## 2.3.4 | 2018/11/16

- fixed `Copy path` not working with webpack

## 2.3.2 | 2018/11/16

- extension packed using `webpack.js` for faster loading
- fixed `duplicate` file when inside group

## 2.3.1 | 2018/11/04

- README

## 2.3.0 | 2018/11/03

- added support for multiple/switchable favorite storage per workspace [#28](https://github.com/kdcro101/vscode-favorites/issues/28)
- fixed adding file from editor using command `Favorites: Add to group of favorites` from palette [#26](https://github.com/kdcro101/vscode-favorites/issues/26)

## 2.2.5 | 2018/10/29

- merging update observables

## 2.2.4 | 2018/10/27

- unsubscribe observables on extension deactivation

## 2.2.2 | 2018/10/26

- fixed creating `.vscode/setting.json` when folder gets opened [#25](https://github.com/kdcro101/vscode-favorites/issues/25)

## 2.2.1 | 2018/10/26

- Favorites refresh on FileSystemWatcher events [#24](https://github.com/kdcro101/vscode-favorites/issues/24)
- added `refresh` button

## 2.2.0 | 2018/10/24

- fixed "Remove everything from favorites"
- added configuration `favorites.useWorkspace`
- added workspace folder selection for storage of favorites

## 2.1.5 | 2018/10/22

- fixed `Path must be string. Received null` error [#20](https://github.com/kdcro101/vscode-favorites/issues/20)

## 2.1.2 | 2018/10/21
 
 - added `Copy Name` to copy file name
 - added support for `files.exclude`

## 2.0.5 | 2018/10/18

- Icon + Marketplace banner
- Favorites items are stored, by default, in workspace root as `favorites.json` In case of multiroot workspace, file is located in first workspace. [#13](https://github.com/kdcro101/vscode-favorites/issues/13)  [#18](https://github.com/kdcro101/vscode-favorites/issues/18) [#19](https://github.com/kdcro101/vscode-favorites/issues/19) 
- added configuration item `favorites.storageFilePath` to overrride storage file path relative to workspace. Default is `.favorites.json`

## 2.0.1 | 2018/10/17

- Favorites items are stored in `.vscode/favorites.json`. In case of multiroot workspace, file is located in first workspace. [#13](https://github.com/kdcro101/vscode-favorites/issues/13)  [#18](https://github.com/kdcro101/vscode-favorites/issues/18)  

## 2.0.0 | 2018/10/17

- Favorites items are stored in workspace root as file `.favorites.json`. In case of multiroot workspace, file is located in first workspace. [#13](https://github.com/kdcro101/vscode-favorites/issues/13)  


## 1.9.10 | 2018/10/15

- Marketplace icon + activity bar icon

## 1.9.9 | 2018/10/11

- Fix favorites explorer focusing on acitve editor change. [#16](https://github.com/kdcro101/vscode-favorites/issues/16)

## 1.9.8 | 2018/10/09

- README
- `Add to favorites` executed from command palette adds active document to favorites root

## 1.9.7 | 2018/09/25

- favorites.useTrash -> README
- remove obsolete code

## 1.9.6 | 2018/09/19

- Colored icons for groups are generated when needed if not exists

## 1.9.5 | 2018/09/18

- activity bar icon name change (caching problem - full restart was required)
- README 

## 1.9.3 | 2018/09/18

- remove unicode characters from context menu when adding to favorites [#11](https://github.com/kdcro101/vscode-favorites/issues/11)
- change activity bar icon
- README

## 1.9.2 | 2018/09/15

- change prompt to include `PERMANENTLY` when deleting from file system

## 1.9.1 | 2018/09/12

- Fix reporting of "Unable to identify path" when adding file/directory that is already in favorites

## 1.9.0 | 2018/09/08

- Copy Path

## 1.8.0 | 2018/08/30

- Trash support

## 1.7.3 | 2018/08/21

- view/item context menu fix

## 1.7.2 | 2018/08/18

- code cleanup

## 1.7.1 | 2018/08/16

- file uri fix for external resources

## 1.7.0 | 2018/08/15

- minor bugs
- create group in root from context menu (right click on empty area)
- external resources (files/directories out of workspace) can be added
- minor context menu reordering

## 1.6.0 | 2018/08/08

- reveal file in "favorites" view (if visible) when active editor changes

## 1.5.5 | 2018/08/06

- fs.move -> fs.rename

## 1.5.4 | 2018/08/06

- minor bugs

## 1.5.3 | 2018/08/06

- fs-extra 7.0.0 upgrade

## 1.5.2 | 2018/07/13

- "window.titleBarStyle": "custom" - temporary fix

## 1.5.1 | 2018/07/10

- minor bugs

## 1.5.0 | 2018/07/10

- multiple selection can be added to favorites

## 1.4.4 | 2018/05/25

- fixed file creation bug when user cancel file name input

## 1.4.3 | 2018/05/09

- activationEvents
- fixed command labels

## 1.4.2 | 2018/05/09

- icon
- readme update

## 1.4.1 | 2018/05/09

- fixed bug that may corrupt current favorites data
- remove all icon changed
- missing command labels fixed

## 1.4.0 | 2018/05/09

- groups colors can be changed
- filesystem operations in favorites view
- copy/cut/paste operations in favorites view

## 1.3.1 | 2018/05/08

- minor bugs
- README update

## 1.3.0 | 2018/05/08

- renaming group
- alias for favorite items (custom label)
- activity bar contribution
- minimum vscode version = 1.23.0

## 1.2.1 | 2018/05/07

- minor bugs

## 1.2.0 | 2018/05/02

- added subgroup support


## 1.0.3 | 2018/03/30

- icon change

## 1.0.2 | 2018/03/29

- minor bugs
- README

## 1.0.0 | 2018/03/24

- added option to delete everything

## 0.1.8 | 2018/03/22

- fixed `delete item` menu showing on file system item

## 0.1.4 | 2018/03/21

## 0.1.3 | 2018/03/21

- reduce extension size

## 0.1.2 | 2018/03/20

- update minimum engine to `^1.13.0`

## 0.1.1 | 2018/03/19

- fixed badges link

## 0.1.0 | 2018/03/19

- added ability to group favorites


## 0.0.5 | 2018/03/19

- initial commit
- collapse function
- fixed sorting
