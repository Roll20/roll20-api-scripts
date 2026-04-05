// Script:   Format Table
// By:       Keith Curtis
// Contact:  https://app.roll20.net/users/162065/keithcurtis

var TableFormatter = (() => {
    'use strict';
    
    const version = '1.0.0';
    log('-=> Format Table v' + version + ' is loaded. Use !format-table to call up panel');
    // 1.0.0 Debut

    const SCRIPT = 'TableFormatter';

    const buttonStyle = "background:#555; color:#eee; width:40%; padding:4px 8px; border: solid 1px #111; border-radius:8px; text-decoration:none; display:inline-block; margin:2px; font-weight:bold; font-size:12px;"
    // -------------------------------
    // Styles
    // -------------------------------
    const STYLES = {

        "5e": {
            table: {
                width: "100%",
                border: "none",
                borderSpacing: "0",
                outline: "none",
                color: "#111"
            },
            tr: {
                base: {
                    width: "100%",
                    textAlign: "left",
                    fontFamily: "Verdana, sans-serif",
                    fontSize: "13px",
                    border: "0px solid #ffffff"
                },
                first: {
                    fontWeight: "bold",
                    background: "transparent"
                },
                odd: {
                    background: "transparent"
                },
                even: {
                    background: "#E0E5C1"
                }
            },
            td: {
                paddingTop: "2px",
                paddingBottom: "2px",
                border: "none",
                outline: "none",
                textAlign: "left"
            }
        },
        
        "5.5e": {
            table: {
                width: "100%",
                border: "none",
                borderSpacing: "0",
                outline: "none",
                color: "#111"
            },
            tr: {
                base: {
                    width: "100%",
                    textAlign: "left",
                    fontFamily: "Scala Sans Offc, Verdana, sans-serif",
                    fontSize: "14px",
                    border: "0px solid #ffffff"
                },
                first: {
                    fontWeight: "bold",
                    background: "transparent"
                },
                odd: {
                    background: "#f5f8fa"
                },
                even: {
                    background: "#e1ebf0"
                }
            },
            td: {
                paddingTop: "2px",
                paddingBottom: "2px",
                border: "none",
                outline: "none",
                textAlign: "left"
            }
        },

"Wikitable": {
    table: {
        width: "100%",
        borderCollapse: "collapse",
        backgroundColor: "#f8f9fa",
        color: "#202122",
        border: "1px solid #a2a9b1",
        margin: "1em 0"
    },
    tr: {
        base: {},
        first: {
            backgroundColor: "#eaecf0",
            color: "#202122",
            fontWeight: "bold",
            textAlign: "center"
        },
        odd: {
            backgroundColor: "#ffffff"
        },
        even: {
            backgroundColor: "#f8f9fa"
        }
    },
    td: {
        border: "1px solid #a2a9b1",
        padding: "0.2em 0.4em",
        textAlign: "left"
    }
},

"Pathfinder 2": {
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "Verdana, sans-serif",
        fontSize: "14px",
        color: "#111"
    },
    tr: {
        base: {},
        first: {
            background: "#4a0409",
            color: "#eee",
            fontWeight: "bold",
            borderBottom: "2px solid #8a6d3b"
        },
        odd: {
            background: "#f8f3e5"
        },
        even: {
            background: "#f1e9cd"
        }
    },
    td: {
        padding: "6px",
        border: "1px solid #c2b59b"
    }
},

"OSR": {
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "Times New Roman, serif",
        fontSize: "15px",
        color: "#000",
        border: "none"
    },
    tr: {
        base: {},
        first: {
            fontWeight: "bold",
            borderBottom: "2px solid #000"
        },
        odd: {},
        even: {}
    },
    td: {
        padding: "4px",
        border: "none"
    }
},

"DnD 3": {
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "Verdana, sans-serif",
        fontSize: "13px"
    },
    tr: {
        base: {},
        first: {
            background: "#b7c9e2",
            color: "#000",
            fontWeight: "bold"
        },
        odd: {
            background: "#ffffff"
        },
        even: {
            background: "#eef3fa"
        }
    },
    td: {
        padding: "5px",
        border: "1px solid #7f9db9"
    }
},



        "Minimal": {
            table: {
                width: "100%",
                margin:"0",
                borderCollapse: "collapse"
            },
            tr: {
                base: {},
                first: {
                    fontWeight: "bold"
                },
                odd: {},
                even: {}
            },
            td: {
                padding: "4px",
                border: "1px solid #ccc"
            }
        },
        
        
        "Invisible": {
    table: {
        width: "100%",
        borderCollapse: "collapse",
        border: "none"
    },
    tr: {
        base: {},
        first: {},
        odd: {},
        even: {}
    },
    td: {
        padding: "6px",
        border: "none"
    }
},



