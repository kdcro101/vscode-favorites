import { from } from "rxjs";
import { map } from "rxjs/operators";
import * as vscode from "vscode";
import { ResourceType } from "../types";
import { Favorites } from "./favorites";
import { FavoritesBrowser } from "./favorites-browser";
import { ViewItem } from "./view-item";

export interface FavoritesNavigatorQuickPickItem extends vscode.QuickPickItem {
    viewItem: ViewItem;
    parent?: ViewItem;
    upLevel: boolean;
}

export class FavoritesNavigator {
    private browser: FavoritesBrowser = null;
    constructor(private favorites: Favorites) {
        this.browser = new FavoritesBrowser(this.favorites);
    }

    public build(item: ViewItem): Promise<FavoritesNavigatorQuickPickItem[]> {
        return new Promise((resolve, reject) => {

            from(Promise.all([
                this.browser.getChildren(item),
                this.browser.getParent(item),
            ])).pipe(
                map<[ViewItem[], ViewItem], FavoritesNavigatorQuickPickItem[]>((result) => {

                    const listItems = result[0] ? result[0] : [];
                    const parent = result[1];

                    let pickItems: FavoritesNavigatorQuickPickItem[] = item ? [{
                        label: "↰ ..",
                        viewItem: null,
                        upLevel: true,
                        parent,
                    }] : [];

                    const contents = listItems.map((i) => {
                        let label = "";
                        let desc = "";
                        if (i.resourceType === ResourceType.Group) {
                            label = `■ ${i.label}`;
                            desc = "group";
                        }
                        if (i.resourceType === ResourceType.Directory) {
                            label = `□ ${i.label}`;
                            desc = "directory";
                        }
                        if (i.resourceType === ResourceType.File) {
                            label = `${i.label}`;
                            desc = "file";
                        }

                        const out: FavoritesNavigatorQuickPickItem = {
                            label,
                            description: desc,
                            viewItem: i,
                            upLevel: false,
                        };
                        return out;
                    });

                    pickItems = pickItems.concat(contents);

                    return pickItems;
                }),
            ).subscribe((list) => {
                resolve(list);
            }, (e) => {
                reject(e);
            });

        });
    }
}
