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
exports.__esModule = true;
var react_1 = require("react");
var Tooltip_1 = require("../ui/Tooltip");
var HabitosEstiloVidaForm = function (_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14;
    var data = _a.data, updateData = _a.updateData, setSectionError = _a.setSectionError, clearSectionError = _a.clearSectionError, sectionKey = _a.sectionKey, _15 = _a.errors, errors = _15 === void 0 ? {} : _15;
    // Inicializamos los datos
    var actualData = {
        tabaquismo: data.tabaquismo || { estado: 'Nunca' },
        alcohol: data.alcohol || { consume: false },
        drogas: data.drogas || { consume: false },
        actividad_fisica: data.actividad_fisica || { realiza: false },
        dieta: data.dieta || {},
        sueno: data.sueno || {},
        ocupacion_entorno: data.ocupacion_entorno || {},
        apoyo_social_salud_mental: data.apoyo_social_salud_mental || {},
        otros_habitos_relevantes: data.otros_habitos_relevantes || ''
    };
    // Estado para manejar la cantidad de cigarrillos y años fumando
    var _16 = react_1.useState(((_b = actualData.tabaquismo) === null || _b === void 0 ? void 0 : _b.cantidad_dia) || 0), cantidadCigarrillos = _16[0], setCantidadCigarrillos = _16[1];
    var _17 = react_1.useState(((_c = actualData.tabaquismo) === null || _c === void 0 ? void 0 : _c.anos_fumando) || 0), anosFumando = _17[0], setAnosFumando = _17[1];
    // Calcular paquetes/año cuando cambian los valores
    react_1.useEffect(function () {
        var _a;
        if (((_a = actualData.tabaquismo) === null || _a === void 0 ? void 0 : _a.estado) !== 'Nunca') {
            var paquetesDia = cantidadCigarrillos / 20; // Un paquete tiene 20 cigarrillos
            var paquetesAno = Math.round(paquetesDia * anosFumando * 10) / 10; // Redondear a 1 decimal
            updateData({
                tabaquismo: __assign(__assign({}, actualData.tabaquismo), { cantidad_dia: cantidadCigarrillos, anos_fumando: anosFumando, paquetes_ano: paquetesAno })
            });
        }
    }, [cantidadCigarrillos, anosFumando, (_d = actualData.tabaquismo) === null || _d === void 0 ? void 0 : _d.estado]);
    // Handler para cambios en campos simples
    var handleInputChange = function (e) {
        var _a, _b, _c;
        var _d = e.target, name = _d.name, value = _d.value;
        // Manejo especial para campos anidados
        var fieldPath = name.split('.');
        if (fieldPath.length === 1) {
            // Campo simple
            updateData((_a = {}, _a[name] = value, _a));
        }
        else if (fieldPath.length === 2) {
            // Campo anidado (por ejemplo "tabaquismo.estado")
            var section = fieldPath[0], field = fieldPath[1];
            updateData((_b = {},
                _b[section] = __assign(__assign({}, actualData[section]), (_c = {}, _c[field] = value, _c)),
                _b));
        }
        clearSectionError(name);
    };
    // Handler para cambios en checkboxes
    var handleCheckboxChange = function (e) {
        var _a, _b, _c;
        var _d = e.target, name = _d.name, checked = _d.checked;
        // Manejo especial para campos anidados
        var fieldPath = name.split('.');
        if (fieldPath.length === 1) {
            // Campo simple
            updateData((_a = {}, _a[name] = checked, _a));
        }
        else if (fieldPath.length === 2) {
            // Campo anidado (por ejemplo "alcohol.consume")
            var section = fieldPath[0], field = fieldPath[1];
            updateData((_b = {},
                _b[section] = __assign(__assign({}, actualData[section]), (_c = {}, _c[field] = checked, _c)),
                _b));
        }
        clearSectionError(name);
    };
    // Handler específico para número de cigarrillos
    var handleCantidadCigarrillosChange = function (e) {
        var value = parseInt(e.target.value) || 0;
        setCantidadCigarrillos(value);
    };
    // Handler específico para años fumando
    var handleAnosFumandoChange = function (e) {
        var value = parseInt(e.target.value) || 0;
        setAnosFumando(value);
    };
    // Opciones para el estado de fumador
    var estadoTabaquismoOptions = [
        { value: 'Nunca', label: 'Nunca he fumado' },
        { value: 'Exfumador', label: 'Exfumador' },
        { value: 'Fumador actual', label: 'Fumador actual' }
    ];
    // Opciones para frecuencia de consumo de alcohol
    var frecuenciaAlcoholOptions = [
        { value: '', label: 'Seleccionar...' },
        { value: 'Nunca', label: 'Nunca' },
        { value: 'Ocasional', label: 'Ocasional (eventos especiales)' },
        { value: 'Social (mensual)', label: 'Social (algunas veces al mes)' },
        { value: 'Semanal', label: 'Semanal (1-2 veces por semana)' },
        { value: 'Diario', label: 'Diario o casi diario' }
    ];
    // Opciones para tipo de dieta
    var tipoDietaOptions = [
        { value: '', label: 'Seleccionar...' },
        { value: 'Balanceada', label: 'Balanceada (variada)' },
        { value: 'Alta en grasas', label: 'Alta en grasas' },
        { value: 'Vegetariana', label: 'Vegetariana' },
        { value: 'Vegana', label: 'Vegana' },
        { value: 'Baja en carbohidratos', label: 'Baja en carbohidratos' },
        { value: 'Otra', label: 'Otra' }
    ];
    // Opciones para calidad de sueño
    var calidadSuenoOptions = [
        { value: '', label: 'Seleccionar...' },
        { value: 'Muy mala', label: 'Muy mala' },
        { value: 'Mala', label: 'Mala' },
        { value: 'Regular', label: 'Regular' },
        { value: 'Buena', label: 'Buena' },
        { value: 'Muy buena', label: 'Muy buena' }
    ];
    // Opciones para tipo de trabajo
    var tipoTrabajoOptions = [
        { value: '', label: 'Seleccionar...' },
        { value: 'Sedentario', label: 'Sedentario (principalmente sentado)' },
        { value: 'Activo', label: 'Activo (requiere actividad física)' },
        { value: 'Mixto', label: 'Mixto (combinación de ambos)' }
    ];
    // Opciones para estrés laboral
    var estresLaboralOptions = [
        { value: '', label: 'Seleccionar...' },
        { value: 'Bajo', label: 'Bajo' },
        { value: 'Moderado', label: 'Moderado' },
        { value: 'Alto', label: 'Alto' },
        { value: 'Muy alto', label: 'Muy alto' }
    ];
    // Opciones para estado de ánimo general
    var estadoAnimoOptions = [
        { value: '', label: 'Seleccionar...' },
        { value: 'Bueno', label: 'Bueno' },
        { value: 'Regular', label: 'Regular' },
        { value: 'Malo', label: 'Malo' }
    ];
    // Opciones para apoyo social percibido
    var apoyoSocialOptions = [
        { value: '', label: 'Seleccionar...' },
        { value: 'Sí, cuento con apoyo', label: 'Sí, cuento con apoyo' },
        { value: 'A veces', label: 'A veces' },
        { value: 'No realmente', label: 'No realmente' }
    ];
    return (react_1["default"].createElement("div", { className: "space-y-8" },
        react_1["default"].createElement("div", { className: "p-6 bg-white shadow rounded-lg" },
            react_1["default"].createElement("h3", { className: "text-xl font-semibold mb-6 text-gray-800 border-b pb-3" }, "H\u00E1bitos y Estilo de Vida"),
            react_1["default"].createElement("div", { className: "p-4 bg-blue-50 rounded-md border border-blue-100 mb-6" },
                react_1["default"].createElement("h4", { className: "text-md font-medium text-blue-800 mb-1" }, "Sus h\u00E1bitos diarios influyen en su salud"),
                react_1["default"].createElement("p", { className: "text-sm text-blue-600" }, "Esta secci\u00F3n nos ayuda a entender aspectos de su estilo de vida que pueden influir en su salud. La informaci\u00F3n es confidencial y nos permite ofrecer recomendaciones personalizadas.")),
            react_1["default"].createElement("div", { className: "mb-8 border rounded-md p-4" },
                react_1["default"].createElement("h4", { className: "text-lg font-medium mb-4" }, "Tabaquismo"),
                react_1["default"].createElement("div", { className: "mb-4" },
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "En relaci\u00F3n al tabaco:"),
                    react_1["default"].createElement("div", { className: "space-y-2" }, estadoTabaquismoOptions.map(function (option) {
                        var _a;
                        return (react_1["default"].createElement("label", { key: option.value, className: "flex items-start" },
                            react_1["default"].createElement("input", { type: "radio", name: "tabaquismo.estado", value: option.value, checked: ((_a = actualData.tabaquismo) === null || _a === void 0 ? void 0 : _a.estado) === option.value, onChange: handleInputChange, className: "mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" }),
                            react_1["default"].createElement("span", { className: "ml-2 text-sm text-gray-700" }, option.label)));
                    }))),
                (((_e = actualData.tabaquismo) === null || _e === void 0 ? void 0 : _e.estado) === 'Fumador actual' || ((_f = actualData.tabaquismo) === null || _f === void 0 ? void 0 : _f.estado) === 'Exfumador') && (react_1["default"].createElement("div", { className: "ml-6 space-y-4 pt-2 border-t border-dashed border-gray-200" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, ((_g = actualData.tabaquismo) === null || _g === void 0 ? void 0 : _g.estado) === 'Fumador actual'
                                ? '¿Cuántos cigarrillos fuma al día?'
                                : '¿Cuántos cigarrillos fumaba al día?'),
                            react_1["default"].createElement("input", { type: "number", min: "0", value: cantidadCigarrillos || '', onChange: handleCantidadCigarrillosChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, ((_h = actualData.tabaquismo) === null || _h === void 0 ? void 0 : _h.estado) === 'Fumador actual'
                                ? '¿Desde hace cuántos años fuma?'
                                : '¿Por cuántos años fumó?'),
                            react_1["default"].createElement("input", { type: "number", min: "0", value: anosFumando || '', onChange: handleAnosFumandoChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }))),
                    cantidadCigarrillos > 0 && anosFumando > 0 && (react_1["default"].createElement("div", { className: "bg-gray-50 p-3 rounded-md" },
                        react_1["default"].createElement("span", { className: "text-sm font-medium text-gray-700" }, "\u00CDndice paquetes/a\u00F1o: "),
                        react_1["default"].createElement("span", { className: "text-sm" }, (_j = actualData.tabaquismo) === null || _j === void 0 ? void 0 : _j.paquetes_ano),
                        react_1["default"].createElement(Tooltip_1["default"], { text: "El \u00EDndice paquetes/a\u00F1o es una forma de medir la exposici\u00F3n acumulada al tabaco. Se calcula multiplicando el n\u00FAmero de paquetes fumados por d\u00EDa (cigarrillos/20) por el n\u00FAmero de a\u00F1os fumando." })))))),
            react_1["default"].createElement("div", { className: "mb-8 border rounded-md p-4" },
                react_1["default"].createElement("h4", { className: "text-lg font-medium mb-4" }, "Consumo de Alcohol"),
                react_1["default"].createElement("div", { className: "mb-4" },
                    react_1["default"].createElement("label", { className: "flex items-center" },
                        react_1["default"].createElement("input", { type: "checkbox", name: "alcohol.consume", checked: ((_k = actualData.alcohol) === null || _k === void 0 ? void 0 : _k.consume) || false, onChange: handleCheckboxChange, className: "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" }),
                        react_1["default"].createElement("span", { className: "ml-2 text-sm text-gray-700" }, "\u00BFConsume bebidas alcoh\u00F3licas?"))),
                ((_l = actualData.alcohol) === null || _l === void 0 ? void 0 : _l.consume) && (react_1["default"].createElement("div", { className: "ml-6 space-y-4 pt-2 border-t border-dashed border-gray-200" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFQu\u00E9 tipo de bebida consume con m\u00E1s frecuencia?"),
                        react_1["default"].createElement("input", { type: "text", name: "alcohol.tipo_bebida", value: ((_m = actualData.alcohol) === null || _m === void 0 ? void 0 : _m.tipo_bebida) || '', onChange: handleInputChange, placeholder: "Ej: Cerveza, vino, destilados, etc.", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFCon qu\u00E9 frecuencia consume alcohol?"),
                        react_1["default"].createElement("select", { name: "alcohol.frecuencia", value: ((_o = actualData.alcohol) === null || _o === void 0 ? void 0 : _o.frecuencia) || '', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }, frecuenciaAlcoholOptions.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); }))),
                    ((_p = actualData.alcohol) === null || _p === void 0 ? void 0 : _p.frecuencia) && actualData.alcohol.frecuencia !== 'Nunca' && (react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" },
                            "\u00BFCu\u00E1ntas bebidas consume en una semana t\u00EDpica?",
                            react_1["default"].createElement(Tooltip_1["default"], { text: "Una bebida est\u00E1ndar equivale aproximadamente a: 1 lata de cerveza (330 ml), 1 copa de vino (140 ml) o 1 medida de destilado (40 ml)." })),
                        react_1["default"].createElement("input", { type: "number", name: "alcohol.cantidad_semana", min: "0", value: ((_q = actualData.alcohol) === null || _q === void 0 ? void 0 : _q.cantidad_semana) || '', onChange: handleInputChange, placeholder: "N\u00FAmero de bebidas", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" })))))),
            react_1["default"].createElement("div", { className: "mb-8 border rounded-md p-4" },
                react_1["default"].createElement("h4", { className: "text-lg font-medium mb-4" }, "Consumo de Otras Sustancias"),
                react_1["default"].createElement("div", { className: "mb-4" },
                    react_1["default"].createElement("label", { className: "flex items-center" },
                        react_1["default"].createElement("input", { type: "checkbox", name: "drogas.consume", checked: ((_r = actualData.drogas) === null || _r === void 0 ? void 0 : _r.consume) || false, onChange: handleCheckboxChange, className: "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" }),
                        react_1["default"].createElement("span", { className: "ml-2 text-sm text-gray-700" }, "\u00BFConsume o ha consumido recientemente otras sustancias?")),
                    react_1["default"].createElement("p", { className: "mt-1 text-xs text-gray-500 ml-6" }, "Esta informaci\u00F3n es confidencial y solo es utilizada para fines m\u00E9dicos.")),
                ((_s = actualData.drogas) === null || _s === void 0 ? void 0 : _s.consume) && (react_1["default"].createElement("div", { className: "ml-6 space-y-4 pt-2 border-t border-dashed border-gray-200" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFQu\u00E9 tipo de sustancia(s)?"),
                        react_1["default"].createElement("input", { type: "text", name: "drogas.tipo_droga", value: ((_t = actualData.drogas) === null || _t === void 0 ? void 0 : _t.tipo_droga) || '', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFCon qu\u00E9 frecuencia las consume?"),
                        react_1["default"].createElement("input", { type: "text", name: "drogas.frecuencia_uso", value: ((_u = actualData.drogas) === null || _u === void 0 ? void 0 : _u.frecuencia_uso) || '', onChange: handleInputChange, placeholder: "Ej: Diariamente, semanalmente, ocasionalmente...", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }))))),
            react_1["default"].createElement("div", { className: "mb-8 border rounded-md p-4" },
                react_1["default"].createElement("h4", { className: "text-lg font-medium mb-4" }, "Actividad F\u00EDsica"),
                react_1["default"].createElement("div", { className: "mb-4" },
                    react_1["default"].createElement("label", { className: "flex items-center" },
                        react_1["default"].createElement("input", { type: "checkbox", name: "actividad_fisica.realiza", checked: ((_v = actualData.actividad_fisica) === null || _v === void 0 ? void 0 : _v.realiza) || false, onChange: handleCheckboxChange, className: "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" }),
                        react_1["default"].createElement("span", { className: "ml-2 text-sm text-gray-700" }, "\u00BFRealiza actividad f\u00EDsica o ejercicio regularmente?"))),
                ((_w = actualData.actividad_fisica) === null || _w === void 0 ? void 0 : _w.realiza) && (react_1["default"].createElement("div", { className: "ml-6 space-y-4 pt-2 border-t border-dashed border-gray-200" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFQu\u00E9 tipo de actividad f\u00EDsica realiza principalmente?"),
                        react_1["default"].createElement("input", { type: "text", name: "actividad_fisica.tipo_ejercicio", value: ((_x = actualData.actividad_fisica) === null || _x === void 0 ? void 0 : _x.tipo_ejercicio) || '', onChange: handleInputChange, placeholder: "Ej: Caminar, correr, nataci\u00F3n, gimnasio, etc.", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" })),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFCu\u00E1ntas veces por semana?"),
                            react_1["default"].createElement("input", { type: "number", name: "actividad_fisica.frecuencia_semana", min: "0", max: "7", value: ((_y = actualData.actividad_fisica) === null || _y === void 0 ? void 0 : _y.frecuencia_semana) || '', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFCu\u00E1ntos minutos por sesi\u00F3n?"),
                            react_1["default"].createElement("input", { type: "number", name: "actividad_fisica.duracion_sesion_min", min: "0", step: "5", value: ((_z = actualData.actividad_fisica) === null || _z === void 0 ? void 0 : _z.duracion_sesion_min) || '', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" })))))),
            react_1["default"].createElement("div", { className: "mb-8 border rounded-md p-4" },
                react_1["default"].createElement("h4", { className: "text-lg font-medium mb-4" }, "Alimentaci\u00F3n"),
                react_1["default"].createElement("div", { className: "mb-4" },
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFC\u00F3mo describir\u00EDa su alimentaci\u00F3n habitual?"),
                    react_1["default"].createElement("select", { name: "dieta.tipo_dieta", value: ((_0 = actualData.dieta) === null || _0 === void 0 ? void 0 : _0.tipo_dieta) || '', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }, tipoDietaOptions.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); }))),
                ((_1 = actualData.dieta) === null || _1 === void 0 ? void 0 : _1.tipo_dieta) === 'Otra' && (react_1["default"].createElement("div", { className: "mb-4" },
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Describa su tipo de alimentaci\u00F3n:"),
                    react_1["default"].createElement("textarea", { name: "dieta.descripcion_adicional_dieta", value: ((_2 = actualData.dieta) === null || _2 === void 0 ? void 0 : _2.descripcion_adicional_dieta) || '', onChange: handleInputChange, rows: 2, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }))),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "N\u00FAmero de comidas al d\u00EDa"),
                        react_1["default"].createElement("input", { type: "number", name: "dieta.comidas_dia", min: "1", max: "10", value: ((_3 = actualData.dieta) === null || _3 === void 0 ? void 0 : _3.comidas_dia) || '', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFCu\u00E1ntos litros de agua bebe al d\u00EDa?"),
                        react_1["default"].createElement("input", { type: "number", name: "dieta.hidratacion_litros_dia", min: "0", step: "0.5", value: ((_4 = actualData.dieta) === null || _4 === void 0 ? void 0 : _4.hidratacion_litros_dia) || '', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }))),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFConsume caf\u00E9, t\u00E9, mate u otras bebidas con cafe\u00EDna?"),
                        react_1["default"].createElement("input", { type: "text", name: "dieta.consumo_cafeina", value: ((_5 = actualData.dieta) === null || _5 === void 0 ? void 0 : _5.consumo_cafeina) || '', onChange: handleInputChange, placeholder: "Tipo y cantidad aproximada", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFConsume refrescos, jugos artificiales u otras bebidas azucaradas?"),
                        react_1["default"].createElement("input", { type: "text", name: "dieta.consumo_bebidas_azucaradas", value: ((_6 = actualData.dieta) === null || _6 === void 0 ? void 0 : _6.consumo_bebidas_azucaradas) || '', onChange: handleInputChange, placeholder: "Tipo y frecuencia", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" })))),
            react_1["default"].createElement("div", { className: "mb-8 border rounded-md p-4" },
                react_1["default"].createElement("h4", { className: "text-lg font-medium mb-4" }, "H\u00E1bitos de Sue\u00F1o"),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFCu\u00E1ntas horas duerme en promedio por noche?"),
                        react_1["default"].createElement("input", { type: "number", name: "sueno.horas_noche_promedio", min: "0", max: "24", step: "0.5", value: ((_7 = actualData.sueno) === null || _7 === void 0 ? void 0 : _7.horas_noche_promedio) || '', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFC\u00F3mo calificar\u00EDa la calidad de su sue\u00F1o?"),
                        react_1["default"].createElement("select", { name: "sueno.calidad_sueno", value: ((_8 = actualData.sueno) === null || _8 === void 0 ? void 0 : _8.calidad_sueno) || '', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }, calidadSuenoOptions.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); }))))),
            react_1["default"].createElement("div", { className: "mb-8 border rounded-md p-4" },
                react_1["default"].createElement("h4", { className: "text-lg font-medium mb-4" }, "Ocupaci\u00F3n y Entorno Laboral"),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFC\u00F3mo describir\u00EDa su actividad laboral?"),
                        react_1["default"].createElement("select", { name: "ocupacion_entorno.tipo_trabajo", value: ((_9 = actualData.ocupacion_entorno) === null || _9 === void 0 ? void 0 : _9.tipo_trabajo) || '', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }, tipoTrabajoOptions.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); }))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFCu\u00E1ntas horas trabaja al d\u00EDa en promedio?"),
                        react_1["default"].createElement("input", { type: "number", name: "ocupacion_entorno.horas_trabajo_dia", min: "0", max: "24", value: ((_10 = actualData.ocupacion_entorno) === null || _10 === void 0 ? void 0 : _10.horas_trabajo_dia) || '', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }))),
                react_1["default"].createElement("div", { className: "mb-4" },
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Nivel de estr\u00E9s laboral percibido"),
                    react_1["default"].createElement("select", { name: "ocupacion_entorno.estres_laboral", value: ((_11 = actualData.ocupacion_entorno) === null || _11 === void 0 ? void 0 : _11.estres_laboral) || '', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }, estresLaboralOptions.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); }))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" },
                        "\u00BFEst\u00E1 expuesto a riesgos ambientales o laborales?",
                        react_1["default"].createElement(Tooltip_1["default"], { text: "Por ejemplo: ruido excesivo, productos qu\u00EDmicos, polvo, altura, uso prolongado de pantallas, etc." })),
                    react_1["default"].createElement("textarea", { name: "ocupacion_entorno.exposicion_ambiental_riesgos", value: ((_12 = actualData.ocupacion_entorno) === null || _12 === void 0 ? void 0 : _12.exposicion_ambiental_riesgos) || '', onChange: handleInputChange, rows: 2, placeholder: "Detalle cualquier exposici\u00F3n", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }))),
            react_1["default"].createElement("div", { className: "mb-8 border rounded-md p-4" },
                react_1["default"].createElement("h4", { className: "text-lg font-medium mb-4" }, "Apoyo Social y Bienestar Emocional"),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFC\u00F3mo describir\u00EDa su estado de \u00E1nimo general?"),
                        react_1["default"].createElement("select", { name: "apoyo_social_salud_mental.estado_animo_general", value: ((_13 = actualData.apoyo_social_salud_mental) === null || _13 === void 0 ? void 0 : _13.estado_animo_general) || '', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }, estadoAnimoOptions.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); }))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u00BFCuenta con apoyo de familiares, amigos o comunidad cuando lo necesita?"),
                        react_1["default"].createElement("select", { name: "apoyo_social_salud_mental.apoyo_social_percibido", value: ((_14 = actualData.apoyo_social_salud_mental) === null || _14 === void 0 ? void 0 : _14.apoyo_social_percibido) || '', onChange: handleInputChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" }, apoyoSocialOptions.map(function (option) { return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label)); }))))),
            react_1["default"].createElement("div", { className: "mb-4" },
                react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" },
                    "\u00BFHay otros h\u00E1bitos o aspectos de su estilo de vida que considere relevantes?",
                    react_1["default"].createElement(Tooltip_1["default"], { text: "Por ejemplo: uso prolongado de dispositivos electr\u00F3nicos, hobbies, exposici\u00F3n solar, etc." })),
                react_1["default"].createElement("textarea", { name: "otros_habitos_relevantes", value: actualData.otros_habitos_relevantes || '', onChange: handleInputChange, rows: 3, placeholder: "Describa cualquier otro h\u00E1bito que considere importante para su salud", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" })))));
};
exports["default"] = HabitosEstiloVidaForm;
