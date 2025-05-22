'use client';
import FormField from '@/app/components/ui/FormField';

// Helper component for each symptom entry
const SymptomEntry = ({ system, symptom, formData, handleSymptomChange, handleSymptomDetailsChange }) => {
  const symptomData = formData[system]?.[symptom.id] || { presente: false, detalles: '' };

  return (
    <div className="border-b border-gray-200 pb-3 last:border-b-0">
      <div className="flex items-center justify-between">
        <label htmlFor={`${system}-${symptom.id}-presente`} className="text-sm text-gray-700 flex-1">
          {symptom.label}
        </label>
        <div className="flex items-center space-x-3">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name={`${system}-${symptom.id}-respuesta`}
              checked={symptomData.presente === true}
              onChange={() => handleSymptomChange(system, symptom.id, true)}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm">Sí</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name={`${system}-${symptom.id}-respuesta`}
              checked={symptomData.presente === false}
              onChange={() => handleSymptomChange(system, symptom.id, false)}
              className="form-radio h-4 w-4 text-gray-500"
            />
            <span className="ml-2 text-sm">No</span>
          </label>
        </div>
      </div>
      {symptomData.presente && (
        <div className="mt-2 pl-4">
          <FormField
            label="Detalles (opcional)"
            name={`${system}-${symptom.id}-detalles`}
            type="textarea"
            value={symptomData.detalles}
            onChange={(e) => handleSymptomDetailsChange(system, symptom.id, e.target.value)}
            placeholder="Ej: Desde cuándo, intensidad, qué lo mejora/empeora..."
            rows={2}
            tooltip="Proporcione más información sobre este síntoma si es necesario."
          />
        </div>
      )}
    </div>
  );
};

