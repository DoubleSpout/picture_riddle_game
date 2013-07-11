/*
* Kendo UI Web v2013.1.319 (http://kendoui.com)
* Copyright 2013 Telerik AD. All rights reserved.
*
* Kendo UI Web commercial licenses may be obtained at
* https://www.kendoui.com/purchase/license-agreement/kendo-ui-web-commercial.aspx
* If you do not own a commercial license, this file shall be governed by the
* GNU General Public License (GPL) version 3.
* For GPL requirements, please review: http://www.gnu.org/copyleft/gpl.html
*/
kendo_module({
    id: "dropdownlist",
    name: "DropDownList",
    category: "web",
    description: "The DropDownList widget displays a list of values and allows the selection of a single value from the list.",
    depends: [ "list" ]
});

(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        Select = ui.Select,
        os = kendo.support.mobileOS,
        ns = ".kendoDropDownList",
        DISABLED = "disabled",
        READONLY = "readonly",
        CHANGE = "change",
        SELECT = "select",
        FOCUSED = "k-state-focused",
        DEFAULT = "k-state-default",
        STATEDISABLED = "k-state-disabled",
        ARIA_DISABLED = "aria-disabled",
        ARIA_READONLY = "aria-readonly",
        SELECTED = "k-state-selected",
        HOVEREVENTS = "mouseenter" + ns + " mouseleave" + ns,
        TABINDEX = "tabindex",
        proxy = $.proxy;

    var DropDownList = Select.extend( {
        init: function(element, options) {
            var that = this,
                index = options && options.index,
                optionLabel, useOptionLabel, text;

            that.ns = ns;
            options = $.isArray(options) ? { dataSource: options } : options;

            Select.fn.init.call(that, element, options);

            that._focusHandler = function() {
                that.wrapper.focus();
            };

            options = that.options;
            element = that.element.on("focus" + ns, that._focusHandler);

            that._reset();

            that._word = "";

            that._wrapper();

            that._tabindex();
            that.wrapper.data(TABINDEX, that.wrapper.attr(TABINDEX));

            that._aria();

            that._span();

            that._popup();

            that._mobile();

            that._accessors();

            that._dataSource();
            that._ignoreCase();

            that._enable();

            that._cascade();

            that._oldIndex = that.selectedIndex = -1;
            if (index !== undefined) {
                options.index = index;
            }

            if (options.autoBind) {
                that.dataSource.fetch();
            } else {
                text = options.text || "";
                if (!text) {
                    optionLabel = that._optionLabelText(options.optionLabel),
                    useOptionLabel = optionLabel && options.index === 0;

                    if (element.is(SELECT)) {
                        if (useOptionLabel) {
                            text = optionLabel;
                        } else {
                            text = element.children(":selected").text();
                        }
                    } else if (!element[0].value && useOptionLabel) {
                        text = optionLabel;
                    }
                }

                that.text(text);
            }

            kendo.notify(that);
        },

        options: {
            name: "DropDownList",
            enabled: true,
            autoBind: true,
            index: 0,
            text: null,
            value: null,
            template: "",
            delay: 500,
            height: 200,
            dataTextField: "",
            dataValueField: "",
            optionLabel: "",
            cascadeFrom: "",
            ignoreCase: true,
            animation: {}
        },
        events: [
            "open",
            "close",
            CHANGE,
            "select",
            "dataBinding",
            "dataBound",
            "cascade"
        ],

        setOptions: function(options) {
            Select.fn.setOptions.call(this, options);

            this._template();
            this._accessors();
            this._aria();
        },

        destroy: function() {
            var that = this;

            that.wrapper.off(ns);
            that.element.off(ns);
            that._inputWrapper.off(ns);

            Select.fn.destroy.call(that);
        },

        open: function() {
            var that = this;

            if (!that.ul[0].firstChild) {
                that._open = true;

                if (!that._request) {
                    that.dataSource.fetch();
                }
            } else {
                that.popup.open();
                that._scroll(that._current);
            }
        },

        toggle: function(toggle) {
            this._toggle(toggle);
        },

        refresh: function() {
            var that = this,
                data = that._data(),
                length = data.length,
                optionLabel = that.options.optionLabel;

            that.trigger("dataBinding");
            if (that._current) {
                that.current(null);
            }

            that.ul[0].innerHTML = kendo.render(that.template, data);
            that._height(length);

            if (that.popup.visible()) {
                that.popup._position();
            }

            if (that.element.is(SELECT)) {
                if (optionLabel && length) {
                    optionLabel = that._optionLabelText(optionLabel);
                    optionLabel = '<option value="">' + optionLabel + "</option>";
                }

                that._options(data, optionLabel);
            }

            if (that._open) {
                that._open = false;
                that.toggle(!!length);
            }

            that._hideBusy();
            that._makeUnselectable();

            if (!that._fetch && length /*do set value when no data*/) {
                that._selectItem();
            }

            that._bound = true;
            that.trigger("dataBound");
        },



        search: function(word) {
            if (word) {
                var that = this,
                    ignoreCase = that.options.ignoreCase;

                if (ignoreCase) {
                    word = word.toLowerCase();
                }

                that._select(function(dataItem) {
                    var text = that._text(dataItem);

                    if (text !== undefined) {
                        text = (text + "");
                        if (ignoreCase) {
                            text = text.toLowerCase();
                        }

                        return text.indexOf(word) === 0;
                    }
                });
            }
        },

        text: function (text) {
            var span = this.span;

            if (text !== undefined) {
                span.text(text);
            } else {
                return span.text();
            }
        },

        value: function(value) {
            var that = this,
                idx, hasValue;

            if (value !== undefined) {
                if (value !== null) {
                    value = value.toString();
                }

                that._selectedValue = value;

                hasValue = value || (that.options.optionLabel && !that.element[0].disabled && value === "");
                if (hasValue && that._fetchItems(value)) {
                    return;
                }

                idx = that._index(value);
                that.select(idx > -1 ? idx : 0);
            } else {
                return that._accessor();
            }
        },

        _editable: function(options) {
            var that = this,
                element = that.element,
                disable = options.disable,
                readonly = options.readonly,
                wrapper = that.wrapper.off(ns),
                dropDownWrapper = that._inputWrapper.off(HOVEREVENTS);

            if (!readonly && !disable) {
                element.removeAttr(DISABLED).removeAttr(READONLY);

                dropDownWrapper
                    .addClass(DEFAULT)
                    .removeClass(STATEDISABLED)
                    .on(HOVEREVENTS, that._toggleHover);

                wrapper
                    .attr(TABINDEX, wrapper.data(TABINDEX))
                    .attr(ARIA_DISABLED, false)
                    .attr(ARIA_READONLY, false)
                    .on("click" + ns, function(e) {
                            that._blured = false;
                            e.preventDefault();
                            that.toggle();
                    })
                    .on("keydown" + ns, proxy(that._keydown, that))
                    .on("keypress" + ns, proxy(that._keypress, that))
                    .on("focusin" + ns, function() {
                        dropDownWrapper.addClass(FOCUSED);
                        that._blured = false;
                    })
                    .on("focusout" + ns, function() {
                        if (!that._blured) {
                            that._triggerCascade();
                            that._blur();
                            dropDownWrapper.removeClass(FOCUSED);

                            that._blured = true;
                            element.blur();
                        }
                    });

            } else {
                if (disable) {
                    wrapper.removeAttr(TABINDEX);
                    dropDownWrapper
                        .addClass(STATEDISABLED)
                        .removeClass(DEFAULT);
                } else {
                    dropDownWrapper
                        .addClass(DEFAULT)
                        .removeClass(STATEDISABLED);
                }

                element.attr(DISABLED, disable)
                       .attr(READONLY, readonly);

                wrapper.attr(ARIA_DISABLED, disable)
                       .attr(ARIA_READONLY, readonly);
            }
        },

        _accept: function(li) {
            this._focus(li);
        },

        _optionLabelText: function() {
            var options = this.options,
                dataTextField = options.dataTextField,
                optionLabel = options.optionLabel;

            if (optionLabel && dataTextField && typeof optionLabel === "object") {
                return this._text(optionLabel);
            }

            return optionLabel;
        },

        _data: function() {
            var that = this,
                options = that.options,
                optionLabel = options.optionLabel,
                textField = options.dataTextField,
                valueField = options.dataValueField,
                data = that.dataSource.view(),
                length = data.length,
                first = optionLabel,
                idx = 0;

            if (optionLabel && length) {
                if (typeof optionLabel === "object") {
                    first = optionLabel;
                } else if (textField) {
                    first = {};

                    textField = textField.split(".");
                    valueField = valueField.split(".");

                    assign(first, valueField, "");
                    assign(first, textField, optionLabel);
                }

                first = new kendo.data.ObservableArray([first]);

                for (; idx < length; idx++) {
                    first.push(data[idx]);
                }
                data = first;
            }

            return data;
        },

        _keydown: function(e) {
            var that = this,
                key = e.keyCode,
                keys = kendo.keys,
                ul = that.ul[0];

            if (key === keys.LEFT) {
                key = keys.UP;
            } else if (key === keys.RIGHT) {
                key = keys.DOWN;
            }

            e.keyCode = key;
            that._move(e);

            if (key === keys.HOME) {
                e.preventDefault();
                that._select(ul.firstChild);
            } else if (key === keys.END) {
                e.preventDefault();
                that._select(ul.lastChild);
            }
        },

        _selectNext: function(character, index) {
            var that = this,
                ignoreCase = that.options.ignoreCase,
                data = that._data(),
                length = data.length,
                text;

            for (; index < length; index++) {
                text = that._text(data[index]);
                if (text) {
                    text = text + "";
                    if (ignoreCase) {
                        text = text.toLowerCase();
                    }

                    if (text.indexOf(character) === 0) {
                        that._select(index);
                        that._triggerEvents();
                        return true;
                    }
                }
            }

            return false;
        },

        _keypress: function(e) {
            var that = this;

            setTimeout(function() {
                var character = String.fromCharCode(e.keyCode || e.charCode),
                    index = that.selectedIndex;

                if (that.options.ignoreCase) {
                    character = character.toLowerCase();
                }

                if (character === that._last && index > -1) {
                    that._word = character;
                    if (that._selectNext(character, index + 1)) {
                        return;
                    }
                } else {
                    that._word += character;
                }

                that._last = character;
                that._search();
            });
        },

        _popup: function() {
            Select.fn._popup.call(this);
            this.popup.one("open", function() {
                this.wrapper = kendo.wrap(this.element)
                                    .addClass("km-popup");
            });
        },

        _search: function() {
            var that = this,
                dataSource = that.dataSource,
                word = that._word;

            clearTimeout(that._typing);

            that._typing = setTimeout(function() {
                that._word = "";
            }, that.options.delay);

            if (!that.ul[0].firstChild) {
                dataSource.one(CHANGE, function () {
                    if (dataSource.data()[0]) {
                        that.search(word);
                    }
                }).fetch();
                return;
            }

            that.search(word);
            that._triggerEvents();
        },

        _select: function(li) {
            var that = this,
                current = that._current,
                data = that._data(),
                value,
                text,
                idx;

            li = that._get(li);

            if (li && li[0] && !li.hasClass(SELECTED)) {
                if (current) {
                    current.removeClass(SELECTED);
                }

                idx = ui.List.inArray(li[0], that.ul[0]);
                if (idx > -1) {
                    data = data[idx];
                    text = that._text(data);
                    value = that._value(data);
                    that.selectedIndex = idx;

                    that.text(text);
                    that._accessor(value !== undefined ? value : text, idx);
                    that._selectedValue = that._accessor();

                    that.current(li.addClass(SELECTED));

                    if (that._optionID) {
                        that._current.attr("aria-selected", true);
                    }
                }
            }
        },

        _triggerEvents: function() {
            if (!this.popup.visible()) {
                this._triggerCascade();
                this._change();
            }
        },

        _mobile: function() {
            var that = this,
                popup = that.popup,
                root = popup.element.parents(".km-root").eq(0);

            if (root.length && os) {
                popup.options.animation.open.effects = (os.android || os.meego) ? "fadeIn" : (os.ios || os.wp) ? "slideIn:up" : popup.options.animation.open.effects;
            }
        },

        _span: function() {
            var that = this,
                wrapper = that.wrapper,
                SELECTOR = "span.k-input",
                span;

            span = wrapper.find(SELECTOR);

            if (!span[0]) {
                wrapper.append('<span unselectable="on" class="k-dropdown-wrap k-state-default"><span unselectable="on" class="k-input">&nbsp;</span><span unselectable="on" class="k-select"><span unselectable="on" class="k-icon k-i-arrow-s">select</span></span></span>')
                       .append(that.element);

                span = wrapper.find(SELECTOR);
            }

            that.span = span;
            that._inputWrapper = $(wrapper[0].firstChild);
            that._arrow = wrapper.find(".k-icon").mousedown(function(e) { e.preventDefault(); });
        },

        _wrapper: function() {
            var that = this,
                element = that.element,
                DOMelement = element[0],
                wrapper;

            wrapper = element.parent();

            if (!wrapper.is("span.k-widget")) {
                wrapper = element.wrap("<span />").parent();
                wrapper[0].style.cssText = DOMelement.style.cssText;
            }

            element.hide();

            that._focused = that.wrapper = wrapper
                              .addClass("k-widget k-dropdown k-header")
                              .addClass(DOMelement.className)
                              .css("display", "")
                              .attr({
                                  unselectable: "on",
                                  role: "listbox",
                                  "aria-haspopup": true,
                                  "aria-expanded": false
                              });
        },

        _clearSelection: function() {
            var that = this,
                optionLabel = that.options.optionLabel;

            if (that.dataSource.view()[0] && optionLabel) {
                that.select(0);
                return;
            }

            that.text(optionLabel);
            that.element.val("");
            that.selectedIndex = -1;
        }
    });

    function assign(instance, fields, value) {
        var idx = 0,
            lastIndex = fields.length - 1,
            field;

        for (; idx < lastIndex; ++idx) {
            field = fields[idx];

            if (!(field in instance)) {
                instance[field] = {};
            }

            instance = instance[field];
        }

        instance[fields[lastIndex]] = value;
    }

    ui.plugin(DropDownList);
})(window.kendo.jQuery);
