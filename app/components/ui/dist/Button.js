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
var Button = function (_a) {
    var children = _a.children, className = _a.className, _b = _a.variant, variant = _b === void 0 ? 'primary' : _b, props = __rest(_a, ["children", "className", "variant"]);
    var baseStyle = "px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
    var variantStyle = "";
    switch (variant) {
        case 'primary':
            variantStyle = "text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500";
            break;
        case 'secondary':
            variantStyle = "text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500";
            break;
        case 'danger':
            variantStyle = "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500";
            break;
        default:
            variantStyle = "text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500";
    }
    return (react_1["default"].createElement("button", __assign({ type: "button" // Default to type button, can be overridden by props
        , className: baseStyle + " " + variantStyle + " " + className }, props), children));
};
exports["default"] = Button;
