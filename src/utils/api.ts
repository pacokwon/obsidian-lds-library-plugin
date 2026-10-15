import { AvailableLanguage } from "@/lang";
import { ParsedURL } from "./url";

export const BASE_URL = "https://www.churchofjesuschrist.org";

export function makeResourceUrl(url: ParsedURL) {
    return `${BASE_URL}/study/api/v3/language-pages/type/content?lang=${url.language}&uri=/${url.kind}${url.resourcePath}`;
}

export function expandResourceUrl(
    path: string,
    language: AvailableLanguage = "eng",
) {
    return `${BASE_URL}/study/api/v3/language-pages/type/content?lang=${language}&uri=${path}`;
}

export function getHymnIndexUrl(lang: AvailableLanguage = "eng") {
    return `${BASE_URL}/study/api/v3/language-pages/type/content?lang=${lang}&uri=/manual/hymns`;
}

export function getConferenceTalkListUrl(
    year: number,
    month: 4 | 10,
    lang: AvailableLanguage = "eng",
) {
    const paddedMonth = month === 4 ? "04" : "10";
    return `${BASE_URL}/study/api/v3/language-pages/type/content?lang=${lang}&uri=/general-conference/${year}/${paddedMonth}`;
}