const RevisionSistemasForm = ({ formData = {}, updateData, errors = {}, setErrors }) => {
  // Helper para manejar cambios en campos anidados dentro de cada sistema
  const handleSystemChange = (system, field, value, type = 'text') => {
    const val = type === 'checkbox' ? !formData[system]?.[field] : value;
    updateData({
      [system]: {
        ...(formData[system] || {}),
        [field]: val,
      },
    });
  };

  // Helper para manejar el estado "presente" de un síntoma y los detalles
  const handleSymptomChange = (system, symptom, isPresent) => {
    updateData({
      [system]: {
        ...(formData[system] || {}),
        [symptom]: {
          presente: isPresent,
          detalles: isPresent ? formData[system]?.[symptom]?.detalles || '' : '',
        },
      },
    });
  };

  const handleSymptomDetailsChange = (system, symptom, detalles) => {
    updateData({
      [system]: {
        ...(formData[system] || {}),
        [symptom]: {
          ...(formData[system]?.[symptom] || { presente: false }),
          detalles: detalles,
        },
      },
    });
  };

  // Definición de los sistemas y sus síntomas comunes
  const systems = [
    {
      id: 'general',
      name: 'Síntomas Generales',
      symptoms: [
        { id: 'fiebre', label: 'Fiebre o escalofríos' },
        { id: 'perdida_peso', label: 'Pérdida de peso inexplicable' },
        { id: 'fatiga', label: 'Fatiga o cansancio excesivo' },
        { id: 'sudoracion_nocturna', label: 'Sudoración nocturna' },
        { id: 'cambios_apetito', label: 'Cambios en el apetito' },
      ],
    },
    {
      id: 'piel',
      name: 'Piel y Anexos',
      symptoms: [
        { id: 'erupciones', label: 'Erupciones o rash' },
        { id: 'prurito', label: 'Picazón (prurito)' },
        { id: 'cambios_lunares', label: 'Cambios en lunares o manchas' },
        { id: 'sequedad_excesiva', label: 'Sequedad excesiva o sudoración' },
        { id: 'caida_cabello_unas', label: 'Caída de cabello o cambios en uñas' },
      ],
    },
    {
      id: 'cabeza_cuello',
      name: 'Cabeza y Cuello',
      symptoms: [
        { id: 'dolor_cabeza_inusual', label: 'Dolor de cabeza inusual o severo' },
        { id: 'mareos_vertigo', label: 'Mareos o vértigo' },
        { id: 'problemas_vision', label: 'Problemas de visión (visión borrosa, doble, pérdida)' },
        { id: 'problemas_audicion', label: 'Problemas de audición (pérdida, zumbidos)' },
        { id: 'dolor_garganta_frecuente', label: 'Dolor de garganta frecuente o dificultad para tragar' },
        { id: 'bultos_cuello', label: 'Bultos o ganglios inflamados en el cuello' },
        { id: 'congestion_nasal_cronica', label: 'Congestión nasal crónica o secreción' },
      ],
    },
    {
      id: 'respiratorio',
      name: 'Sistema Respiratorio',
      symptoms: [
        { id: 'tos_persistente', label: 'Tos persistente' },
        { id: 'falta_aire', label: 'Falta de aire (disnea) en reposo o esfuerzo' },
        { id: 'dolor_pecho_respirar', label: 'Dolor en el pecho al respirar o toser' },
        { id: 'sibilancias', label: 'Silbidos en el pecho (sibilancias)' },
        { id: 'expectoracion_sangre', label: 'Expectoración con sangre (hemoptisis)' },
      ],
    },
    {
      id: 'cardiovascular',
      name: 'Sistema Cardiovascular',
      symptoms: [
        { id: 'dolor_pecho_opresion', label: 'Dolor u opresión en el pecho' },
        { id: 'palpitaciones', label: 'Palpitaciones (latidos fuertes o irregulares)' },
        { id: 'hinchazon_piernas', label: 'Hinchazón en piernas o tobillos (edema)' },
        { id: 'dificultad_respirar_acostado', label: 'Dificultad para respirar al estar acostado (ortopnea)' },
        { id: 'desmayos', label: 'Desmayos o pérdida de conocimiento (síncope)' },
        { id: 'dolor_piernas_caminar', label: 'Dolor en las piernas al caminar (claudicación)' },
      ]
    },
    {
      id: 'gastrointestinal',
      name: 'Sistema Gastrointestinal',
      symptoms: [
        { id: 'dolor_abdominal', label: 'Dolor abdominal frecuente o severo' },
        { id: 'nauseas_vomitos', label: 'Náuseas o vómitos persistentes' },
        { id: 'acidez_reflujo', label: 'Acidez o reflujo gastroesofágico frecuente' },
        { id: 'cambios_habito_intestinal', label: 'Cambios en el hábito intestinal (diarrea, estreñimiento)' },
        { id: 'sangre_heces', label: 'Sangre en las heces o heces negras' },
        { id: 'dificultad_tragar_disfagia', label: 'Dificultad para tragar (disfagia)' },
        { id: 'ictericia', label: 'Ictericia (coloración amarilla de piel u ojos)' },
      ]
    },
    {
      id: 'genitourinario',
      name: 'Sistema Genitourinario',
      symptoms: [
        { id: 'dolor_orinar', label: 'Dolor o ardor al orinar (disuria)' },
        { id: 'aumento_frecuencia_urinaria', label: 'Aumento de la frecuencia urinaria' },
        { id: 'sangre_orina', label: 'Sangre en la orina (hematuria)' },
        { id: 'dificultad_iniciar_miccion', label: 'Dificultad para iniciar la micción o chorro débil' },
        { id: 'incontinencia_urinaria', label: 'Incontinencia urinaria' },
        { id: 'dolor_lumbar_costados', label: 'Dolor lumbar o en los costados (sugestivo renal)' },
        { id: 'secrecion_genital_inusual', label: 'Secreción genital inusual (uretral/vaginal)' },
        { id: 'dolor_testicular_pelvico', label: 'Dolor testicular o pélvico (según corresponda)' },
      ]
    },
    {
      id: 'musculoesqueletico',
      name: 'Sistema Musculoesquelético',
      symptoms: [
        { id: 'dolor_articular', label: 'Dolor en articulaciones' },
        { id: 'rigidez_articular', label: 'Rigidez articular, especialmente matutina' },
        { id: 'hinchazon_articular', label: 'Hinchazón en articulaciones' },
        { id: 'debilidad_muscular', label: 'Debilidad muscular' },
        { id: 'dolor_espalda_cronico', label: 'Dolor de espalda crónico o severo' },
      ]
    },
    {
      id: 'neurologico',
      name: 'Sistema Neurológico',
      symptoms: [
        { id: 'perdida_fuerza_motora', label: 'Pérdida de fuerza o parálisis en alguna parte del cuerpo' },
        { id: 'hormigueo_adormecimiento', label: 'Hormigueo o adormecimiento persistente' },
        { id: 'temblores', label: 'Temblores' },
        { id: 'convulsiones', label: 'Convulsiones' },
        { id: 'dificultad_habla_lenguaje', label: 'Dificultad para hablar o entender el lenguaje' },
        { id: 'problemas_memoria_concentracion', label: 'Problemas de memoria o concentración significativos' },
        { id: 'alteraciones_marcha_equilibrio', label: 'Alteraciones de la marcha o equilibrio' },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <h3 className="text-md font-medium text-blue-800 mb-1">Revisión por Sistemas</h3>
        <p className="text-sm text-blue-600">
          Por favor, indique si ha experimentado alguno de los siguientes síntomas recientemente.
          Si marca &quot;Sí&quot;, por favor proporcione breves detalles.
        </p>
      </div>

      {systems.map((system) => (
        <div key={system.id} className="border rounded-md p-4 shadow-sm bg-white">
          <h4 className="text-lg font-semibold text-gray-700 mb-3">{system.name}</h4>
          <div className="space-y-4">
            {system.symptoms.map((symptom) => (
              <SymptomEntry
                key={symptom.id}
                system={system.id}
                symptom={symptom}
                formData={formData}
                handleSymptomChange={handleSymptomChange}
                handleSymptomDetailsChange={handleSymptomDetailsChange}
              />
            ))}
            {/* Campo general de Otros síntomas para el sistema */}
            <FormField
              label={`Otros síntomas en ${system.name.toLowerCase()} no listados`}
              name={`${system.id}-otros_sintomas_detalles`}
              type="textarea"
              value={formData[system.id]?.otros_sintomas_detalles || ''}
              onChange={(e) => handleSystemChange(system.id, 'otros_sintomas_detalles', e.target.value)}
              placeholder="Describa brevemente cualquier otro síntoma relevante para este sistema."
              rows={2}
            />
          </div>
        </div>
      ))}

      <FormField
        label="¿Algún otro síntoma o problema de salud no mencionado anteriormente que le preocupe?"
        name="revision_sistemas_comentarios_adicionales"
        type="textarea"
        value={formData.revision_sistemas_comentarios_adicionales || ''}
        onChange={(e) => updateData({ revision_sistemas_comentarios_adicionales: e.target.value })}
        placeholder="Si tiene algo más que agregar sobre su estado de salud general, por favor indíquelo aquí."
        rows={3}
      />
    </div>
  );
};

export default RevisionSistemasForm;
