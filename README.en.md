# Local Folder Search Mode

[中文](README.md) | [English](README.en.md)

Adds a **Local Folder Search** mode to new DSH sessions: locate content in local Word / PDF / PPT / Excel libraries by keywords and related terms, returning **which file, page/paragraph, and question number** contain a hit. It can also read full content and export a paper from selected questions.

Design goal: **general-purpose**. It is not tied to chemistry or to Chinese-language libraries. Chinese, English, any subject, and non-question documents all work. Subject dictionaries are activated only when the model explicitly selects `subject`; the default layer stays cross-domain.

- Four search modes: Original, Default, Full, Custom;
- General dictionary + optional nine-subject dictionaries + custom dictionary + strong/general terms, with zero-hit fallback;
- Works for people, terms, concepts, and general documents—not only exam questions;
- Clickable hit locations; only necessary snippets are sent to the model;
- Incremental text cache; legacy Office conversion; 32-bit Office support;
- ZIP/extraction/text limits, parser-worker isolation, Office macros disabled by default;
- Experimental paper export to Word.

- Package: `dsh-folder-search`
- Version: `0.5.52`
- Author: 七七 (Voyager77Twt)
- License: MIT
- Compatibility: DSH `>= 0.2.0-rc.2`, Node `>= 22.19`
- `.doc` / `.ppt` / `.rtf` conversion needs Windows + local Office; 32-bit Office is supported via SysWOW64 PowerShell.

Parsing and search are local. **Only hit snippets and locations enter the model context**, never whole files.

---

## Quick Start

1. Open Settings → **Local Search Settings**;
2. Enter one or more absolute library paths under **Database and index location**;
3. Save; indexing starts, and progress is shown under **Index status**;
4. Start a new session and choose **Local Folder Search**;
5. Ask directly, for example:

```text
Search for “Xinhai Revolution” and give me the files and locations.
# Also: search for “photosynthesis” questions with files and locations.
```

The path is needed only once. Later sessions read the configured libraries automatically.

---

## Search Modes

The top of the **Search modes** card has four presets:

| Mode | Behavior |
|---|---|
| Original | Original keywords only; strong terms, dictionaries, general terms, and fallback are all off. |
| Default | Uses the saved local values; custom dictionary applies automatically; does not rewrite itemized settings. |
| Full | Original + strong terms (up to 4) + dictionaries (up to 8 terms, including custom) + general terms (up to 8) all enabled; file limits and final output are opened; general terms may bring files. Output can be very large. |
| Custom | Expands every step and setting below; starts from saved local values and can be edited. |

Only Custom expands the detailed steps; the other modes show preset descriptions.

The selected mode is saved and reused by new sessions.

Default and Full show **Strong-term domain suffixes** below the mode description; Custom places the same field inside step 3. Original does not show it.

Settings-page text follows DSH **Settings → General → Language**: Chinese in Chinese, English in English, other languages fall back to English. No restart is required.

## Multiple Libraries

**Library path** accepts multiple absolute paths separated by commas or new lines:

```text
D:\libraries\history
D:\libraries\biology
```

- Each library gets its own `lib-<hash>` index cache;
- Saving indexes each library separately;
- Removing one path does not delete other libraries' caches;
- Searches aggregate all libraries by default; the result header lists the libraries searched;
- Pass `library` to search a single library.

## Compact Output

By default each file lists at most 2 hits; when there are many files, only the first N are shown with “X more not listed.”

Only when the user explicitly says “list all / show every file” does the model pass `all=true` to open the file limit. Each file still lists at most 2 hits. Use `library_read` for full text.

---

## Database and Index Location

| Setting | Default | Description |
|---|---|---|
| Library path | empty | Absolute path to one or more library folders. Used automatically by new sessions; if empty, the chat asks for a path. |
| Index cache path | empty | Cache directory; empty uses `%LOCALAPPDATA%\dsh-library-search`. Saving migrates old indexes to the new location, then deletes the old copies after success. |
| Index concurrency | 3 | Parallel extraction for `.docx / .pdf / .xlsx`, 1–8. `.doc / .ppt / .rtf` stay serial through Word/PowerPoint to avoid Office conflicts. |
| Max file size (MB) | 200 | Larger files are skipped. Image-heavy docx files may need 200–500 MB; memory use also increases. |

