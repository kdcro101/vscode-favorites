
// declare module "renderjson" {

//   export default function (data: any);
//   export function set_icons(collapse: string, uncollapse: string);
//   // set_max_string_length: function()
//   // set_property_list: function()
//   // set_replacer: function()
//   // set_show_by_default: function()
//   // set_show_to_level: function()
//   // set_sort_objects: function()

// }

declare module "trash" {
    interface TrashOptions {
        glob: boolean;
    }
    function trash (iterable: Iterable<string>, opts?: TrashOptions): Promise<void>;
    export = trash;
}


