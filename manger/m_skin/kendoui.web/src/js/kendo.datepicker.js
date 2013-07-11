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
    id: "datepicker",
    name: "DatePicker",
    category: "web",
    description: "The DatePicker widget allows the user to select a date from a calendar or by direct input.",
    depends: [ "calendar", "popup" ]
});

(function($, undefined) {
    var kendo = window.kendo,
    ui = kendo.ui,
    Widget = ui.Widget,
    parse = kendo.parseDate,
    keys = kendo.keys,
    template = kendo.template,
    activeElement = kendo._activeElement,
    DIV = "<div />",
    SPAN = "<span />",
    ns = ".kendoDatePicker",
    CLICK = "click" + ns,
    OPEN = "open",
    CLOSE = "close",
    CHANGE = "change",
    DATEVIEW = "dateView",
    DISABLED = "disabled",
    READONLY = "readonly",
    DEFAULT = "k-state-default",
    FOCUSED = "k-state-focused",
    SELECTED = "k-state-selected",
    STATEDISABLED = "k-state-disabled",
    HOVER = "k-state-hover",
    KEYDOWN = "keydown" + ns,
    HOVEREVENTS = "mouseenter" + ns + " mouseleave" + ns,
    MOUSEDOWN = "mousedown" + ns,
    ID = "id",
    MIN = "min",
    MAX = "max",
    MONTH = "month",
    ARIA_DISABLED = "aria-disabled",
    ARIA_EXPANDED = "aria-expanded",
    ARIA_HIDDEN = "aria-hidden",
    ARIA_READONLY = "aria-readonly",
    calendar = kendo.calendar,
    isInRange = calendar.isInRange,
    restrictValue = calendar.restrictValue,
    isEqualDatePart = calendar.isEqualDatePart,
    extend = $.extend,
    proxy = $.proxy,
    DATE = Date;

    function normalize(options) {
        var parseFormats = options.parseFormats,
            format = options.format;

        calendar.normalize(options);

        parseFormats = $.isArray(parseFormats) ? parseFormats : [parseFormats];
        if ($.inArray(format, parseFormats) === -1) {
            parseFormats.splice(0, 0, options.format);
        }

        options.parseFormats = parseFormats;
    }

    function preventDefault(e) {
        e.preventDefault();
    }

    var DateView = function(options) {
        var that = this, id,
            body = document.body,
            sharedCalendar = DatePicker.sharedCalendar,
            div = $(DIV).attr(ARIA_HIDDEN, "true")
                        .addClass("k-calendar-container")
                        .appendTo(body);

        if (!sharedCalendar) {
            sharedCalendar = DatePicker.sharedCalendar = new ui.Calendar($(DIV).attr(ID, kendo.guid()).hide().appendTo(body), { focusOnNav: false });
            calendar.makeUnselectable(sharedCalendar.element);
        }

        that.calendar = sharedCalendar;
        that.options = options = options || {};
        id = options.id;

        if (id) {
            id += "_dateview";

            div.attr(ID, id);
            that._dateViewID = id;
        }

        that.popup = new ui.Popup(div, extend(options.popup, options, { name: "Popup", isRtl: kendo.support.isRtl(options.anchor) }));
        that.div = div;

        that._templates();

        that.value(options.value);
    };

    DateView.prototype = {
        _calendar: function() {
            var that = this,
                popup = that.popup,
                options = that.options,
                calendar = that.calendar,
                element = calendar.element;

            if (element.data(DATEVIEW) !== that) {

                element.appendTo(popup.element)
                       .data(DATEVIEW, that)
                       .off(CLICK + " " + KEYDOWN)
                       .on(CLICK, "td:has(.k-link)", proxy(that._click, that))
                       .on(MOUSEDOWN, preventDefault)
                       .show();

                calendar.unbind(CHANGE)
                        .bind(CHANGE, options);

                calendar.month = that.month;
                calendar.options.dates = options.dates;
                calendar.options.depth = options.depth;
                calendar.options.culture = options.culture;

                calendar._footer(that.footer);

                calendar.min(options.min);
                calendar.max(options.max);

                calendar.navigate(that._value || that._current, options.start);
                that.value(that._value);
            }
        },

        destroy: function() {
            var that = this,
                calendar = that.calendar,
                element = calendar.element,
                dv = element.data(DATEVIEW),
                popups;

            if (dv === undefined || dv === that) {
                popups = $(".k-calendar-container");

                if (popups.length > 1) {
                    element.hide().appendTo(document.body);
                } else {
                    element.off(ns);
                    calendar.destroy();
                    calendar.element.remove();
                    DatePicker.sharedCalendar = null;
                }
            }

            that.popup.destroy();
        },

        open: function() {
            var that = this;

            that._calendar();
            that.popup.open();
        },

        close: function() {
            this.popup.close();
        },

        min: function(value) {
            this._option(MIN, value);
        },

        max: function(value) {
            this._option(MAX, value);
        },

        toggle: function() {
            var that = this;

            that[that.popup.visible() ? CLOSE : OPEN]();
        },

        move: function(e) {
            var that = this,
                key = e.keyCode,
                calendar = that.calendar,
                selectIsClicked = e.ctrlKey && key == keys.DOWN || key == keys.ENTER;

            if (key == keys.ESC) {
                that.close();
                return;
            }

            if (e.altKey) {
                if (key == keys.DOWN) {
                    that.open();
                    e.preventDefault();
                } else if (key == keys.UP) {
                    that.close();
                    e.preventDefault();
                }
                return;
            }

            if (!that.popup.visible()){
                return;
            }

            if (selectIsClicked && calendar._cell.hasClass(SELECTED)) {
                that.close();
                e.preventDefault();
                return;
            }

            that._current = calendar._move(e);
        },


        value: function(value) {
            var that = this,
                calendar = that.calendar,
                options = that.options;

            that._value = value;
            that._current = new DATE(+restrictValue(value, options.min, options.max));

            if (calendar.element.data(DATEVIEW) === that) {
                calendar.value(value);
            }
        },

        _click: function(e) {
            if (e.currentTarget.className.indexOf(SELECTED) !== -1) {
                this.close();
            }
        },

        _option: function(option, value) {
            var that = this,
                options = that.options,
                calendar = that.calendar;

            options[option] = value;

            if (calendar.element.data(DATEVIEW) === that) {
                calendar[option](value);
            }
        },

        _templates: function() {
            var that = this,
                options = that.options,
                footer = options.footer,
                month = options.month || {},
                content = month.content,
                empty = month.empty;

            that.month = {
                content: template('<td#=data.cssClass#><a tabindex="-1" class="k-link" href="\\#" ' + kendo.attr("value") + '="#=data.dateString#" title="#=data.title#">' + (content || "#=data.value#") + '</a></td>', { useWithBlock: !!content }),
                empty: template("<td>" + (empty || "&nbsp;") + "</td>", { useWithBlock: !!empty })
            };

            if (footer !== false) {
                that.footer = template(footer || '#= kendo.toString(data,"D","' + options.culture +'") #', { useWithBlock: false });
            }
        }
    };

    DateView.normalize = normalize;

    kendo.DateView = DateView;

    var DatePicker = Widget.extend({
        init: function(element, options) {
            var that = this,
                disabled,
                div;

            Widget.fn.init.call(that, element, options);
            element = that.element;
            options = that.options;

            normalize(options);

            that._wrapper();

            that.dateView = new DateView(extend({}, options, {
                id: element.attr(ID),
                anchor: that.wrapper,
                change: function() {
                    // calendar is the current scope
                    that._change(this.value());
                    that.close();
                },
                close: function(e) {
                    if (that.trigger(CLOSE)) {
                        e.preventDefault();
                    } else {
                        element.attr(ARIA_EXPANDED, false);
                        div.attr(ARIA_HIDDEN, true);
                    }
                },
                open: function(e) {
                    var options = that.options,
                        date;
                    if (that.trigger(OPEN)) {
                        e.preventDefault();
                    } else {
                        if (that.element.val() !== that._oldText) {
                            date = parse(element.val(), options.parseFormats, options.culture);
                            if (!date) {
                                that.dateView.value(date);
                            } else {
                                that.dateView._current = date;
                                that.dateView.calendar._focus(date);
                            }
                        }

                        element.attr(ARIA_EXPANDED, true);
                        div.attr(ARIA_HIDDEN, false);
                    }
                }
            }));
            div = that.dateView.div;

            that._icon();

            element[0].type = "text";
            element
                .addClass("k-input")
                .attr({
                    role: "textbox",
                    "aria-haspopup": true,
                    "aria-expanded": false,
                    "aria-owns": that.dateView._dateViewID
                });

            that._reset();
            that._template();

            disabled = element.is("[disabled]");
            if (disabled) {
                that.enable(false);
            } else {
                that.readonly(element.is("[readonly]"));
            }

            that.value(options.value || that.element.val());

            kendo.notify(that);
        },
        events: [
        OPEN,
        CLOSE,
        CHANGE],
        options: {
            name: "DatePicker",
            value: null,
            footer: "",
            format: "",
            culture: "",
            parseFormats: [],
            min: new Date(1900, 0, 1),
            max: new Date(2099, 11, 31),
            start: MONTH,
            depth: MONTH,
            animation: {},
            month : {},
            dates: [],
            ARIATemplate: 'Current focused date is #=kendo.toString(data.current, "D")#'
        },

        setOptions: function(options) {
            var that = this,
                dateView = that.dateView,
                dateViewOptions = dateView.options;

            Widget.fn.setOptions.call(that, options);

            normalize(that.options);

            dateView.options = extend(dateViewOptions, that.options, {
                change: dateViewOptions.change,
                close: dateViewOptions.close,
                open: dateViewOptions.open
            });
        },

        _editable: function(options) {
            var that = this,
                icon = that._dateIcon.off(ns),
                element = that.element.off(ns),
                wrapper = that._inputWrapper.off(ns),
                readonly = options.readonly,
                disable = options.disable;

            if (!readonly && !disable) {
                wrapper
                    .addClass(DEFAULT)
                    .removeClass(STATEDISABLED)
                    .on(HOVEREVENTS, that._toggleHover);

                element.removeAttr(DISABLED)
                       .removeAttr(READONLY)
                       .attr(ARIA_DISABLED, false)
                       .attr(ARIA_READONLY, false)
                       .on("keydown" + ns, proxy(that._keydown, that))
                       .on("blur" + ns, proxy(that._blur, that))
                       .on("focus" + ns, function() {
                           that._inputWrapper.addClass(FOCUSED);
                       });

               icon.on(CLICK, proxy(that._click, that))
                   .on(MOUSEDOWN, preventDefault);
            } else {
                wrapper
                    .addClass(disable ? STATEDISABLED : DEFAULT)
                    .removeClass(disable ? DEFAULT : STATEDISABLED);

                element.attr(DISABLED, disable)
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

            Widget.fn.destroy.call(that);

            that.dateView.destroy();

            that.element.off(ns);
            that._dateIcon.off(ns);
            that._inputWrapper.off(ns);

            if (that._form) {
                that._form.off("reset", that._resetHandler);
            }
        },

        open: function() {
            this.dateView.open();
        },

        close: function() {
            this.dateView.close();
        },

        min: function(value) {
            return this._option(MIN, value);
        },

        max: function(value) {
            return this._option(MAX, value);
        },

        value: function(value) {
            var that = this;

            if (value === undefined) {
                return that._value;
            }

            that._old = that._update(value);

            if (that._old === null) {
                that.element.val("");
            }

            that._oldText = that.element.val();
        },

        _toggleHover: function(e) {
            $(e.currentTarget).toggleClass(HOVER, e.type === "mouseenter");
        },

        _blur: function() {
            var that = this,
                value = that.element.val();

            that.close();
            if (value !== that._oldText) {
                that._change(value);
            }

            that._inputWrapper.removeClass(FOCUSED);
        },

        _click: function() {
            var that = this,
                element = that.element;

            that.dateView.toggle();

            if (!kendo.support.touch && element[0] !== activeElement()) {
                element.focus();
            }
        },

        _change: function(value) {
            var that = this;

            value = that._update(value);

            if (+that._old != +value) {
                that._old = value;
                that._oldText = that.element.val();

                that.trigger(CHANGE);

                // trigger the DOM change event so any subscriber gets notified
                that.element.trigger(CHANGE);
            }
        },

        _keydown: function(e) {
            var that = this,
                dateView = that.dateView,
                value = that.element.val();

            if (!dateView.popup.visible() && e.keyCode == keys.ENTER && value !== that._oldText) {
                that._change(value);
            } else {
                dateView.move(e);
                that._updateARIA(dateView._current);
            }
        },

        _icon: function() {
            var that = this,
                element = that.element,
                icon;

            icon = element.next("span.k-select");

            if (!icon[0]) {
                icon = $('<span unselectable="on" class="k-select"><span unselectable="on" class="k-icon k-i-calendar">select</span></span>').insertAfter(element);
            }

            that._dateIcon = icon.attr({
                "role": "button",
                "aria-controls": that.dateView._dateViewID
            });
        },

        _option: function(option, value) {
            var that = this,
                options = that.options;

            if (value === undefined) {
                return options[option];
            }

            value = parse(value, options.parseFormats, options.culture);

            if (!value) {
                return;
            }

            options[option] = new DATE(+value);
            that.dateView[option](value);
        },

        _update: function(value) {
            var that = this,
                options = that.options,
                min = options.min,
                max = options.max,
                date = parse(value, options.parseFormats, options.culture),
                formattedValue;

            if (+date === +that._value) {
                formattedValue = kendo.toString(date, options.format, options.culture);

                if (formattedValue !== value) {
                    that.element.val(date === null ? value : formattedValue);
                }

                return date;
            }

            if (date !== null && isEqualDatePart(date, min)) {
                date = restrictValue(date, min, max);
            } else if (!isInRange(date, min, max)) {
                date = null;
            }

            that._value = date;
            that.dateView.value(date);
            that.element.val(date ? kendo.toString(date, options.format, options.culture) : value);
            that._updateARIA(date);

            return date;
        },

        _wrapper: function() {
            var that = this,
                element = that.element,
                wrapper;

            wrapper = element.parents(".k-datepicker");

            if (!wrapper[0]) {
                wrapper = element.wrap(SPAN).parent().addClass("k-picker-wrap k-state-default");
                wrapper = wrapper.wrap(SPAN).parent();
            }

            wrapper[0].style.cssText = element[0].style.cssText;
            element.css({
                width: "100%",
                height: element[0].style.height
            });

            that.wrapper = wrapper.addClass("k-widget k-datepicker k-header")
                                  .addClass(element[0].className);

            that._inputWrapper = $(wrapper[0].firstChild);
        },

        _reset: function() {
            var that = this,
                element = that.element,
                form = element.closest("form");

            if (form[0]) {
                that._resetHandler = function() {
                    that.value(element[0].defaultValue);
                };

                that._form = form.on("reset", that._resetHandler);
            }
        },

        _template: function() {
            this._ariaTemplate = template(this.options.ARIATemplate);
        },

        _updateARIA: function(date) {
            this.element.attr("aria-label", this._ariaTemplate({ current: date }));
        }
    });

    ui.plugin(DatePicker);

})(window.kendo.jQuery);