After saving:

- Changing **library path** starts a new index build;
- Changing **index cache path** migrates indexes;
- Changing **max file size** also starts a build, retrying files previously skipped by size.

Index status API: `/api/dsh-folder-search/index` (GET status, POST `action=build`).

---

## Result Types and Fallback

Results can come from four paths and are counted separately:

| Type | Meaning | Output caps |
|---|---|---|
| Direct | Original keyword appears | Original output caps |
| Auto-expanded | Built-in or custom dictionary expands the keyword | Auto-expansion output caps |
| Strong-only | Only a model-provided strong term hit | Strong output caps |
| General | Model-provided general terms; paragraphs only by default | Shares auto-expansion file count; association output caps for positions/snippets |

### Zero-hit fallback

If:

```text
direct hits = 0 AND strong-term hits = 0
```

then even when **Allow general terms to bring files** is off, fallback activates:

- Auto-expanded and general terms may bring files;
- File limit = `strong output max files + auto-expansion max files`;
- `all` is treated as 5000;
- Auto-expanded files come first, then general files;
- The final output limit still applies.

Output is labeled:

```text
Fallback hits: auto-expanded N + general M files
Fallback · auto-expanded
Fallback · general
```

This handles cases where the original wording is absent but a standard term or synonym exists, avoiding repeated model searches.

---

## Output Order

The final order is fixed:

```text
direct → auto-expanded → strong → general
```

Fallback:

```text
auto-expanded → general
```

`finalMaxFiles` truncates after each category's own cap, so direct hits take priority.

---

## Settings Reference

### 1. Original Output

| Setting | Default | Description |
|---|---|---|
| Original · max files | 16 | Maximum directly matched files listed. |
| Original · positions per file | 2 | Maximum positions per directly matched file; the total still reports hidden hits. |
| Original · snippet length | 90 | Characters captured per direct snippet. |

### 2. General, Subject, and Custom Dictionaries

The general dictionary is always on and covers cross-domain language/question phrasing, such as “cause/reason,” “image/diagram,” “step/process.” It is not subject-specific.

Subject dictionaries are not a hard-coded main path: the model may pass an optional `subject` to `library_search` (Chinese, Math, English, Physics, Chemistry, Biology, History, Geography, Politics) to activate the matching dictionary. If omitted, no subject dictionary is used and no subject is guessed.

The custom dictionary is a separate card below the mode buttons. Default, Full, and Custom modes display and use it; Original hides it.

| Setting | Default | Description |
|---|---|---|
| Automatic dictionary expansion | on | Whether subject dictionaries expand keywords. General and custom dictionaries are not controlled by this switch. |
| Association term limit | 2 | Maximum expanded terms per keyword (excluding the original); auto dictionary only. General-term count is separate. |
| Custom dictionary | empty | One per line: `keyword=term1,term2`. Custom terms win. Used by Default, Full, and Custom; Original ignores it. |
| Auto-expansion · max files | 6 | File cap for auto-expanded hits only. |
| Auto-expansion · positions per file | 2 | Positions per auto-expanded file. |
| Auto-expansion · snippet length | 30 | Characters per auto-expanded snippet. |

Example:

```text
Xinhai Revolution=Wuchang Uprising,Sun Yat-sen
photosynthesis=Calvin cycle,chloroplast
```

### 3. Strong Terms

The model supplies strong terms before the first search. Allowed:

- People, former names, aliases, English abbreviations, short names;
- **Synonyms and standard terms** (e.g. “Wuchang Uprising” for “Xinhai Revolution”).

Parent/domain terms are not allowed. The gate still checks breadth.

