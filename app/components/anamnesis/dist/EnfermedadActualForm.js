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
// Importar componentes UI (asumimos que ya existen)
var FormField_1 = require("../ui/FormField");
var Tooltip_1 = require("../ui/Tooltip");
var DEFAULT_SYMPTOM = {
    nombre: '',
    intensidad: 0,
    frecuencia: '',
    patron: '',
    factores: {
        agravantes: [],
        aliviantes: []
    }
};
var DEFAULT_IMPACTO = {
    general: 0,
    avd: 0,
    trabajo_estudios: 0,
    sueno: 0,
    social_hobbies: 0,
    animo: 0
};
var EnfermedadActualForm = function (_a) {
    var data = _a.data, updateData = _a.updateData, setSectionError = _a.setSectionError, clearSectionError = _a.clearSectionError, sectionKey = _a.sectionKey;
    var _b = react_1.useState(''), newSymptom = _b[0], setNewSymptom = _b[1];
    var _c = react_1.useState(''), newAgravante = _c[0], setNewAgravante = _c[1];
    var _d = react_1.useState(''), newAliviante = _d[0], setNewAliviante = _d[1];
    var _e = react_1.useState(''), tratamientoInput = _e[0], setTratamientoInput = _e[1];
    // Inicializar datos si no existen
    var actualData = {
        inicio: data.inicio || '',
        sintomas: data.sintomas || [],
        tratamientos_probados: data.tratamientos_probados || [],
        impacto_funcional: data.impacto_funcional || __assign({}, DEFAULT_IMPACTO),
        narrativa: data.narrativa || ''
    };
    var handleInputChange = function (e) {
        var _a;
        var _b = e.target, name = _b.name, value = _b.value;
        updateData((_a = {}, _a[name] = value, _a));
        clearSectionError(name);
    };
    var handleAddSymptom = function () {
        if (!newSymptom.trim())
            return;
        var updatedSintomas = __spreadArrays(actualData.sintomas, [__assign(__assign({}, DEFAULT_SYMPTOM), { nombre: newSymptom.trim() })]);
        updateData({ sintomas: updatedSintomas });
        setNewSymptom('');
    };
    var handleRemoveSymptom = function (index) {
        var updatedSintomas = __spreadArrays(actualData.sintomas);
        updatedSintomas.splice(index, 1);
        updateData({ sintomas: updatedSintomas });
    };
    var handleUpdateSymptom = function (index, field, value) {
        var _a;
        var updatedSintomas = __spreadArrays(actualData.sintomas);
        // Si es un campo anidado (factores.agravantes o factores.aliviantes)
        if (field === 'factores') {
            updatedSintomas[index] = __assign(__assign({}, updatedSintomas[index]), { factores: __assign(__assign({}, updatedSintomas[index].factores), value) });
        }
        else {
            updatedSintomas[index] = __assign(__assign({}, updatedSintomas[index]), (_a = {}, _a[field] = value, _a));
        }
        updateData({ sintomas: updatedSintomas });
    };
    var handleAddFactorAgravante = function (index) {
        var _a;
        if (!newAgravante.trim())
            return;
        var updatedSintomas = __spreadArrays(actualData.sintomas);
        var currentAgravantes = ((_a = updatedSintomas[index].factores) === null || _a === void 0 ? void 0 : _a.agravantes) || [];
        updatedSintomas[index] = __assign(__assign({}, updatedSintomas[index]), { factores: __assign(__assign({}, updatedSintomas[index].factores), { agravantes: __spreadArrays(currentAgravantes, [newAgravante.trim()]) }) });
        updateData({ sintomas: updatedSintomas });
        setNewAgravante('');
    };
    var handleAddFactorAliviante = function (index) {
        var _a;
        if (!newAliviante.trim())
            return;
        var updatedSintomas = __spreadArrays(actualData.sintomas);
        var currentAliviantes = ((_a = updatedSintomas[index].factores) === null || _a === void 0 ? void 0 : _a.aliviantes) || [];
        updatedSintomas[index] = __assign(__assign({}, updatedSintomas[index]), { factores: __assign(__assign({}, updatedSintomas[index].factores), { aliviantes: __spreadArrays(currentAliviantes, [newAliviante.trim()]) }) });
        updateData({ sintomas: updatedSintomas });
        setNewAliviante('');
    };
    var handleAddTratamiento = function () {
        if (!tratamientoInput.trim())
            return;
        var updatedTratamientos = __spreadArrays(actualData.tratamientos_probados, [tratamientoInput.trim()]);
        updateData({ tratamientos_probados: updatedTratamientos });
        setTratamientoInput('');
    };
    var handleRemoveTratamiento = function (index) {
        var updatedTratamientos = __spreadArrays(actualData.tratamientos_probados);
        updatedTratamientos.splice(index, 1);
        updateData({ tratamientos_probados: updatedTratamientos });
    };
    var handleUpdateImpacto = function (field, value) {
        var _a;
        updateData({
            impacto_funcional: __assign(__assign({}, actualData.impacto_funcional), (_a = {}, _a[field] = value, _a))
        });
    };
    // Opciones para frecuencia de síntomas
    var frecuenciaOptions = [
        { value: '', label: 'Seleccionar...' },
        { value: 'Constante', label: 'Constante (siempre presente)' },
        { value: 'Intermitente', label: 'Intermitente (viene y va)' },
        { value: 'Periódico', label: 'Periódico (ocurre en intervalos)' },
        { value: 'Episódico', label: 'Episódico (ataques ocasionales)' },
        { value: 'Progresivo', label: 'Progresivo (empeora con el tiempo)' }
    ];
    // Opciones para patrón temporal
    var patronOptions = [
        { value: '', label: 'Seleccionar...' },
        { value: 'Mañana', label: 'Principalmente en la mañana' },
        { value: 'Tarde', label: 'Principalmente en la tarde' },
        { value: 'Noche', label: 'Principalmente en la noche' },
        { value: 'Madrugada', label: 'Principalmente en la madrugada' },
        { value: 'Sin patrón', label: 'Sin patrón definido' },
        { value: 'Relacionado con comidas', label: 'Relacionado con las comidas' },
        { value: 'Relacionado con actividad', label: 'Relacionado con la actividad física' },
        { value: 'Relacionado con descanso', label: 'Relacionado con el descanso' }
    ];
    return (react_1["default"].createElement("div", { className: "space-y-8" },
        react_1["default"].createElement("div", { className: "p-6 bg-white shadow rounded-lg" },
            react_1["default"].createElement("h3", { className: "text-xl font-semibold mb-6 text-gray-800 border-b pb-3" }, "Historia de la Enfermedad Actual"),
            react_1["default"].createElement("div", { className: "p-4 bg-blue-50 rounded-md border border-blue-100 mb-6" },
                react_1["default"].createElement("h4", { className: "text-md font-medium text-blue-800 mb-1" }, "\u00BFC\u00F3mo ha evolucionado su problema?"),
                react_1["default"].createElement("p", { className: "text-sm text-blue-600" }, "En esta secci\u00F3n queremos entender c\u00F3mo ha progresado su problema de salud actual, desde que comenz\u00F3 hasta ahora. Esto nos ayudar\u00E1 a comprender mejor el curso de su enfermedad.")),
            react_1["default"].createElement("div", { className: "mb-6" },
                react_1["default"].createElement(FormField_1["default"], { label: "\u00BFCu\u00E1ndo comenz\u00F3 el problema?", name: "inicio", type: "date", value: actualData.inicio, onChange: handleInputChange, required: true, tooltip: "Seleccione la fecha aproximada en que not\u00F3 por primera vez el problema o s\u00EDntoma principal." })),
            react_1["default"].createElement("div", { className: "mb-6 border rounded-md p-4" },
                react_1["default"].createElement("h4", { className: "text-lg font-medium mb-4" }, "S\u00EDntomas"),
                react_1["default"].createElement("div", { className: "flex mb-4" },
                    react_1["default"].createElement("input", { type: "text", value: newSymptom, onChange: function (e) { return setNewSymptom(e.target.value); }, placeholder: "Ingrese un s\u00EDntoma", className: "flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" }),
                    react_1["default"].createElement("button", { onClick: handleAddSymptom, className: "px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" }, "Agregar")),
                actualData.sintomas.length === 0 ? (react_1["default"].createElement("p", { className: "text-gray-500 text-sm italic" }, "No hay s\u00EDntomas registrados. Agregue al menos un s\u00EDntoma relevante.")) : (react_1["default"].createElement("div", { className: "space-y-6" }, actualData.sintomas.map(function (sintoma, index) {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    return (react_1["default"].createElement("div", { key: index, className: "border-b pb-6" },
                        react_1["default"].createElement("div", { className: "flex justify-between items-center mb-3" },
                            react_1["default"].createElement("h5", { className: "text-md font-medium" }, sintoma.nombre),
                            react_1["default"].createElement("button", { onClick: function () { return handleRemoveSymptom(index); }, className: "text-red-500 hover:text-red-700", title: "Eliminar s\u00EDntoma" },
                                react_1["default"].createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" },
                                    react_1["default"].createElement("path", { fillRule: "evenodd", d: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z", clipRule: "evenodd" })))),
                        react_1["default"].createElement("div", { className: "mb-4" },
                            react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" },
                                "Intensidad",
                                react_1["default"].createElement("span", { className: "text-xs text-gray-500 ml-2" }, "(0: Ausente, 10: M\u00E1ximo imaginable)")),
                            react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                                react_1["default"].createElement("input", { type: "range", min: "0", max: "10", step: "1", value: sintoma.intensidad || 0, onChange: function (e) { return handleUpdateSymptom(index, 'intensidad', parseInt(e.target.value)); }, className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" }),
                                react_1["default"].createElement("span", { className: "bg-blue-100 text-blue-800 text-sm px-2.5 py-0.5 rounded w-8 text-center" }, sintoma.intensidad || 0))),
                        react_1["default"].createElement("div", { className: "mb-4" },
                            react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFCon qu\u00E9 frecuencia ocurre este s\u00EDntoma?"),
                            react_1["default"].createElement("select", { value: sintoma.frecuencia || '', onChange: function (e) { return handleUpdateSymptom(index, 'frecuencia', e.target.value); }, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }, frecuenciaOptions.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); }))),
                        react_1["default"].createElement("div", { className: "mb-4" },
                            react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFCu\u00E1ndo suele aparecer o empeorar?"),
                            react_1["default"].createElement("select", { value: sintoma.patron || '', onChange: function (e) { return handleUpdateSymptom(index, 'patron', e.target.value); }, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }, patronOptions.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); }))),
                        react_1["default"].createElement("div", { className: "mb-4" },
                            react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Factores que empeoran este s\u00EDntoma"),
                            react_1["default"].createElement("div", { className: "flex mb-2" },
                                react_1["default"].createElement("input", { type: "text", value: newAgravante, onChange: function (e) { return setNewAgravante(e.target.value); }, placeholder: "Ej: Esfuerzo f\u00EDsico", className: "flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm" }),
                                react_1["default"].createElement("button", { onClick: function () { return handleAddFactorAgravante(index); }, className: "px-3 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300 focus:outline-none text-sm" }, "Agregar")),
                            react_1["default"].createElement("div", { className: "flex flex-wrap gap-2" }, (_b = (_a = sintoma.factores) === null || _a === void 0 ? void 0 : _a.agravantes) === null || _b === void 0 ? void 0 :
                                _b.map(function (factor, factorIndex) { return (react_1["default"].createElement("span", { key: factorIndex, className: "bg-red-50 text-red-700 text-xs px-2 py-1 rounded flex items-center" },
                                    factor,
                                    react_1["default"].createElement("button", { className: "ml-1 text-red-500 hover:text-red-700", onClick: function () {
                                            var _a;
                                            var updatedAgravantes = __spreadArrays((((_a = sintoma.factores) === null || _a === void 0 ? void 0 : _a.agravantes) || []));
                                            updatedAgravantes.splice(factorIndex, 1);
                                            handleUpdateSymptom(index, 'factores', { agravantes: updatedAgravantes });
                                        } },
                                        react_1["default"].createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3 w-3", viewBox: "0 0 20 20", fill: "currentColor" },
                                            react_1["default"].createElement("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }))))); }),
                                !((_d = (_c = sintoma.factores) === null || _c === void 0 ? void 0 : _c.agravantes) === null || _d === void 0 ? void 0 : _d.length) && (react_1["default"].createElement("span", { className: "text-xs text-gray-500 italic" }, "Ninguno registrado")))),
                        react_1["default"].createElement("div", { className: "mb-4" },
                            react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Factores que mejoran este s\u00EDntoma"),
                            react_1["default"].createElement("div", { className: "flex mb-2" },
                                react_1["default"].createElement("input", { type: "text", value: newAliviante, onChange: function (e) { return setNewAliviante(e.target.value); }, placeholder: "Ej: Reposo", className: "flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm" }),
                                react_1["default"].createElement("button", { onClick: function () { return handleAddFactorAliviante(index); }, className: "px-3 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300 focus:outline-none text-sm" }, "Agregar")),
                            react_1["default"].createElement("div", { className: "flex flex-wrap gap-2" }, (_f = (_e = sintoma.factores) === null || _e === void 0 ? void 0 : _e.aliviantes) === null || _f === void 0 ? void 0 :
                                _f.map(function (factor, factorIndex) { return (react_1["default"].createElement("span", { key: factorIndex, className: "bg-green-50 text-green-700 text-xs px-2 py-1 rounded flex items-center" },
                                    factor,
                                    react_1["default"].createElement("button", { className: "ml-1 text-green-700 hover:text-green-900", onClick: function () {
                                            var _a;
                                            var updatedAliviantes = __spreadArrays((((_a = sintoma.factores) === null || _a === void 0 ? void 0 : _a.aliviantes) || []));
                                            updatedAliviantes.splice(factorIndex, 1);
                                            handleUpdateSymptom(index, 'factores', { aliviantes: updatedAliviantes });
                                        } },
                                        react_1["default"].createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3 w-3", viewBox: "0 0 20 20", fill: "currentColor" },
                                            react_1["default"].createElement("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }))))); }),
                                !((_h = (_g = sintoma.factores) === null || _g === void 0 ? void 0 : _g.aliviantes) === null || _h === void 0 ? void 0 : _h.length) && (react_1["default"].createElement("span", { className: "text-xs text-gray-500 italic" }, "Ninguno registrado"))))));
                })))),
            react_1["default"].createElement("div", { className: "mb-6 border rounded-md p-4" },
                react_1["default"].createElement("h4", { className: "text-lg font-medium mb-4" }, "Tratamientos ya probados"),
                react_1["default"].createElement("div", { className: "flex mb-4" },
                    react_1["default"].createElement("input", { type: "text", value: tratamientoInput, onChange: function (e) { return setTratamientoInput(e.target.value); }, placeholder: "Ej: Paracetamol 500mg cada 8 horas", className: "flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" }),
                    react_1["default"].createElement("button", { onClick: handleAddTratamiento, className: "px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" }, "Agregar")),
                actualData.tratamientos_probados.length === 0 ? (react_1["default"].createElement("p", { className: "text-gray-500 text-sm italic" }, "No hay tratamientos registrados.")) : (react_1["default"].createElement("ul", { className: "space-y-2 ml-5 list-disc" }, actualData.tratamientos_probados.map(function (tratamiento, index) { return (react_1["default"].createElement("li", { key: index, className: "flex justify-between items-center" },
                    react_1["default"].createElement("span", null, tratamiento),
                    react_1["default"].createElement("button", { onClick: function () { return handleRemoveTratamiento(index); }, className: "text-red-500 hover:text-red-700" },
                        react_1["default"].createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" },
                            react_1["default"].createElement("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }))))); })))),
            react_1["default"].createElement("div", { className: "mb-6 border rounded-md p-4" },
                react_1["default"].createElement("h4", { className: "text-lg font-medium mb-4" }, "Impacto en su vida diaria"),
                react_1["default"].createElement("p", { className: "text-sm text-gray-600 mb-4" }, "Indique en qu\u00E9 medida el problema afecta cada aspecto de su vida diaria, donde 0 es \"No afecta\" y 5 es \"Afecta completamente\"."),
                react_1["default"].createElement("div", { className: "mb-4" },
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Impacto general en su calidad de vida"),
                    react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                        react_1["default"].createElement("input", { type: "range", min: "0", max: "5", step: "1", value: actualData.impacto_funcional.general || 0, onChange: function (e) { return handleUpdateImpacto('general', parseInt(e.target.value)); }, className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" }),
                        react_1["default"].createElement("span", { className: "bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded w-6 text-center" }, actualData.impacto_funcional.general || 0))),
                react_1["default"].createElement("div", { className: "mb-4" },
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Impacto en actividades b\u00E1sicas diarias (aseo, vestirse, alimentaci\u00F3n)"),
                    react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                        react_1["default"].createElement("input", { type: "range", min: "0", max: "5", step: "1", value: actualData.impacto_funcional.avd || 0, onChange: function (e) { return handleUpdateImpacto('avd', parseInt(e.target.value)); }, className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" }),
                        react_1["default"].createElement("span", { className: "bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded w-6 text-center" }, actualData.impacto_funcional.avd || 0))),
                react_1["default"].createElement("div", { className: "mb-4" },
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Impacto en trabajo o estudios"),
                    react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                        react_1["default"].createElement("input", { type: "range", min: "0", max: "5", step: "1", value: actualData.impacto_funcional.trabajo_estudios || 0, onChange: function (e) { return handleUpdateImpacto('trabajo_estudios', parseInt(e.target.value)); }, className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" }),
                        react_1["default"].createElement("span", { className: "bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded w-6 text-center" }, actualData.impacto_funcional.trabajo_estudios || 0))),
                react_1["default"].createElement("div", { className: "mb-4" },
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Impacto en la calidad del sue\u00F1o"),
                    react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                        react_1["default"].createElement("input", { type: "range", min: "0", max: "5", step: "1", value: actualData.impacto_funcional.sueno || 0, onChange: function (e) { return handleUpdateImpacto('sueno', parseInt(e.target.value)); }, className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" }),
                        react_1["default"].createElement("span", { className: "bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded w-6 text-center" }, actualData.impacto_funcional.sueno || 0))),
                react_1["default"].createElement("div", { className: "mb-4" },
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Impacto en actividades sociales y de ocio"),
                    react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                        react_1["default"].createElement("input", { type: "range", min: "0", max: "5", step: "1", value: actualData.impacto_funcional.social_hobbies || 0, onChange: function (e) { return handleUpdateImpacto('social_hobbies', parseInt(e.target.value)); }, className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" }),
                        react_1["default"].createElement("span", { className: "bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded w-6 text-center" }, actualData.impacto_funcional.social_hobbies || 0))),
                react_1["default"].createElement("div", { className: "mb-4" },
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Impacto en su estado de \u00E1nimo"),
                    react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                        react_1["default"].createElement("input", { type: "range", min: "0", max: "5", step: "1", value: actualData.impacto_funcional.animo || 0, onChange: function (e) { return handleUpdateImpacto('animo', parseInt(e.target.value)); }, className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" }),
                        react_1["default"].createElement("span", { className: "bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded w-6 text-center" }, actualData.impacto_funcional.animo || 0)))),
            react_1["default"].createElement("div", { className: "mb-4" },
                react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1 flex items-center" },
                    "Relato cronol\u00F3gico",
                    react_1["default"].createElement("span", { className: "ml-1 text-xs text-gray-500" }, "(opcional)"),
                    react_1["default"].createElement(Tooltip_1["default"], { text: "Describa con sus propias palabras c\u00F3mo ha evolucionado su problema desde el inicio hasta ahora." })),
                react_1["default"].createElement("textarea", { name: "narrativa", value: actualData.narrativa, onChange: handleInputChange, rows: 6, placeholder: "Describa en orden cronol\u00F3gico c\u00F3mo ha evolucionado su problema. Por ejemplo: 'El dolor comenz\u00F3 hace 2 semanas tras una ca\u00EDda. Al principio era leve pero ha ido empeorando...'", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" })))));
};
exports["default"] = EnfermedadActualForm;
