'use client';
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
// Importar componentes UI
var FormField_1 = require("../ui/FormField");
var Tooltip_1 = require("../ui/Tooltip");
var PercepcionPacienteForm = function (_a) {
    var data = _a.data, updateData = _a.updateData, setSectionError = _a.setSectionError, clearSectionError = _a.clearSectionError, sectionKey = _a.sectionKey;
    var _b = react_1.useState(''), newExpectativa = _b[0], setNewExpectativa = _b[1];
    // Inicializar datos si no existen
    var actualData = {
        interpretacion_problema: data.interpretacion_problema || '',
        mayor_preocupacion: data.mayor_preocupacion || '',
        temores_especificos: data.temores_especificos || '',
        expectativas_consulta: data.expectativas_consulta || [],
        expectativas_otro: data.expectativas_otro || '',
        impacto_vida_resumen: data.impacto_vida_resumen || '',
        preguntas_para_medico: data.preguntas_para_medico || ''
    };
    var handleInputChange = function (e) {
        var _a;
        var _b = e.target, name = _b.name, value = _b.value;
        updateData((_a = {}, _a[name] = value, _a));
        clearSectionError(name);
    };
    var handleAddExpectativa = function () {
        if (!newExpectativa.trim())
            return;
        var updatedExpectativas = __spreadArrays((actualData.expectativas_consulta || []), [newExpectativa.trim()]);
        updateData({ expectativas_consulta: updatedExpectativas });
        setNewExpectativa('');
    };
    var handleRemoveExpectativa = function (index) {
        var updatedExpectativas = __spreadArrays((actualData.expectativas_consulta || []));
        updatedExpectativas.splice(index, 1);
        updateData({ expectativas_consulta: updatedExpectativas });
    };
    // Opciones predefinidas para expectativas comunes
    var expectativasComunes = [
        'Conocer mi diagnóstico',
        'Recibir tratamiento para aliviar síntomas',
        'Entender la causa de mi problema',
        'Descartar condiciones graves',
        'Obtener una segunda opinión',
        'Recibir una receta médica',
        'Conseguir un certificado/justificante médico',
        'Orientación sobre manejo en casa'
    ];
    var handleSelectExpectativaComun = function (expectativa) {
        if (actualData.expectativas_consulta.includes(expectativa)) {
            // Si ya existe, la quitamos
            var updatedExpectativas = actualData.expectativas_consulta.filter(function (e) { return e !== expectativa; });
            updateData({ expectativas_consulta: updatedExpectativas });
        }
        else {
            // Si no existe, la añadimos
            var updatedExpectativas = __spreadArrays(actualData.expectativas_consulta, [expectativa]);
            updateData({ expectativas_consulta: updatedExpectativas });
        }
    };
    return (react_1["default"].createElement("div", { className: "space-y-8" },
        react_1["default"].createElement("div", { className: "p-6 bg-white shadow rounded-lg" },
            react_1["default"].createElement("h3", { className: "text-xl font-semibold mb-6 text-gray-800 border-b pb-3" }, "Su Percepci\u00F3n del Problema"),
            react_1["default"].createElement("div", { className: "p-4 bg-blue-50 rounded-md border border-blue-100 mb-6" },
                react_1["default"].createElement("h4", { className: "text-md font-medium text-blue-800 mb-1" }, "Su opini\u00F3n es importante"),
                react_1["default"].createElement("p", { className: "text-sm text-blue-600" }, "Esta secci\u00F3n nos permite entender qu\u00E9 piensa usted sobre su problema de salud, sus preocupaciones y expectativas. Su perspectiva es fundamental para ofrecerle una atenci\u00F3n personalizada y responder a sus necesidades espec\u00EDficas.")),
            react_1["default"].createElement("div", { className: "mb-6" },
                react_1["default"].createElement(FormField_1["default"], { label: "\u00BFQu\u00E9 cree que est\u00E1 causando su problema de salud?", name: "interpretacion_problema", type: "textarea", value: actualData.interpretacion_problema, onChange: handleInputChange, placeholder: "Explique brevemente qu\u00E9 cree que est\u00E1 causando sus s\u00EDntomas o problema de salud actual.", tooltip: "Su opini\u00F3n sobre la causa de su problema nos ayuda a entender su perspectiva y aclarar posibles dudas." })),
            react_1["default"].createElement("div", { className: "mb-6" },
                react_1["default"].createElement(FormField_1["default"], { label: "\u00BFCu\u00E1l es su mayor preocupaci\u00F3n en este momento?", name: "mayor_preocupacion", type: "textarea", value: actualData.mayor_preocupacion, onChange: handleInputChange, placeholder: "\u00BFQu\u00E9 es lo que m\u00E1s le preocupa sobre su condici\u00F3n actual? Por ejemplo, si teme que pueda ser algo grave, que afecte su calidad de vida, etc.", tooltip: "Conocer lo que m\u00E1s le preocupa nos permite enfocar mejor la consulta." })),
            react_1["default"].createElement("div", { className: "mb-6" },
                react_1["default"].createElement(FormField_1["default"], { label: "\u00BFTiene alg\u00FAn temor espec\u00EDfico sobre su condici\u00F3n?", name: "temores_especificos", type: "textarea", value: actualData.temores_especificos, onChange: handleInputChange, placeholder: "\u00BFHay algo en particular que teme que pueda estar causando sus s\u00EDntomas? Por ejemplo, si teme que pueda ser una enfermedad espec\u00EDfica basado en experiencias previas, historia familiar, etc.", tooltip: "Mencionar sus temores espec\u00EDficos nos permite abordarlos directamente durante la consulta." })),
            react_1["default"].createElement("div", { className: "mb-6 border rounded-md p-4" },
                react_1["default"].createElement("h4", { className: "text-lg font-medium mb-4 flex items-center" },
                    "Expectativas de la consulta",
                    react_1["default"].createElement(Tooltip_1["default"], { text: "Saber qu\u00E9 espera obtener de esta consulta nos ayuda a enfocar mejor nuestra atenci\u00F3n y asegurar que sus necesidades sean satisfechas." })),
                react_1["default"].createElement("div", { className: "mb-4" },
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Seleccione sus expectativas para esta consulta (puede elegir varias)"),
                    react_1["default"].createElement("div", { className: "flex flex-wrap gap-2" }, expectativasComunes.map(function (expectativa, index) { return (react_1["default"].createElement("button", { key: index, onClick: function () { return handleSelectExpectativaComun(expectativa); }, className: "px-3 py-1 text-sm rounded-full transition-colors " + (actualData.expectativas_consulta.includes(expectativa)
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200') }, expectativa)); }))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Agregar otra expectativa (opcional)"),
                    react_1["default"].createElement("div", { className: "flex mb-2" },
                        react_1["default"].createElement("input", { type: "text", value: newExpectativa, onChange: function (e) { return setNewExpectativa(e.target.value); }, placeholder: "Escriba aqu\u00ED otra expectativa", className: "flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" }),
                        react_1["default"].createElement("button", { onClick: handleAddExpectativa, className: "px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" }, "Agregar"))),
                react_1["default"].createElement("div", { className: "mt-4" },
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Sus expectativas seleccionadas:"),
                    actualData.expectativas_consulta.length > 0 ? (react_1["default"].createElement("ul", { className: "list-disc pl-5 space-y-1" }, actualData.expectativas_consulta.map(function (expectativa, index) { return (react_1["default"].createElement("li", { key: index, className: "text-sm text-gray-700 flex justify-between items-center" },
                        react_1["default"].createElement("span", null, expectativa),
                        react_1["default"].createElement("button", { onClick: function () { return handleRemoveExpectativa(index); }, className: "text-red-500 hover:text-red-700 ml-2" },
                            react_1["default"].createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor" },
                                react_1["default"].createElement("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }))))); }))) : (react_1["default"].createElement("p", { className: "text-sm text-gray-500 italic" }, "No ha seleccionado ninguna expectativa a\u00FAn."))),
                react_1["default"].createElement("div", { className: "mt-4" },
                    react_1["default"].createElement(FormField_1["default"], { label: "\u00BFHay algo m\u00E1s espec\u00EDfico que espera de esta consulta?", name: "expectativas_otro", type: "textarea", value: actualData.expectativas_otro, onChange: handleInputChange, placeholder: "Si tiene alguna expectativa adicional o quiere explicar m\u00E1s detalladamente lo que espera de esta consulta, escr\u00EDbalo aqu\u00ED." }))),
            react_1["default"].createElement("div", { className: "mb-6" },
                react_1["default"].createElement(FormField_1["default"], { label: "\u00BFC\u00F3mo ha afectado este problema su vida diaria?", name: "impacto_vida_resumen", type: "textarea", value: actualData.impacto_vida_resumen, onChange: handleInputChange, rows: 4, placeholder: "Describa c\u00F3mo este problema ha afectado aspectos importantes de su vida como trabajo, familia, relaciones sociales, actividades que disfruta, etc.", tooltip: "Entender el impacto de su problema en su vida cotidiana nos ayuda a evaluar mejor su situaci\u00F3n y priorizar intervenciones." })),
            react_1["default"].createElement("div", { className: "mb-4" },
                react_1["default"].createElement(FormField_1["default"], { label: "\u00BFQu\u00E9 preguntas espec\u00EDficas tiene para su m\u00E9dico/a?", name: "preguntas_para_medico", type: "textarea", value: actualData.preguntas_para_medico, onChange: handleInputChange, rows: 4, placeholder: "Anote aqu\u00ED las preguntas m\u00E1s importantes que le gustar\u00EDa hacer a su m\u00E9dico/a durante la consulta para asegurarse de resolverlas.", tooltip: "Sus preguntas nos permiten preparar mejor la consulta y asegurar que todas sus dudas sean abordadas." })))));
};
exports["default"] = PercepcionPacienteForm;
