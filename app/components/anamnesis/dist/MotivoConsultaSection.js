"use strict";
exports.__esModule = true;
var react_1 = require("react");
var Textarea_1 = require("../../ui/Textarea");
var MotivoConsultaSection = function (_a) {
    var data = _a.data, updateData = _a.updateData, setSectionError = _a.setSectionError, clearSectionError = _a.clearSectionError;
    var handleChange = function (e) {
        var _a;
        var _b = e.target, name = _b.name, value = _b.value;
        updateData((_a = {}, _a[name] = value, _a));
        // Añadir validación si es necesario
    };
    return (react_1["default"].createElement("div", { className: "bg-white shadow-md rounded-lg p-6 mb-8" },
        react_1["default"].createElement("h2", { className: "text-xl font-semibold text-gray-800 mb-6" }, "2. Motivo de Consulta"),
        react_1["default"].createElement(Textarea_1["default"], { label: "Descripci\u00F3n del Motivo de Consulta", name: "descripcion", value: data.descripcion || '', onChange: handleChange, rows: 4, placeholder: "Describa con sus propias palabras cu\u00E1l es el principal problema o raz\u00F3n por la que busca atenci\u00F3n m\u00E9dica hoy...", tooltip: "Sea lo m\u00E1s espec\u00EDfico posible. Esta informaci\u00F3n es crucial para entender su situaci\u00F3n." })));
};
exports["default"] = MotivoConsultaSection;
