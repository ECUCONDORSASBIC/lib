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
var Tooltip_1 = require("../ui/Tooltip");
var SaludMentalForm = function (_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    var data = _a.data, updateData = _a.updateData, setSectionError = _a.setSectionError, clearSectionError = _a.clearSectionError, sectionKey = _a.sectionKey;
    var _s = react_1.useState(''), newFuenteEstres = _s[0], setNewFuenteEstres = _s[1];
    var _t = react_1.useState(''), newMecanismoAfrontamiento = _t[0], setNewMecanismoAfrontamiento = _t[1];
    // Inicializar datos si no existen
    var actualData = {
        estado_animo_phq2: data.estado_animo_phq2 || {
            decaido_deprimido: 'Nunca',
            poco_interes_placer: 'Nunca'
        },
        ansiedad_gad2: data.ansiedad_gad2 || {
            nervioso_ansioso: 'Nunca',
            no_controla_preocupaciones: 'Nunca'
        },
        estres_percibido: data.estres_percibido || 0,
        fuentes_estres: data.fuentes_estres || [],
        mecanismos_afrontamiento: data.mecanismos_afrontamiento || [],
        calidad_sueno_detalle: data.calidad_sueno_detalle || {
            dificultad_conciliar: 'Nunca',
            despertares_nocturnos: 'Nunca',
            sueno_reparador: 'Casi siempre'
        },
        apoyo_social: data.apoyo_social || {
            confianza_apoyo: 'Sí, en general',
            sentimiento_soledad: 'Nunca'
        },
        eventos_vitales_recientes: data.eventos_vitales_recientes || {
            presente: false,
            descripcion: ''
        }
    };
    var handleInputChange = function (e) {
        var _a, _b, _c;
        var _d = e.target, name = _d.name, value = _d.value;
        // Maneja campos anidados (con notación de punto)
        var nameParts = name.split('.');
        if (nameParts.length === 2) {
            var parent = nameParts[0], child = nameParts[1];
            updateData((_a = {},
                _a[parent] = __assign(__assign({}, data[parent]), (_b = {}, _b[child] = value, _b)),
                _a));
        }
        else {
            updateData((_c = {}, _c[name] = value, _c));
        }
        clearSectionError(name);
    };
    var handleCheckboxChange = function (e) {
        var _a;
        var _b = e.target, name = _b.name, checked = _b.checked;
        // Si es el checkbox de eventos vitales, actualiza sólo ese campo
        if (name === 'eventos_vitales_recientes.presente') {
            updateData({
                eventos_vitales_recientes: __assign(__assign({}, actualData.eventos_vitales_recientes), { presente: checked })
            });
        }
        else {
            updateData((_a = {}, _a[name] = checked, _a));
        }
    };
    var handleAddFuenteEstres = function () {
        if (!newFuenteEstres.trim())
            return;
        var updatedFuentes = __spreadArrays((actualData.fuentes_estres || []), [newFuenteEstres.trim()]);
        updateData({ fuentes_estres: updatedFuentes });
        setNewFuenteEstres('');
    };
    var handleRemoveFuenteEstres = function (index) {
        var updatedFuentes = __spreadArrays((actualData.fuentes_estres || []));
        updatedFuentes.splice(index, 1);
        updateData({ fuentes_estres: updatedFuentes });
    };
    var handleAddMecanismoAfrontamiento = function () {
        if (!newMecanismoAfrontamiento.trim())
            return;
        var updatedMecanismos = __spreadArrays((actualData.mecanismos_afrontamiento || []), [newMecanismoAfrontamiento.trim()]);
        updateData({ mecanismos_afrontamiento: updatedMecanismos });
        setNewMecanismoAfrontamiento('');
    };
    var handleRemoveMecanismoAfrontamiento = function (index) {
        var updatedMecanismos = __spreadArrays((actualData.mecanismos_afrontamiento || []));
        updatedMecanismos.splice(index, 1);
        updateData({ mecanismos_afrontamiento: updatedMecanismos });
    };
    // Opciones de frecuencia para PHQ-2 y GAD-2
    var frecuenciaOptions = [
        { value: 'Nunca', label: 'Nunca' },
        { value: 'Varios días', label: 'Varios días' },
        { value: 'Más de la mitad de los días', label: 'Más de la mitad de los días' },
        { value: 'Casi todos los días', label: 'Casi todos los días' }
    ];
    // Opciones para dificultad para conciliar el sueño/despertares
    var dificultadSuenoOptions = [
        { value: 'Nunca', label: 'Nunca' },
        { value: 'A veces', label: 'A veces' },
        { value: 'Frecuente', label: 'Frecuente' }
    ];
    // Opciones para sueño reparador
    var suenoReparadorOptions = [
        { value: 'Nunca', label: 'Nunca' },
        { value: 'Raramente', label: 'Raramente' },
        { value: 'A veces', label: 'A veces' },
        { value: 'Casi siempre', label: 'Casi siempre' }
    ];
    // Opciones para apoyo social
    var confianzaApoyoOptions = [
        { value: 'Sí, en general', label: 'Sí, en general' },
        { value: 'A veces', label: 'A veces' },
        { value: 'No realmente', label: 'No realmente' }
    ];
    // Opciones para sentimiento de soledad
    var sentimientoSoledadOptions = [
        { value: 'Nunca', label: 'Nunca' },
        { value: 'Raramente', label: 'Raramente' },
        { value: 'A veces', label: 'A veces' },
        { value: 'Con frecuencia', label: 'Con frecuencia' }
    ];
    return (react_1["default"].createElement("div", { className: "space-y-8" },
        react_1["default"].createElement("div", { className: "p-6 bg-white shadow rounded-lg" },
            react_1["default"].createElement("h3", { className: "text-xl font-semibold mb-6 text-gray-800 border-b pb-3" }, "Salud Mental y Bienestar"),
            react_1["default"].createElement("div", { className: "p-4 bg-blue-50 rounded-md border border-blue-100 mb-6" },
                react_1["default"].createElement("h4", { className: "text-md font-medium text-blue-800 mb-1" }, "Cuidamos su bienestar integral"),
                react_1["default"].createElement("p", { className: "text-sm text-blue-600" }, "Esta secci\u00F3n nos permite comprender mejor c\u00F3mo se ha sentido emocionalmente en las \u00FAltimas semanas. Los aspectos de salud mental son parte importante de su bienestar general y pueden estar relacionados con sus s\u00EDntomas. Sus respuestas son confidenciales y nos ayudan a brindarle una atenci\u00F3n m\u00E1s completa.")),
            react_1["default"].createElement("div", { className: "mb-6 border rounded-md p-4" },
                react_1["default"].createElement("h4", { className: "text-lg font-medium mb-4 flex items-center" },
                    "Estado de \u00E1nimo",
                    react_1["default"].createElement(Tooltip_1["default"], { text: "Estas dos preguntas ayudan a detectar posibles s\u00EDntomas depresivos." })),
                react_1["default"].createElement("p", { className: "text-sm text-gray-600 mb-4" }, "Durante las \u00FAltimas 2 semanas, \u00BFcon qu\u00E9 frecuencia ha experimentado alguno de los siguientes problemas?"),
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Se ha sentido deca\u00EDdo/a, deprimido/a o sin esperanzas"),
                        react_1["default"].createElement("select", { name: "estado_animo_phq2.decaido_deprimido", value: ((_b = actualData.estado_animo_phq2) === null || _b === void 0 ? void 0 : _b.decaido_deprimido) || 'Nunca', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }, frecuenciaOptions.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); }))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Ha sentido poco inter\u00E9s o placer al hacer las cosas"),
                        react_1["default"].createElement("select", { name: "estado_animo_phq2.poco_interes_placer", value: ((_c = actualData.estado_animo_phq2) === null || _c === void 0 ? void 0 : _c.poco_interes_placer) || 'Nunca', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }, frecuenciaOptions.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); }))))),
            react_1["default"].createElement("div", { className: "mb-6 border rounded-md p-4" },
                react_1["default"].createElement("h4", { className: "text-lg font-medium mb-4 flex items-center" },
                    "Ansiedad",
                    react_1["default"].createElement(Tooltip_1["default"], { text: "Estas dos preguntas ayudan a detectar posibles s\u00EDntomas de ansiedad." })),
                react_1["default"].createElement("p", { className: "text-sm text-gray-600 mb-4" }, "Durante las \u00FAltimas 2 semanas, \u00BFcon qu\u00E9 frecuencia ha experimentado alguno de los siguientes problemas?"),
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Se ha sentido nervioso/a, ansioso/a o con los nervios de punta"),
                        react_1["default"].createElement("select", { name: "ansiedad_gad2.nervioso_ansioso", value: ((_d = actualData.ansiedad_gad2) === null || _d === void 0 ? void 0 : _d.nervioso_ansioso) || 'Nunca', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }, frecuenciaOptions.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); }))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "No ha sido capaz de dejar de preocuparse o de controlar la preocupaci\u00F3n"),
                        react_1["default"].createElement("select", { name: "ansiedad_gad2.no_controla_preocupaciones", value: ((_e = actualData.ansiedad_gad2) === null || _e === void 0 ? void 0 : _e.no_controla_preocupaciones) || 'Nunca', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }, frecuenciaOptions.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); }))))),
            react_1["default"].createElement("div", { className: "mb-6 border rounded-md p-4" },
                react_1["default"].createElement("h4", { className: "text-lg font-medium mb-4" }, "Nivel de estr\u00E9s"),
                react_1["default"].createElement("div", { className: "mb-4" },
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" },
                        "\u00BFC\u00F3mo calificar\u00EDa su nivel de estr\u00E9s en el \u00FAltimo mes?",
                        react_1["default"].createElement("span", { className: "text-xs text-gray-500 ml-2" }, "(0: Sin estr\u00E9s, 10: Estr\u00E9s extremo)")),
                    react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                        react_1["default"].createElement("input", { type: "range", min: "0", max: "10", step: "1", name: "estres_percibido", value: actualData.estres_percibido || 0, onChange: function (e) { return updateData({ estres_percibido: parseInt(e.target.value) }); }, className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" }),
                        react_1["default"].createElement("span", { className: "bg-blue-100 text-blue-800 text-sm px-2.5 py-0.5 rounded w-8 text-center" }, actualData.estres_percibido || 0))),
                (actualData.estres_percibido || 0) > 3 && (react_1["default"].createElement("div", { className: "mb-4" },
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFCu\u00E1les son las principales fuentes de estr\u00E9s en su vida actualmente?"),
                    react_1["default"].createElement("div", { className: "flex mb-2" },
                        react_1["default"].createElement("input", { type: "text", value: newFuenteEstres, onChange: function (e) { return setNewFuenteEstres(e.target.value); }, placeholder: "Ej: Trabajo, problemas familiares...", className: "flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" }),
                        react_1["default"].createElement("button", { onClick: handleAddFuenteEstres, className: "px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" }, "Agregar")),
                    react_1["default"].createElement("div", { className: "flex flex-wrap gap-2 mt-2" }, (_f = actualData.fuentes_estres) === null || _f === void 0 ? void 0 :
                        _f.map(function (fuente, index) { return (react_1["default"].createElement("span", { key: index, className: "bg-gray-100 text-gray-800 text-sm px-2.5 py-0.5 rounded flex items-center" },
                            fuente,
                            react_1["default"].createElement("button", { className: "ml-1 text-gray-500 hover:text-gray-700", onClick: function () { return handleRemoveFuenteEstres(index); } },
                                react_1["default"].createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor" },
                                    react_1["default"].createElement("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }))))); }),
                        !((_g = actualData.fuentes_estres) === null || _g === void 0 ? void 0 : _g.length) && (react_1["default"].createElement("span", { className: "text-sm text-gray-500 italic" }, "Ninguna registrada"))))),
                (actualData.estres_percibido || 0) > 3 && (react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFQu\u00E9 estrategias utiliza para lidiar con el estr\u00E9s?"),
                    react_1["default"].createElement("div", { className: "flex mb-2" },
                        react_1["default"].createElement("input", { type: "text", value: newMecanismoAfrontamiento, onChange: function (e) { return setNewMecanismoAfrontamiento(e.target.value); }, placeholder: "Ej: Ejercicio, meditaci\u00F3n...", className: "flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" }),
                        react_1["default"].createElement("button", { onClick: handleAddMecanismoAfrontamiento, className: "px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" }, "Agregar")),
                    react_1["default"].createElement("div", { className: "flex flex-wrap gap-2 mt-2" }, (_h = actualData.mecanismos_afrontamiento) === null || _h === void 0 ? void 0 :
                        _h.map(function (mecanismo, index) { return (react_1["default"].createElement("span", { key: index, className: "bg-green-100 text-green-800 text-sm px-2.5 py-0.5 rounded flex items-center" },
                            mecanismo,
                            react_1["default"].createElement("button", { className: "ml-1 text-green-700 hover:text-green-900", onClick: function () { return handleRemoveMecanismoAfrontamiento(index); } },
                                react_1["default"].createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor" },
                                    react_1["default"].createElement("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }))))); }),
                        !((_j = actualData.mecanismos_afrontamiento) === null || _j === void 0 ? void 0 : _j.length) && (react_1["default"].createElement("span", { className: "text-sm text-gray-500 italic" }, "Ninguno registrado")))))),
            react_1["default"].createElement("div", { className: "mb-6 border rounded-md p-4" },
                react_1["default"].createElement("h4", { className: "text-lg font-medium mb-4" }, "Calidad del sue\u00F1o"),
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFTiene dificultad para quedarse dormido/a al acostarse?"),
                        react_1["default"].createElement("select", { name: "calidad_sueno_detalle.dificultad_conciliar", value: ((_k = actualData.calidad_sueno_detalle) === null || _k === void 0 ? void 0 : _k.dificultad_conciliar) || 'Nunca', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }, dificultadSuenoOptions.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); }))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFSe despierta durante la noche?"),
                        react_1["default"].createElement("select", { name: "calidad_sueno_detalle.despertares_nocturnos", value: ((_l = actualData.calidad_sueno_detalle) === null || _l === void 0 ? void 0 : _l.despertares_nocturnos) || 'Nunca', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }, dificultadSuenoOptions.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); }))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFSiente que su sue\u00F1o es reparador?"),
                        react_1["default"].createElement("select", { name: "calidad_sueno_detalle.sueno_reparador", value: ((_m = actualData.calidad_sueno_detalle) === null || _m === void 0 ? void 0 : _m.sueno_reparador) || 'Casi siempre', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }, suenoReparadorOptions.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); }))))),
            react_1["default"].createElement("div", { className: "mb-6 border rounded-md p-4" },
                react_1["default"].createElement("h4", { className: "text-lg font-medium mb-4" }, "Apoyo social"),
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFSiente que puede contar con alguien cuando necesita ayuda o apoyo?"),
                        react_1["default"].createElement("select", { name: "apoyo_social.confianza_apoyo", value: ((_o = actualData.apoyo_social) === null || _o === void 0 ? void 0 : _o.confianza_apoyo) || 'Sí, en general', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }, confianzaApoyoOptions.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); }))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFCon qu\u00E9 frecuencia se siente solo/a?"),
                        react_1["default"].createElement("select", { name: "apoyo_social.sentimiento_soledad", value: ((_p = actualData.apoyo_social) === null || _p === void 0 ? void 0 : _p.sentimiento_soledad) || 'Nunca', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }, sentimientoSoledadOptions.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); }))))),
            react_1["default"].createElement("div", { className: "mb-6 border rounded-md p-4" },
                react_1["default"].createElement("h4", { className: "text-lg font-medium mb-4" }, "Eventos vitales significativos"),
                react_1["default"].createElement("div", { className: "mb-3" },
                    react_1["default"].createElement("label", { className: "inline-flex items-center cursor-pointer" },
                        react_1["default"].createElement("input", { type: "checkbox", name: "eventos_vitales_recientes.presente", checked: ((_q = actualData.eventos_vitales_recientes) === null || _q === void 0 ? void 0 : _q.presente) || false, onChange: handleCheckboxChange, className: "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" }),
                        react_1["default"].createElement("span", { className: "ml-2 text-sm text-gray-700" }, "\u00BFHa experimentado alg\u00FAn evento vital significativo en los \u00FAltimos 6 meses?"),
                        react_1["default"].createElement(Tooltip_1["default"], { text: "Por ejemplo: p\u00E9rdida de un ser querido, divorcio/separaci\u00F3n, cambio de trabajo, mudanza, enfermedad grave, etc." }))),
                ((_r = actualData.eventos_vitales_recientes) === null || _r === void 0 ? void 0 : _r.presente) && (react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Por favor, describa brevemente estos eventos recientes:"),
                    react_1["default"].createElement("textarea", { name: "eventos_vitales_recientes.descripcion", value: actualData.eventos_vitales_recientes.descripcion || '', onChange: handleInputChange, rows: 4, placeholder: "Describa los eventos significativos y aproximadamente cu\u00E1ndo ocurrieron", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" })))))));
};
exports["default"] = SaludMentalForm;
