import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, LdsLibrarySettings } from "@/settings";
import { VerseSuggester } from "@/suggestion/VerseSuggester";
import { LdsLibrarySettingTab } from "@/ui/SettingTab";
import { ConferenceSuggester } from "./suggestion/ConferenceSuggester";
import { HymnSuggester } from "./suggestion/HymnSuggester";

export default class LdsLibraryPlugin extends Plugin {
    settings: LdsLibrarySettings;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new LdsLibrarySettingTab(this.app, this));
        this.registerEditorSuggest(new VerseSuggester(this));
        this.registerEditorSuggest(new ConferenceSuggester(this));
        this.registerEditorSuggest(new HymnSuggester(this));
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData(),
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
