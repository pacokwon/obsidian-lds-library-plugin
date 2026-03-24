export interface Suggestion {
    render(el: HTMLElement): void;
    getReplacement(): string;
}