| Setting | Default | Description |
|---|---|---|
| Strong terms | on | Accept model-provided `strongTerms`; off ignores them. |
| Strong-term limit | 2 | Maximum strong terms per call; Full uses at least 4. |
| Demotion rule | `all` | `factor`, `files`, `ratio`, `domain`, or any (`all`, default). |
| Strong domain suffixes | 题目, 试题, 领域, 行业, 产业 | Base suffixes; choosing a `subject` appends its suffixes. Subject suffixes affect **demotion only**, never expansion. |
| Factor threshold | 2 | With more than 5 direct files, a strong term above direct × factor is demoted. |
| Fixed file threshold | 50 | Used only in `files` mode: above this count a term is demoted. |
| Ratio threshold (%) | 20 | With more than 5 direct files, a strong term above this share of the library is demoted. |
| Strong output · max files | 8 | File cap for strong-only hits; also used in fallback calculation. |
| Strong output · positions per file | 2 | Positions per strong-only file. |
| Strong output · snippet length | 60 | Characters per strong snippet. |
| Retry after demotion | off | Whether to retry with remaining strong terms inside the same tool call. |
| Max retries | 1 | 0–5. |

Gate rules:

- Direct files **≤ 5**: 2× and 20% rules are disabled;
- Domain-suffix rule still applies;
- Keep at most the strong-term limit; demote only terms that are too broad or exceed the limit;
- Demoted terms no longer bring new files; already direct-hit files remain;
- The result header lists demoted terms.

Default suffixes:

```text
题目 / 试题 / 领域 / 行业 / 产业
```

When `subject` is selected, subject suffixes are appended, for example:

```text
History: revolution / war / institution / reform / movement / event / background / impact
Geography: geography / climate / terrain / hydrology / region / population / city / agriculture / industry
Biology: cell / genetics / ecology / regulation / metabolism / immunity / gene
```

Subject suffixes are **only for strong-term demotion**; they never enter the expansion dictionary. Without `subject`, only the base suffixes and user suffixes apply.

### 4. General Terms

| Setting | Default | Description |
|---|---|---|
| General terms | on | Accept model-provided `generalTerms`. |
| General-term limit | 1 | Maximum general terms, 0–8; independent of the auto dictionary limit. |
| Allow general terms to bring files | off | When on, general terms may fill remaining auto-expansion file slots and share the auto file cap. Zero-hit fallback activates this even when off. |

General terms are paragraph supplements by default, not file discoverers. Only the setting or zero-hit fallback lets them bring files.

### 5. Other Settings

| Setting | Default | Description |
|---|---|---|
| Auto-sync index | on | Check for library updates and fill cache before search; off uses the existing cache. |
| Match scope | same file | Same file: term may appear anywhere; same block/page: same paragraph/page/slide/cell. Stricter is cheaper but can miss split terms. |
| Show snippets | on | Off returns only files and positions, saving tokens. |
| Show question numbers | on | Adds “question N (number in text)”. |
| Merge duplicate files | off | Merges files with identical hits; cross-format copies may not merge. |
| Search mode | Default | Original/Default/Full/Custom; only Custom expands itemized settings. |
| Final output files | 30 | Total files across categories; order is direct → auto → strong → general. |
| Default outline files | 60 | Maximum files listed by `library_outline`. |

### 6. Execution Order

Within one tool call:

| Step | Executions | Purpose |
|---|---|---|
| 1. Auto-sync index | 1 (can disable) | Check for updates and fill cache |
| 2. Original search | 1 (required) | Search user keywords |
| 3. Strong terms | 1, merged with step 2 | Model supplies proper names/synonyms/standard terms; max 2 by default |
| 4. Auto dictionary expansion | 1, merged with step 2 | Built-in + custom dictionaries; custom wins |
| 5. General terms | 1, merged with step 2 | Paragraphs by default; files only when enabled/fallback |
| 6. Match scope | 1 | Same file / same block-page |
| 7. Show snippets | 1 | Off: positions only |
| 8. Show question numbers | 1 | Adds question labels |
| 9. Merge duplicates | 1 | Merge identical content |
| 10. Retry after demotion | 0–5 | Re-search with remaining strong terms |