"Roll20 Default": {
    table: {},
    tr: {
        base: {},
        first: {},
        odd: {},
        even: {}
    },
    td: {}
}
    };

    // -------------------------------
    // Utilities
    // -------------------------------

    const cssObjToString = (obj) => {
        return Object.entries(obj)
            .map(([k, v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}:${v}`)
            .join(';');
    };

    const applyStyle = (existing, styleObj) => {
        return cssObjToString(styleObj);
    };

    const findHandout = (input) => {
        let handout = getObj('handout', input);
        if (handout) return handout;

        input = input.toLowerCase();
        return findObjs({ type: 'handout' })
            .find(h => h.get('name').toLowerCase() === input);
    };

    const sendReport = (msg) => {
        let report = `<div style="
                border:1px solid #444;
                border-radius:10px;
                background:#ccc;
                color:#111;
                padding:10px;
                font-size:14px;
            ">${msg}</div>`.replace(/\r\n|\r|\n/g, "").trim();
        sendChat(SCRIPT,
            `/w gm ${report}`
        );
    };

    // -------------------------------
    // Core Processing
    // -------------------------------

    const processTables = (html, style) => {

        let tableCount = 0;

        // Match top-level tables only (non-greedy)
        return {
            html: html.replace(/<table[\s\S]*?<\/table>/gi, (tableHTML) => {

                tableCount++;

                let rowIndex = 0;

                // Apply table style
                tableHTML = tableHTML.replace(/<table([^>]*)>/i, (m, attrs) => {
                    return `<table style="${applyStyle('', style.table)}">`;
                });

                // Process rows
                tableHTML = tableHTML.replace(/<tr([^>]*)>([\s\S]*?)<\/tr>/gi, (m, attrs, inner) => {

                    let trStyle = { ...style.tr.base };

                    if (rowIndex === 0 && style.tr.first) {
                        Object.assign(trStyle, style.tr.first);
                    } else if (rowIndex % 2 === 0 && style.tr.even) {
                        Object.assign(trStyle, style.tr.even);
                    } else if (style.tr.odd) {
                        Object.assign(trStyle, style.tr.odd);
                    }

                    rowIndex++;

                    // Process cells
                    inner = inner.replace(/<td([^>]*)>([\s\S]*?)<\/td>/gi, (tdMatch, tdAttrs, tdInner) => {
                        return `<td style="${applyStyle('', style.td)}">${tdInner}</td>`;
                    });

                    return `<tr style="${applyStyle('', trStyle)}">${inner}</tr>`;
                });

                return tableHTML;
            }),
            count: tableCount
        };
    };

    // -------------------------------
    // Command Parsing
    // -------------------------------

const parseArgs = (msg) => {
    let args = msg.content.split(/\s+--/).slice(1);

    let out = {};

    args.forEach(a => {
        let [key, val] = a.split('|');

        if (key) {
            out[key.trim().toLowerCase()] = val ? val.trim() : true;
        }
    });

    return out;
};
    // -------------------------------
    // Main Handler
    // -------------------------------

const handleInput = (msg) => {
    if (msg.type !== 'api') return;
    if (!msg.content.startsWith('!format-table')) return;

    const args = parseArgs(msg);

    // -------------------------------
    // HELP
    // -------------------------------
    if (args.help !== undefined) {

        const styles = Object.keys(STYLES).sort();
        const styleList = styles.map(s => `<li><b>${s}</b></li>`).join('');

        sendReport(`
            <span style="font-weight:bold; font-size:20px;">TableFormatter Help</span><br><br>

            <b>Purpose</b><br>
            Applies a predefined style to all tables in a handout.<br><br>

            <b>Usage</b><br>
            <code>!format-table</code><br>
            Calls up a control panel to apply styles with a button press.<br><br>

            <b>Macro Syntax</b><br>
            <code>!format-table --style|STYLE --handout|HANDOUT</code><br><br>

            <b>Arguments</b><br>
            <ul style="margin-left:10px;">
                <li><b>--style</b> | Style name</li>
                <li><b>--handout</b> | Handout name or ID</li>
            </ul>

            <b>Available Styles</b>
            <ul style="margin-left:10px;">
                ${styleList}
            </ul>

            <b>Example</b><br>
            <code>!format-table --style|5e --handout|Monster Stats</code><br><br>

            <b>Notes</b><br>
            • Formats <b>all tables</b> in the handout<br>
            • Existing table styles will be replaced<br>
            • Handout must exist<br><br>

            <a href="!format-table" style="${buttonStyle} width:auto;">Open Style Selector</a>
        `);

        return;
    }

    // -------------------------------
    // BARE COMMAND → UI
    // -------------------------------
    if (msg.content.trim() === '!format-table') {

        const styles = Object.keys(STYLES).sort();

        const styleButtons = styles.map(s => {
            const cmd = `!format-table --style|${s} --handout|?{Handout Name or ID}`;
            return `<a href="${cmd}" style="${buttonStyle}">${s}</a>`;
        }).join('');

        sendReport(`
            <span style="font-weight:bold; font-size:20px;">Table Formatter</span><br><br>
            Apply a predefined style to <b>all tables</b> in a handout.<br><br>

            <div style="margin-top:4px;">
                ${styleButtons}
            </div>

            <br>
            You will be prompted for the handout name or ID.<br><br>

            <a href="!format-table --help" style="${buttonStyle}">Help</a>
        `);

        return;
    }

    // -------------------------------
    // NORMAL EXECUTION
    // -------------------------------
    const styleName = args.style;
    const handoutInput = args.handout;

    if (!styleName || !handoutInput) {
        sendReport(`Missing arguments.<br>
        Use <code>!format-table --help</code> or run <b>!format-table</b> for UI.`);
        return;
    }

    const style = STYLES[styleName];
    if (!style) {
        sendReport(`Style <b>${styleName}</b> not found.`);
        return;
    }

    const handout = findHandout(handoutInput);
    if (!handout) {
        sendReport(`Handout <b>${handoutInput}</b> not found.`);
        return;
    }

    handout.get('notes', (notes) => {

        let result = processTables(notes, style);

        handout.set('notes', result.html);

        sendReport(`
            <b>Table Formatting Complete</b><br>
            Handout: ${handout.get('name')}<br>
            Style: ${styleName}<br>
            Tables Processed: ${result.count}
        `);
    });
};

const buildMacroLink = () => {

    const styles = Object.keys(STYLES);

    // Build dropdown list
    const styleOptions = styles
        .map(s => `${s}`)
        .join('|');

    // Confirmation prompt (first gate)
    const confirm = `?{Format all tables in a handout using a predefined style?|Yes,continue|No,abort}`;

    const command =
        `!format-table ` +
        `--style|?{Style|${styleOptions}} ` +
        `--handout|?{Handout Name or ID}`;

    // Wrap with confirmation gate
    const fullCommand = `${confirm}==Yes,continue?${command}:`;

    return `<a href="${fullCommand}" style="background:#444;color:white;padding:5px 8px;border-radius:4px;text-decoration:none;display:inline-block;">Format a Table</a>`;
};



    // -------------------------------
    // Init
    // -------------------------------

    const register = () => {
        on('chat:message', handleInput);
    };

    return {
        register
    };

})();

on('ready', () => {
    TableFormatter.register();
});