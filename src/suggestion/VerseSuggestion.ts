import { AvailableLanguage } from "@/lang";
import { bookData } from "@/utils/config";
import { fetchScripture } from "@/utils/scripture";
import { Suggestion } from "./Suggestion";
import { VerseLinkSuggestion } from "./VerseLinkSuggestion";

export class VerseSuggestion implements Suggestion {
    public text: string;
    public previewText: string;
    private bookTitleInLanguage: string;
    private verseIds: string;
    private url: string;

    private constructor(
        public book: string,
        public chapter: number,
        public verseString: string,
        public lang: AvailableLanguage,
    ) {
        this.verseIds = verseString
            .split(",")
            .map((range) =>
                range
                    .split("-")
                    .map((verse) => `p${verse}`)
                    .join("-"),
            )
            .join(",");
    }

    // factory function
    static async create(
        book: string,
        chapter: number,
        verseString: string,
        lang: AvailableLanguage,
    ) {
        const suggestion = new VerseSuggestion(
            book,
            chapter,
            verseString,
            lang,
        );

        await suggestion.loadVerse();
        return suggestion;
    }

    public getReplacement(): string {
        const range = this.verseString.replaceAll(",", ", ");
        return [
            `> [!ldslib] [${this.bookTitleInLanguage}:${range}](${this.url})`,
            this.text,
            "",
        ].join("\n");
    }

    private getUrl(volumeTitleShort: string, bookTitleShort: string): string {
        return `https://www.churchofjesuschrist.org/study/scriptures/${volumeTitleShort}/${bookTitleShort}/${this.chapter}?lang=${this.lang}&id=${this.verseIds}`;
    }

    private getShortenedName(bookTitle: string) {
        for (const [name, info] of Object.entries(bookData)) {
            if (
                info.names.some(
                    (name) => name.toLowerCase() === bookTitle.toLowerCase(),
                )
            ) {
                const volume = info.volume;
                return [name, volume];
            }
        }

        console.error(`Could not find book with title ${bookTitle}`);
        return ["", ""];
    }

    private async loadVerse(): Promise<void> {
        const [bookTitleShort, volumeTitleShort] = this.getShortenedName(
            this.book,
        );

        if (bookTitleShort === "" || volumeTitleShort === "")
            throw new Error(`Couldn't find book name ${this.book}`);

        this.url = this.getUrl(volumeTitleShort, bookTitleShort);

        const scriptureData = await fetchScripture(this.url);
        this.bookTitleInLanguage = scriptureData.nativeBookTitle;
        const verses = scriptureData.verses.map((_verse) => {
            const [_, verseNumber, text] = _verse.match(/^(\d+)\s*(.*)$/) ?? [
                null,
                "0",
                "",
            ];
            const verse = Number(verseNumber);

            return {
                volumeTitleShort,
                bookTitleShort,
                chapter: this.chapter,
                verse,
                text,
            };
        });

        this.text = verses
            .map(({ verse, text }) => `> ${verse} ${text}`)
            .join("\n");

        this.previewText = verses
            .map(({ verse, text }) => `${verse} ${text}`)
            .join("\n");
    }

    public render(el: HTMLElement): void {
        const outer = el.createDiv({ cls: "obr-suggester-container" });
        outer.createDiv({ cls: "obr-shortcode" }).setText(this.previewText);
    }

    public toVerseLinkSuggestion(): VerseLinkSuggestion {
        return new VerseLinkSuggestion(
            this.url,
            this.bookTitleInLanguage,
            this.verseString,
        );
    }
}
