import { deleteObject, getDownloadURL, getStorage, listAll, ref, uploadBytes } from 'firebase/storage';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Importación temporal para simulación - en producción usaría la autenticación real
const getCurrentUser = () => Promise.resolve({ uid: 'test-patient-id' });

// Componentes UI
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import Button from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import Select from '../../../components/ui/select';
import { Spinner } from '../../../components/ui/Spinner';

// Iconos
import {
  Download,
  Eye,
  FileText,
  RefreshCw,
  Search,
  Share2,
  Trash2,
  Upload
} from 'lucide-react';

const DocumentsHistory = ({ patientId }) => {
  const params = useParams();
  const id = patientId || params?.id;

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewUrl, setViewUrl] = useState('');

  // Filtros y ordenamiento
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Formulario de subida
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  // Formulario de compartir
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    if (id) {
      fetchDocuments();
    }
  }, [id]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      // En un entorno real, esto sería una llamada a la API
      const storage = getStorage();
      const listRef = ref(storage, `patients/${id}/documents`);

      const res = await listAll(listRef);

      const docsPromises = res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);

        // Extraer información del nombre del archivo
        const nameParts = itemRef.name.split('_');
        const datePart = nameParts[nameParts.length - 1].split('.')[0];
        const category = nameParts[0];
        const extension = itemRef.name.split('.').pop().toLowerCase();

        return {
          id: itemRef.name,
          name: itemRef.name,
          type: extension,
          size: 1024000, // Tamaño simulado
          uploadDate: `2025-${datePart.substring(0, 2)}-${datePart.substring(2, 4)}T10:30:00Z`,
          description: `${category} - ${nameParts.slice(1, -1).join(' ')}`,
          category: category,
          url: url
        };
      });

      const docsData = await Promise.all(docsPromises);
      setDocuments(docsData);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Error al cargar los documentos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Por favor seleccione un archivo');
      return;
    }

    setUploadError(null);
    setUploadProgress(0);

    try {
      const storage = getStorage();
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
      const fileName = `${category || 'general'}_${file.name.split('.')[0]}_${timestamp}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `patients/${id}/documents/${fileName}`);

      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      await uploadBytes(storageRef, file);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadSuccess(true);

      // Limpiar formulario
      setFile(null);
      setDescription('');
      setCategory('');

      // Recargar documentos
      setTimeout(() => {
        fetchDocuments();
        setShowUploadModal(false);
        setUploadSuccess(false);
        setUploadProgress(0);
      }, 1500);

    } catch (err) {
      console.error('Error uploading document:', err);
      setUploadError('Error al subir el documento. Intente nuevamente.');
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;

    try {
      const storage = getStorage();
      const docRef = ref(storage, `patients/${id}/documents/${selectedDocument.name}`);

      await deleteObject(docRef);

      // Actualizar lista de documentos
      setDocuments(prev => prev.filter(doc => doc.id !== selectedDocument.id));
      setShowDeleteConfirm(false);
      setSelectedDocument(null);

    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Error al eliminar el documento. Intente nuevamente.');
    }
  };

  const handleView = async (document) => {
    setSelectedDocument(document);
    setViewUrl(document.url);
    setShowViewModal(true);
  };

  const handleShare = async () => {
    if (!selectedDocument || !selectedDoctor) {
      return;
    }

    // En un entorno real, esto sería una llamada a la API
    try {
      // Simular compartir documento
      console.log(`Compartiendo documento ${selectedDocument.name} con doctor ${selectedDoctor}`);

      // Actualizar documento con información de compartido
      setDocuments(prev => prev.map(doc => {
        if (doc.id === selectedDocument.id) {
          return {
            ...doc,
            sharedWith: {
              doctorId: selectedDoctor,
              doctorName: doctors.find(d => d.id === selectedDoctor)?.name || 'Doctor',
              sharedAt: new Date().toISOString()
            }
          };
        }
        return doc;
      }));

      // Limpiar formulario
      setSelectedDoctor('');
      setShareMessage('');
      setShowShareModal(false);
      setSelectedDocument(null);

    } catch (err) {
      console.error('Error sharing document:', err);
      setError('Error al compartir el documento. Intente nuevamente.');
    }
  };

  const openShareModal = (document) => {
    setSelectedDocument(document);

    // En un entorno real, esto sería una llamada a la API
    // Simular carga de médicos
    setDoctors([
      { id: 'doc-1', name: 'Dra. Ana Martínez', specialty: 'Cardiología' },
      { id: 'doc-2', name: 'Dr. Carlos Ramírez', specialty: 'Neurología' }
    ]);

    setShowShareModal(true);
  };

  // Filtrar y ordenar documentos
  const filteredAndSortedDocuments = documents
    .filter(doc => {
      // Filtrar por tipo
      if (filterType && doc.type !== filterType) return false;

      // Filtrar por categoría
      if (filterCategory && doc.category !== filterCategory) return false;

      // Filtrar por término de búsqueda
      if (searchTerm && !doc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !doc.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Ordenar por fecha (más reciente primero)
      if (sortBy === 'date_desc') {
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      }
      // Ordenar por fecha (más antiguo primero)
      if (sortBy === 'date_asc') {
        return new Date(a.uploadDate) - new Date(b.uploadDate);
      }
      // Ordenar por nombre (A-Z)
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      // Ordenar por nombre (Z-A)
      if (sortBy === 'name_desc') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

  // Obtener categorías únicas para el filtro
  const uniqueCategories = [...new Set(documents.map(doc => doc.category))];

  // Obtener tipos únicos para el filtro
  const uniqueTypes = [...new Set(documents.map(doc => doc.type))];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Historial de Documentos</CardTitle>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2"
        >
          <Upload size={16} />
          Subir Documento
        </Button>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDocuments}
                className="flex items-center gap-1"
              >
                <RefreshCw size={14} />
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Filtros y búsqueda */}
        <div className="flex flex-col gap-3 mb-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar documentos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={filterType}
              onValueChange={setFilterType}
              aria-label="Filtrar por tipo"
            >
              <option value="">Todos los tipos</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type.toUpperCase()}</option>
              ))}
            </Select>

            <Select
              value={filterCategory}
              onValueChange={setFilterCategory}
              aria-label="Filtrar por categoría"
            >
              <option value="">Todas las categorías</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>

            <Select
              value={sortBy}
              onValueChange={setSortBy}
              aria-label="Ordenar por"
            >
              <option value="date_desc">Más recientes</option>
              <option value="date_asc">Más antiguos</option>
              <option value="name_asc">Nombre (A-Z)</option>
              <option value="name_desc">Nombre (Z-A)</option>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : filteredAndSortedDocuments.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {documents.length === 0 ?
              'No hay documentos disponibles' :
              'No se encontraron documentos que coincidan con los filtros aplicados'}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredAndSortedDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col justify-between gap-2 py-4 md:flex-row md:items-center"
                data-testid="document-item"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-muted">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{doc.name}</h4>
                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                        {doc.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(doc.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      {doc.sharedWith && (
                        <span className="text-xs text-primary">
                          Compartido con: {doc.sharedWith.doctorName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(doc)}
                    data-testid={`view-button-${doc.id}`}
                  >
                    <Eye size={16} className="mr-1" />
                    Ver
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(doc.url, '_blank')}
                    data-testid={`download-button-${doc.id}`}
                  >
                    <Download size={16} className="mr-1" />
                    Descargar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openShareModal(doc)}
                    data-testid={`share-button-${doc.id}`}
                  >
                    <Share2 size={16} className="mr-1" />
                    Compartir
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDocument(doc);
                      setShowDeleteConfirm(true);
                    }}
                    data-testid={`delete-button-${doc.id}`}
                  >
                    <Trash2 size={16} className="mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Modal de subida de documentos */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir Nuevo Documento</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {uploadError && (
              <Alert variant="destructive">
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {uploadSuccess ? (
              <Alert variant="success" className="border-green-200 bg-green-50">
                <AlertTitle>¡Éxito!</AlertTitle>
                <AlertDescription>Documento subido con éxito</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="file" className="text-sm font-medium">
                    Seleccionar archivo
                  </label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                  />
                  {file && (
                    <p className="text-xs text-muted-foreground">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Descripción
                  </label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción del documento"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Categoría
                  </label>
                  <Select
                    id="category"
                    value={category}
                    onValueChange={setCategory}
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="laboratory">Resultados de laboratorio</option>
                    <option value="radiology">Radiografías</option>
                    <option value="prescription">Recetas médicas</option>
                    <option value="cardiology">Cardiología</option>
                    <option value="other">Otros</option>
                  </Select>
                </div>

                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="w-full h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      {uploadProgress}%
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUploadModal(false)}
              disabled={uploadProgress > 0 && uploadProgress < 100}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploadProgress > 0 || uploadSuccess}
            >
              Subir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de visualización de documentos */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Visor de Documentos</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden border rounded">
            {selectedDocument && (
              <iframe
                src={viewUrl}
                className="w-full h-[calc(80vh-10rem)]"
                title={selectedDocument.name}
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>
              Cerrar
            </Button>
            {selectedDocument && (
              <Button onClick={() => window.open(viewUrl, '_blank')}>
                <Download size={16} className="mr-2" />
                Descargar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de compartir documento */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartir Documento</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {selectedDocument && (
              <div className="p-3 rounded bg-muted">
                <p className="text-sm font-medium">{selectedDocument.name}</p>
                <p className="text-xs text-muted-foreground">{selectedDocument.description}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="doctor" className="text-sm font-medium">
                Seleccionar médico
              </label>
              <Select
                id="doctor"
                value={selectedDoctor}
                onValueChange={setSelectedDoctor}
              >
                <option value="">Seleccionar médico</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Mensaje
              </label>
              <Input
                id="message"
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="Mensaje opcional para el médico"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleShare}
              disabled={!selectedDoctor}
            >
              Compartir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmación de eliminación */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p>¿Está seguro de que desea eliminar este documento?</p>
            {selectedDocument && (
              <p className="mt-2 font-medium">{selectedDocument.name}</p>
            )}
            <p className="mt-2 text-sm text-destructive">
              Esta acción no se puede deshacer.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DocumentsHistory;
