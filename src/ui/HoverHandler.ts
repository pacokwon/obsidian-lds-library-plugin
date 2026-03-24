import { HoverPopover } from "obsidian";

export default class HoverHandler {
    private popover: HoverPopover;

    constructor() {
        this.popover = new HoverPopover({ hoverPopover: null }, null);
    }

    onMouseover(event: MouseEvent) {
        const el = event.target as HTMLElement;
        if (el && el.matches("a.external-link")) {
            this.popover.hoverEl.innerHTML = `<div>FOOBAR</div>`;
            this.popover.load();
        }
    }

    onMouseout(event: MouseEvent) {
        const el = event.target as HTMLElement;
        if (el && el.matches("a.external-link")) {
            this.popover.unload();
        }
    }
}