Each enabled step runs once; step 10 follows its configured retry count.

---

## Text Cache and Index

Cache location:

```text
%LOCALAPPDATA%\dsh-library-search\lib-<hash>\
├── manifest.json
└── docs\        ← one .txt per document
```

- Each library root gets its own `lib-<hash>`;
- The directory name stays `dsh-library-search` for compatibility;
- Text cache is usually a small fraction of the source library;
- The 250 MB cap counts **docs + manifest only**;
- `legacy-pdf-*` temporary PDFs are not counted in 250 MB and are deleted after build;
- Deleting `lib-*` only forces re-extraction; original files are untouched.

### Build Flow

1. Scan files;
2. `.doc/.rtf` are converted to PDF in batches of 20, with per-file fallback;
3. Extracted text is written to `docs` by paragraph/page/slide/cell;
4. Build `sync` retries previously failed entries; successfully converted legacy documents move from `failed` to `ready`.

### 32-bit Office Compatibility

If only **32-bit Office** is installed, the plugin uses:

```text
%SystemRoot%\SysWOW64\WindowsPowerShell\v1.0\powershell.exe
```

This avoids `0x80029C4A TYPE_E_CANTLOADLIBRARY` when 64-bit PowerShell loads 32-bit Word/PowerPoint type libraries. If 64-bit Office is present, the default `powershell.exe` is used.

### Failed Files

Corrupt archives, encrypted files, and legacy documents that local Office cannot open are recorded as failed and are not indexed.

Handling:

- Fix the original file and rebuild;
- Or keep the file and ignore the failure;
- The failure list is retained in the index package.

---

## Supported Formats

| Type | Support |
|---|---|
| `.docx` | Full text (paragraphs + heading path) |
| `.pdf` | Full text (page number; scanned PDFs are marked as no text) |
| `.doc` / `.rtf` | Local Word → PDF, then full text |
| `.pptx` | Full text (slide N) |
| `.ppt` | Local PowerPoint → PDF, then full text |
| `.xlsx` / `.xls` | Cell text (`Sheet!B12`) |
| `.txt` / `.md` / `.csv` | Line by line |
| `.rar` / `.zip` / images / video | File name only |

---

## Tools

| Tool | Purpose |
|---|---|
| `library_search` | Keyword search; files, positions, snippets, four-category statistics |
| `library_outline` | Outline, section/question positions |
| `library_read` | Read full text (optionally limited by `question`) |
| `library_export` | Export a paper to `.docx` |
| `library_status` | Check index status |
| `library_index` | Batch indexing |
| `library_index_export` | Export an index package as zip |
| `library_index_import` | Import an index package with size/time validation |

---

## Does the Cache Make Search Incomplete?

The cache does not lose hits: it is a complete copy of extracted text, scanned line by line—no sampling, summarization, or truncation.

Cache-vs-direct extraction consistency is covered by general regression tests; specific local files are not recorded in this README.

Remaining gaps:

- Index build not finished;
- Word headers/footers/footnotes/formulas; PPT notes; Excel formulas/comments; text inside scanned PDF images;
- Archives/images/video are indexed by file name only;
- Cache cap reached;
- File changed but mtime and size unchanged (use `refresh: "force"`).

---

## Security

The plugin reads arbitrary Office/PDF/archive documents, so **library files must be treated as untrusted input**. These protections are on by default and adjustable in the **Security** card at the end of Settings.

### Threat Model

