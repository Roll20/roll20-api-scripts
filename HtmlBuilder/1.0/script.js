var HtmlBuilder = (() => {
  'use strict';

  return class HtmlBuilder {

    /**
     * The script's version.
     */
    static get VERSION() {
      return '1.0';
    }

    /**
     * Converts an object representing an element's attributes into a
     * string.
     * @param {object} attrs
     * @return {string}
     */
    static attrsToString(attrs) {
      attrs = _.clone(attrs);
      attrs.style = HtmlBuilder.cssToString(attrs.style);

      let attrsList = [];
      _.each(attrs, (value, key) => {
        attrsList.push(key + '="' + value + '"');
      });
      return attrsList.join(' ');
    }

    /**
     * Converts an object representing a CSS style into a style string.
     * @param {object} styleObj
     * @return {string}
     */
    static cssToString(styleObj) {
      let styles = [];
      _.each(styleObj, (value, key) => {
        styles.push(key + ': ' + value + ';');
      });
      return styles.join(' ');
    }

    /**
     * Creates an HTML Builder.
     * @constructor
     * @param {string} [tag='div']
     * @param {(HtmlBuilder|string)} [content='']
     * @param {object} [attrs={}]
     */
    constructor(tag, content, attrs) {
      this._tag = tag || 'div';
      this._attrs = _.clone(attrs) || {};
      this._css = {};
      this._children = [content || ''];
    }

    /**
     * Appends a child element to this one.
     * @param {(HtmlBuilder|string)} tag
     *        The tag or pre-made element to append.
     * @param {(HtmlBuilder|string)} [content]
     *        If tag is a string, this is the inner content of the element.
     * @param {object} [attrs]
     *        If tag is a string, this is the set of its element's attributes.
     * @return {HtmlBuilder}
     *         The child element.
     */
    append(tag, content, attrs) {
      let elem = tag;
      if(_.isString(elem))
        elem = new HtmlBuilder(tag, content, attrs);
      this._children.push(elem);
      return elem;
    }

    /**
     * @private
     */
    _applyCssToStyle(css, style) {
      style = _.clone(style) || {};

      let classes = this.getClasses();
      _.each(classes, (clazz) => {
        let clazzStyle = css[clazz];
        if(clazzStyle)
          style = _.extend(_.clone(clazzStyle), style);
      });
      return style;
    }

    /**
     * Get the element's CSS classes.
     * @return {string[]}
     */
    getClasses() {
      let tuple = this._getTagAndClasses();
      return tuple[1];
    }

    /**
     * Get the element's tag.
     * @return {string}
     */
    getTag() {
      let tuple = this._getTagAndClasses();
      return tuple[0];
    }

    /**
     * @private
     */
    _getTagAndClasses() {
      if(!this._match)
        this._match = /((\w|\d)+)?(\.((.)+))?/.exec(this._tag);

      let tag = this._match[1] || 'div';
      let classes = (this._match[4] || '').split(' ');
      return [tag, classes];
    }

    /**
     * Sets the CSS class styles for this element and its descendants.
     * @param {object} css
     */
    setCss(css) {
      this._css = _.clone(css);
    }

    /**
     * Produces the HTML string from this builder.
     * @param {object} [parentCss]
     *        The CSS class definitions of this element's parent.
     * @return {string}
     */
    toString(parentCss) {
      // Add the tag start.
      let tagName = this.getTag();
      let result = '<' + tagName;

      // Add the attributes.
      let css = _.extend(_.clone(parentCss) || {}, this._css);
      let attrs = _.clone(this._attrs);
      attrs.style = this._applyCssToStyle(css, attrs.style);
      result += ' ' + HtmlBuilder.attrsToString(attrs);

      // Add the inner HTML and tag end.
      if(tagName === 'br' || tagName === 'img')
        result += '/>';
      else {
        result += '>';
        _.each(this._children, child => {
          if(child instanceof HtmlBuilder)
            result += child.toString(css);
          else
            result += child;
        });
        result += '</' + tagName + '>';
      }
      return result;
    }
  };
})();

/**
// Demo:
on('ready', () => {
  'use strict';

  try {
    let table = new HtmlBuilder('table.trapResult', '', {
      'border': 'solid 5px #f00'
    });
    table.setCss({
      trapResult: {
        'background': '#fff',
        'border': 'solid 1px #000',
        'border-collapse': 'separate',
        'border-radius': '10px',
        'overflow': 'hidden',
        'width': '100%'
      }
    });
    table.append('thead', '', {
      style: {
        'background': '#000',
        'color': '#fff',
        'font-weight': 'bold'
      }
    }).append('tr').append('th', 'IT\'S A TRAP!');
    table.append('body').append('tr').append('td', 'This is a test.');
    sendChat('HTML Builder test', table.toString());
  }
  catch(err) {
    log(err.stack);
  }
});
**/
