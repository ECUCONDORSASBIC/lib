/**
 * @typedef {Object} IdentificacionData
 * @property {string} nombreCompleto
 * @property {string} fechaNacimiento
 * @property {'masculino' | 'femenino' | 'otro'} sexo
 * @property {string} ocupacion
 */

/**
 * @typedef {Object} MotivoConsultaData
 * @property {string} descripcion
 */

/**
 * @typedef {Object} ImpactoFuncional
 * @property {number} [general]
 * @property {number} [avd]
 * @property {number} [trabajo_estudios]
 * @property {number} [sueno]
 * @property {number} [social_hobbies]
 * @property {number} [animo]
 */

/**
 * @typedef {Object} Sintoma
 * @property {string} nombre
 * @property {{ coord_x: number, coord_y: number, vista: string }} [localizacion_diagrama]
 * @property {number} [intensidad]
 * @property {string} [frecuencia]
 * @property {string} [patron]
 * @property {{ agravantes?: string[], aliviantes?: string[] }} [factores]
 * @property {boolean} [presente] - Para Revisión por Sistemas
 * @property {string} [inicio] - Ej. "Nuevo en las últimas 2 semanas", "Crónico, sin cambios"
 * @property {number | 'leve' | 'moderado' | 'severo'} [severidad] - Puede ser numérico o categórico
 * @property {string} [factores_modificantes]
 * @property {string} [caracteristicas_adicionales]
 */

/**
 * @typedef {Object} EnfermedadActualData
 * @property {string} inicio
 * @property {Sintoma[]} sintomas
 * @property {string[]} tratamientos_probados
 * @property {ImpactoFuncional} impacto_funcional
 * @property {string} narrativa
 */

/**
 * @typedef {Object} Cirugia
 * @property {number} anio
 * @property {string} procedimiento
 */

/**
 * @typedef {Object} Medicamento
 * @property {string} nombre
 * @property {string} dosis
 */

/**
 * @typedef {Object} ManejoMedicacionCronica
 * @property {'Nunca' | 'Raramente' | 'A veces' | 'Con frecuencia' | 'Casi siempre'} [adherencia]
 * @property {boolean} [comprension_tratamiento]
 * @property {'Sí' | 'No' | 'No estoy seguro'} [efectos_secundarios_percibidos]
 * @property {string} [descripcion_efectos_secundarios]
 */

/**
 * @typedef {Object} AntecedentesPersonalesData
 * @property {string[]} enfermedades_cronicas
 * @property {Cirugia[]} cirugias
 * @property {string[]} alergias
 * @property {Medicamento[]} medicamentos_actuales
 * @property {ManejoMedicacionCronica} [manejo_medicacion_cronica]
 * @property {string} otros_antecedentes
 */

/**
 * @typedef {Object} AntecedenteFamiliar
 * @property {string} parentesco
 * @property {string[]} enfermedades
 */

/**
 * @typedef {Object} AntecedentesFamiliaresData
 * @property {AntecedenteFamiliar[]} familiares
 */

/**
 * @typedef {Object} HabitosEstiloVidaData
 * @property {{ estado: 'Nunca' | 'Exfumador' | 'Fumador actual', cantidad_dia?: number, anos_fumando?: number, paquetes_ano?: number }} [tabaquismo]
 * @property {{ consume: boolean, tipo_bebida?: string, frecuencia?: string, cantidad_semana?: number }} [alcohol]
 * @property {{ consume: boolean, tipo_droga?: string, frecuencia_uso?: string }} [drogas]
 * @property {{ realiza: boolean, tipo_ejercicio?: string, frecuencia_semana?: number, duracion_sesion_min?: number }} [actividad_fisica]
 * @property {{ tipo_dieta?: string, comidas_dia?: number, hidratacion_litros_dia?: number }} [dieta]
 * @property {number} [sueno_horas_noche]
 * @property {string} [otros]
 */

/**
 * @typedef {Object} RevisionSistemasData
 * @property {Sintoma[]} [general]
 * @property {Sintoma[]} [piel_anexos]
 * @property {Sintoma[]} [cabeza_cuello]
 * @property {Sintoma[]} [ojos]
 * @property {Sintoma[]} [oidos_nariz_garganta]
 * @property {Sintoma[]} [cardiovascular]
 * @property {Sintoma[]} [respiratorio]
 * @property {Sintoma[]} [gastrointestinal]
 * @property {Sintoma[]} [genitourinario]
 * @property {Sintoma[]} [musculoesqueletico]
 * @property {Sintoma[]} [neurologico]
 * @property {Sintoma[]} [endocrino]
 * @property {Sintoma[]} [hematologico_linfatico]
 * @property {Sintoma[]} [psiquiatrico_general]
 */

