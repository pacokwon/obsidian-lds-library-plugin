import { App, FuzzySuggestModal } from "obsidian";
import { HymnEntry } from "@/utils/hymns";

/** Fuzzy picker over the hymnbook, searchable by number or title. */
export class HymnSuggestModal extends FuzzySuggestModal<HymnEntry> {
    constructor(
        app: App,
        private hymns: HymnEntry[],
        private initialQuery: string,
        private onChoose?: (v: HymnEntry) => void,
    ) {
        super(app);
        this.limit = hymns.length;
        this.setPlaceholder("Hymn number or title");
    }

    onOpen(): void {
        super.onOpen();
        if (this.initialQuery) {
            this.inputEl.value = this.initialQuery;
            this.inputEl.dispatchEvent(new Event("input"));
        }
    }

    getItems(): HymnEntry[] {
        return this.hymns;
    }

    getItemText(item: HymnEntry): string {
        return `${item.number} ${item.title}`;
    }

    onChooseItem(value: HymnEntry, _evt: MouseEvent | KeyboardEvent): void {
        this.onChoose?.(value);
    }
}
