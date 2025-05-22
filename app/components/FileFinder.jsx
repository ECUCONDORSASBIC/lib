import { useState } from 'react';
import { FiFile, FiFolder, FiSearch } from 'react-icons/fi';

export default function FileFinder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPath, setSearchPath] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchPath) {
      setError('La ruta de búsqueda es requerida');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/search-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          path: searchPath,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al realizar la búsqueda');
      }

      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Buscador de Archivos y Carpetas</h1>

      <form onSubmit={handleSearch} className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="flex-grow">
            <label htmlFor="path" className="block text-sm font-medium text-gray-700 mb-1">
              Ruta de búsqueda
            </label>
            <input
              id="path"
              type="text"
              value={searchPath}
              onChange={(e) => setSearchPath(e.target.value)}
              placeholder="Ej: C:/Users/miUsuario/Documentos"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="flex-grow">
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
              Término de búsqueda (opcional)
            </label>
            <input
              id="query"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nombre de archivo o carpeta"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center disabled:opacity-50"
          >
            {isLoading ? 'Buscando...' : <><FiSearch className="mr-2" />Buscar</>}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="border border-gray-200 rounded-md shadow-sm">
          <h2 className="text-lg font-medium px-4 py-3 bg-gray-50 border-b border-gray-200">
            Resultados ({results.length})
          </h2>
          <ul className="divide-y divide-gray-200">
            {results.map((item, index) => (
              <li key={index} className="px-4 py-3 hover:bg-gray-50">
                <div className="flex items-start">
                  {item.isDirectory ? (
                    <FiFolder className="h-5 w-5 text-yellow-500 mr-3 mt-1" />
                  ) : (
                    <FiFile className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.path}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {results.length === 0 && !isLoading && searchPath && !error && (
        <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
          <p className="text-gray-500">No se encontraron resultados para tu búsqueda.</p>
        </div>
      )}
    </div>
  );
}
