'use client';
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var Tooltip = function (_a) {
    var text = _a.text, _b = _a.position, position = _b === void 0 ? 'top' : _b, children = _a.children;
    var positionClasses = {
        top: 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1',
        right: 'left-full top-1/2 transform translate-x-1 -translate-y-1/2',
        bottom: 'top-full left-1/2 transform -translate-x-1/2 translate-y-1',
        left: 'right-full top-1/2 transform -translate-x-1 -translate-y-1/2'
    };
    var arrowClasses = {
        top: 'absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800',
        right: 'absolute right-full top-1/2 transform translate-y-1/2 border-4 border-transparent border-r-gray-800',
        bottom: 'absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800',
        left: 'absolute left-full top-1/2 transform translate-y-1/2 border-4 border-transparent border-l-gray-800'
    };
    return (react_1["default"].createElement("div", { className: "group relative inline-block" },
        children || (react_1["default"].createElement("div", { className: "text-gray-400 cursor-help ml-1" },
            react_1["default"].createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                react_1["default"].createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })))),
        react_1["default"].createElement("div", { className: "absolute z-10 " + positionClasses[position] + " hidden group-hover:block w-64 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg" },
            text,
            react_1["default"].createElement("div", { className: arrowClasses[position] }))));
};
exports["default"] = Tooltip;