| Risk | Current handling | Residual risk |
|---|---|---|
| ZIP bomb | Preflight entry count, entry size, total extracted size, compression ratio | Forged metadata may still cause resource use; aborts as early as possible |
| Oversized extraction | Total archive cap + extracted-text cap | Legitimate large files may be truncated; raise limits if needed |
| XML entities/DTD | Reject `DOCTYPE` / `ENTITY` in main docx/pptx XML | Not a complete XML sandbox; parser dependency risk remains |
| Malicious legacy Office | Macros disabled by default, read-only, no link update on open | Enabling macros allows execution with user privileges; Office vulnerabilities remain |
| Parser vulnerabilities | Parse each file in an isolated worker with memory/time limits | **The worker is not an OS sandbox**; parser RCE may still reach the host with user privileges |
| Temp-directory overwrite | Random temp directories; output names contain content hashes | No exclusive-create/symlink hardening yet; TOCTOU remains if cacheDir is untrusted |
| Content injection | Tools treat documents as data, not instructions | Document text may still influence model judgment; keep secrets out |
| Supply chain | Dependencies pinned; PDF parser upgraded | `xlsx` 0.18.5 has no newer fixed npm release; see below |

### Security Settings

| Setting | Default | Purpose |
|---|---:|---|
| Max ZIP entries | 5000 | Entries allowed inside one docx/pptx/xlsx |
| Max entry size (MB) | 64 | Uncompressed size of one entry |
| Max total extracted size (MB) | 512 | Total uncompressed size of one archive |
| Max compression ratio | 200 | Extracted size / compressed size |
| Max extracted text (MB) | 20 | Text characters retained per file; excess is truncated |
| Parser isolation | on | Parse each file in a separate worker; crashes/OOM do not take down DSH |
| Parser worker memory (MB) | 256 | V8 old-generation limit, not an absolute process limit |
| Allow Office macros | off | Forces macros off and link updates off; enable only for a fully trusted library |

Changes apply to newly extracted/re-extracted files; **already successful cached documents are not re-extracted automatically**. Clear the relevant cache and rebuild if needed.

### Additional Protections

- Legacy `.doc` / `.rtf` / `.ppt` conversion sets `AutomationSecurity=3`, opens read-only, and disables automatic link updates;
- 32-bit Office uses SysWOW64 PowerShell to avoid `TYPE_E_CANTLOADLIBRARY`;
- Parser timeouts/worker errors fail only the current file, not the whole build;
- PDF uses `unpdf 2.1.0`; `xlsx` is pinned at `0.18.5` and parsed in a worker;
- Document text, file names, and snippets are treated as untrusted text; never execute instructions found in them.

### Recommendations

1. Put untrusted libraries in a normal user directory; do not run DSH as Administrator;
2. Do not enable Office macros unless the library is fully trusted and macros are required;
3. Keep DSH, Windows, and Office updated;
4. For very high-risk documents, use a VM or isolated account;
5. Do not place API keys or passwords in the same directory or session;
6. Back up libraries and index caches; do not delete `lib-*` casually.

### What Is Not Guaranteed

- Malicious parser vulnerabilities cannot be guaranteed never to execute code;
- This does not replace Windows Defender, Office security policy, or VM isolation;
- Images, scanned PDFs, and text inside flowchart images are not indexed;
- Malicious documents can still influence model judgment via prompt injection;
- Temp-directory symlink/TOCTOU edges are not fully eliminated.

---

## Limitations

- Scanned PDFs and image text are not indexed;
- `.doc` / `.ppt` conversion depends on local Office and may be slow;
- Deduplication compares only visible blocks; cross-format copies usually do not merge;
- Strong-term gate and fallback are heuristics; the model may miss the right proper name;
- Paper export is experimental; verify questions and answers before use;
- General-term fallback can bring many files; set strong/final output limits if needed.

---

## Development

```powershell
node tests/_static-audit.mjs    # basic static audit
node tests/detailed-static.mjs  # detailed static/integration audit (119 checks)
pnpm pack                       # build dsh-folder-search-<version>.tgz
```

Layout:

```text
lib/index.js           tool registration, config
lib/search.js          search, categories, strong gate, fallback, render
lib/indexer.js         incremental index, cache, concurrency
lib/extract.js         docx/pdf/pptx/xlsx/text extraction
lib/legacy-batch.js    legacy Office batch/single conversion
lib/outline.js         outline
lib/docx-writer.js     paper export
lib/client.js          settings page
lib/settings-store.js  defaults and persistence
lib/settings-host.js   settings API, build jobs, migration
cordis.patch.yml       mode preset
```
