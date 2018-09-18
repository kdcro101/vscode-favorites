import * as Color from "color";
import * as fs from "fs-extra";
import * as colors from "html-colors";
import * as md5 from "md5";
import * as path from "path";
import { ExtensionContext } from "vscode";
import { HtmlColor } from "../types";
import { Favorites } from "./favorites";

const STORAGE_DIRECTORY: string = "svg-generated";

export class GroupColor {
    public colorList: HtmlColor = colors.all();
    public storagePath: string = null;
    constructor(private favorites: Favorites, private context: ExtensionContext) {
        this.storagePath = path.join(this.context.extensionPath, STORAGE_DIRECTORY);
    }
    public getIconPath(normalizedColor: string) {
        const ip = this.iconPath(normalizedColor);
        const exists = fs.pathExistsSync(ip);

        if (exists) {
            return ip;
        }
        const svg = this.build(normalizedColor);
        const dir = path.dirname(ip);
        fs.mkdirpSync(dir);
        fs.writeFileSync(ip, svg);
        return ip;

    }
    public iconPath(normalizedColor: string): string {
        const h = md5(normalizedColor);
        const p = path.join(this.storagePath, `icon_${h}.svg`);
        return p;
    }
    public setColor(id: string, colorDef: string) {
        return new Promise((resolve, reject) => {

            const isColor = this.isColor(colorDef);
            if (!isColor) {
                reject("invalid_color");
                return;
            }

            const normColor = this.normalizeColor(colorDef);
            const iconPath = this.iconPath(normColor);
            const iconData = this.build(normColor);

            fs.outputFile(iconPath, iconData)
                .then(() => {
                    return this.groupIconSet(id, normColor);
                }).then(() => {
                    resolve();
                }).catch((e) => {
                    reject(e);
                });
        });
    }
    public isColor(colorDef: string): boolean {
        try {
            const c = Color(colorDef);
            const rgb = c.rgb().string(4);
            return true;
        } catch (e) {

            return false;
        }

        // colorDef.match(new RegExp(/#[0-9a-f]{6}/, "i"));
    }
    public normalizeColor(color: string): string {
        try {
            const c = Color(color);
            const rgb = c.rgb().string(4);
            return rgb;
        } catch (e) {
            return null;
        }
    }
    public removeColor(id: string) {
        return this.groupIconRemove(id);
    }
    private groupIconRemove(id: string) {
        return new Promise((resolve, reject) => {

            Promise.all([
                this.favorites.get(),
            ]).then((results) => {
                const all = results[0];
                const i = all.findIndex((d) => d.id === id);

                if (i < 0) {
                    reject("no_item");
                    return;
                }

                delete all[i].iconColor;

                return this.favorites.save(all);

            }).then(() => {
                resolve();
            }).catch((e) => {
                reject(e);
            });

        });
    }
    private groupIconSet(id: string, normalizedColor: string) {
        return new Promise((resolve, reject) => {

            Promise.all([
                this.favorites.get(),
            ]).then((results) => {
                const all = results[0];
                const i = all.findIndex((d) => d.id === id);

                if (i < 0) {
                    reject("no_item");
                    return;
                }

                all[i].iconColor = normalizedColor;

                return this.favorites.save(all);

            }).then(() => {
                resolve();
            }).catch((e) => {
                reject(e);
            });

        });
    }
    private build(fillColor: string) {
        const o = `

<svg version="1.1" id="_x31_0" xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
x="0px" y="0px" viewBox="0 0 512 512" style="width: 256px; height: 256px; opacity: 1;" xml:space="preserve">
<g>
        <path class="st0" d="M225.645,129.496c15.214,0.086,29.523,6.157,42.578,18.298l1.418,1.332l40.5,43.746h117.774V75.836
        l-212.332-0.25l-47.91-51.73c-9.981-9.153-18.797-11.562-25.699-11.645L1.578,12.043H0.418L0.332,75.254v6.484L0,349.332
        c0,8.734,6.988,15.887,15.718,15.887l35.165,0.082V231.98v-6.488v-63.294v-32.867H85.25L225.645,129.496z"
        style="fill: ${fillColor};"></path>
        <path class="st0"
        d="M427.914,225.824H299.246l-47.902-51.731c-9.985-9.152-18.715-11.562-25.699-11.644L85.25,162.281h-1.082
        L84,225.492v6.488L83.836,365.3l-0.168,118.27c0,8.734,7.07,15.887,15.801,15.887l396.313,0.5c8.734,0,16.218-7.07,16.218-15.805
        V225.824H427.914z" style="fill: ${fillColor};">
        </path>
</g>
</svg>
        `;
        return o;
    }

}
