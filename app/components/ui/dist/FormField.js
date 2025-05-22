'use client';
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var FormField = function (_a) {
    var label = _a.label, name = _a.name, _b = _a.type, type = _b === void 0 ? 'text' : _b, value = _a.value, onChange = _a.onChange, _c = _a.required, required = _c === void 0 ? false : _c, _d = _a.disabled, disabled = _d === void 0 ? false : _d, tooltip = _a.tooltip, placeholder = _a.placeholder, _e = _a.options, options = _e === void 0 ? [] : _e, error = _a.error, min = _a.min, max = _a.max, step = _a.step, _f = _a.rows, rows = _f === void 0 ? 3 : _f, children = _a.children, autoComplete = _a.autoComplete, checked = _a.checked;
    // Tooltip component
    var Tooltip = function (_a) {
        var text = _a.text;
        return (react_1["default"].createElement("div", { className: "group relative inline-block" },
            react_1["default"].createElement("div", { className: "text-gray-400 cursor-help ml-1" },
                react_1["default"].createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                    react_1["default"].createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }))),
            react_1["default"].createElement("div", { className: "absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 hidden group-hover:block w-64 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg" },
                text,
                react_1["default"].createElement("div", { className: "absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" }))));
    };
    // Render different form field types
    var renderField = function () {
        switch (type) {
            case 'textarea':
                return (react_1["default"].createElement("textarea", { id: name, name: name, value: value || '', onChange: onChange, disabled: disabled, placeholder: placeholder, rows: rows, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 " + (error ? 'border-red-500' : ''), required: required }));
            case 'select':
                return (react_1["default"].createElement("select", { id: name, name: name, value: value || '', onChange: onChange, disabled: disabled, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 " + (error ? 'border-red-500' : ''), required: required },
                    react_1["default"].createElement("option", { value: "" }, placeholder || 'Seleccionar...'),
                    options.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); })));
            case 'checkbox':
                return (react_1["default"].createElement("div", { className: "flex items-center" },
                    react_1["default"].createElement("input", { type: "checkbox", id: name, name: name, checked: !!checked, onChange: onChange, disabled: disabled, className: "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500", required: required }),
                    react_1["default"].createElement("label", { htmlFor: name, className: "ml-2 block text-sm text-gray-700" },
                        label,
                        " ",
                        required && react_1["default"].createElement("span", { className: "text-red-500" }, "*")),
                    tooltip && react_1["default"].createElement(Tooltip, { text: tooltip })));
            case 'radio':
                return (react_1["default"].createElement("div", { className: "mt-1 space-y-2" }, options.map(function (option) { return (react_1["default"].createElement("label", { key: option.value, className: "inline-flex items-center mr-6" },
                    react_1["default"].createElement("input", { type: "radio", name: name, value: option.value, checked: value === option.value, onChange: onChange, disabled: disabled, className: "h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500", required: required }),
                    react_1["default"].createElement("span", { className: "ml-2 text-sm text-gray-700" }, option.label))); })));
            case 'range':
                return (react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                    react_1["default"].createElement("input", { type: "range", id: name, name: name, value: value || '0', onChange: onChange, disabled: disabled, min: min, max: max, step: step, className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer", required: required }),
                    react_1["default"].createElement("span", { className: "bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded" }, value || '0')));
            default:
                return (react_1["default"].createElement("input", { type: type, id: name, name: name, value: value || '', onChange: onChange, disabled: disabled, autoComplete: autoComplete, placeholder: placeholder, min: min, max: max, step: step, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 " + (error ? 'border-red-500' : ''), required: required }));
        }
    };
    // Don't render the label separately if it's a checkbox type
    return (react_1["default"].createElement("div", { className: "mb-4" },
        type !== 'checkbox' && (react_1["default"].createElement("div", { className: "flex items-center justify-between mb-1" },
            react_1["default"].createElement("label", { htmlFor: name, className: "block text-sm font-medium text-gray-700" },
                label,
                " ",
                required && react_1["default"].createElement("span", { className: "text-red-500" }, "*")),
            tooltip && react_1["default"].createElement(Tooltip, { text: tooltip }))),
        renderField(),
        children,
        error && react_1["default"].createElement("p", { className: "mt-1 text-sm text-red-500" }, error)));
};
exports["default"] = FormField;
