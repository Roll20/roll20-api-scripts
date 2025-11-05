import { getConfig } from "../modules/config";
import { s } from "../utils/chat";
import { BORDER_RADIUS, COLOR_BLUE, COLOR_GREEN, COLOR_RED, COLOR_WHITE, FONT_SIZE, PADDING } from "./styles";

const CONFIG_WRAPPER_STYLE = s({
  border: `1px solid ${COLOR_BLUE["300"]}`,
  borderRadius: BORDER_RADIUS.MD,
  padding: PADDING.MD,
  backgroundColor: COLOR_BLUE["50"],
});

const CONFIG_HEADER_STYLE = s({
  color: COLOR_BLUE["400"],
  fontSize: FONT_SIZE.LG,
  fontWeight: "bold",
  marginBottom: PADDING.SM,
});

const CONFIG_BODY_STYLE = s({
  fontSize: FONT_SIZE.SM,
});

const CONFIG_TABLE_STYLE = s({
  width: "100%",
  border: "none",
  borderCollapse: "separate",
  borderSpacing: "0 4px",
});

const CONFIG_ROW_STYLE = s({
  marginBottom: PADDING.XS,
});

const CONFIG_BUTTON_SHARED = {
  color: COLOR_WHITE,
  border: "none",
  borderRadius: BORDER_RADIUS.SM,
  fontSize: FONT_SIZE.SM,
  padding: `${PADDING.XS} ${PADDING.SM}`,
  textAlign: "center",
  width: "100%",
};

const CONFIG_BUTTON_STYLE_ON = s({
  backgroundColor: COLOR_GREEN["500"],
  ...CONFIG_BUTTON_SHARED,
});

const CONFIG_BUTTON_STYLE_OFF = s({
  backgroundColor: COLOR_RED["300"],
  ...CONFIG_BUTTON_SHARED,
});

const CONFIG_CLEAR_FIX_STYLE = s({
  clear: "both",
});

function camelToKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};

export function createConfigMessage(): string {
  const config = getConfig();
  const configEntries = Object.entries(config);
  const relevantEntries = configEntries.filter(([key]) =>
    key !== "version" && key !== "globalconfigCache" && key !== "flags"
  );
  return (
    <div style={CONFIG_WRAPPER_STYLE}>
      <div style={CONFIG_HEADER_STYLE}>ChatSetAttr Configuration</div>
      <div style={CONFIG_BODY_STYLE}>
        <table style={CONFIG_TABLE_STYLE}>
          {relevantEntries.map(([key, value]) => (
            <tr style={CONFIG_ROW_STYLE}>
              <td>
                <strong>{key}:</strong>
              </td>
              <td>
                <a
                  href={`!setattr-config --${camelToKebabCase(key)}`}
                  style={value ? CONFIG_BUTTON_STYLE_ON : CONFIG_BUTTON_STYLE_OFF}>
                  {value ? "Enabled" : "Disabled"}
                </a>
              </td>
            </tr>
          ))}
        </table>
        <div style={CONFIG_CLEAR_FIX_STYLE}></div>
      </div>
    </div>
  );
};