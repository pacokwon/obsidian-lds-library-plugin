import { fetchScripture } from "@/utils/scripture";
import { syntaxTree } from "@codemirror/language";
import { Range, RangeSetBuilder } from "@codemirror/state";
import {
    Decoration,
    DecorationSet,
    EditorView,
    hoverTooltip,
    ViewPlugin,
    WidgetType,
} from "@codemirror/view";
import { App } from "obsidian";

function debug(view, pos) {
    const tree = syntaxTree(view.state);
    let cursor = tree.resolve(pos, -1);

    console.group(`Syntax stack at pos ${pos}`);
    do {
        console.log(
            `${cursor.type.name} [${cursor.from}, ${cursor.to}]`,
            `"${view.state.doc.sliceString(cursor.from, cursor.to).replace(/\n/g, "\\n")}"`,
        );
    } while (cursor.parent());
    console.groupEnd();

    // Tooltip content
    return {
        pos: 0,
        end: 0,
        create(view) {
            const dom = document.createElement("div");
            dom.textContent = `Google link:`;
            dom.className = "google-hover-tooltip";
            return { dom };
        },
    };
}

export const linkViewPlugin = hoverTooltip((view, pos) => {
    const tree = syntaxTree(view.state);
    let node = tree.resolve(pos, -1);

    const doc = view.state.doc;

    // Extract destination
    console.log(
        `${node.type.name} [${node.from}, ${node.to}] ${doc.sliceString(node.from, node.to)}`,
    );

    let cursor = node.node.cursor();
    if (cursor.type.name !== "link") return null;

    while (cursor.type.name !== "string_url") cursor.nextSibling();

    const url = doc.sliceString(cursor.from, cursor.to);

    return {
        pos: cursor.from,
        end: cursor.to,
        above: true,
        create(view) {
            const dom = document.createElement("div");
            fetchScripture(url).then(({ verses }) => {
                dom.textContent = verses.join("\n");
            });
            dom.className = "popover hover-popover";
            dom.textContent = url;
            return { dom };
        },
    };
});
