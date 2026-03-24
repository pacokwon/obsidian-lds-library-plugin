import { Suggestion } from "./Suggestion";

export class VerseLinkSuggestion implements Suggestion {
    constructor(
        private url: string,
        private bookAndChapter: string,
        private verseString: string,
    ) {}

    public getReplacement(): string {
        const range = this.verseString.replaceAll(",", ", ");
        return `[${this.bookAndChapter}:${range}](${this.url})`;
    }

    public render(el: HTMLElement): void {
        const outer = el.createDiv({ cls: "obr-suggester-container" });
        outer
            .createDiv({ cls: "obr-shortcode" })
            .setText(
                `Insert Link to ${this.bookAndChapter}:${this.verseString}`,
            );
    }
}
