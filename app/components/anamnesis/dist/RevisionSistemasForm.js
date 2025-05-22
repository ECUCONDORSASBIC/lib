'use client';
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var RevisionSistemasForm = function (_a) {
    var data = _a.data, updateData = _a.updateData, setSectionError = _a.setSectionError, clearSectionError = _a.clearSectionError, sectionKey = _a.sectionKey, _b = _a.errors, errors = _b === void 0 ? {} : _b;
    // Mapa de sistemas con nombres de visualización y síntomas comunes
    var sistemasMap = {
        general: {
            displayName: 'General',
            sintomas: ['Fiebre', 'Escalofríos', 'Fatiga', 'Malestar general', 'Cambios de peso', 'Sudoración nocturna']
        },
        piel_anexos: {
            displayName: 'Piel y Anexos',
            sintomas: ['Erupciones cutáneas', 'Cambios de color', 'Picazón', 'Lesiones', 'Cambios en cabello/uñas', 'Moretones inexplicables']
        },
        cabeza_cuello: {
            displayName: 'Cabeza y Cuello',
            sintomas: ['Dolor de cabeza', 'Mareos', 'Hinchazón en cuello', 'Dolor en cuello', 'Rigidez', 'Limitación de movimiento']
        },
        ojos: {
            displayName: 'Ojos',
            sintomas: ['Visión borrosa', 'Dolor ocular', 'Enrojecimiento', 'Secreción', 'Sensibilidad a la luz', 'Cambios en visión']
        },
        oidos_nariz_garganta: {
            displayName: 'Oídos, Nariz y Garganta',
            sintomas: ['Dolor de oído', 'Problemas de audición', 'Secreción nasal', 'Congestión', 'Dolor de garganta', 'Dificultad para tragar', 'Cambios en la voz']
        },
        cardiovascular: {
            displayName: 'Cardiovascular',
            sintomas: ['Dolor en el pecho', 'Palpitaciones', 'Falta de aire al esfuerzo', 'Edema (hinchazón) de extremidades', 'Claudicación (dolor al caminar)']
        },
        respiratorio: {
            displayName: 'Respiratorio',
            sintomas: ['Tos', 'Flema/esputo', 'Dificultad para respirar', 'Sibilancias', 'Dolor al respirar', 'Tos con sangre']
        },
        gastrointestinal: {
            displayName: 'Gastrointestinal',
            sintomas: ['Dolor abdominal', 'Náuseas', 'Vómitos', 'Diarrea', 'Estreñimiento', 'Cambios en apetito', 'Acidez', 'Sangre en heces']
        },
        genitourinario: {
            displayName: 'Genitourinario',
            sintomas: ['Dolor al orinar', 'Cambios en frecuencia urinaria', 'Sangre en orina', 'Incontinencia', 'Secreción genital', 'Problemas sexuales']
        }
        // Puedes añadir más sistemas según sea necesario
    };
    // Inicializar datos si no existen
    var actualData = __assign({}, data);
    // Función para manejar cambios en la presencia de un síntoma
    var handleSymptomChange = function (sistema, nombreSintoma, presente) {
        var _a, _b;
        // Obtener la lista actual de síntomas para el sistema o inicializarla si no existe
        var sintomasActuales = actualData[sistema] || [];
        if (presente) {
            // Si el síntoma está presente, verificar si ya existe
            var sintomaExistente = sintomasActuales.find(function (s) { return s.nombre === nombreSintoma; });
            if (!sintomaExistente) {
                // Si no existe, añadirlo a la lista
                var nuevosSintomas = __spreadArrays(sintomasActuales, [
                    { nombre: nombreSintoma, presente: true }
                ]);
                updateData((_a = {}, _a[sistema] = nuevosSintomas, _a));
            }
        }
        else {
            // Si el síntoma no está presente, filtrarlo de la lista
            var nuevosSintomas = sintomasActuales.filter(function (s) { return s.nombre !== nombreSintoma; });
            updateData((_b = {}, _b[sistema] = nuevosSintomas, _b));
        }
    };
    // Función para manejar cambios en los detalles de un síntoma
    var handleDetailChange = function (sistema, nombreSintoma, field, value) {
        var _a, _b;
        // Obtener la lista actual de síntomas
        var sintomasActuales = __spreadArrays((actualData[sistema] || []));
        // Encontrar el índice del síntoma
        var index = sintomasActuales.findIndex(function (s) { return s.nombre === nombreSintoma; });
        if (index !== -1) {
            // Actualizar el campo específico
            sintomasActuales[index] = __assign(__assign({}, sintomasActuales[index]), (_a = {}, _a[field] = value, _a));
            updateData((_b = {}, _b[sistema] = sintomasActuales, _b));
        }
    };
    // Verificar si un síntoma está marcado como presente
    var isSymptomsPresent = function (sistema, nombreSintoma) {
        var sintomas = actualData[sistema] || [];
        return sintomas.some(function (s) { return s.nombre === nombreSintoma && s.presente; });
    };
    // Obtener detalles de un síntoma si existe
    var getSymptomDetails = function (sistema, nombreSintoma) {
        var sintomas = actualData[sistema] || [];
        return sintomas.find(function (s) { return s.nombre === nombreSintoma; }) || { nombre: nombreSintoma };
    };
    return (react_1["default"].createElement("div", { className: "space-y-8" },
        react_1["default"].createElement("div", { className: "p-6 bg-white rounded-lg shadow" },
            react_1["default"].createElement("h3", { className: "pb-3 mb-6 text-xl font-semibold text-gray-800 border-b" }, "Revisi\u00F3n por Sistemas"),
            react_1["default"].createElement("div", { className: "p-4 mb-6 border border-blue-100 rounded-md bg-blue-50" },
                react_1["default"].createElement("h4", { className: "mb-1 font-medium text-blue-800 text-md" }, "Reporte de s\u00EDntomas por sistemas"),
                react_1["default"].createElement("p", { className: "text-sm text-blue-600" }, "Marque cualquier s\u00EDntoma que haya experimentado recientemente y proporcione detalles adicionales si es necesario. Esta informaci\u00F3n nos ayuda a obtener una visi\u00F3n completa de su salud.")),
            Object.entries(sistemasMap).map(function (_a) {
                var sistema = _a[0], _b = _a[1], displayName = _b.displayName, sintomas = _b.sintomas;
                return (react_1["default"].createElement("fieldset", { key: sistema, className: "p-4 mb-8 border rounded-md" },
                    react_1["default"].createElement("legend", { className: "px-2 text-lg font-medium" }, displayName),
                    react_1["default"].createElement("div", { className: "mt-4 space-y-4" }, sintomas.map(function (sintoma) {
                        var isPresent = isSymptomsPresent(sistema, sintoma);
                        var detalles = getSymptomDetails(sistema, sintoma);
                        return (react_1["default"].createElement("div", { key: sintoma, className: "space-y-2" },
                            react_1["default"].createElement("div", { className: "flex items-center" },
                                react_1["default"].createElement("input", { type: "checkbox", id: sistema + "-" + sintoma.replace(/\s/g, '-'), checked: isPresent, onChange: function (e) { return handleSymptomChange(sistema, sintoma, e.target.checked); }, className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" }),
                                react_1["default"].createElement("label", { htmlFor: sistema + "-" + sintoma.replace(/\s/g, '-'), className: "ml-2 text-sm text-gray-700" }, sintoma)),
                            isPresent && (react_1["default"].createElement("div", { className: "p-3 mt-2 ml-6 rounded-md bg-gray-50" },
                                react_1["default"].createElement("div", { className: "mb-3" },
                                    react_1["default"].createElement("label", { className: "block mb-1 text-xs font-medium text-gray-500" }, "Inicio del s\u00EDntoma"),
                                    react_1["default"].createElement("select", { value: detalles.inicio || '', onChange: function (e) { return handleDetailChange(sistema, sintoma, 'inicio', e.target.value); }, className: "block w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" },
                                        react_1["default"].createElement("option", { value: "" }, "Seleccione..."),
                                        react_1["default"].createElement("option", { value: "Nuevo en las \u00FAltimas 2 semanas" }, "Nuevo en las \u00FAltimas 2 semanas"),
                                        react_1["default"].createElement("option", { value: "Comenz\u00F3 hace 2-4 semanas" }, "Comenz\u00F3 hace 2-4 semanas"),
                                        react_1["default"].createElement("option", { value: "Comenz\u00F3 hace 1-3 meses" }, "Comenz\u00F3 hace 1-3 meses"),
                                        react_1["default"].createElement("option", { value: "Comenz\u00F3 hace 3-6 meses" }, "Comenz\u00F3 hace 3-6 meses"),
                                        react_1["default"].createElement("option", { value: "Comenz\u00F3 hace 6-12 meses" }, "Comenz\u00F3 hace 6-12 meses"),
                                        react_1["default"].createElement("option", { value: "Cr\u00F3nico, m\u00E1s de un a\u00F1o" }, "Cr\u00F3nico, m\u00E1s de un a\u00F1o"),
                                        react_1["default"].createElement("option", { value: "Cr\u00F3nico, sin cambios" }, "Cr\u00F3nico, sin cambios"),
                                        react_1["default"].createElement("option", { value: "Cr\u00F3nico, con empeoramiento reciente" }, "Cr\u00F3nico, con empeoramiento reciente"))),
                                react_1["default"].createElement("div", { className: "mb-3" },
                                    react_1["default"].createElement("label", { className: "block mb-1 text-xs font-medium text-gray-500" }, "Severidad"),
                                    react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                                        "                            ",
                                        react_1["default"].createElement("input", { type: "range", min: "1", max: "10", step: "1", value: typeof detalles.severidad === 'number' ? detalles.severidad : 5, onChange: function (e) { return handleDetailChange(sistema, sintoma, 'severidad', parseInt(e.target.value, 10)); }, className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer", "aria-label": "Severidad de " + sintoma, title: "Severidad de " + sintoma + " en escala de 1 a 10" }),
                                        react_1["default"].createElement("span", { className: "bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded w-6 text-center" }, typeof detalles.severidad === 'number' ? detalles.severidad : 5))),
                                react_1["default"].createElement("div", { className: "mb-3" },
                                    react_1["default"].createElement("label", { className: "block mb-1 text-xs font-medium text-gray-500" }, "Factores que modifican el s\u00EDntoma"),
                                    react_1["default"].createElement("input", { type: "text", value: detalles.factores_modificantes || '', onChange: function (e) { return handleDetailChange(sistema, sintoma, 'factores_modificantes', e.target.value); }, placeholder: "\u00BFQu\u00E9 empeora o mejora este s\u00EDntoma?", className: "block w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" })),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("label", { className: "block mb-1 text-xs font-medium text-gray-500" }, "Detalles adicionales"),
                                    react_1["default"].createElement("textarea", { value: detalles.caracteristicas_adicionales || '', onChange: function (e) { return handleDetailChange(sistema, sintoma, 'caracteristicas_adicionales', e.target.value); }, placeholder: "Describa cualquier otra caracter\u00EDstica o detalle relevante", rows: 2, className: "block w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" }))))));
                    }))));
            }),
            react_1["default"].createElement("div", { className: "mt-8" },
                react_1["default"].createElement("h4", { className: "mb-4 text-lg font-medium" }, "Otros s\u00EDntomas no listados"),
                react_1["default"].createElement("textarea", { name: "otros_sintomas", value: actualData.otros_sintomas || '', onChange: function (e) { return updateData({ otros_sintomas: e.target.value }); }, rows: 4, placeholder: "Describa cualquier otro s\u00EDntoma que est\u00E9 experimentando y que no est\u00E9 listado arriba.", className: "block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" })))));
};
exports["default"] = RevisionSistemasForm;
