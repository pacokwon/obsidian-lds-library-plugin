import { App, Modal, Notice, requestUrl } from "obsidian";
import { AvailableLanguage } from "@/lang";
import { expandResourceUrl } from "@/utils/api";
import { findAuthor } from "@/utils/dom";
import { withSpinner } from "./spinner";

type Selection = {
    start: string;
    range: string;
    content: string[];
    author: { name: string; role: string };
    /** The loaded page, so callers can read extra metadata (e.g. hymn credits). */
    root: ParentNode;
};
export class TalkParagraphPicker extends Modal {
    // set of ids of paragraphs that are selected
    private selected: Set<string>;

    // list of paragraph ids to avoid re-querying in the merge algorithm
    private ids: string[];

    constructor(
        app: App,
        private resourcePath: string,
        private language: AvailableLanguage,
        private onPick: (result: Selection) => void,
    ) {
        super(app);
        this.selected = new Set();
    }

    // INFO: entrypoint to the modal
    async onOpen() {
        this.contentEl.addClass("conference-talk-modal");
        await this.populateParagraphElements();
    }

    async fetchTalkBody(): Promise<string> {
        const url = expandResourceUrl(this.resourcePath, this.language);
        const response = await withSpinner(this.contentEl, () =>
            requestUrl({ url, method: "GET" }),
        );
        return response.json.content.body;
    }

    async populateParagraphElements() {
        const body = await this.fetchTalkBody();

        // create template, manipulate dom and insert in the end
        const tpl = document.createElement("template");
        tpl.innerHTML = body;

        // remove footer
        tpl.content.querySelector("footer")?.remove();

        const div = this.makeButtonContainerDiv();

        // paragraphs (actually contains other elements like h1, etc)
        const ps = tpl.content.querySelectorAll("[data-aid]");
        this.ids = Array.from(ps).flatMap((e) => {
            // verbose function body due to type checking limitations if written otherwise
            const id = e.getAttribute("id");
            if (id !== null) return [id];
            else return [];
        });
        const setSelected = (id: string, on: boolean) => {
            const target = tpl.content.getElementById(id) ?? this.contentEl.querySelector(`#${CSS.escape(id)}`);
            if (on) this.selected.add(id);
            else this.selected.delete(id);
            if (target instanceof HTMLElement) target.toggleClass("selected", on);
        };
        let lastClicked: string | null = null;
        const selectRun = (fromId: string, toId: string) => {
            const a = this.ids.indexOf(fromId);
            const b = this.ids.indexOf(toId);
            if (a === -1 || b === -1) return false;
            const [from, to] = a < b ? [a, b] : [b, a];
            for (let i = from; i <= to; i++) setSelected(this.ids[i], true);
            lastClicked = toId;
            return true;
        };
        // Sweeping the mouse from one line to another, the way you would select
        // text, selects the whole run. (A press and release on the same line is
        // an ordinary click, handled below.)
        let pressedId: string | null = null;
        ps.forEach((el) => {
            el.addEventListener("mousedown", () => {
                pressedId = el.getAttribute("id");
            });
            el.addEventListener("mouseup", () => {
                const id = el.getAttribute("id");
                if (pressedId !== null && id !== null && pressedId !== id) {
                    selectRun(pressedId, id);
                    this.contentEl.win.getSelection()?.removeAllRanges();
                }
                pressedId = null;
            });
        });
        ps.forEach((el) => {
            el.addEventListener("click", (evt) => {
                const id = el.getAttribute("id");

                if (id === null) return;

                // Shift+click selects the whole run from the last clicked item to this one.
                const shift = evt instanceof MouseEvent && evt.shiftKey;
                if (shift && lastClicked !== null && lastClicked !== id) {
                    if (selectRun(lastClicked, id)) return;
                }

                setSelected(id, !this.selected.has(id));
                lastClicked = id;
            });
        });

        this.contentEl.append(tpl.content);
        this.modalEl.appendChild(div);
    }

    makeSelection(): Selection | null {
        const ranges: Array<[string, string]> = [];

        // iterate through ids, see if any consecutive ids are in the set
        for (let i = 0; i < this.ids.length; i++) {
            if (!this.selected.has(this.ids[i])) continue;

            let j = i + 1;
            while (j < this.ids.length && this.selected.has(this.ids[j])) {
                j++;
            }
            ranges.push([this.ids[i], this.ids[j - 1]]);

            i = j - 1;
        }

        if (ranges.length === 0) return null;

        const ids = Array.from(this.selected.entries())
            .map(([id, _]) => `#${id}`)
            .join(",");
        const idElements = this.contentEl.querySelectorAll(ids);
        const content = Array.from(idElements).flatMap((el) =>
            el.textContent !== null ? [el.textContent] : [],
        );
        const author = findAuthor(this.contentEl);

        return {
            start: ranges[0][0],
            range: ranges
                .map(([a, b]) => (a === b ? a : `${a}-${b}`))
                .join(","),
            content,
            author,
            root: this.contentEl,
        };
    }

    makeButtonContainerDiv() {
        // div is the flexbox. it aligns the button to the right
        const div = document.createElement("div");
        div.className = "button-box";

        const button = document.createElement("button");
        button.className = "create-link mod-cta";
        button.textContent = "Insert Link";
        button.addEventListener("click", (_) => {
            const selection = this.makeSelection();

            if (selection === null) {
                new Notice("Click one or more paragraphs or lines first, then Insert Link.");
                return;
            }

            try {
                this.onPick(selection);
            } catch (e) {
                console.error(e);
                new Notice(
                    `Could not insert: ${e instanceof Error ? e.message : String(e)}`,
                );
                return;
            }
            this.close();
        });

        div.appendChild(button);

        return div;
    }

    onClose() {
        this.contentEl.empty();
        this.selected.clear();
    }
}
