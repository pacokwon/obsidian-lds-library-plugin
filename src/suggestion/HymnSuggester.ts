import {
    App,
    Editor,
    EditorPosition,
    EditorSuggest,
    EditorSuggestContext,
    EditorSuggestTriggerInfo,
    Notice,
    TFile,
} from "obsidian";
import LdsLibraryPlugin from "@/LdsLibraryPlugin";
import { AvailableLanguage, isAvailableLanguage } from "@/lang";
import { HymnSuggestModal } from "@/ui/HymnSuggestModal";
import { SpinnerModal } from "@/ui/SpinnerModal";
import { TalkParagraphPicker } from "@/ui/TalkParagraphPicker";
import { BASE_URL } from "@/utils/api";
import {
    HymnEntry,
    fetchHymnIndex,
    findHymnCredits,
    toHymnCalloutString,
} from "@/utils/hymns";
import { SingleSuggestion } from "./SingleSuggestion";

/**
 * `:Hymn:` opens the hymn picker; `:Hymn 193:` or `:Hymn amazed:` opens it
 * with that search already typed. `:[eng] Hymn 193:` picks the language.
 */
const HYMN_REG = /^:(?:\[(\w{3})\]\s+)?[hH]ymns?(?:\s+([^:]*?))?\s*:$/;

type HymnPrompt = { language: AvailableLanguage; query: string };
type HymnPromptSuggestion = SingleSuggestion<HymnPrompt>;

export class HymnSuggester extends EditorSuggest<HymnPromptSuggestion> {
    public app: App;

    constructor(public plugin: LdsLibraryPlugin) {
        super(plugin.app);
        this.app = plugin.app;
    }

    onTrigger(
        cursor: EditorPosition,
        editor: Editor,
        _file: TFile | null,
    ): EditorSuggestTriggerInfo | null {
        const currentContent = editor
            .getLine(cursor.line)
            .substring(0, cursor.ch);
        const match = currentContent.match(HYMN_REG)?.[0] ?? "";
        if (!match) return null;
        return {
            start: { line: cursor.line, ch: currentContent.lastIndexOf(match) },
            end: cursor,
            query: match,
        };
    }

    async getSuggestions(
        context: EditorSuggestContext,
    ): Promise<HymnPromptSuggestion[]> {
        const match = context.query.match(HYMN_REG);
        if (match === null) return [];

        const language = match[1] ?? this.plugin.settings.language;
        if (!isAvailableLanguage(language))
            throw new Error(`${language} is not a valid language option`);

        const query = (match[2] ?? "").trim();
        const text = query
            ? `Open Hymn Picker for "${query}"`
            : "Open Hymn Picker";
        return [new SingleSuggestion<HymnPrompt>({ language, query }, text)];
    }

    renderSuggestion(suggestion: HymnPromptSuggestion, el: HTMLElement): void {
        suggestion.render(el);
    }

    async selectSuggestion(
        suggestion: HymnPromptSuggestion,
        _evt: MouseEvent | KeyboardEvent,
    ): Promise<void> {
        if (!this.context) return;

        // context will become null once SpinnerModal is closed. snapshot variables to use in the future
        const { editor, start, end } = this.context;
        const { language, query } = suggestion.data;

        const spinnerModal = new SpinnerModal(this.app);
        spinnerModal.open();
        let hymns: HymnEntry[];
        try {
            hymns = await fetchHymnIndex(language);
        } catch (e) {
            console.error(e);
            new Notice("Could not load the hymn index. Check your connection and try again.");
            return;
        } finally {
            spinnerModal.close();
        }
        if (hymns.length === 0) {
            new Notice("The hymn index came back empty.");
            return;
        }

        new HymnSuggestModal(this.app, hymns, query, ({ number, title, href }) => {
            new TalkParagraphPicker(
                this.app,
                href,
                language,
                ({ start: startId, range, content, root }) => {
                    const url = `${BASE_URL}/study${href}?lang=${language}&id=${range}#${startId}`;
                    const callout = toHymnCalloutString({
                        url,
                        title,
                        number,
                        content,
                        credits: findHymnCredits(root),
                    });
                    editor.replaceRange(callout, start, end);
                    new Notice(`Inserted ${content.length} line${content.length === 1 ? "" : "s"} from hymn ${number}.`);
                },
            ).open();
        }).open();
    }
}
