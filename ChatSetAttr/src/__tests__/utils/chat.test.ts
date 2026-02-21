/* eslint-disable @stylistic/quotes */
import { describe, it, expect } from "vitest";
import { h, s } from "../../utils/chat";

describe("chat utilities", () => {
  describe("h function (JSX helper)", () => {
    it("should create a simple HTML tag with no attributes or children", () => {
      const result = h("div");
      expect(result).toBe("<div></div>");
    });

    it("should create a tag with text content", () => {
      const result = h("p", {}, "Hello World");
      expect(result).toBe("<p>Hello World</p>");
    });

    it("should create a tag with multiple text children", () => {
      const result = h("div", {}, "First", "Second", "Third");
      expect(result).toBe("<div>FirstSecondThird</div>");
    });

    it("should create a tag with a single attribute", () => {
      const result = h("div", { class: "container" });
      expect(result).toBe("<div class=\"container\"></div>");
    });

    it("should create a tag with multiple attributes", () => {
      const result = h("input", { type: "text", name: "username", id: "user" });
      expect(result).toBe("<input type=\"text\" name=\"username\" id=\"user\"></input>");
    });

    it("should create a tag with attributes and children", () => {
      const result = h("button", { type: "submit", class: "btn" }, "Click me");
      expect(result).toBe("<button type=\"submit\" class=\"btn\">Click me</button>");
    });

    it("should handle empty attributes object", () => {
      const result = h("span", {}, "Content");
      expect(result).toBe("<span>Content</span>");
    });

    it("should filter out null and undefined children", () => {
      const result = h("div", {}, "First", null, "Second", undefined, "Third");
      expect(result).toBe("<div>FirstSecondThird</div>");
    });

    it("should handle empty string children", () => {
      const result = h("div", {}, "First", "", "Second");
      expect(result).toBe("<div>FirstSecond</div>");
    });

    it("should handle nested HTML structure simulation", () => {
      const inner = h("span", {}, "Inner");
      const result = h("div", { class: "outer" }, "Before", inner, "After");
      expect(result).toBe('<div class="outer">Before<span>Inner</span>After</div>');
    });

    it("should handle special characters in attribute values", () => {
      const result = h("div", { "data-value": "test & value", title: 'Quote "test"' });
      expect(result).toBe('<div data-value="test & value" title="Quote "test""></div>');
    });

    it("should handle special characters in children", () => {
      const result = h("p", {}, "Text with & < > characters");
      expect(result).toBe("<p>Text with & < > characters</p>");
    });

    it("should handle numeric string children", () => {
      const result = h("div", {}, "Count: ", "42");
      expect(result).toBe("<div>Count: 42</div>");
    });

    it("should handle self-closing tag behavior (treats all tags the same)", () => {
      const result = h("br", { class: "line-break" });
      expect(result).toBe('<br class="line-break"></br>');
    });

    it("should handle complex nested attributes", () => {
      const result = h("div", {
        id: "main",
        class: "container fluid",
        "data-toggle": "modal",
        "aria-label": "Main content"
      }, "Content");
      expect(result).toBe('<div id="main" class="container fluid" data-toggle="modal" aria-label="Main content">Content</div>');
    });

    it("should handle CSS style attribute", () => {
      const result = h("div", { style: "color: red; font-size: 16px;" }, "Styled text");
      expect(result).toBe('<div style="color: red; font-size: 16px;">Styled text</div>');
    });

    it("should preserve order of attributes", () => {
      const result = h("input", { z: "last", a: "first", m: "middle" });
      expect(result).toBe('<input z="last" a="first" m="middle"></input>');
    });

    it("should handle boolean-like attribute values", () => {
      const result = h("input", { disabled: "true", checked: "false" });
      expect(result).toBe('<input disabled="true" checked="false"></input>');
    });

    it("should handle whitespace in children", () => {
      const result = h("pre", {}, "  Code with  spaces  ");
      expect(result).toBe("<pre>  Code with  spaces  </pre>");
    });

    describe("edge cases and undefined props", () => {
      it("should handle undefined attributes parameter", () => {
        const result = h("div", undefined, "Content");
        expect(result).toBe("<div>Content</div>");
      });

      it("should handle undefined attribute values", () => {
        const result = h("div", { class: "test", id: undefined as unknown as string });
        expect(result).toBe('<div class="test" id="undefined"></div>');
      });

      it("should handle null attribute values", () => {
        const result = h("div", { class: "test", id: null as unknown as string });
        expect(result).toBe('<div class="test" id="null"></div>');
      });

      it("should handle empty string attribute values", () => {
        const result = h("input", { type: "text", value: "", placeholder: "" });
        expect(result).toBe('<input type="text" value="" placeholder=""></input>');
      });

      it("should handle zero as attribute value", () => {
        const result = h("div", { tabindex: "0", "data-count": "0" });
        expect(result).toBe('<div tabindex="0" data-count="0"></div>');
      });

      it("should handle attributes with special characters in keys", () => {
        const result = h("div", { "data-test-value": "test", "aria-label": "label" });
        expect(result).toBe('<div data-test-value="test" aria-label="label"></div>');
      });

      it("should handle empty tag name", () => {
        const result = h("", {}, "Content");
        expect(result).toBe("<>Content</>");
      });

      it("should handle tag name with numbers", () => {
        const result = h("h1", {}, "Heading");
        expect(result).toBe("<h1>Heading</h1>");
      });

      it("should handle very long attribute values", () => {
        const longValue = "a".repeat(1000);
        const result = h("div", { "data-long": longValue });
        expect(result).toBe(`<div data-long="${longValue}"></div>`);
      });

      it("should handle very long children content", () => {
        const longContent = "content ".repeat(500);
        const result = h("div", {}, longContent);
        expect(result).toBe(`<div>${longContent}</div>`);
      });

      it("should handle numeric-like strings in children", () => {
        const result = h("div", {}, "123", "456.789", "-42");
        expect(result).toBe("<div>123456.789-42</div>");
      });

      it("should handle boolean-like strings in children", () => {
        const result = h("div", {}, "true", "false", "null", "undefined");
        expect(result).toBe("<div>truefalsenullundefined</div>");
      });

      it("should handle mixed null, undefined, and valid children", () => {
        const result = h("div", {}, "Start", null, undefined, "", "End");
        expect(result).toBe("<div>StartEnd</div>");
      });

      it("should handle attributes with Unicode characters", () => {
        const result = h("div", { title: "Café München 🎉", "data-emoji": "👍" });
        expect(result).toBe('<div title="Café München 🎉" data-emoji="👍"></div>');
      });

      it("should handle children with Unicode characters", () => {
        const result = h("p", {}, "Hello 世界", " Café ☕");
        expect(result).toBe("<p>Hello 世界 Café ☕</p>");
      });

      it("should handle arrays of children without adding commas", () => {
        const children = ["First", "Second", "Third"];
        const result = h("div", {}, children);
        expect(result).toBe("<div>FirstSecondThird</div>");
      });

      it("should handle nested arrays of children", () => {
        const firstGroup = ["A", "B"];
        const secondGroup = ["C", "D"];
        const result = h("div", {}, firstGroup, secondGroup);
        expect(result).toBe("<div>ABCD</div>");
      });

      it("should handle arrays mixed with regular children", () => {
        const arrayChildren = ["Middle1", "Middle2"];
        const result = h("div", {}, "Start", arrayChildren, "End");
        expect(result).toBe("<div>StartMiddle1Middle2End</div>");
      });

      it("should handle arrays with null and undefined values", () => {
        const children = ["First", null, "Second", undefined, "Third"];
        const result = h("div", {}, children);
        expect(result).toBe("<div>FirstSecondThird</div>");
      });

      it("should simulate JSX array behavior (like map)", () => {
        // This simulates what happens when you do messages.map(msg => <p>{msg}</p>)
        const messages = ["Message 1", "Message 2", "Message 3"];
        const paragraphs = messages.map(message => h("p", {}, message));
        const result = h("div", {}, paragraphs);
        expect(result).toBe("<div><p>Message 1</p><p>Message 2</p><p>Message 3</p></div>");
      });

      it("should handle deeply nested arrays", () => {
        const nestedArray = [["A", "B"], [["C", "D"], "E"]];
        const result = h("div", {}, ...nestedArray);
        expect(result).toBe("<div>ABCDE</div>");
      });

      it("should handle empty arrays", () => {
        const result = h("div", {}, []);
        expect(result).toBe("<div></div>");
      });

      it("should handle arrays containing empty strings", () => {
        const children = ["Start", "", "End"];
        const result = h("div", {}, children);
        expect(result).toBe("<div>StartEnd</div>");
      });
    });
  });

  describe("s function (style helper)", () => {
    it("should convert a simple style object to CSS string", () => {
      const result = s({ color: "red" });
      expect(result).toBe("color: red;");
    });

    it("should convert multiple properties", () => {
      const result = s({ color: "red", fontSize: "16px", margin: "10px" });
      expect(result).toBe("color: red;font-size: 16px;margin: 10px;");
    });

    it("should convert camelCase to kebab-case", () => {
      const result = s({ backgroundColor: "blue", borderRadius: "5px" });
      expect(result).toBe("background-color: blue;border-radius: 5px;");
    });

    it("should handle empty style object", () => {
      const result = s({});
      expect(result).toBe("");
    });

    it("should handle single character properties", () => {
      const result = s({ x: "10", y: "20" });
      expect(result).toBe("x: 10;y: 20;");
    });

    it("should handle complex camelCase conversions", () => {
      const result = s({
        WebkitTransform: "rotate(45deg)",
        MozUserSelect: "none",
        msFilter: "blur(5px)"
      });
      expect(result).toBe("webkit-transform: rotate(45deg);moz-user-select: none;ms-filter: blur(5px);");
    });

    it("should handle CSS custom properties (CSS variables)", () => {
      const result = s({ "--main-color": "blue", "--secondary-color": "red" });
      expect(result).toBe("--main-color: blue;--secondary-color: red;");
    });

    it("should handle numeric values", () => {
      const result = s({ zIndex: "999", opacity: "0.5" });
      expect(result).toBe("z-index: 999;opacity: 0.5;");
    });

    it("should handle properties with multiple capital letters", () => {
      const result = s({ WebkitBorderRadius: "10px", MozBorderRadius: "10px" });
      expect(result).toBe("webkit-border-radius: 10px;moz-border-radius: 10px;");
    });

    it("should handle properties that are already kebab-case", () => {
      const result = s({ "font-size": "14px", "line-height": "1.5" });
      expect(result).toBe("font-size: 14px;line-height: 1.5;");
    });

    it("should handle mixed camelCase and kebab-case properties", () => {
      const result = s({
        fontSize: "14px",
        "line-height": "1.5",
        backgroundColor: "white",
        "border-color": "black"
      });
      expect(result).toBe("font-size: 14px;line-height: 1.5;background-color: white;border-color: black;");
    });

    it("should handle properties with units", () => {
      const result = s({
        width: "100px",
        height: "50vh",
        margin: "1rem 2em",
        fontSize: "1.2em"
      });
      expect(result).toBe("width: 100px;height: 50vh;margin: 1rem 2em;font-size: 1.2em;");
    });

    it("should handle calc() and other CSS functions", () => {
      const result = s({
        width: "calc(100% - 20px)",
        transform: "rotate(45deg) scale(1.2)",
        background: "linear-gradient(to right, red, blue)"
      });
      expect(result).toBe("width: calc(100% - 20px);transform: rotate(45deg) scale(1.2);background: linear-gradient(to right, red, blue);");
    });

    it("should handle special characters in values", () => {
      const result = s({
        content: '"Hello World"',
        fontFamily: "'Times New Roman', serif"
      });
      expect(result).toBe('content: "Hello World";font-family: \'Times New Roman\', serif;');
    });

    it("should handle boolean-like string values", () => {
      const result = s({
        display: "none",
        visibility: "hidden",
        pointerEvents: "auto"
      });
      expect(result).toBe("display: none;visibility: hidden;pointer-events: auto;");
    });

    it("should preserve property order", () => {
      const result = s({
        zIndex: "1",
        color: "red",
        fontSize: "12px",
        margin: "0"
      });
      expect(result).toBe("z-index: 1;color: red;font-size: 12px;margin: 0;");
    });

    it("should handle shorthand properties", () => {
      const result = s({
        margin: "10px 20px 30px 40px",
        padding: "5px 10px",
        border: "1px solid black",
        font: "bold 16px Arial"
      });
      expect(result).toBe("margin: 10px 20px 30px 40px;padding: 5px 10px;border: 1px solid black;font: bold 16px Arial;");
    });

    describe("edge cases and undefined props", () => {
      it("should handle undefined style object", () => {
        const result = s(undefined as unknown as Record<string, string>);
        expect(result).toBe("");
      });

      it("should handle object with undefined values", () => {
        const result = s({
          color: "red",
          fontSize: undefined as unknown as string,
          margin: "10px"
        });
        expect(result).toBe("color: red;font-size: undefined;margin: 10px;");
      });

      it("should handle object with null values", () => {
        const result = s({
          color: "red",
          backgroundColor: null as unknown as string,
          padding: "5px"
        });
        expect(result).toBe("color: red;background-color: null;padding: 5px;");
      });

      it("should handle object with empty string values", () => {
        const result = s({
          color: "",
          fontSize: "16px",
          margin: ""
        });
        expect(result).toBe("color: ;font-size: 16px;margin: ;");
      });

      it("should handle object with zero values", () => {
        const result = s({
          zIndex: "0",
          opacity: "0",
          margin: "0",
          padding: "0px"
        });
        expect(result).toBe("z-index: 0;opacity: 0;margin: 0;padding: 0px;");
      });

      it("should handle properties with numbers in the name", () => {
        const result = s({
          "grid-column-start": "1",
          "grid-row-end": "3",
          "column-count": "2"
        });
        expect(result).toBe("grid-column-start: 1;grid-row-end: 3;column-count: 2;");
      });

      it("should handle very long property names and values", () => {
        const longProp = "a".repeat(100);
        const longValue = "b".repeat(200);
        const result = s({ [longProp]: longValue });
        expect(result).toBe(`${longProp}: ${longValue};`);
      });

      it("should handle properties with Unicode characters", () => {
        const result = s({
          "font-family": "Café Sans",
          content: "\"Hello 世界\"",
          "--custom-émoji": "🎨"
        });
        expect(result).toBe("font-family: Café Sans;content: \"Hello 世界\";--custom-émoji: 🎨;");
      });

      it("should handle properties with special CSS values", () => {
        const result = s({
          display: "inherit",
          position: "initial",
          color: "unset",
          margin: "revert"
        });
        expect(result).toBe("display: inherit;position: initial;color: unset;margin: revert;");
      });

      it("should handle malformed camelCase properties", () => {
        const result = s({
          borderTop: "1px",
          BorderBottom: "2px",
          BORDER_LEFT: "3px",
          "border-right": "4px"
        });
        expect(result).toBe("border-top: 1px;border-bottom: 2px;border_left: 3px;border-right: 4px;");
      });

      it("should handle properties with only uppercase letters", () => {
        const result = s({
          URL: "test.com",
          CSS: "styles",
          HTML: "markup"
        });
        expect(result).toBe("url: test.com;css: styles;html: markup;");
      });

      it("should handle single character property names", () => {
        const result = s({
          x: "10px",
          y: "20px",
          z: "30px"
        });
        expect(result).toBe("x: 10px;y: 20px;z: 30px;");
      });

      it("should handle properties with boolean-like string values", () => {
        const result = s({
          visibility: "true",
          display: "false",
          opacity: "null",
          zIndex: "undefined"
        });
        expect(result).toBe("visibility: true;display: false;opacity: null;z-index: undefined;");
      });

      it("should handle complex CSS expressions", () => {
        const result = s({
          transform: "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)",
          filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))",
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)"
        });
        expect(result).toBe("transform: matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));clip-path: polygon(50% 0%, 0% 100%, 100% 100%);");
      });
    });
  });

  describe("integration tests", () => {
    it("should work together to create styled HTML elements", () => {
      const styles = s({ backgroundColor: "red", padding: "10px" });
      const result = h("div", { style: styles }, "Styled content");
      expect(result).toBe('<div style="background-color: red;padding: 10px;">Styled content</div>');
    });

    it("should handle complex nested structures with styles", () => {
      const headerStyle = s({ fontSize: "24px", fontWeight: "bold" });
      const containerStyle = s({ border: "1px solid #ccc", padding: "20px" });

      const header = h("h1", { style: headerStyle }, "Title");
      const content = h("p", {}, "Some content");
      const result = h("div", { style: containerStyle }, header, content);

      expect(result).toBe('<div style="border: 1px solid #ccc;padding: 20px;"><h1 style="font-size: 24px;font-weight: bold;">Title</h1><p>Some content</p></div>');
    });

    it("should handle multiple styled elements", () => {
      const buttonStyle = s({ backgroundColor: "blue", color: "white", padding: "8px 16px" });
      const linkStyle = s({ textDecoration: "none", color: "blue" });

      const button = h("button", { style: buttonStyle, type: "submit" }, "Submit");
      const link = h("a", { style: linkStyle, href: "#" }, "Link");
      const result = h("div", {}, button, " ", link);

      expect(result).toBe('<div><button style="background-color: blue;color: white;padding: 8px 16px;" type="submit">Submit</button> <a style="text-decoration: none;color: blue;" href="#">Link</a></div>');
    });
  });
});