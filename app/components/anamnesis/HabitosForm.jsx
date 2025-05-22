'use client';
import FormField from '@/app/components/ui/FormField';

// Componente para una sección específica de hábito
const HabitSection = ({ title, children, description = null }) => {
  return (
    <div className="mb-6 overflow-hidden bg-white border border-gray-200 rounded-lg">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h4 className="font-medium text-gray-900">{title}</h4>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

const HabitosForm = ({ formData = {}, updateData, errors = {} }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateData({ [name]: type === 'checkbox' ? checked : value });
  };

  const tabaquismismoOptions = [
    { value: 'no_fumador', label: 'No fumador' },
    { value: 'ex_fumador', label: 'Ex-fumador' },
    { value: 'fumador_actual', label: 'Fumador actual' }
  ];

  const alcoholOptions = [
    { value: 'nunca', label: 'Nunca' },
    { value: 'ocasional', label: 'Ocasional (eventos sociales)' },
    { value: 'semanal', label: 'Semanal (1-2 veces/semana)' },
    { value: 'frecuente', label: 'Frecuente (3+ veces/semana)' },
    { value: 'diario', label: 'Diario' }
  ];

  const alimentacionOptions = [
    { value: 'muy_saludable', label: 'Muy saludable (balanceada, natural, variada)' },
    { value: 'saludable', label: 'Saludable (generalmente balanceada)' },
    { value: 'regular', label: 'Regular (a veces balanceada)' },
    { value: 'poco_saludable', label: 'Poco saludable (frecuentemente comida procesada)' },
    { value: 'muy_poco_saludable', label: 'Muy poco saludable (alta en grasas/azúcares)' }
  ];

  const actividadFisicaOptions = [
    { value: 'sedentario', label: 'Sedentario (poco o ningún ejercicio)' },
    { value: 'ligero', label: 'Ligero (ejercicio leve 1-2 veces/semana)' },
    { value: 'moderado', label: 'Moderado (ejercicio 3-5 veces/semana)' },
    { value: 'activo', label: 'Activo (ejercicio intenso regularmente)' },
    { value: 'muy_activo', label: 'Muy activo (ejercicio intenso diario o atleta)' }
  ];

  const suenoOptions = [
    { value: 'excelente', label: 'Excelente (7-9 horas, descanso reparador)' },
    { value: 'bueno', label: 'Bueno (cantidad adecuada, algo variable)' },
    { value: 'regular', label: 'Regular (a veces suficiente, a veces no)' },
    { value: 'malo', label: 'Malo (poco sueño, no reparador)' },
    { value: 'muy_malo', label: 'Muy malo (insomnio, problemas crónicos)' }
  ];

  const estresOptions = [
    { value: 'muy_bajo', label: 'Muy bajo (raramente me siento estresado)' },
    { value: 'bajo', label: 'Bajo (ocasionalmente siento estrés)' },
    { value: 'moderado', label: 'Moderado (estrés regular pero manejable)' },
    { value: 'alto', label: 'Alto (frecuentemente estresado)' },
    { value: 'muy_alto', label: 'Muy alto (estrés crónico severo)' }
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 border border-blue-100 rounded-md bg-blue-50">
        <h3 className="mb-1 font-medium text-blue-800 text-md">Hábitos y Estilo de Vida</h3>
        <p className="text-sm text-blue-600">
          La información sobre sus hábitos y estilo de vida ayuda a su médico a entender factores que pueden afectar su salud.
          Por favor, responda con sinceridad para obtener una evaluación más precisa.
        </p>
      </div>

      <HabitSection
        title="Tabaquismo"
        description="Información sobre consumo de tabaco actual o pasado"
      >
        <FormField
          label="Estado de tabaquismo"
          name="estado_tabaquismo"
          type="radio-group"
          value={formData.estado_tabaquismo}
          onChange={handleChange}
          error={errors.estado_tabaquismo}
          options={tabaquismismoOptions}
        />

        {formData.estado_tabaquismo === 'fumador_actual' && (
          <>
            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
              <FormField
                label="Cigarrillos por día (promedio)"
                name="cigarrillos_dia"
                type="number"
                value={formData.cigarrillos_dia}
                onChange={handleChange}
                error={errors.cigarrillos_dia}
                placeholder="Ej: 10"
              />

              <FormField
                label="Años fumando"
                name="anos_fumando"
                type="number"
                value={formData.anos_fumando}
                onChange={handleChange}
                error={errors.anos_fumando}
                placeholder="Ej: 5"
              />
            </div>

            <FormField
              label="Intención de dejar de fumar"
              name="intencion_dejar"
              type="select"
              value={formData.intencion_dejar}
              onChange={handleChange}
              error={errors.intencion_dejar}
              options={[
                { value: 'no_interesado', label: 'No interesado en dejar de fumar' },
                { value: 'considerando', label: 'Considerando dejarlo en el futuro' },
                { value: 'planeando', label: 'Planeando dejarlo pronto' },
                { value: 'intentando', label: 'Intentando dejarlo actualmente' }
              ]}
            />
          </>
        )}

        {formData.estado_tabaquismo === 'ex_fumador' && (
          <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
            <FormField
              label="Cigarrillos por día que fumaba (promedio)"
              name="cigarrillos_dia_antes"
              type="number"
              value={formData.cigarrillos_dia_antes}
              onChange={handleChange}
              error={errors.cigarrillos_dia_antes}
            />

            <FormField
              label="Años que fumó"
              name="anos_fumando_antes"
              type="number"
              value={formData.anos_fumando_antes}
              onChange={handleChange}
              error={errors.anos_fumando_antes}
            />

            <FormField
              label="Hace cuánto dejó de fumar (años)"
              name="anos_sin_fumar"
              type="number"
              value={formData.anos_sin_fumar}
              onChange={handleChange}
              error={errors.anos_sin_fumar}
            />
          </div>
        )}

        <FormField
          label="¿Exposición a humo de segunda mano?"
          name="humo_segunda_mano"
          type="checkbox"
          value={formData.humo_segunda_mano}
          onChange={handleChange}
          error={errors.humo_segunda_mano}
        />

        {formData.humo_segunda_mano && (
          <FormField
            label="Detalles sobre exposición a humo de segunda mano"
            name="detalles_humo_segunda_mano"
            type="textarea"
            value={formData.detalles_humo_segunda_mano}
            onChange={handleChange}
            error={errors.detalles_humo_segunda_mano}
            placeholder="Ej: Exposición en el hogar, trabajo, frecuencia..."
            rows={2}
          />
        )}
      </HabitSection>

      <HabitSection
        title="Consumo de Alcohol"
        description="Información sobre consumo de bebidas alcohólicas"
      >
        <FormField
          label="Frecuencia de consumo de alcohol"
          name="frecuencia_alcohol"
          type="radio-group"
          value={formData.frecuencia_alcohol}
          onChange={handleChange}
          error={errors.frecuencia_alcohol}
          options={alcoholOptions}
        />

        {formData.frecuencia_alcohol && formData.frecuencia_alcohol !== 'nunca' && (
          <>
            <FormField
              label="Cantidad típica por ocasión (número de bebidas)"
              name="cantidad_alcohol"
              type="number"
              value={formData.cantidad_alcohol}
              onChange={handleChange}
              error={errors.cantidad_alcohol}
              placeholder="Ej: 2"
              tooltip="1 bebida = 1 vaso de vino, 1 cerveza o 1 trago de licor"
            />

            <FormField
              label="Tipo de bebidas que consume habitualmente"
              name="tipos_alcohol"
              type="textarea"
              value={formData.tipos_alcohol}
              onChange={handleChange}
              error={errors.tipos_alcohol}
              placeholder="Ej: Cerveza, vino tinto, whisky..."
              rows={1}
            />
          </>
        )}
      </HabitSection>

      <HabitSection title="Otras Sustancias">
        <FormField
          label="¿Consume o ha consumido regularmente otras sustancias?"
          name="consumo_otras_sustancias"
          type="checkbox"
          value={formData.consumo_otras_sustancias}
          onChange={handleChange}
          error={errors.consumo_otras_sustancias}
        />

        {formData.consumo_otras_sustancias && (
          <FormField
            label="Detalles sobre consumo de otras sustancias"
            name="detalles_otras_sustancias"
            type="textarea"
            value={formData.detalles_otras_sustancias}
            onChange={handleChange}
            error={errors.detalles_otras_sustancias}
            placeholder="Especifique sustancias, frecuencia y duración del consumo..."
            rows={3}
            tooltip="Esta información es confidencial y solo se utiliza para su tratamiento médico"
          />
        )}
      </HabitSection>

      <HabitSection title="Alimentación">
        <FormField
          label="Autoevaluación de su alimentación"
          name="calidad_alimentacion"
          type="radio-group"
          value={formData.calidad_alimentacion}
          onChange={handleChange}
          error={errors.calidad_alimentacion}
          options={alimentacionOptions}
        />

        <div className="mt-4 space-y-4">
          <FormField
            label="Número de comidas por día (promedio)"
            name="comidas_dia"
            type="number"
            value={formData.comidas_dia}
            onChange={handleChange}
            error={errors.comidas_dia}
            placeholder="Ej: 3"
          />

          <FormField
            label="¿Sigue alguna dieta especial?"
            name="dieta_especial"
            type="checkbox"
            value={formData.dieta_especial}
            onChange={handleChange}
            error={errors.dieta_especial}
          />

          {formData.dieta_especial && (
            <FormField
              label="Describa su dieta especial"
              name="descripcion_dieta"
              type="textarea"
              value={formData.descripcion_dieta}
              onChange={handleChange}
              error={errors.descripcion_dieta}
              placeholder="Ej: Vegetariana, vegana, sin gluten, baja en carbohidratos..."
              rows={2}
            />
          )}

          <FormField
            label="¿Tiene intolerancias o restricciones alimentarias?"
            name="restricciones_alimentarias"
            type="textarea"
            value={formData.restricciones_alimentarias}
            onChange={handleChange}
            error={errors.restricciones_alimentarias}
            placeholder="Ej: Intolerancia a la lactosa, alergia a frutos secos..."
            rows={2}
          />

          <FormField
            label="Consumo típico de agua (vasos por día)"
            name="consumo_agua"
            type="number"
            value={formData.consumo_agua}
            onChange={handleChange}
            error={errors.consumo_agua}
            placeholder="Ej: 8"
          />
        </div>
      </HabitSection>

      <HabitSection title="Actividad Física">
        <FormField
          label="Nivel de actividad física"
          name="nivel_actividad"
          type="radio-group"
          value={formData.nivel_actividad}
          onChange={handleChange}
          error={errors.nivel_actividad}
          options={actividadFisicaOptions}
        />

        {formData.nivel_actividad && formData.nivel_actividad !== 'sedentario' && (
          <>
            <FormField
              label="Tipo de actividad física que realiza"
              name="tipo_ejercicio"
              type="textarea"
              value={formData.tipo_ejercicio}
              onChange={handleChange}
              error={errors.tipo_ejercicio}
              placeholder="Ej: Caminar, correr, gimnasio, natación, ciclismo..."
              rows={2}
            />

            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
              <FormField
                label="Frecuencia semanal (días)"
                name="frecuencia_ejercicio"
                type="number"
                value={formData.frecuencia_ejercicio}
                onChange={handleChange}
                error={errors.frecuencia_ejercicio}
                placeholder="Ej: 3"
              />

              <FormField
                label="Duración por sesión (minutos)"
                name="duracion_ejercicio"
                type="number"
                value={formData.duracion_ejercicio}
                onChange={handleChange}
                error={errors.duracion_ejercicio}
                placeholder="Ej: 45"
              />
            </div>
          </>
        )}

        <FormField
          label="Actividad en trabajo/ocupación diaria"
          name="actividad_ocupacional"
          type="select"
          value={formData.actividad_ocupacional}
          onChange={handleChange}
          error={errors.actividad_ocupacional}
          options={[
            { value: 'sedentario', label: 'Sedentaria (sentado la mayoría del tiempo)' },
            { value: 'ligero', label: 'Ligera (mayormente de pie, poca actividad)' },
            { value: 'moderado', label: 'Moderada (caminar frecuentemente, algo de actividad)' },
            { value: 'intenso', label: 'Intensa (trabajo físico constante)' }
          ]}
        />
      </HabitSection>

      <HabitSection title="Sueño">
        <FormField
          label="Calidad general del sueño"
          name="calidad_sueno"
          type="radio-group"
          value={formData.calidad_sueno}
          onChange={handleChange}
          error={errors.calidad_sueno}
          options={suenoOptions}
        />

        <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
          <FormField
            label="Horas de sueño por noche (promedio)"
            name="horas_sueno"
            type="number"
            value={formData.horas_sueno}
            onChange={handleChange}
            error={errors.horas_sueno}
            placeholder="Ej: 7"
          />

          <FormField
            label="Hora habitual de acostarse"
            name="hora_acostarse"
            type="time"
            value={formData.hora_acostarse}
            onChange={handleChange}
            error={errors.hora_acostarse}
          />
        </div>

        <FormField
          label="¿Tiene problemas para dormir?"
          name="problemas_sueno"
          type="checkbox"
          value={formData.problemas_sueno}
          onChange={handleChange}
          error={errors.problemas_sueno}
        />

        {formData.problemas_sueno && (
          <FormField
            label="Describa sus problemas de sueño"
            name="descripcion_problemas_sueno"
            type="textarea"
            value={formData.descripcion_problemas_sueno}
            onChange={handleChange}
            error={errors.descripcion_problemas_sueno}
            placeholder="Ej: Dificultad para conciliar el sueño, despertares frecuentes, ronquidos..."
            rows={2}
          />
        )}
      </HabitSection>

      <HabitSection title="Nivel de Estrés">
        <FormField
          label="Nivel de estrés habitual"
          name="nivel_estres"
          type="radio-group"
          value={formData.nivel_estres}
          onChange={handleChange}
          error={errors.nivel_estres}
          options={estresOptions}
        />

        {formData.nivel_estres && ['alto', 'muy_alto'].includes(formData.nivel_estres) && (
          <>
            <FormField
              label="Principales fuentes de estrés"
              name="fuentes_estres"
              type="textarea"
              value={formData.fuentes_estres}
              onChange={handleChange}
              error={errors.fuentes_estres}
              placeholder="Ej: Trabajo, familia, finanzas, salud..."
              rows={2}
            />

            <FormField
              label="¿Qué técnicas utiliza para manejar el estrés?"
              name="manejo_estres"
              type="textarea"
              value={formData.manejo_estres}
              onChange={handleChange}
              error={errors.manejo_estres}
              placeholder="Ej: Meditación, ejercicio, terapia..."
              rows={2}
            />
          </>
        )}
      </HabitSection>

      <FormField
        label="Información adicional sobre sus hábitos"
        name="informacion_adicional_habitos"
        type="textarea"
        value={formData.informacion_adicional_habitos}
        onChange={handleChange}
        error={errors.informacion_adicional_habitos}
        placeholder="Cualquier otra información relevante sobre sus hábitos o estilo de vida..."
        rows={3}
      />
    </div>
  );
};

export default HabitosForm;
