# FormatHandout Style Library

Ready-made styles for **FormatHandout**, a Roll20 API script that dresses up a handout's Notes/GM Notes with CSS to look like a real prop from your game world. Four styles ship with the script itself; the rest are plain CSS you copy into a handout of your own -- either way, once a style exists, it shows up automatically in the script's style picker.

*Current as of FormatHandout v0.17.0.*

---

## Installation

FormatHandout looks for any handout in your game named exactly `<Style Name>_css` (for example `Monument_css`) and reads plain CSS straight out of its **Notes** field -- no special editor, no script changes, nothing to configure.

**Built-in styles (Parchment, 5e, Book, Computer)** are created for you automatically the first time the script runs in your game -- there's nothing to install for these four, they already exist. If you ever want to see or tweak one's CSS, just open its `<Name>_css` handout like any other.

**Every other style below**, you add yourself:

1. In your Roll20 game, open the **Handouts** tab in the right-hand sidebar (the card icon).
2. Click **+ Add a handout** to create a new one.
3. Name it *exactly* as shown below, including the trailing `_css` (for example `Monument_css`) -- FormatHandout matches on this exact name.
4. Open the handout and click into its **Notes** field. Insert an empty code block (Roll20's rich-text toolbar has one) and paste the style's CSS -- copied straight from the block below -- into that code block. A clean paste into a code block avoids the editor mangling anything before FormatHandout reads it.
5. Save/close the handout.
6. Open the control panel (type `!FormatHandout` in chat, or click the "?" button on it once it exists) -- the new style now appears in the style picker automatically. No reload or restart needed.

To update a style later, just reopen its `<Name>_css` handout and edit the CSS directly -- FormatHandout reads it fresh every time you apply or preview a style.

---

## Built-in styles

Already in your game -- nothing to install. Listed here so you can see what's available at a glance.

### Parchment (`Parchment_css`)

Warm tan parchment with a serif type family, a dashed sepia blockquote border, and a zebra-striped table -- a good general-purpose "old document" look that isn't tied to any one genre.

<details>
<summary><b>Parchment</b> &mdash; CSS</summary>

```css
container {
  background-image: url('https://i.imgur.com/vjL1blE.jpg');
  color: #3b2c1a;
  font-family: Georgia, 'Palatino Linotype', serif;
  padding: 12px;
  border: 1px solid #c9b183;
}

h1 { color: #5c3a21; font-size: 28px; text-align: center; border-bottom: 2px double #8a6a3f; padding-bottom: 6px; margin: 16px 0 10px 0; }
h2 { color: #5c3a21; font-size: 22px; border-bottom: 1px solid #8a6a3f; padding-bottom: 4px; margin: 16px 0 8px 0; }
h3 { color: #6b4a26; font-size: 19px; font-style: italic; margin: 14px 0 6px 0; }
h4 { color: #6b4a26; font-size: 16px; margin: 12px 0 4px 0; }
h5 { color: #6b4a26; font-size: 14px; margin: 10px 0 4px 0; }
h6 { color: #6b4a26; font-size: 13px; font-variant: small-caps; margin: 10px 0 4px 0; }
p { font-size: 15px; line-height: 1.6; margin: 6px 0; }
blockquote { border-left: 3px dashed #8a6a3f; background-color: #ece0c4; padding: 8px 14px; margin: 10px 0; font-style: italic; color: #4a3820; }
pre { background-color: #e9dcb9; color: #3b2c1a; padding: 8px 10px; border: 1px solid #c9b183; font-family: 'Courier New', monospace; font-size: 13px; }
ol { margin: 6px 0 6px 22px; }
ul { margin: 6px 0 6px 22px; }
li { font-size: 15px; line-height: 1.6; margin: 2px 0; }
strong { color: #5c3a21; }

table { width: 100%; border-collapse: collapse; font-family: Georgia, 'Palatino Linotype', serif; font-size: 14px; color: #3b2c1a; }
tr:first-child { background-color: #e4d5b3; font-weight: bold; border-bottom: 2px solid #8a6a3f; }
tr:nth-child(odd) { background-color: #f4ecd8; }
tr:nth-child(even) { background-color: #ece0c4; }
td { padding: 4px 8px; border: 1px solid #c9b183; text-align: left; }
```

</details>

### 5e (`5e_css`)

A cream Player's Handbook-style page: a red drop-shadow heading, a right-floated boxed sidebar quote/aside, and a bordered table -- built to feel like an official D&D 5e sourcebook page.

<details>
<summary><b>5e</b> &mdash; CSS</summary>

```css
bg {
    background-image: url('https://i.imgur.com/vjL1blE.jpg');
    padding: 30px;
    padding-top: 1px;
    margin: 0px;
}
p {
    font-family: Georgia;
    font-size: 13px;
    margin-bottom: 0px;
    text-indent: 10px;
    color: #111;
}
p.first-of-type {
    font-family: Georgia;
    font-size: 13px !important;
    margin-bottom: 0px;
    text-indent: 0px!important;
}
ul {
    font-family: Georgia !important;
    font-size: 15px;
    list-style-position: inside;
    padding-left: 5px;
    margin-bottom: 0px;
    text-indent: -5px;
    color: #111;
}
li {
    font-family: Georgia !important;
    font-size: 15px;
    list-style-position: inside;
    margin-bottom: 0px;
    text-indent: -5px;
}
h1 {
    font-family: 'mrs eaves', 'times new roman', times, baskerville, garamond;
    color: #58170D !important;
    font-weight: bolder;
    font-variant: small-caps;
    text-transform: capitalize;
    font-size: 42px;
    margin-top: 20px;
    margin-bottom: 4px;
    padding-top: 40px;
    clear: both;
}
h2 {
    font-family: 'mrs eaves', 'times new roman', times, baskerville, garamond;
    color: #58170D!important;
    font-weight: bolder;
    font-variant: small-caps;
    text-transform: capitalize;
    line-height: 80%;
    margin-top: 10px;
    font-size: 28px;
}
h3 {
    font-family: 'mrs eaves', 'times new roman', times, baskerville, garamond;
    color: #58170D!important;
    font-weight: bolder;
    font-variant: small-caps;
    text-transform: capitalize;
    font-size: 24px;
    margin-top: 10px;
    margin-bottom: 2px;
    line-height: 80%;
    border-bottom: 2px solid #c9ad6a;
    clear: both;
}
h4 {
    font-family: 'mrs eaves', 'times new roman', times, baskerville, garamond;
    color: #58170D!important;
    font-variant: small-caps;
    text-transform: capitalize;
    font-size: 24px;
    margin-top: 10px;
    margin-bottom: 2px;
    line-height: 80%;
}
h5 {
    font-family: Verdana, sans-serif !important;
    color: black!important;
    font-variant: small-caps;
    font-size: 16px;
    margin-top: 10px;
    margin-bottom: 8px;
    line-height: 80%;
}
h6 {
    font-family: Verdana, sans-serif !important;
    color: black!important;
    font-variant: small-caps;
    font-style: italic;
    font-size: 14px;
    margin-top: 8px;
    margin-bottom: 6px;
    line-height: 80%;
}
pre {
    font-family: Verdana, sans-serif !important;
    text-align: left;
    float: right;
    margin-left: 6px;
    width: 40%;
    margin-top: 1em;
    margin-bottom: 1em;
    padding: 5px 10px;
    background-color: #e0e5c1;
    border-top: 2px solid;
    border-bottom: 2px solid;
    border-left: 0px solid;
    border-right: 0px solid;
    box-shadow: 1px 4px 14px #888;
    white-space: pre-wrap !important;
    overflow-wrap: break-word !important;
    word-break: normal !important;
}
blockquote {
    font-family: Verdana, sans-serif !important;
    text-align: left;
    margin-left: 15%;
    margin-right: 15%;
    margin-top: 1em;
    margin-bottom: 1em;
    padding: 5px 10px;
    background-color: #e0e5c1;
    border-top: 2px solid;
    border-bottom: 2px solid;
    border-left: 0px solid;
    border-right: 0px solid;
    box-shadow: 1px 4px 14px #888;
}
a:link {
    text-decoration: underline;
    color: #58170D;
}
table {
    width: 100%;
    border: none;
    border-spacing: 0;
    outline: none;
    color: #111;
}
tr {
    width: 100%;
    text-align: left;
    font-family: Verdana, sans-serif;
    font-size: 13px;
    border: 0px solid #ffffff;
}
tr:first-child {
    font-weight: bold;
    background: transparent;
}
tr:nth-child(even) {
    background: transparent;
}
tr:nth-child(odd) {
    background: #E0E5C1;
}
td {
    padding-top: 2px;
    padding-bottom: 2px;
    border: none;
    outline: none;
    text-align: left;
}
```

</details>

### Book (`Book_css`)

A leather-and-parchment page from an old, well-loved tome -- an ornamental small-caps display heading, italic serif subheadings, and a first paragraph that skips its indent right after a heading, the way traditional book typesetting does it.

<details>
<summary><b>Book</b> &mdash; CSS</summary>

```css
container {
  background-image: url('https://files.d20.io/images/499387644/qnbekevImRbYAxPEmk1E1A/original.webp?1788122543');
  color: #3a2b18;
  font-family: 'Crimson Text', Georgia, 'Times New Roman', serif;
  padding: 20px 26px;
  border: 4px double #5b3d22;
  box-shadow: 0 0 16px rgba(0,0,0,0.35);
}

h1 {
  font-family: 'Della Respira', Georgia, serif;
  color: #4a2f1c;
  font-size: 30px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 3px;
  border-bottom: 2px double #8a6a3f;
  padding-bottom: 10px;
  margin: 8px 0 14px 0;
}

h2 {
  font-family: 'Della Respira', Georgia, serif;
  color: #4a2f1c;
  font-size: 22px;
  text-align: center;
  letter-spacing: 1px;
  margin: 16px 0 8px 0;
}

h3, h4, h5, h6 {
  font-family: 'Merriweather', Georgia, serif;
  font-style: italic;
  color: #5b3d22;
  font-size: 16px;
  margin: 12px 0 5px 0;
}

p {
  font-family: 'Crimson Text', Georgia, 'Times New Roman', serif;
  font-size: 16px;
  line-height: 1.7;
  text-indent: 24px;
  margin: 2px 0;
  text-align: justify;
}

p.first-of-type {
  text-indent: 0px !important;
}

blockquote {
  font-family: 'Crimson Text', Georgia, serif;
  font-style: italic;
  font-size: 30px!important;
  line-height:1.4;
  color: #5b3d22;
  border-left: 3px solid #8a6a3f;
  border-right: 3px solid #8a6a3f;
  padding: 8px 16px;
  margin: 30px 8%;
}

pre, code {
  font-family: 'IM Fell DW Pica', Georgia, serif;
  background-color: rgba(0,0,0,0.12);
  color: #3a2b18;
  border: 1px solid #8a6a3f;
  padding: 6px 10px;
  font-size: 14px;
}

ol, ul { margin: 6px 0 6px 30px; }
li {
  font-family: 'Crimson Text', Georgia, 'Times New Roman', serif;
  font-size: 16px;
  line-height: 1.6;
}

strong { color: #4a2f1c; }
em { color: #5b3d22; }
s { color: #9c8a68; }

a { color: #6e4326; text-decoration: underline; }

table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Crimson Text', Georgia, serif;
  font-size: 15px;
  color: #3a2b18;
}
tr:first-child { background-color: rgba(0,0,0,0.12); font-weight: bold; border-bottom: 2px double #8a6a3f; }
tr:nth-child(odd) { background-color: rgba(0,0,0,0.05); }
tr:nth-child(even) { background-color: transparent; }
td, th {
  font-family: 'Crimson Text', Georgia, serif;
  padding: 5px 9px;
  border: 1px solid #8a6a3f;
  text-align: left;
}
```

</details>

### Computer (`Computer_css`)

A retro monochrome terminal readout -- black screen, monospace type, a phosphor-green glow, faint horizontal scanlines, and an amber blockquote for a distinct "alert line" in an otherwise green-on-black display.

<details>
<summary><b>Computer</b> &mdash; CSS</summary>

```css
container {
  background-color: #0a0f0a;
  background-image: repeating-linear-gradient(to bottom, rgba(255,255,255,0.02), rgba(255,255,255,0.02) 1px, transparent 2px, transparent 3px);
  color: #33ff66;
  font-family: 'Lucida Console', 'Courier New', monospace;
  padding: 16px 18px;
  border: 2px solid #1f5c33;
  box-shadow: 0 0 18px rgba(51,255,102,0.25);
}

h1 {
  font-family: 'Contrail One', 'Lucida Console', monospace;
  color: #9dffb8;
  font-size: 24px;
  text-transform: uppercase;
  letter-spacing: 3px;
  border-bottom: 1px solid #1f5c33;
  padding-bottom: 6px;
  margin: 4px 0 10px 0;
}

h2 {
  font-family: 'Contrail One', 'Lucida Console', monospace;
  color: #9dffb8;
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 10px 0 6px 0;
}

h3, h4, h5, h6 {
  font-family: 'Lucida Console', 'Courier New', monospace;
  color: #9dffb8;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 8px 0 4px 0;
}

p {
  font-family: 'Lucida Console', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  margin: 6px 0;
}

blockquote {
  font-family: 'Lucida Console', 'Courier New', monospace;
  color: #ffcf5c;
  background-color: #1a1206;
  border-left: 3px solid #ffcf5c;
  padding: 6px 10px;
  margin: 10px 0;
  font-size: 13px;
}

pre, code {
  font-family: 'Lucida Console', 'Courier New', monospace;
  background-color: #001a08;
  color: #33ff66;
  border: 1px solid #1f5c33;
  padding: 8px 10px;
  font-size: 13px;
  line-height: 1.5;
}

ol, ul { margin: 6px 0 6px 26px; }
li {
  font-family: 'Lucida Console', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}

strong { color: #9dffb8; }
em { color: #74e896; }
s { color: #4a7a5a; }

a { color: #6cf0ff; text-decoration: underline; }

table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Lucida Console', 'Courier New', monospace;
  font-size: 13px;
  color: #33ff66;
}
tr:first-child { background-color: #123c1e; color: #9dffb8; font-weight: bold; }
tr:nth-child(odd) { background-color: #0a0f0a; }
tr:nth-child(even) { background-color: #0f180f; }
td, th {
  font-family: 'Lucida Console', 'Courier New', monospace;
  padding: 4px 8px;
  border: 1px solid #1f5c33;
  text-align: left;
}
```

</details>

---

## Additional styles

Copy these into a new handout of your own, per the installation steps above.

### Monument (`Monument_css`)

A carved stone monument inscription -- tiling header-ornament and footer-band artwork over a marble texture, all-caps chiseled headings with a light/dark text-shadow bevel, and a table and quote block that read as recessed and embossed into the stone, respectively.

<details>
<summary><b>Monument</b> &mdash; CSS</summary>

```css
bg {
  background-image: url('https://files.d20.io/images/459209530/dIxYg78Hg-J_cM6IC9AJcw/original.png'), url('https://files.d20.io/images/459209476/2ievKCGQVkd4dB0n-lNV4Q/original.png'), url('https://files.d20.io/images/459209470/FuYxzu3hsKZZe7vP6czucg/original.png');
  background-repeat: repeat-x, repeat-x, repeat-y;
  background-position: top center, bottom center, top center;
  background-size: auto, auto, 100% auto;
  background-color: #efece0;
  padding: 90px 60px 180px 60px;
  color: #2f2a22;
  box-shadow: 0 0 4px rgba(0,0,0,0.4);
}
h1 {
  font-family: 'Crimson Text', Cambria, 'Times New Roman', serif;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 52px;
  line-height: 56px;
  text-align: center;
  color: #55483a;
  text-shadow: -1px -1px rgba(0,0,0,0.5), 1px 1px rgba(255,255,255,0.6);
  margin: 30 0 16px 0;
}
h2 {
  font-family: 'Crimson Text', Cambria, 'Times New Roman', serif;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-size: 40px;
  text-align: center;
  color: #55483a;
  text-shadow: -1px -1px rgba(0,0,0,0.4), 1px 1px rgba(255,255,255,0.5);
  margin: 28px 0 8px 0;
}
h3 {
  font-family: 'Crimson Text', Cambria, 'Times New Roman', serif;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 34px;
  text-align: center;
  color: #5e5040;
  text-shadow: -1px -1px rgba(0,0,0,0.3), 1px 1px rgba(255,255,255,0.4);
  margin: 24px 0 6px 0;
}
h4 {
  font-family: 'Crimson Text', Cambria, 'Times New Roman', serif;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 24px;
  color: #5e5040;
  text-shadow: -1px -1px rgba(0,0,0,0.25), 1px 1px rgba(255,255,255,0.35);
  margin: 18px 0 4px 0;
}
h5 {
  font-family: 'Crimson Text', Cambria, 'Times New Roman', serif;
  font-weight: 700;
  font-variant: small-caps;
  font-size: 20px;
  color: #5e5040;
  margin: 10px 0 4px 0;
}
h6 {
  font-family: 'Crimson Text', Cambria, 'Times New Roman', serif;
  font-style: italic;
  font-variant: small-caps;
  font-size: 18px;
  color: #6b5c48;
  margin: 10px 0 3px 0;
}
p {
  font-family: 'Crimson Text', Cambria, 'Times New Roman', serif;
  text-transform: uppercase;
  font-size: 18px;
  line-height: 26px;
  letter-spacing: 0.3px;
  text-align: justify;
  color: #332c22;
  text-shadow: -1px -1px rgba(0,0,0,0.25), 1px 1px rgba(255,255,255,0.5);
  margin: 10px 0;
}

blockquote {
  font-family: 'Crimson Text', Cambria, 'Times New Roman', serif;
  text-transform: uppercase;
  font-size: 14px;
  text-align: center;
  color: #55483a;
  text-shadow: -1px -1px rgba(0,0,0,0.3), 1px 1px rgba(255,255,255,0.5);
  border-top: 1px solid #a89572;
  border-bottom: 1px solid #a89572;
  padding: 8px 0;
  margin: 12px 20px;
}
ol {
  font-family: 'Crimson Text', Cambria, 'Times New Roman', serif;
  text-transform: uppercase;
  font-size: 13px;
  color: #332c22;
  margin: 6px 0 6px 24px;
}
ul {
  font-family: 'Crimson Text', Cambria, 'Times New Roman', serif;
  text-transform: uppercase;
  font-size: 13px;
  color: #332c22;
  margin: 6px 0 6px 24px;
}
li {
  font-size: 13px;
  line-height: 19px;
  margin: 3px 0;
}
strong { color: #5e0000; }
em { font-style: italic; color: #4a3f30; }
table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Crimson Text', Cambria, 'Times New Roman', serif;
  font-size: 18px;
  text-transform: uppercase;
  color: #332c22;
  margin: 10px 0;
  padding: 6px;
  box-shadow: inset 3px 3px 6px rgba(0,0,0,0.5), inset -3px -3px 6px rgba(255,255,255,0.4);
}
tr:first-child { background-color: rgba(0,0,0,0.14); font-weight: bold; border-bottom: 2px solid rgba(0,0,0,0.3); }
tr:nth-child(odd) { background-color: rgba(0,0,0,0.06); }
tr:nth-child(even) { background-color: transparent; }
td {
  font-family: 'Crimson Text', Cambria, 'Times New Roman', serif;
  font-size: 18px;
  text-transform: uppercase;
  padding: 6px 10px;
  border: 1px solid rgba(0,0,0,0.2);
  text-align: left;
}
pre {
  display: block;
  font-family: 'Crimson Text', Cambria, 'Times New Roman', serif;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 24px;
  letter-spacing: 0.5px;
  line-height: 28px;
  color: #3a2a12;
  background-image: url('https://files.d20.io/images/499399675/EdoupRBzUV7zDrCse4iCww/original.webp?1788127559'), url('https://files.d20.io/images/459209476/2ievKCGQVkd4dB0n-lNV4Q/original.png'), url('https://files.d20.io/images/459209470/FuYxzu3hsKZZe7vP6czucg/original.png');
  background-repeat: repeat-x, repeat-x, repeat-y;
  border-radius: 4px;
  padding: 20px 24px;
  margin: 10px 0;
  white-space: pre-wrap;
  box-shadow: inset 2px 2px 5px rgba(255,255,255,0.35), inset -2px -2px 5px rgba(0,0,0,0.45);
}
```

</details>

### Notebook (`Notebook_css`)

An in-world letter/journal page locked to the background photo's 16px ruled-paper baseline grid -- every heading and paragraph lands on a ruled line, in a handwriting-style font family.

<details>
<summary><b>Notebook</b> &mdash; CSS</summary>

```css
bg {
  background-image: url('https://files.d20.io/images/499370200/Bl_yAIIf5zOPDaGdtjP66g/original.webp?1788115636');
  background-color: #f7f3e9;
  padding: 21px 44px;
  color: #2a2419;
}
h1 {
  font-family: 'Patrick Hand', 'Segoe Print', 'Bradley Hand', cursive;
  font-style: italic;
  font-weight: bold;
  font-size: 40px;
  line-height: 32px;
  color: #2a2419;
  text-align: center;
  margin: 0 0 16px 0;
}
h2 {
  font-family: 'Patrick Hand', 'Segoe Print', 'Bradley Hand', cursive;
  font-style: italic;
  font-size: 21px;
  line-height: 48px;
  color: #2a2419;
  margin: 16px 0 0 0;
}
h3 {
  font-family: 'Patrick Hand', 'Segoe Print', 'Bradley Hand', cursive;
  font-style: italic;
  font-size: 17px;
  line-height: 16px;
  color: #2a2419;
  margin: 16px 0 0 0;
}
h4 {
  font-family: 'Patrick Hand', 'Segoe Print', 'Bradley Hand', cursive;
  font-style: italic;
  font-size: 15px;
  line-height: 16px;
  color: #2a2419;
  margin: 16px 0 0 0;
}
h5 {
  font-family: 'Patrick Hand', 'Segoe Print', 'Bradley Hand', cursive;
  font-style: italic;
  font-size: 14px;
  line-height: 16px;
  color: #3a3222;
  margin: 16px 0 0 0;
}
h6 {
  font-family: 'Patrick Hand', 'Segoe Print', 'Bradley Hand', cursive;
  font-style: italic;
  font-size: 12px;
  line-height: 16px;
  color: #4a4030;
  margin: 16px 0 0 0;
}
p {
  font-family: 'Patrick Hand', 'Segoe Print', 'Bradley Hand', cursive;
  font-size: 12px;
  line-height: 16px;
  color: #2a2419;
  margin: 13px 0 19px 0;
}
blockquote {
  font-family: 'Patrick Hand', 'Segoe Print', 'Bradley Hand', cursive;
  font-style: italic;
  font-size: 12px;
  line-height: 16px;
  color: #8a1f1f;
  border-left: 2px dashed #8a1f1f;
  padding: 0 10px;
  margin: 16px 0;
}
strong { color: #000; }
em { color: #3a3222; }
```

</details>

### Letter (`Letter_css`)

A freeform handwritten letter -- warm paper, ink-blue body text, a flourished script heading, and a floated script-font blockquote that reads as a postscript aside rather than a centered callout.

<details>
<summary><b>Letter</b> &mdash; CSS</summary>

```css
container {
  background-color: #f7f1e0;
  color: #26324a;
  font-family: 'Patrick Hand', 'Comic Sans MS', cursive;
  padding: 36px 30px;
  border: 1px solid #d8cba8;
  box-shadow: 0 0 12px rgba(0,0,0,0.15);
}

h1 {
  font-family: 'Shadows Into Light', 'Comic Sans MS', cursive;
  color: #1c2a44;
  font-size: 36px;
  font-weight: normal;
  text-align: left;
  margin: 18px 0 12px 0;
  border-bottom: 1px solid #a6997a;
  padding-bottom: 6px;
}

h2 {
  font-family: 'Shadows Into Light', 'Comic Sans MS', cursive;
  color: #1c2a44;
  font-size: 30px;
  font-weight: normal;
  margin: 116px 0 6px 0;
}

h3, h4, h5, h6 {
  font-family: 'Cedarville Cursive', 'Comic Sans MS', cursive;
  color: #26324a;
  font-size: 26px;
  font-style: bold;
  margin: 11px 0 4px 0;
}

p {
  font-family: 'Cedarville Cursive', 'Comic Sans MS', cursive;
  font-size: 26px;
  line-height: 1.5;
  margin: 16px 0;
  letter-spacing: 0.2px;
}

blockquote {
  font-family: 'Shadows Into Light', 'Comic Sans MS', cursive;
  font-size: 22px;
  line-height: 1.5;
  color: #7a3b2e;
  float: right;
  border: none!important;
  width: 40%;
  margin: 14px 10% 6px 10%;
  padding: 4px 0;
}

pre, code {
  font-family: 'Lucida Console', 'Courier New', monospace;
  background-color: #efe6cf;
  color: #26324a;
  padding: 6px 10px;
  border: 1px dashed #a6997a;
  font-size: 13px;
}

ol, ul { margin: 8px 0 8px 26px; }
li {
  font-family: 'Patrick Hand', 'Comic Sans MS', cursive;
  font-size: 17px;
  line-height: 1.6;
  margin: 3px 0;
}

strong { color: #1c2a44; }
em { color: #26324a; }
s { color: #7a7a7a; }

a { color: #7a3b2e; text-decoration: underline; }

table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Patrick Hand', 'Comic Sans MS', cursive;
  font-size: 15px;
  color: #26324a;
}
tr:first-child { background-color: #ecdfc0; font-weight: bold; }
tr:nth-child(odd) { background-color: #f7f1e0; }
tr:nth-child(even) { background-color: #efe6cf; }
td, th {
  font-family: 'Patrick Hand', 'Comic Sans MS', cursive;
  padding: 4px 8px;
  border: 1px solid #d8cba8;
  text-align: left;
}
```

</details>

### Newspaper (`Newspaper_css`)

A newsprint clipping -- a condensed bold masthead headline, justified serif body copy, an italic serif byline/dateline, and a drop-shadow so the whole thing reads as a cut-out clipping rather than a full page.

<details>
<summary><b>Newspaper</b> &mdash; CSS</summary>

```css
bg {
  background-image: url('https://files.d20.io/images/459209532/psepbax2MooUvZ273m0BtQ/original.png');
  background-color: #e8e4d8;
  box-shadow: 4px 4px 6px rgba(0,0,0,0.4);
  padding: 14px 16px;
  color: #2c2c2c;
}
h1 {
  font-family: Anton, Impact, 'Arial Narrow', sans-serif;
  text-transform: uppercase;
  font-size: 30px;
  line-height: 30px;
  text-align: center;
  color: #1c1c1c;
  border-bottom: 2px solid #1c1c1c;
  padding-bottom: 6px;
  margin: 0 0 10px 0;
}
h2 {
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-size: 15px;
  text-align: center;
  color: #444;
  margin: 0 0 12px 0;
}
h3 {
  font-family: Anton, Impact, 'Arial Narrow', sans-serif;
  text-transform: uppercase;
  font-size: 19px;
  line-height: 20px;
  text-align: left;
  color: #1c1c1c;
  border-bottom: 1px solid #1c1c1c;
  padding-bottom: 3px;
  margin: 10px 0 6px 0;
}
h4 {
  font-family: Anton, Impact, 'Arial Narrow', sans-serif;
  text-transform: uppercase;
  font-size: 16px;
  line-height: 17px;
  color: #1c1c1c;
  margin: 8px 0 4px 0;
}
h5 {
  font-family: Anton, Impact, 'Arial Narrow', sans-serif;
  text-transform: uppercase;
  font-size: 14px;
  color: #333;
  margin: 6px 0 3px 0;
}
h6 {
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-size: 12px;
  text-align: right;
  color: #555;
  margin: 0 0 4px 0;
}
p {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 14px;
  line-height: 18px;
  text-align: justify;
  color: #2c2c2c;
  margin: 6px 0;
}
p.first-of-type { font-size: 15px !important; }
blockquote {
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-size: 13px;
  color: #444;
  border-top: 1px solid #999;
  border-bottom: 1px solid #999;
  border-left: none!important;
  padding: 6px 0;
  margin: 8px 0;
  text-align: center;
}
table { width: 100%; border-collapse: collapse; font-family: Georgia, serif; font-size: 13px; color: #2c2c2c; }
tr:first-child { border-bottom: 2px solid #1c1c1c; font-weight: bold; }
td { padding: 3px 6px; border-bottom: 1px solid #999; }
```

</details>

### Wanted (`Wanted_css`)

A wood/leather wanted poster -- a stenciled Western display headline, an inset shadow for a weathered feel, and a bordered blockquote built for a "REWARD: 500gp / DEAD OR ALIVE" callout.

<details>
<summary><b>Wanted</b> &mdash; CSS</summary>

```css
bg {
  background-image: url('https://files.d20.io/images/459209462/iw8RdsL5EVwrQkXPVR5nRQ/original.jpg');
  background-color: #d9c49a;
  box-shadow: inset 0 0 25px rgba(0,0,0,0.5);
  border: 2px solid #3a2415;
  padding: 40px 32px;
  color: #2a1a0d;
}
h1 {
  font-family: Rye, Copperplate, Georgia, serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 42px;
  line-height:1.2;
  text-align: center;
  color: #6b1c1c;
  margin: 0 0 6px 0;
}
h2 {
  font-family: 'IM Fell DW Pica', 'Times New Roman', serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 36px;
  text-align: center;
  color: #3a2415;
  border-top: 1px solid #3a2415;
  border-bottom: 1px solid #3a2415;
  padding: 4px 0;
  margin: 12px 0 18px 0;
}
h3 {
  font-family: 'IM Fell DW Pica', 'Times New Roman', serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 30px;
  text-align: center;
  color: #3a2415;
  margin: 16px 0 4px 0;
}
h4 {
  font-family: 'IM Fell DW Pica', 'Times New Roman', serif;
  text-transform: uppercase;
  font-size: 24px;
  text-align: center;
  color: #3a2415;
  margin: 12px 0 3px 0;
}
h5 {
  font-family: 'IM Fell DW Pica', 'Times New Roman', serif;
  font-variant: small-caps;
  font-size: 22px;
  text-align: center;
  color: #3a2415;
  margin: 10px 0 3px 0;
}
h6 {
  font-family: 'IM Fell DW Pica', 'Times New Roman', serif;
  font-style: italic;
  font-variant: small-caps;
  font-size: 18px;
  text-align: center;
  color: #6b1c1c;
  margin: 8px 0 2px 0;
}
p {
  font-family: 'IM Fell DW Pica', 'Times New Roman', serif;
  font-size: 18px;
  line-height: 24px;
  text-align: center;
  color: #2a1a0d;
  margin: 4px 0;
}
pre {
  font-family: 'IM Fell DW Pica', 'Times New Roman', serif;
  font-size: 20px;
  line-height:1.2;
  text-align: center;
  color: #6b1c1c;
  border-color: #333;
  border-style: inset;
  background-color: rgba(0,0,0,0.1);
  padding: 6px;
  margin: 20px 20px;
}
blockquote {
  font-family: Rye, Copperplate, Georgia, serif;
  font-size: 20px;
  line-height:1.2;
  text-align: center;
  color: #6b1c1c;
  border: 2px solid #6b1c1c;
  padding: 6px;
  margin: 20px 20px;
}
strong { color: #6b1c1c; }

table { width: 100%; border-collapse: collapse; font-family: Georgia, 'Palatino Linotype', serif; font-size: 14px; color: #111; }
tr:first-child { font-weight: bold; border-bottom: 2px solid #333; }
td { padding: 4px 8px; border: 1px solid #333; text-align: left; }
```

</details>

### Dossier (`Dossier_css`)

A redacted classified memo -- a typewriter font throughout, `s` (strikethrough) restyled into a solid black redaction bar instead of a line-through, and boxed double-bordered heading text.

<details>
<summary><b>Dossier</b> &mdash; CSS</summary>

```css
bg {
  background-color: #e9e7df;
  border: 1px solid #999;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  padding: 16px 18px;
  color: #1a1a1a;
}
h1 {
  font-family: 'Courier New', Consolas, monospace;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 22px;
  text-align: center;
  color: #a30000;
  border: 3px double #a30000;
  padding: 6px;
  margin: 0 0 12px 0;
}
h2 {
  font-family: 'Courier New', Consolas, monospace;
  text-transform: uppercase;
  font-size: 14px;
  color: #444;
  border-bottom: 1px solid #999;
  padding-bottom: 2px;
  margin: 10px 0 6px 0;
}
h3 {
  font-family: 'Courier New', Consolas, monospace;
  text-transform: uppercase;
  font-size: 13px;
  color: #444;
  margin: 8px 0 4px 0;
}
h4 {
  font-family: 'Courier New', Consolas, monospace;
  text-transform: uppercase;
  font-size: 12.5px;
  color: #555;
  margin: 7px 0 3px 0;
}
h5 {
  font-family: 'Courier New', Consolas, monospace;
  font-style: italic;
  font-size: 12px;
  color: #555;
  margin: 6px 0 3px 0;
}
h6 {
  font-family: 'Courier New', Consolas, monospace;
  font-style: italic;
  font-size: 11px;
  color: #666;
  margin: 5px 0 2px 0;
}
p {
  font-family: 'Courier New', Consolas, monospace;
  font-size: 13px;
  line-height: 18px;
  color: #1a1a1a;
  margin: 4px 0;
}
blockquote {
  font-weight: bold;
  background-color: rgba(0,0,0,0.22);
  border: 1px solid #000;
  padding: 12px 12px;
  margin: 12px 24px;
  text-align: center;
}
pre {
  font-weight: bold;
  font-family: 'Courier New', Consolas, monospace;
  background-color: rgba(0,0,0,0.12);
  border: 1px solid #000;
  padding: 12px 12px;
  margin: 12px 24px;
}
s {
  background-color: #000;
  color: #000;
  text-decoration: none;
  padding: 0 2px;
  border-radius: 1px;
}
table { width: 100%; border-collapse: collapse; font-family: 'Courier New', monospace; font-size: 12px; color: #1a1a1a; }
tr:first-child { background-color: none; font-weight: bold; }
td { padding: 3px 6px; border: 1px solid #999; }
```

</details>

### Chalkboard (`Chalkboard_css`)

A chalkboard photo background with a layered white text-shadow trick that gives every heading a soft, slightly-offset chalky texture instead of a crisp, flat shadow.

<details>
<summary><b>Chalkboard</b> &mdash; CSS</summary>

```css
bg {
  background-image: url('https://files.d20.io/images/499367520/A_31cGjx2Ee-9Xg5TaHUjg/original.webp?1788114506');
  background-color: #20291f;
  padding: 20px 24px;
  color: #eceae0;
}
h1 {
  font-family: Chalkduster, 'Permanent Marker', 'Segoe Print', cursive;
  font-weight: normal;
  letter-spacing: 1px;
  font-size: 42px;
  text-align: center;
  color: #f5f3ea;
  text-shadow: 0 0 1px rgba(255,255,255,0.6), 1px 0 1px rgba(255,255,255,0.35), -1px 0 1px rgba(255,255,255,0.35), 0 1px 1px rgba(255,255,255,0.25);
  border-bottom: 3px solid rgba(236,234,224,0.5);
  padding-bottom: 8px;
  margin: 20px 0 14px 0;
}
h2 {
  font-family: Chalkduster, 'Permanent Marker', 'Segoe Print', cursive;
  font-weight: normal;
  letter-spacing: 0.5px;
  font-size: 36px;
  text-align: center;
  color: #f5f3ea;
  text-shadow: 0 0 1px rgba(255,255,255,0.5), 1px 0 1px rgba(255,255,255,0.3), -1px 0 1px rgba(255,255,255,0.3);
  border-bottom: 1px solid rgba(236,234,224,0.35);
  padding-bottom: 5px;
  margin: 20px 0 8px 0;
}
h3 {
  font-family: Chalkduster, 'Permanent Marker', 'Segoe Print', cursive;
  font-weight: normal;
  font-size: 24px;
  text-align: center;
  color: #f0eee2;
  text-shadow: 0 0 1px rgba(255,255,255,0.45), 1px 0 1px rgba(255,255,255,0.25), -1px 0 1px rgba(255,255,255,0.25);
  margin: 18px 0 5px 0;
}
h4 {
  font-family: Chalkduster, 'Permanent Marker', 'Segoe Print', cursive;
  font-weight: normal;
  font-size: 16px;
  color: #f0eee2;
  text-shadow: 0 0 1px rgba(255,255,255,0.4), 1px 0 1px rgba(255,255,255,0.2);
  margin: 14px 0 4px 0;
}
h5 {
  font-family: Chalkduster, 'Permanent Marker', 'Segoe Print', cursive;
  font-weight: normal;
  font-style: italic;
  font-size: 15px;
  color: #ece9dc;
  text-shadow: 0 0 1px rgba(255,255,255,0.35);
  margin: 8px 0 3px 0;
}
h6 {
  font-family: Chalkduster, 'Permanent Marker', 'Segoe Print', cursive;
  font-weight: normal;
  font-style: italic;
  font-size: 13px;
  color: #d8d5c8;
  text-shadow: 0 0 1px rgba(255,255,255,0.3);
  margin: 7px 0 2px 0;
}
p {
  font-family: 'Segoe Print', 'Comic Sans MS', cursive, sans-serif;
  font-size: 15px;
  line-height: 21px;
  color: #eceae0;
  text-shadow: 0 0 1px rgba(255,255,255,0.3);
  margin: 10px 0;
}
blockquote {
  font-family: 'Segoe Print', 'Comic Sans MS', cursive, sans-serif;
  font-style: italic;
  color: #f5f3ea;
  text-shadow: 0 0 1px rgba(255,255,255,0.35);
  border: 1px dashed rgba(236,234,224,0.5);
  padding: 6px 10px;
  margin: 10px 0;
}
strong { color: #fdf6d8; text-shadow: 0 0 2px rgba(253,246,216,0.5); }
em { font-style: italic; color: #dedbcd; }
s {
  text-decoration: line-through;
  text-decoration-color: rgba(236,234,224,0.6);
  color: rgba(236,234,224,0.45);
}
ol {
  font-family: 'Segoe Print', 'Patrick Hand', 'Comic Sans MS', cursive, sans-serif;
  font-size: 15px;
  color: #eceae0;
  margin: 6px 0 6px 24px;
}
ul {
  font-family: 'Segoe Print', 'Patrick Hand', 'Comic Sans MS', cursive, sans-serif;
  font-size: 15px;
  color: #eceae0;
  margin: 6px 0 6px 24px;
}
li {
  line-height: 20px;
  margin: 2px 0;
}
table { width: 100%; border-collapse: collapse; font-family: 'Segoe Print', 'Patrick Hand', cursive, sans-serif; font-size: 13px; color: #eceae0; }
tr:first-child { border-bottom: 2px dashed rgba(236,234,224,0.6); font-weight: bold; color: #f5f3ea; }
tr:nth-child(odd) { background-color: rgba(255,255,255,0.03); }
tr:nth-child(even) { background-color: transparent; }
td { padding: 4px 8px; border-bottom: 1px dashed rgba(236,234,224,0.25); text-align: left; }
```

</details>

### Journal (`Journal_css`)

A ruled-paper diary/log page, distinct from Notebook -- no baseline grid, a script-font date/entry heading, and a floated script-font blockquote that reads as a handwritten margin note.

<details>
<summary><b>Journal</b> &mdash; CSS</summary>

```css
container {
  background-color: #f7f2e2;
  background-image: repeating-linear-gradient(to bottom, transparent, transparent 27px, #d9cfa8 28px);
  color: #3b2b1a;
  font-family: 'Patrick Hand', Georgia, 'Times New Roman', serif;
  padding: 16px 20px;
  border: 1px solid #cbbd91;
}

h1 {
  font-family: 'Kaushan Script', Georgia, serif;
  font-style: italic;
  color: #4a331d;
  font-size: 26px;
  text-align: left;
  margin: 20px 0 4px 0;
  border-bottom: 1px solid #b7a877;
  padding-bottom: 4px;
}

h2 {
  font-family: 'Kaushan Script', Georgia, serif;
  font-style: italic;
  color: #4a331d;
  font-size: 20px;
  margin: 18px 0 4px 0;
}

h3, h4, h5, h6 {
  font-family: 'Patrick Hand', Tahoma, sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight:bold!important;
  font-size: 18px;
  margin: 16px 0 3px 0;
}

p {
  font-family: 'Patrick Hand', Georgia, 'Times New Roman', serif;
  font-size: 18px;
  line-height: 27px;
  margin: 0 0 1px 0;
}

p.first-of-type {
  text-indent: 0px !important;
}

blockquote {
  font-family: 'Shadows Into Light', 'Comic Sans MS', cursive;
  font-size: 15px;
  color: #6e4a2e;
  float: right;
  width: 32%;
  margin: 4px 0 8px 12px;
  padding: 4px 8px;
  border-left: 1px dashed #b7a877;
  text-align: left;
  line-height: 1.4;
}

pre, code {
  font-family: 'Lucida Console', 'Courier New', monospace;
  background-color: #efe6c9;
  color: #3b2b1a;
  padding: 6px 10px;
  border: 1px solid #cbbd91;
  font-size: 13px;
}

ol, ul { margin: 4px 0 4px 24px; }
li {
  font-family: 'Crimson Text', Georgia, 'Times New Roman', serif;
  font-size: 16px;
  line-height: 27px;
}

strong { color: #4a331d; }
em { color: #3b2b1a; }
s { color: #948467; }

a { color: #6e4a2e; text-decoration: underline; }

table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Patrick Hand', Georgia, serif;
  font-size: 14px;
  color: #3b2b1a;
  margin: 20px 0;
}
tr:first-child { background-color: #e6d9ad; font-weight: bold; border-bottom: 2px solid #b7a877; }
tr:nth-child(odd) { background-color: #f7f2e2; }
tr:nth-child(even) { background-color: #efe6c9; }
td, th {
  font-family: 'Patrick Hand', Georgia, serif;
  padding: 4px 8px;
  border: 1px solid #cbbd91;
  text-align: left;
}
```

</details>

### Scroll (`Scroll_css`)

An unrolled parchment scroll -- a blood-red blackletter headline, three stacked background images that scale to the handout's own width, and a white-on-orange magical glow shared by the h2/h3 headings and the strikethrough tag, for a burned-away or enchanted-text effect.

<details>
<summary><b>Scroll</b> &mdash; CSS</summary>

```css
bg {
  box-sizing: border-box;
  background-color: transparent;
  background-image: url('https://files.d20.io/images/499523393/r8kFWGBwQiabPd_8DSHNxA/original.webp?1788234833'), url('https://files.d20.io/images/499523394/3MC6HfU5mzqXbgV855ZbKg/original.webp?1788234834'), url('https://files.d20.io/images/499523395/MKWdctjvzLVXua6XKrrQSg/original.webp?1788234834');
  background-repeat: no-repeat, no-repeat, repeat-y;
  background-position: top center, bottom center, top center;
  background-size: 100% auto, 100% auto, 100% auto;
  padding: 150px 100px 120px 100px;
  color: #000;
  font-family: 'Kaushan Script', Georgia, serif;
}
h1 {
  font-family: 'UnifrakturMaguntia', 'Old English Text MT', fantasy;
  color: #5c0000;
  font-size: 80px;
  text-align: center;
  line-height: 1.0;
  margin: 0 0 14px 0;
}

h2 {
  font-family: 'UnifrakturMaguntia', 'Old English Text MT', fantasy;
  color: #fff;
  font-size: 50px;
  line-height: 1.2;
  text-align: center;
  margin: 30px 0 20px 0;
  text-shadow:
    0 0 2px #fff,
    0 0 5px #ff9900,
    0 0 10px #ff9900,
    0 0 20px #ff6600;
}

h3 {
  font-family: 'UnifrakturMaguntia', 'Old English Text MT', fantasy;
  color: #fff;
  font-size: 36px;
  line-height: 1.2;
  text-align: center;
  margin: 30px 0 20px 0;
  text-shadow:
    0 0 2px #fff,
    0 0 5px #ff9900,
    0 0 10px #ff9900,
    0 0 20px #ff6600;
}

h4 {
  font-family: 'UnifrakturMaguntia', 'Old English Text MT', fantasy;
  color: #222;
  font-size: 18px;
  text-align: center;
  margin: 14px 0 5px 0;
}

h5 {
  font-family: 'Kaushan Script', Georgia, serif;
  color: #222;
  font-size: 16px;
  margin: 12px 0 4px 0;
}

h6 {
  font-family: 'Kaushan Script', Georgia, serif;
  color: #222;
  font-style: italic;
  font-size: 14px;
  margin: 10px 0 4px 0;
}

p {
  font-family: 'Kaushan Script', Georgia, serif;
  color: #222;
  font-size: 20px;
  line-height: 1.6;
  margin: 8px 0;
}

blockquote {
  font-family: Georgia, serif;
  background-color: rgba(0,0,0,0.06);
  color: #444;
  border-left: 3px solid #5c0000;
  border-right: 3px solid #5c0000;
  padding: 8px 16px;
  margin: 12px 40px;
}

pre, code {
  font-family: Georgia, serif;
  color: #000;
  background-color: rgba(0,0,0,0.06);
  border: 1px solid #a6997a;
  padding: 6px 10px;
  font-size: 15px;
}

ol, ul { margin: 6px 0 6px 26px; }
li {
  font-family: 'Kaushan Script', Georgia, serif;
  color: #000;
  font-size: 17px;
  line-height: 1.6;
}

strong { color: #5c0000; }
em { font-style: italic; color: #000; }
s {
  color: #fff;
  text-decoration: none !important;
  text-shadow:
    0 0 2px #fff,
    0 0 5px #ff9900,
    0 0 10px #ff9900,
    0 0 20px #ff6600;
}

a { color: #5c0000; text-decoration: underline; }

table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Kaushan Script', Georgia, serif;
  font-size: 16px;
  color: #000;
}
tr:first-child { background-color: rgba(92,0,0,0.12); font-weight: bold; border-bottom: 2px solid #5c0000; }
tr:nth-child(odd) { background-color: rgba(0,0,0,0.04); }
tr:nth-child(even) { background-color: transparent; }
td, th {
  font-family: 'Kaushan Script', Georgia, serif;
  padding: 5px 9px;
  border: 1px solid #a6997a;
  text-align: left;
}
```

</details>

### PF2 (`PF2_css`)

A Pathfinder 2 sourcebook look -- a large centered blackletter H1, bold Garamond H2, uppercase Anton H3/H4 in navy, and a top/bottom-rule banner blockquote, with flat colors standing in for any official background art.

<details>
<summary><b>PF2</b> &mdash; CSS</summary>

```css
bg {
  background-color: #fff;
  padding: 20px 26px;
  color: #2a2418;
  font-family: 'EB Garamond', Garamond, Georgia, serif;
}

h1 {
  font-family: 'UnifrakturMaguntia', 'Old English Text MT', fantasy;
  font-weight: bold;
  color: #005c2e;
  font-size: 52px;
  line-height:1.2;
  text-align:center;
  letter-spacing: 1px;
  padding: 6px 0;
  margin: 10px 0 12px 0;
}

h2 {
  font-family: 'EB Garamond', Garamond, Georgia, serif;
  font-weight: bold;
  letter-spacing: 2px;
  color: #662600;
  font-size: 36px;
  font-weight: bold;
  padding: 4px 0;
  margin: 14px 0 0px 0;
}

h3 {
  font-family: Anton, Arial, sans-serif;
  font-weight: bold;
  color: #001a4d;
  font-size: 20px;
  text-transform: uppercase;
  margin: 16px 0 0 0;
}

h4 {
  font-family: Anton, Arial, sans-serif;
  font-weight: bold;
  color: #001a4d;
  font-size: 20px;
  text-transform: uppercase;
  margin: 16px 0 0 0;
  border-bottom: 2px solid #001a4d;
}

h5 {
  font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif;
  font-style: italic;
  color: #662600;
  font-size: 13px;
  margin: 8px 0 3px 0;
}

h6 {
  font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif;
  font-style: italic;
  color: #555;
  font-size: 12px;
  margin: 6px 0 2px 0;
}

p {
  font-family: 'EB Garamond', Garamond, Georgia, serif;
  font-size: 16px;
  line-height: 1.5;
  color: #2a2418;
  margin: 6px 0;
}

blockquote {
  font-family: 'Oswald', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.2;
  color: #005c2e;
  border-top: 1px solid #005c2e;
  border-bottom: 1px solid #005c2e;
  padding: 10px 14px;
  margin: 20px 0px;
}

pre {
  font-family: 'Oswald', Arial, sans-serif;
  color: #111;
  font-size: 14px;
  line-height: 1.3;
  border: none;
  background-color: transparent;
  padding: none;
}

ol, ul { margin: 6px 0 6px 24px; }
li {
  font-family: 'EB Garamond', Garamond, Georgia, serif;
  font-size: 15px;
  line-height: 1.5;
  color: #2a2418;
}

em { font-style: italic;}
s { color: #999; }

a { color: #005c2e; text-decoration: underline; }

table {
  width: 100%;
  border-collapse: collapse;
  font-family: Verdana, sans-serif;
  font-size: 14px;
  color: #111;
}
tr:first-child { background-color: #4a0409; color: #eee; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #8a6d3b; }
tr:nth-child(even) { background-color: #f1e9cd; }
td, th {
  padding: 6px;
  border: 1px solid #c2b59b;
  text-align: left;
}
```

</details>
