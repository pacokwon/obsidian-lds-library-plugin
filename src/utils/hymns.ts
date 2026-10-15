import * as cheerio from "cheerio";
import { requestUrl } from "obsidian";
import { AvailableLanguage } from "@/lang";
import { getHymnIndexUrl } from "./api";

export type HymnEntry = {
    /** Position in the hymnbook index, which is the hymn number. */
    number: number;
    title: string;
    /** Resource path such as /manual/hymns/i-stand-all-amazed */
    href: string;
};

export interface HymnCalloutData {
    url: string;
    title: string;
    number: number;
    content: string[];
    /** Lines from the hymn's credits block, e.g. "Text and music: Charles H. Gabriel, 1856–1932" */
    credits: string[];
}

const indexCache = new Map<AvailableLanguage, HymnEntry[]>();

/**
 * The hymnbook index, numbered by position. The Church's index lists hymns in
 * hymnbook order without printing numbers, so position is the number; this
 * holds for the English 1985 hymnal (341 hymns) and is the best available
 * guess for other languages.
 */
export async function fetchHymnIndex(
    language: AvailableLanguage,
): Promise<HymnEntry[]> {
    const cached = indexCache.get(language);
    if (cached) return cached;

    const response = await requestUrl({
        url: getHymnIndexUrl(language),
        method: "GET",
    });
    const $ = cheerio.load(response.json.content.body);

    let anchors = $("nav > ul > li > ul > li > a");
    if (anchors.length === 0) anchors = $("nav a");

    const entries: HymnEntry[] = anchors
        .map((i, el) => {
            const title = $(el).find("p.title").text().trim() || $(el).text().trim();
            const _href = $(el).attr("href") ?? "";
            const match = _href.match(/\/study([^?]*)/);
            if (match === null)
                throw new Error(`${_href} is not a valid resource path`);
            return { number: i + 1, title, href: match[1] };
        })
        .get();

    indexCache.set(language, entries);
    return entries;
}

/** Credits lines from a loaded hymn page, in the order they appear. */
export function findHymnCredits(root: ParentNode): string[] {
    return Array.from(root.querySelectorAll(".citation-info p")).flatMap(
        (el) => {
            const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
            return text ? [text] : [];
        },
    );
}

/**
 * Lines of a hymn as a callout. Consecutive lines are joined with hard
 * breaks so each stays on its own line; a new stanza or chorus (a line that
 * starts with a verse number or a bracketed label) starts a new block.
 */
export function toHymnCalloutString(hymn: HymnCalloutData): string {
    const { url, title, number, content, credits } = hymn;

    const header = `>[!ldslib] [${title}](${url})`;

    const blocks: string[][] = [];
    for (const raw of content) {
        const line = raw.replace(/\s+/g, " ").trim();
        if (!line) continue;
        const startsBlock = /^(\d+\.\s|\[.+\]$)/.test(line);
        if (startsBlock || blocks.length === 0) blocks.push([line]);
        else blocks[blocks.length - 1].push(line);
    }
    const body = blocks
        .map((lines) =>
            lines
                .map((l, i) => (i < lines.length - 1 ? `> ${l}\\` : `> ${l}`))
                .join("\n"),
        )
        .join("\n>\n");

    const byline = ["[!ldslib-byline]", `Hymns, no. ${number}`, ...credits]
        .map((s) => `>> ${s}`)
        .join("\n");

    return [header, body, byline, ""].join("\n");
}
