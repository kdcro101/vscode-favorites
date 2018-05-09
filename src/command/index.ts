import * as fs from "fs";
import * as path from "path";

import * as vscode from "vscode";
import { QuickPickItem } from "vscode";
import { Clipboard } from "../class/clipboard";
import { DataProvider } from "../class/dataProvider";
import { Favorites } from "../class/favorites";
import { FilesystemUtils } from "../class/filesystem";
import { GroupColor } from "../class/group-color";
import { ViewItem } from "../class/view-item";
import workspace from "../class/workspace";
import { ResourceType, StoredResource, TreeProviders } from "../types/index";

export class Commands {
    private clipboard = new Clipboard();
    private filesystem: FilesystemUtils = null;
    private groupColor: GroupColor = null;

    constructor(
        private context: vscode.ExtensionContext,
        public providers: TreeProviders,
        private favorites: Favorites,
    ) {

        this.filesystem = new FilesystemUtils(favorites);
        this.groupColor = new GroupColor(favorites, context);

        context.subscriptions.push(this.addToFavorites());
        context.subscriptions.push(this.deleteFavorite());
        context.subscriptions.push(this.setSortAsc());
        context.subscriptions.push(this.setSortDesc());
        context.subscriptions.push(this.collapse());
        context.subscriptions.push(this.collapseActivityView());
        context.subscriptions.push(this.createGroup());
        context.subscriptions.push(this.addToFavoritesGroup());
        context.subscriptions.push(this.deleteGroup());
        context.subscriptions.push(this.addCurrentFile());
        context.subscriptions.push(this.deleteAllFavorites());
        context.subscriptions.push(this.groupSubgroupAdd());
        context.subscriptions.push(this.groupRename());
        context.subscriptions.push(this.aliasModify());
        context.subscriptions.push(this.aliasRemove());

        context.subscriptions.push(this.fsCopy());
        context.subscriptions.push(this.fsCut());
        context.subscriptions.push(this.fsPaste());
        context.subscriptions.push(this.fsCreateDirectory());
        context.subscriptions.push(this.fsCreateFile());
        context.subscriptions.push(this.fsDuplicate());
        context.subscriptions.push(this.fsDelete());
        context.subscriptions.push(this.fsRename());
        context.subscriptions.push(this.groupColorSet());
    }

