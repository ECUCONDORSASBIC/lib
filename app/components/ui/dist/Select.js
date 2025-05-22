"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
var react_1 = require("react");
var Select = function (_a) {
    var label = _a.label, name = _a.name, options = _a.options, error = _a.error, tooltip = _a.tooltip, className = _a.className, props = __rest(_a, ["label", "name", "options", "error", "tooltip", "className"]);
    return (react_1["default"].createElement("div", { className: "mb-4 w-full" },
        react_1["default"].createElement("label", { htmlFor: name, className: "block text-sm font-medium text-gray-700 mb-1" },
            label,
            tooltip && (react_1["default"].createElement("span", { className: "ml-1 text-gray-400 hover:text-gray-600 cursor-help", title: tooltip }, "(i)"))),
        react_1["default"].createElement("select", __assign({ id: name, name: name, className: "mt-1 block w-full pl-3 pr-10 py-2 text-base border " + (error ? 'border-red-500' : 'border-gray-300') + " focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md " + className }, props), options.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); })),
        error && react_1["default"].createElement("p", { className: "mt-1 text-xs text-red-600" }, error)));
};
exports["default"] = Select;
