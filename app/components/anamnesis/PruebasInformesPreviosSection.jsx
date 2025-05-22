import { useEffect } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';

/**
 * @param {object} props
 * @param {import('../../../types/anamnesis').PruebasInformesPreviosData} props.data
 * @param {function(Partial<import('../../../types/anamnesis').PruebasInformesPreviosData>): void} props.updateData
 * @param {function(string, string): void} props.setSectionError
 * @param {function(string): void} props.clearSectionError
 * @param {import('../../../types/anamnesis').AnamnesisSectionKey} props.sectionKey
 */
const PruebasInformesPreviosSection = ({
  data,
  updateData,
  setSectionError,
  clearSectionError,
}) => {
  // Assuming 'pruebas' should be component state, potentially initialized from 'data' or empty
  const [pruebas, setPruebas] = React.useState(data?.pruebas_informes_previos || []);

  useEffect(() => {
    updateData({ pruebas });
  }, [pruebas, updateData]);

  const handlePruebaChange = (index, field, value) => {
    const newList = [...pruebas];
    newList[index][field] = value;
    setPruebas(newList);
  };

  const handleAddPrueba = () => {
    setPruebas([...pruebas, { tipo_prueba: '', fecha_realizacion: '', lugar: '', motivo: '', resultados_paciente: '', archivo_adjunto_url: null }]);
  };

  const handleRemovePrueba = (index) => {
    const newList = pruebas.filter((_, i) => i !== index);
    setPruebas(newList.length > 0 ? newList : []);
  };

  // Placeholder para upload de archivos
  const handleFileChange = (index, file) => {
    // Aquí solo guardamos el nombre del archivo, la lógica real de upload se implementa aparte
    const newList = [...pruebas];
    newList[index].archivo_adjunto_url = file ? file.name : '';
    setPruebas(newList);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">9. Pruebas e Informes Médicos Previos</h2>
      <p className="text-gray-600 mb-6">
        Agregue aquí los estudios, análisis o informes médicos previos relevantes. Puede adjuntar archivos si los tiene disponibles.
      </p>
      {pruebas.map((prueba, index) => (
        <div key={index} className="p-4 border rounded-md mb-4 bg-gray-50 relative">
          <h3 className="text-md font-medium text-gray-700 mb-3">Prueba/Informe #{index + 1}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Input
              label="Tipo de Prueba/Informe"
              name={`tipo_prueba-${index}`}
              value={prueba.tipo_prueba}
              onChange={(e) => handlePruebaChange(index, 'tipo_prueba', e.target.value)}
              placeholder="Ej: Análisis de sangre, Radiografía, Informe de especialista"
              className="mb-2"
            />
            <Input
              label="Fecha de Realización"
              name={`fecha_realizacion-${index}`}
              type="date"
              value={prueba.fecha_realizacion}
              onChange={(e) => handlePruebaChange(index, 'fecha_realizacion', e.target.value)}
              className="mb-2"
            />
            <Input
              label="Lugar de Realización"
              name={`lugar-${index}`}
              value={prueba.lugar}
              onChange={(e) => handlePruebaChange(index, 'lugar', e.target.value)}
              placeholder="Ej: Laboratorio Central, Clínica X"
              className="mb-2"
            />
            <Input
              label="Motivo de la Prueba"
              name={`motivo-${index}`}
              value={prueba.motivo}
              onChange={(e) => handlePruebaChange(index, 'motivo', e.target.value)}
              placeholder="Ej: Chequeo anual, dolor abdominal"
              className="mb-2"
            />
          </div>
          <Textarea
            label="Resultados principales (según el paciente)"
            name={`resultados_paciente-${index}`}
            value={prueba.resultados_paciente}
            onChange={(e) => handlePruebaChange(index, 'resultados_paciente', e.target.value)}
            rows={2}
            placeholder="Describa brevemente los hallazgos principales o el diagnóstico si lo conoce."
            className="mb-2"
          />
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adjuntar archivo (opcional)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(index, e.target.files[0])}
              className="block w-full text-sm text-gray-600"
            />
            {prueba.archivo_adjunto_url && (
              <span className="text-xs text-green-600 mt-1 block">Archivo: {prueba.archivo_adjunto_url}</span>
            )}
          </div>
          {pruebas.length > 1 && (
            <Button
              variant="danger"
              onClick={() => handleRemovePrueba(index)}
              className="text-sm mt-2"
            >
              Quitar Prueba/Informe
            </Button>
          )}
        </div>
      ))}
      <Button onClick={handleAddPrueba} variant="secondary" className="mt-2 text-sm">
        + Añadir Otra Prueba/Informe
      </Button>
    </div>
  );
};

export default PruebasInformesPreviosSection;
