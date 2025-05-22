"use strict";
exports.__esModule = true;
var react_1 = require("react");
var Input_1 = require("../../ui/Input");
var Select_1 = require("../../ui/Select");
var IdentificacionSection = function (_a) {
    var data = _a.data, updateData = _a.updateData, setSectionError = _a.setSectionError, clearSectionError = _a.clearSectionError;
    var handleChange = function (e) {
        var _a;
        var _b = e.target, name = _b.name, value = _b.value;
        updateData((_a = {}, _a[name] = value, _a));
        // Podrías añadir validación aquí y usar setSectionError / clearSectionError
    };
    var sexoOptions = [
        { value: 'masculino', label: 'Masculino' },
        { value: 'femenino', label: 'Femenino' },
        { value: 'otro', label: 'Otro' },
    ];
    return (react_1["default"].createElement("div", { className: "bg-white shadow-md rounded-lg p-6 mb-8" },
        react_1["default"].createElement("h2", { className: "text-xl font-semibold text-gray-800 mb-6" }, "1. Datos de Identificaci\u00F3n"),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-x-6" },
            react_1["default"].createElement(Input_1["default"], { label: "Nombre Completo", name: "nombreCompleto", value: data.nombreCompleto || '', onChange: handleChange, placeholder: "Ej: Juan P\u00E9rez Garc\u00EDa", tooltip: "Ingrese el nombre completo del paciente." }),
            react_1["default"].createElement(Input_1["default"], { label: "Fecha de Nacimiento", name: "fechaNacimiento", type: "date", value: data.fechaNacimiento || '', onChange: handleChange, tooltip: "Seleccione la fecha de nacimiento." }),
            react_1["default"].createElement(Select_1["default"], { label: "Sexo", name: "sexo", value: data.sexo || '', onChange: handleChange, options: sexoOptions, tooltip: "Seleccione el sexo del paciente." }),
            react_1["default"].createElement(Input_1["default"], { label: "Ocupaci\u00F3n", name: "ocupacion", value: data.ocupacion || '', onChange: handleChange, placeholder: "Ej: Ingeniero de Software", tooltip: "Ingrese la ocupaci\u00F3n actual del paciente." }))));
};
exports["default"] = IdentificacionSection;
