import { useToast } from '@/app/components/ui/Toast';

const AntecedentesGinecoForm = ({ formData, onChange, patientData }) => {
  const toast = useToast();

  const handleSave = () => {
    if (!formData.menarca || !formData.cicloMenstrual) {
      toast.warning('Debe completar los campos de menarca y ciclo menstrual');
      return;
    }
    onChange(formData);
    toast.success('Antecedentes gineco-obstétricos guardados');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Antecedentes Gineco-Obstétricos</h3>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha de Última Menstruación</label>
          <input
            type="date"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Número de Embarazos</label>
          <input
            type="number"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            placeholder="Ej: 2"
          />
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="radio"
              name="gestas-1"
              value="Parto Vaginal"
            />
            <span className="ml-2">Parto Vaginal</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="gestas-1"
              value="Cesárea"
            />
            <span className="ml-2">Cesárea</span>
          </label>
        </div>
        <div className="mt-6">
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white transition rounded-lg shadow bg-primary hover:bg-primary/90"
          >
            Guardar Antecedentes Gineco-Obstétricos
          </button>
        </div>
      </form>
    </div>
  );
};

export default AntecedentesGinecoForm;
