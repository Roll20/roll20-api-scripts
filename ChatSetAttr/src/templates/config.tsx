import { getConfig } from "../modules/config";
import { s } from "../utils/chat";
import { buttonStyleBase, frameStyleBase, headerStyleBase } from "./styles";

const CONFIG_WRAPPER_STYLE = s(frameStyleBase);

const CONFIG_HEADER_STYLE = s(headerStyleBase);

const CONFIG_TABLE_STYLE = s({
  width: "100%",
  border: "none",
  borderCollapse: "separate",
  borderSpacing: "0 4px",
});

const CONFIG_ROW_STYLE = s({
  marginBottom: "4px",
});

const CONFIG_BUTTON_STYLE_ON = s({
  ...buttonStyleBase,
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
  fontWeight: "500",
});

const CONFIG_BUTTON_STYLE_OFF = s({
  ...buttonStyleBase,
  backgroundColor: "#DC2626",
  color: "#FFFFFF",
  fontWeight: "500",
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
      <div>
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