/**
 * @typedef {Object} SaludMentalData
 * @property {{ decaido_deprimido?: 'Nunca' | 'Varios días' | 'Más de la mitad de los días' | 'Casi todos los días', poco_interes_placer?: 'Nunca' | 'Varios días' | 'Más de la mitad de los días' | 'Casi todos los días' }} [estado_animo_phq2]
 * @property {{ nervioso_ansioso?: 'Nunca' | 'Varios días' | 'Más de la mitad de los días' | 'Casi todos los días', no_controla_preocupaciones?: 'Nunca' | 'Varios días' | 'Más de la mitad de los días' | 'Casi todos los días' }} [ansiedad_gad2]
 * @property {number} [estres_percibido] // 0-10
 * @property {string[]} [fuentes_estres]
 * @property {string[]} [mecanismos_afrontamiento]
 * @property {{ dificultad_conciliar?: 'Nunca' | 'A veces' | 'Frecuente', despertares_nocturnos?: 'Nunca' | 'A veces' | 'Frecuente', sueno_reparador?: 'Nunca' | 'Raramente' | 'A veces' | 'Casi siempre' }} [calidad_sueno_detalle]
 * @property {{ confianza_apoyo?: 'Sí, en general' | 'A veces' | 'No realmente', sentimiento_soledad?: 'Nunca' | 'Raramente' | 'A veces' | 'Con frecuencia' }} [apoyo_social]
 * @property {{ presente: boolean, descripcion?: string }} [eventos_vitales_recientes]
 */

/**
 * @typedef {Object} PruebaInformePrevio
 * @property {string} tipo_prueba
 * @property {string} fecha_realizacion
 * @property {string} [lugar]
 * @property {string} [motivo]
 * @property {string} [resultados_paciente]
 * @property {string} [archivo_adjunto_url]
 * @property {string} [archivo_local_path]
 */

/**
 * @typedef {Object} PruebasInformesPreviosData
 * @property {PruebaInformePrevio[]} pruebas
 */

/**
 * @typedef {Object} PercepcionPacienteData
 * @property {string} interpretacion_problema
 * @property {string} mayor_preocupacion
 * @property {string} temores_especificos
 * @property {string[]} expectativas_consulta
 * @property {string} [expectativas_otro]
 * @property {string} impacto_vida_resumen
 * @property {string} preguntas_para_medico
 */

/**
 * @typedef {Object} AnamnesisFormData
 * @property {IdentificacionData} identificacion
 * @property {MotivoConsultaData} motivo_consulta
 * @property {EnfermedadActualData} enfermedad_actual
 * @property {AntecedentesPersonalesData} antecedentes_personales
 * @property {AntecedentesFamiliaresData} antecedentes_familiares
 * @property {HabitosEstiloVidaData} habitos_estilo_vida
 * @property {RevisionSistemasData} revision_sistemas
 * @property {SaludMentalData} salud_mental
 * @property {PruebasInformesPreviosData} pruebas_informes_previos
 * @property {PercepcionPacienteData} percepcion_paciente
 * @property {boolean} [consentimiento_veracidad]
 */

/**
 * @typedef {keyof AnamnesisFormData} AnamnesisSectionKey
 */

/**
 * @typedef {Object.<AnamnesisSectionKey, Object.<string, string>> & { global?: string }} FormErrors
 */

/**
 * @typedef {Object} AnamnesisFormContextType
 * @property {AnamnesisFormData} formData
 * @property {function(AnamnesisSectionKey, Partial<AnamnesisFormData[AnamnesisSectionKey]>): void} updateFormData
 * @property {number} currentSection
 * @property {function(number): void} setCurrentSection
 * @property {FormErrors} errors
 * @property {React.Dispatch<React.SetStateAction<FormErrors>>} setErrors
 * @property {function(AnamnesisSectionKey): boolean} validateSection
 * @property {function(AnamnesisSectionKey): boolean} isSectionComplete
 * @property {number} totalSections
 */

/**
 * @typedef {Object} SectionProps
 * @property {any} data - Specific data type for the section, e.g., IdentificacionData
 * @property {function(Partial<any>): void} updateData - Specific update function
 * @property {function(string, string): void} setSectionError - To set errors for specific fields
 * @property {function(string): void} clearSectionError - To clear errors for specific fields
 * @property {AnamnesisSectionKey} sectionKey - To identify the section
 */