    public groupColorSet = () => {
        return vscode.commands.registerCommand("favorites.group.color.set",
            (value: ViewItem) => {

                const list: QuickPickItem[] = [
                    {
                        label: "None",
                        description: "Remove color from group",
                    },
                    {
                        label: "Custom",
                        description: "Use custom color (hex or rgb/rgba)",
                    },
                ].concat(
                    Object.keys(this.groupColor.colorList).map((k) => {
                        const o: QuickPickItem = {
                            label: k,
                            description: this.groupColor.colorList[k],
                        };
                        return o;
                    }),
                );

                vscode.window.showQuickPick(list, {
                    matchOnDescription: true,
                    matchOnDetail: true,
                }).then((result) => {

                    if (result == null) {
                        return Promise.resolve(null);
                    }
                    if (result.label === "None") {
                        return this.groupColor.removeColor(value.id);
                    }
                    if (result.label === "Custom") {
                        return vscode.window.showInputBox({
                            prompt: "New group color",
                            placeHolder: "Enter hex or rgb/rgba value",
                        });
                    }
                    // then desc = #hex
                    return Promise.resolve(result.description);

                }).then((input: string) => {
                    if (input == null) {
                        // no action
                        return Promise.resolve();
                    }

                    return this.groupColor.setColor(value.id, input);
                }).then(() => {
                    console.log("all ok");
                });
            });
    }
    public fsCreateFile = () => {
        return vscode.commands.registerCommand("filesystem.create.file",
            // tslint:disable-next-line:no-empty
            (value: ViewItem) => {
                this.filesystem.createFile(value)
                    .then((result) => {
                        this.providers.refresh();
                    })
                    .catch((e) => {
                        this.providers.refresh();
                        console.log(e);
                    });
            });
    }
    public fsCreateDirectory = () => {
        return vscode.commands.registerCommand("filesystem.create.directory",
            // tslint:disable-next-line:no-empty
            (value: ViewItem) => {
                this.filesystem.createDirectory(value)
                    .then((result) => {
                        this.providers.refresh();
                    })
                    .catch((e) => {
                        this.providers.refresh();
                        console.log(e);
                    });
            });
    }
    public fsCopy = () => {
        return vscode.commands.registerCommand("filesystem.copy",
            // tslint:disable-next-line:no-empty
            (value: ViewItem) => {
                this.clipboard.copy(value);
            });
    }
    public fsCut = () => {
        return vscode.commands.registerCommand("filesystem.cut",
            // tslint:disable-next-line:no-empty
            (value: ViewItem) => {
                this.clipboard.cut(value);
            });
    }
    public fsPaste = () => {
        return vscode.commands.registerCommand("filesystem.paste",
            // tslint:disable-next-line:no-empty
            (value: ViewItem) => {
                const state = this.clipboard.get();
                if (state == null) {
                    return;
                }
                switch (state.operation) {
                    case "copy":
                        this.filesystem.copy(state.item, value)
                            .then((result) => {
                                this.providers.refresh();
                                // this.clipboard.reset();
                            })
                            .catch((e) => {
                                console.log(e);
                            });
                        break;
                    case "cut":
                        this.filesystem.move(state.item, value)
                            .then((result) => {
                                this.providers.refresh();
                                this.clipboard.reset();
                            })
                            .catch((e) => {
                                console.log(e);
                            });
                        break;
                }

            });
    }
    public fsDelete = () => {
        return vscode.commands.registerCommand("filesystem.delete",
            // tslint:disable-next-line:no-empty
            (value: ViewItem) => {
                this.filesystem.delete(value)
                    .then((result) => {
                        this.providers.refresh();
                    })
                    .catch((e) => {
                        this.providers.refresh();
                        console.log(e);
                    });
            });
    }
    public fsRename = () => {
        return vscode.commands.registerCommand("filesystem.rename",
            // tslint:disable-next-line:no-empty
            (value: ViewItem) => {
                this.filesystem.rename(value)
                    .then((result) => {
                        this.providers.refresh();
                    })
                    .catch((e) => {
                        this.providers.refresh();
                        console.log(e);
                    });
            });
    }
    public fsDuplicate = () => {
        return vscode.commands.registerCommand("filesystem.duplicate",
            // tslint:disable-next-line:no-empty
            (value: ViewItem) => {
                this.filesystem.duplicate(value)
                    .then((result) => {
                        this.providers.refresh();
                    })
                    .catch((e) => {
                        this.providers.refresh();
                        console.log(e);
                    });
            });
    }
    public aliasRemove = () => {
        return vscode.commands.registerCommand("favorites.alias.remove",
            (value: ViewItem) => {

                this.favorites.labelModify(value.id, null)
                    .then((result) => {
                        this.providers.refresh();
                    })
                    .catch((e) => {
                        console.log(e);
                    });

            });

    }
    public aliasModify = () => {
        return vscode.commands.registerCommand("favorites.alias.modify",
            (value: ViewItem) => {

                this.favorites.get()
                    .then((result) => {
                        const item = result.find((r) => r.id === value.id);
                        const oldVal = (item != null && item.label != null) ? item.label : "";
                        vscode.window.showInputBox({ prompt: "Enter alias", value: oldVal })
                            .then((name) => {
                                if (!name || name.trim().length === 0) {
                                    return;
                                }
                                const tname = name.trim();
                                this.favorites.labelModify(value.id, tname);
                                this.providers.refresh();
                            });

                    })
                    .catch((e) => {
                        console.log(e);
                    });

            });

    }
    public groupRename = () => {
        return vscode.commands.registerCommand("favorites.group.rename",
            (value: ViewItem) => {
                vscode.window.showInputBox({ prompt: "Enter new group name" })
                    .then((name) => {
                        if (!name || name.trim().length === 0) {
                            return;
                        }
                        const tname = name.trim();
                        this.favorites.groupRename(value.id, tname);
                        this.providers.refresh();
                    });

            });

    }
    public groupSubgroupAdd = () => {
        return vscode.commands.registerCommand("favorites.group.subgroup.create",
            (value: ViewItem) => {

                vscode.window.showInputBox({ prompt: "Enter subgroup name" })
                    .then((name) => {
                        console.log(name);
                        if (!name || name.trim().length === 0) {
                            return;
                        }
                        const tname = name.trim();
                        this.favorites.addGroup(value.id, tname);

                    });

            });
    }
    addToFavorites = () => {
        return vscode.commands.registerCommand("favorites.addToFavorites", (fileUri?: vscode.Uri) => {
            if (!fileUri) {
                return vscode.window.showWarningMessage("You have to call this extension from explorer");
            }

            const itemPath = fileUri.fsPath;
            this.favorites.addPathToGroup(null, itemPath);
        });
    }
    addToFavoritesGroup = () => {
        return vscode.commands.registerCommand("favorites.addToFavoritesGroup", (fileUri?: vscode.Uri) => {
            if (!fileUri) {
                return vscode.window.showWarningMessage("You have to call this extension from explorer");
            }

            this.favorites.generateGroupQuickPickList()
                .then((result) => {

                    if (result.length === 0) {
                        vscode.window.showWarningMessage("No group definition found. Create group first.");
                        return;
                    }
                    vscode.window.showQuickPick(result)
                        .then((pickedItem) => {
                            if (pickedItem == null) {
                                // canceled
                                return;
                            }
                            const itemPath = fileUri.fsPath;
                            this.favorites.addPathToGroup(pickedItem.id, itemPath);
                        });

                })
                .catch((e) => {
                    console.log(e);
                });

        });
    }
    collapse = () => {
        return vscode.commands.registerCommand("favorites.collapse", (v) => {

            this.providers.explorer.returnEmpty = true;
            this.providers.refresh();

            setTimeout(() => {
                this.providers.explorer.returnEmpty = false;
                this.providers.refresh();

            }, 400);

            console.log(v);

        });
    }
    collapseActivityView = () => {
        return vscode.commands.registerCommand("favorites.collapse.activity", (v) => {

            this.providers.activity.returnEmpty = true;
            this.providers.activity.refresh();

            setTimeout(() => {
                this.providers.activity.returnEmpty = false;
                this.providers.activity.refresh();

            }, 400);

            console.log(v);

        });
    }
    deleteFavorite = () => {
        return vscode.commands.registerCommand("favorites.deleteFavorite",
            (value: ViewItem) => {

                this.favorites.removeResource(value.id);
                this.providers.refresh();
            });
    }
    setSortAsc = () => {
        return vscode.commands.registerCommand("favorites.nav.sort.az", (value: ViewItem) => {
            const config = vscode.workspace.getConfiguration("favorites");

            vscode.commands.executeCommand("setContext", "sort", "ASC");
            return config.update("sortDirection", "ASC", false);

        });
    }
    setSortDesc = () => {
        return vscode.commands.registerCommand("favorites.nav.sort.za", (value: ViewItem) => {
            const config = vscode.workspace.getConfiguration("favorites");

            vscode.commands.executeCommand("setContext", "sort", "DESC");
            config.update("sortDirection", "DESC", false);

        });
    }
    createGroup = () => {
        return vscode.commands.registerCommand("favorites.group.create", () => {

            vscode.window.showInputBox({ prompt: "Enter group name" }).then((name) => {
                console.log(name);
                if (!name || name.trim().length === 0) {
                    return;
                }
                const tname = name.trim();
                this.favorites.addGroup(null, tname);

            });
        });
    }
    deleteGroup = () => {
        return vscode.commands.registerCommand("favorites.group.delete",
            (value: ViewItem) => {
                this.favorites.removeResource(value.id);
            });
    }
    addCurrentFile = () => {
        return vscode.commands.registerCommand("favorites.add.current", (value: any) => {
            const fsPath = vscode.window.activeTextEditor.document.fileName;
            this.favorites.addPathToGroup(null, fsPath)
                .then((result) => {
                    vscode.window.showInformationMessage(`${fsPath} added to favorites`);
                })
                .catch((e) => {
                    console.log(e);
                });
        });
    }
    deleteAllFavorites = () => {
        return vscode.commands.registerCommand("favorites.delete.all", (value: any) => {

            vscode.window.showInputBox({
                prompt: "Do you want to remove ALL favorites (including groups)?",
                placeHolder: "type 'yes' to remove everything",
            })
                .then((val) => {
                    if (val === "yes") {
                        workspace.save("root", [])
                            .then(() => {
                                vscode.window.showInformationMessage(`All favorites are removed`);

                            });

                    }
                });
            //

        });
    }
}
