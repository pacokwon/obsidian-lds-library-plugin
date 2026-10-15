# LDS Library Reference Plugin for Obsidian

Easily insert your favorite scripture verses and selections from General Conference talks into Obsidian!

[demo](https://github.com/user-attachments/assets/9c5dca75-2104-4bc0-9467-84ca9b5ff541)

---

## Table of Contents

- [Quickstart](#quickstart)
- [Features](#features)
    - [Multiple Scripture Support](#multiple-scripture-support)
        - [How to Reference Verses](#how-to-reference-verses)
    - [General Conference Support](#general-conference-support)
        - [How to Quote General Conference](#how-to-quote-general-conference)
    - [Multiple Language Support](#multiple-language-support)
        - [Default Language](#default-language)
        - [One-time Language Syntax](#one-time-language-syntax)
- [Development](#development)
- [Versioning](#versioning)

---
# Quickstart

## Requirements

You only need Obsidian installed!

## Installation

### Community Plugin

This plugin can be found from the list of community plugins for Obsidian. Open Obsidian's Settings -> Community Plugins, and click `Browse` to search this plugin's name and install.

### Manual Installation

The plugin can also be manually installed by:

1. Creating a directory called `lds-scriptures-reference` under `.obsidian/plugins/` within your vault.
2. From this plugin's [Releases Page](https://github.com/pacokwon/obsidian-lds-library-plugin/releases), download and put `main.js`, `manifest.json`, `styles.css` into `.obsidian/plugins/lds-scriptures-reference/`.
3. Reload Obsidian and navigate to the `Community Plugins` tab to see that installation is successful.
4. Ensure the plugin is then enabled.

# Features

## Multiple Scriptures

The [standard works](https://www.churchofjesuschrist.org/study/manual/gospel-topics/standard-works?lang=eng), or the volumes of scripture officially accepted by the Church of Jesus Christ of Latter-day Saints are available.

- Holy Bible (King James Version)
- Book of Mormon
- Doctrine and Covenants
- Pearl of Great Price

### How To Reference Verses

Insert a callout to a verse using either `:<Book Name> <Chapter Number>:<Verse Numbers>:` or `:<Book Name> <Chapter Number> <Verse Numbers>:`.

You can referece any range, selection, or series of verses from a given chapter using the above syntax.

Obsidian won’t recognize your desired reference until you add a : at the end. Each reference must be on its own line.

Only English book titles are recognized. For example `:1 Nephi 1 1:` is recognized, but `:1 Нефи 1:1:` isn't.

Refer to [BOOKS.md](https://github.com/pacokwon/obsidian-lds-library-plugin/blob/main/docs/BOOKS.md) for the complete list of book names used and recognized in this plugin.

Example:

![Verse Completion](https://github.com/user-attachments/assets/6ed6cc2a-132b-48d1-bceb-7ed87a6dd45c)

Inserted Callout Example:

![Verse Callout](https://github.com/user-attachments/assets/b74f0d9d-c07e-41bd-8219-be6a6f373787)

## General Conference

Get started with inserting a General Conference quote using `:<Month Name> <Year Number>:`, which will open a Conference Picker prompt.

![Conference Talk Picker Prompt](https://github.com/user-attachments/assets/26873f4a-3e4f-4675-9dd1-36d913c9f84f)

After accepting the suggestion, you can search for and choose a talk from that conference.

![Conference Talk Picker](https://github.com/user-attachments/assets/aead481d-19c7-4042-941e-33e6e4044307)

Choose the paragraphs you would like to quote by clicking on them individually, and press `Create Link` to insert the quote in a callout.

|![Paragraph Picker](https://github.com/user-attachments/assets/5f031cc8-d375-4304-acb0-2b3c019974b5)|![Create Link](https://github.com/user-attachments/assets/6e069204-fb44-488b-b67a-cfe9aa558694)|![Conference Talk Callout](https://github.com/user-attachments/assets/7ef642d9-da81-4cca-b7f3-11a7c95aa30d)|
|--|--|--|

## Hymns

Type `:Hymn:` and pick the suggestion to open a picker over the hymnbook,
searchable by number or title. `:Hymn 193:` or `:Hymn amazed:` opens it with
that search already typed.

![Hymn Picker Prompt](https://github.com/user-attachments/assets/1126cafe-c720-4a52-9a5e-432264ffb6ca)

After accepting a the suggestion, you can search for and choose a hymn from the entries.

![Hymn Picker](https://github.com/user-attachments/assets/62c4a0f4-d71f-414b-9a8e-2660fc40c49b)

## Multiple Languages

### Default Language
The default language used for scriptures and conference talks can be set in the Settings tab of the plugin.

![Settings](https://github.com/user-attachments/assets/b25e58b8-39ef-44ab-9966-0e0590262881)

### One-time Language Syntax
For both verses and conference quotes, optionally specify the language for the reference by appending `[<lang>]` at the front. If the language isn't specified, the default language will be used.

|![Language Verse](https://github.com/user-attachments/assets/7a2d0977-13d5-485c-8cc3-a6ad0711f4dd)|![Language Verse Callout](https://github.com/user-attachments/assets/180ce3bf-5b72-4466-ab65-3274a3212770)|
|-|-|

|![Language Conference](https://github.com/user-attachments/assets/71ad49ee-e935-4bc7-b661-011f679e94fb)|![Language Conference Callout](https://github.com/user-attachments/assets/bc9538bf-cffc-43a7-b3d2-675dafd4f173)|
|-|-|

`<lang>` is 3 letter shortcode for each individual languages used by the Church website. You can refer to these shortcodes in the Settings tab of the plugin.

# Development

## Build

Install dependencies:

```bash
yarn
```

Run build script:

```bash
yarn build
```

3 files will be created in the root directory: `main.js`, `manifest.json`, `styles.css`

# Versioning

This plugin follows [semver](https://semver.org/).

To publish a new release, tag it with `git tag -a <major.minor.patch> -m <message>`
