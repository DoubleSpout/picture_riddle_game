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
    id: "numerictextbox",
    name: "NumericTextBox",
    category: "web",
    description: "The NumericTextBox widget can format and display numeric, percentage or currency textbox.",
    depends: [ "core", "userevents" ]
});

(function($, undefined) {
    var kendo = window.kendo,
        keys = kendo.keys,
        ui = kendo.ui,
        Widget = ui.Widget,
        activeElement = kendo._activeElement,
        extractFormat = kendo._extractFormat,
        parse = kendo.parseFloat,
        placeholderSupported = kendo.support.placeholder,
        getCulture = kendo.getCulture,
        CHANGE = "change",
        DISABLED = "disabled",
        READONLY = "readonly",
        INPUT = "k-input",
        SPIN = "spin",
        ns = ".kendoNumericTextBox",
        TOUCHEND = "touchend",
        MOUSELEAVE = "mouseleave" + ns,
        MOUSEUP = "touchcancel" + ns + " " + "touchend" + ns + " mouseup" + ns + " " + MOUSELEAVE,
        HOVEREVENTS = "mouseenter" + ns + " " + MOUSELEAVE,
        DEFAULT = "k-state-default",
        FOCUSED = "k-state-focused",
        HOVER = "k-state-hover",
        FOCUS = "focus",
        POINT = ".",
        SELECTED = "k-state-selected",
        STATEDISABLED = "k-state-disabled",
        ARIA_DISABLED = "aria-disabled",
        ARIA_READONLY = "aria-readonly",
        NULL = null,
        proxy = $.proxy,
        decimals = {
            190 : ".",
            188 : ","
        };

    var NumericTextBox = Widget.extend({
         init: function(element, options) {
             var that = this,
             isStep = options && options.step !== undefined,
             min, max, step, value, disabled;

             Widget.fn.init.call(that, element, options);

             options = that.options;
             element = that.element
                           .on("blur" + ns, proxy(that._focusout, that))
                           .attr("role", "spinbutton");

             options.placeholder = options.placeholder || element.attr("placeholder");

             that._reset();
             that._wrapper();
             that._arrows();
             that._input();

             if (!kendo.support.mobileOS) {
                 that._text.on(FOCUS + ns, proxy(that._click, that));
             } else {
                 that._text.on(TOUCHEND + ns + " " + FOCUS + ns, function(e) {
                    that._toggleText(false);
                    if (e.type === FOCUS) {
                        element.focus();
                    }
                 });
             }

             min = that.min(element.attr("min"));
             max = that.max(element.attr("max"));
             step = that._parse(element.attr("step"));

             if (options.min === NULL && min !== NULL) {
                 options.min = min;
             }

             if (options.max === NULL && max !== NULL) {
                 options.max = max;
             }

             if (!isStep && step !== NULL) {
                 options.step = step;
             }

             element.attr("aria-valuemin", options.min)
                    .attr("aria-valuemax", options.max);

             options.format = extractFormat(options.format);

             value = options.value;
             that.value(value !== NULL ? value : element.val());

             disabled = element.is("[disabled]");
             if (disabled) {
                 that.enable(false);
             } else {
                 that.readonly(element.is("[readonly]"));
             }

             kendo.notify(that);
         },

        options: {
            name: "NumericTextBox",
            decimals: NULL,
            min: NULL,
            max: NULL,
            value: NULL,
            step: 1,
            culture: "",
            format: "n",
            spinners: true,
            placeholder: "",
            upArrowText: "Increase value",
            downArrowText: "Decrease value"
        },
        events: [
            CHANGE,
            SPIN
        ],

        _editable: function(options) {
            var that = this,
                element = that.element,
                disable = options.disable,
                readonly = options.readonly,
                text = that._text.add(element),
                wrapper = that._inputWrapper.off(HOVEREVENTS);

            that._toggleText(true);

            that._upArrowEventHandler.unbind("press");
            that._downArrowEventHandler.unbind("press");
            element.off("keydown" + ns).off("paste" + ns);

            if (!readonly && !disable) {
                wrapper
                    .addClass(DEFAULT)
                    .removeClass(STATEDISABLED)
                    .on(HOVEREVENTS, that._toggleHover);

                text.removeAttr(DISABLED)
                    .removeAttr(READONLY)
                    .attr(ARIA_DISABLED, false)
                    .attr(ARIA_READONLY, false);

                that._upArrowEventHandler.bind("press", function(e) {
                    e.preventDefault();
                    that._spin(1);
                    that._upArrow.addClass(SELECTED);
                });

                that._downArrowEventHandler.bind("press", function(e) {
                    e.preventDefault();
                    that._spin(-1);
                    that._downArrow.addClass(SELECTED);
                });

                that.element
                    .on("keydown" + ns, proxy(that._keydown, that))
                    .on("paste" + ns, proxy(that._paste, that));

            } else {
                wrapper
                    .addClass(disable ? STATEDISABLED : DEFAULT)
                    .removeClass(disable ? DEFAULT : STATEDISABLED);

                text.attr(DISABLED, disable)
                    .attr(READONLY, readonly)
                    .attr(ARIA_DISABLED, disable)
                    .attr(ARIA_READONLY, readonly);
            }
        },

        readonly: function(readonly) {
            this._editable({
                readonly: readonly === undefined ? true : readonly,
                disable: false
            });
        },

        enable: function(enable) {
            this._editable({
                readonly: false,
                disable: !(enable = enable === undefined ? true : enable)
            });
        },

        destroy: function() {
            var that = this;

            that.element
                .add(that._text)
                .add(that._upArrow)
                .add(that._downArrow)
                .add(that._inputWrapper)
                .off(ns);

            if (that._form) {
                that._form.off("reset", that._resetHandler);
            }

            Widget.fn.destroy.call(that);
        },

        min: function(value) {
            return this._option("min", value);
        },

        max: function(value) {
            return this._option("max", value);
        },

        step: function(value) {
            return this._option("step", value);
        },

        value: function(value) {
            var that = this, adjusted;

            if (value === undefined) {
                return that._value;
            }

            value = that._parse(value);
            adjusted = that._adjust(value);

            if (value !== adjusted) {
                return;
            }

            that._update(value);
            that._old = that._value;
        },

        focus: function() {
            this._focusin();
        },

        _adjust: function(value) {
            var that = this,
            options = that.options,
            min = options.min,
            max = options.max;

            if (value === NULL) {
                return value;
            }

            if (min !== NULL && value < min) {
                value = min;
            } else if (max !== NULL && value > max) {
                value = max;
            }

            return value;
        },

        _arrows: function() {
            var that = this,
            arrows,
            options = that.options,
            spinners = options.spinners,
            element = that.element;

            arrows = element.siblings(".k-icon");

            if (!arrows[0]) {
                arrows = $(buttonHtml("n", options.upArrowText) + buttonHtml("s", options.downArrowText))
                        .insertAfter(element);

                arrows.wrapAll('<span class="k-select"/>');
            }

            arrows.on(MOUSEUP, function() {
                clearTimeout( that._spinning );
                arrows.removeClass(SELECTED);
            });

            if (!spinners) {
                arrows.parent().toggle(spinners);
                that._inputWrapper.addClass("k-expand-padding");
            }

            that._upArrow = arrows.eq(0);
            that._upArrowEventHandler = new kendo.UserEvents(that._upArrow);
            that._downArrow = arrows.eq(1);
            that._downArrowEventHandler = new kendo.UserEvents(that._downArrow);
        },

        _blur: function() {
            var that = this;

            that._toggleText(true);
            that._change(that.element.val());
        },

        _click: function(e) {
            var that = this;

            clearTimeout(that._focusing);
            that._focusing = setTimeout(function() {
                var input = e.target,
                    idx = caret(input)[0],
                    value = input.value.substring(0, idx),
                    format = that._format(that.options.format),
                    group = format[","],
                    groupRegExp = new RegExp("\\" + group, "g"),
                    extractRegExp = new RegExp("([\\d\\" + group + "]+)(\\" + format[POINT] + ")?(\\d+)?"),
                    result = extractRegExp.exec(value),
                    caretPosition = 0;

                if (result) {
                    caretPosition = result[0].replace(groupRegExp, "").length;

                    if (value.indexOf("(") != -1 && that._value < 0) {
                        caretPosition++;
                    }
                }

                that._focusin();

                caret(that.element[0], caretPosition);
            });
        },

        _change: function(value) {
            var that = this;

            that._update(value);
            value = that._value;

            if (that._old != value) {
                that._old = value;
                that.trigger(CHANGE);

                // trigger the DOM change event so any subscriber gets notified
                that.element.trigger(CHANGE);
            }
        },

        _culture: function(culture) {
            return culture || getCulture(this.options.culture);
        },

        _focusin: function() {
            var that = this;
            that._inputWrapper.addClass(FOCUSED);
            that._toggleText(false);
            that.element[0].focus();
        },

        _focusout: function() {
            var that = this;

            clearTimeout(that._focusing);
            that._inputWrapper.removeClass(FOCUSED).removeClass(HOVER);
            that._blur();
        },

        _format: function(format, culture) {
            var numberFormat = this._culture(culture).numberFormat;

            format = format.toLowerCase();

            if (format.indexOf("c") > -1) {
                numberFormat = numberFormat.currency;
            } else if (format.indexOf("p") > -1) {
                numberFormat = numberFormat.percent;
            }

            return numberFormat;
        },

        _input: function() {
            var that = this,
                CLASSNAME = "k-formatted-value",
                element = that.element.addClass(INPUT).show()[0],
                accessKey = element.accessKey,
                wrapper = that.wrapper,
                text;

            text = wrapper.find(POINT + CLASSNAME);

            if (!text[0]) {
                text = $('<input type="text"/>').insertBefore(element).addClass(CLASSNAME);
            }

            element.type = "text";
            text[0].tabIndex = element.tabIndex;
            text[0].style.cssText = element.style.cssText;
            text.prop("placeholder", that.options.placeholder);

            if (accessKey) {
                text.attr("accesskey", accessKey);
                element.accessKey = "";
            }

            that._text = text.addClass(element.className);
        },

        _keydown: function(e) {
            var that = this,
                key = e.keyCode;

            if (key == keys.DOWN) {
                that._step(-1);
            } else if (key == keys.UP) {
                that._step(1);
            } else if (key == keys.ENTER) {
                that._change(that.element.val());
            }

            if (that._prevent(key, e.shiftKey) && !e.ctrlKey) {
                e.preventDefault();
            }
        },

        _paste: function(e) {
            var that = this,
                element = e.target,
                value = element.value;

            setTimeout(function() {
                if (that._parse(element.value) === NULL) {
                    that._update(value);
                }
            });
        },

        _prevent: function(key, shiftKey) {
            var that = this,
                element = that.element[0],
                value = element.value,
                options = that.options,
                min = options.min,
                numberFormat = that._format(options.format),
                separator = numberFormat[POINT],
                precision = options.decimals,
                selection = caret(element),
                selectionStart = selection[0],
                selectionEnd = selection[1],
                textSelected = selectionStart === 0 && selectionEnd === value.length,
                prevent = true,
                number;

            if (precision === NULL) {
                precision = numberFormat.decimals;
            }

            if ((key > 16 && key < 21) ||
                (key > 32 && key < 37) ||
                (key > 47 && key < 58) ||
                (key > 95 && key < 106) ||
                 key == keys.INSERT ||
                 key == keys.DELETE ||
                 key == keys.LEFT ||
                 key == keys.RIGHT ||
                 key == keys.TAB ||
                 key == keys.BACKSPACE ||
                 key == keys.ENTER)
            {
                prevent = false;
                if (shiftKey) {
                    number = parseInt(String.fromCharCode(key), 10);
                    if (!isNaN(number)) {
                        number = number + "";
                        value = value.substring(0, selectionStart) + number + value.substring(selectionEnd);
                        if (element.maxLength === -1 || element.maxLength >= value.length) {
                            element.value = value;
                            caret(element, selectionStart + number.length);
                        }

                        prevent = true;
                    }
                }
            } else if ((decimals[key] === separator || key == 110) && precision > 0 && (value.indexOf(separator) == -1 || textSelected)) {
                if (key == 110) {
                    element.value = value.substring(0, selectionStart) + separator + value.substring(selectionEnd);
                    caret(element, selectionStart + separator.length);
                } else if (!shiftKey) {
                    prevent = false;
                }
            } else if ((min === NULL || min < 0) && value.indexOf("-") == -1 && (key == 189 || key == 109 || key == 173) && selectionStart === 0) { //sign
                prevent = false;
            }

            return prevent;
        },

        _option: function(option, value) {
            var that = this,
                options = that.options;

            if (value === undefined) {
                return options[option];
            }

            value = that._parse(value);

            if (!value && option === "step") {
                return;
            }

            options[option] = that._parse(value);
            that.element.attr("aria-value" + option, options[option]);
        },

        _spin: function(step, timeout) {
            var that = this;

            timeout = timeout || 500;

            clearTimeout( that._spinning );
            that._spinning = setTimeout(function() {
                that._spin(step, 50);
            }, timeout );

            that._step(step);
        },

        _step: function(step) {
            var that = this,
                element = that.element,
                value = that._parse(element.val()) || 0;

            if (activeElement() != element[0]) {
                that._focusin();
            }

            value += that.options.step * step;

            that._update(that._adjust(value));

            that.trigger(SPIN);
        },

        _toggleHover: function(e) {
            $(e.currentTarget).toggleClass(HOVER, e.type === "mouseenter");
        },

        _toggleText: function(toggle) {
            var that = this;

            that._text.toggle(toggle);
            that.element.toggle(!toggle);
        },

        _parse: function(value, culture) {
            return parse(value, this._culture(culture), this.options.format);
        },

        _update: function(value) {
            var that = this,
                options = that.options,
                format = options.format,
                decimals = options.decimals,
                culture = that._culture(),
                numberFormat = that._format(format, culture),
                isNotNull;

            if (decimals === NULL) {
                decimals = numberFormat.decimals;
            }

            value = that._parse(value, culture);

            isNotNull = value !== NULL;

            if (isNotNull) {
                value = parseFloat(value.toFixed(decimals));
            }

            that._value = value = that._adjust(value);
            that._placeholder(kendo.toString(value, format, culture));
            that.element.val(isNotNull ? value.toString().replace(POINT, numberFormat[POINT]) : "")
                        .attr("aria-valuenow", value);
        },

        _placeholder: function(value) {
            this._text.val(value);
            if (!placeholderSupported && !value) {
                this._text.val(this.options.placeholder);
            }
        },

        _wrapper: function() {
            var that = this,
                element = that.element,
                DOMElement = element[0],
                wrapper;

            wrapper = element.parents(".k-numerictextbox");

            if (!wrapper.is("span.k-numerictextbox")) {
                wrapper = element.hide().wrap('<span class="k-numeric-wrap k-state-default" />').parent();
                wrapper = wrapper.wrap("<span/>").parent();
            }

            wrapper[0].style.cssText = DOMElement.style.cssText;
            DOMElement.style.width = "";
            that.wrapper = wrapper.addClass("k-widget k-numerictextbox")
                                  .addClass(DOMElement.className)
                                  .css("display", "");

            that._inputWrapper = $(wrapper[0].firstChild);
        },

        _reset: function() {
            var that = this,
                element = that.element,
                form = element.closest("form");

            if (form[0]) {
                that._resetHandler = function() {
                    setTimeout(function() {
                        that.value(element[0].value);
                    });
                };

                that._form = form.on("reset", that._resetHandler);
            }
        }
    });

    function buttonHtml(className, text) {
        return '<span unselectable="on" class="k-link"><span unselectable="on" class="k-icon k-i-arrow-' + className + '" title="' + text + '">' + text + '</span></span>';
    }

    function caret(element, position) {
        var range,
            isPosition = position !== undefined;

        if (element.selectionStart !== undefined) {
            if (isPosition) {
                element.focus();
                element.setSelectionRange(position, position);
            } else {
                position = [element.selectionStart, element.selectionEnd];
            }
        } else if (document.selection) {
            if ($(element).is(":visible")) {
                element.focus();
            }
            range = document.selection.createRange();
            if (isPosition) {
                range.move("character", position);
                range.select();
            } else {
                var rangeElement = element.createTextRange(),
                    rangeDuplicated = rangeElement.duplicate(),
                    selectionStart, selectionEnd;

                    rangeElement.moveToBookmark(range.getBookmark());
                    rangeDuplicated.setEndPoint('EndToStart', rangeElement);
                    selectionStart = rangeDuplicated.text.length;
                    selectionEnd = selectionStart + rangeElement.text.length;

                position = [selectionStart, selectionEnd];
            }
        }

        return position;
    }

    ui.plugin(NumericTextBox);
})(window.kendo.jQuery);
