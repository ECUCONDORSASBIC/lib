'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, getDoc, setDoc, addDoc, deleteDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { toast } from 'react-toastify';
import DashboardLayout from '@/app/components/dashboard/DashboardLayout';

export default function ManageBlog() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blogPosts, setBlogPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'general',
    tags: '',
    published: false,
    featuredImage: null,
    featuredImageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const router = useRouter();
  const db = getFirestore();
  const storage = getStorage();

  // Cargar artículos existentes
  useEffect(() => {
    async function loadBlogPosts() {
      try {
        setLoading(true);
        
        // Verificar permisos de administrador
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        
        if (!session?.user?.role || session.user.role !== 'admin') {
          toast.error('No tienes permisos para acceder a esta sección');
          router.push('/dashboard');
          return;
        }
        
        // Cargar artículos de Firestore
        const postsCollection = collection(db, 'blog_posts');
        const snapshot = await getDocs(postsCollection);
        
        const postsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt) || new Date()
        }));
        
        // Ordenar por fecha de creación (más recientes primero)
        postsList.sort((a, b) => b.createdAt - a.createdAt);
        
        setBlogPosts(postsList);
      } catch (err) {
        console.error('Error al cargar artículos:', err);
        toast.error('Error al cargar los artículos del blog');
      } finally {
        setLoading(false);
      }
    }
    
    loadBlogPosts();
  }, [db, router]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Manejar selección de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Crear URL temporal para vista previa
      const previewUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        featuredImageUrl: previewUrl
      });
    }
  };

  // Iniciar edición de artículo
  const handleEdit = (post) => {
    setEditingPost(post.id);
    setFormData({
      title: post.title || '',
      summary: post.summary || '',
      content: post.content || '',
      category: post.category || 'general',
      tags: post.tags?.join(', ') || '',
      published: post.published === true,
      featuredImageUrl: post.featuredImageUrl || ''
    });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar edición
  const handleCancel = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      summary: '',
      content: '',
      category: 'general',
      tags: '',
      published: false,
      featuredImageUrl: ''
    });
    setImageFile(null);
  };

  // Subir imagen a Firebase Storage
  const uploadImage = async (file, postId) => {
    if (!file) return null;
    
    const fileRef = ref(storage, `blog_images/${postId}/${file.name}`);
    await uploadBytes(fileRef, file);
    const imageUrl = await getDownloadURL(fileRef);
    return imageUrl;
  };

  // Guardar artículo (crear nuevo o actualizar existente)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('El título y el contenido son obligatorios');
      return;
    }
    
    try {
      setSaving(true);
      
      // Preparar datos del artículo
      const postData = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        published: formData.published,
        updatedAt: new Date().toISOString()
      };
      
      let postId;
      
      if (editingPost) {
        // Actualizar artículo existente
        postId = editingPost;
        const postRef = doc(db, 'blog_posts', postId);
        
        // Si hay una nueva imagen, subirla
        if (imageFile) {
          const imageUrl = await uploadImage(imageFile, postId);
          if (imageUrl) {
            postData.featuredImageUrl = imageUrl;
          }
        } else if (formData.featuredImageUrl) {
          // Mantener la URL de la imagen existente
          postData.featuredImageUrl = formData.featuredImageUrl;
        }
        
        await setDoc(postRef, postData, { merge: true });
        
        // Actualizar en el estado local
        setBlogPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId ? { ...post, ...postData } : post
          )
        );
        
        toast.success('Artículo actualizado correctamente');
      } else {
        // Crear nuevo artículo
        postData.createdAt = new Date().toISOString();
        postData.author = {
          id: 'admin', // Idealmente, usar el ID real del usuario
          name: 'Administrador' // Idealmente, usar el nombre real del usuario
        };
        
        // Crear el documento primero para obtener un ID
        const docRef = await addDoc(collection(db, 'blog_posts'), postData);
        postId = docRef.id;
        
        // Si hay una imagen, subirla con el ID del documento recién creado
        if (imageFile) {
          const imageUrl = await uploadImage(imageFile, postId);
          if (imageUrl) {
            postData.featuredImageUrl = imageUrl;
            // Actualizar el documento con la URL de la imagen
            await setDoc(docRef, { featuredImageUrl: imageUrl }, { merge: true });
          }
        }
        
        // Añadir al estado local
        setBlogPosts(prevPosts => [{ id: postId, ...postData, createdAt: new Date() }, ...prevPosts]);
        
        toast.success('Artículo creado correctamente');
      }
      
      // Limpiar formulario
      handleCancel();
    } catch (err) {
      console.error('Error al guardar artículo:', err);
      toast.error('Error al guardar el artículo');
    } finally {
      setSaving(false);
    }
  };

  // Eliminar artículo
  const handleDelete = async (id, imageUrl) => {
    if (!confirm('¿Estás seguro de eliminar este artículo? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Eliminar de Firestore
      await deleteDoc(doc(db, 'blog_posts', id));
      
      // Si hay una imagen asociada, eliminarla de Storage
      if (imageUrl) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (imgError) {
          console.error('Error al eliminar imagen:', imgError);
          // Continuar incluso si falla la eliminación de la imagen
        }
      }
      
      // Eliminar del estado local
      setBlogPosts(prevPosts => prevPosts.filter(post => post.id !== id));
      
      // Si estábamos editando este artículo, cancelar la edición
      if (editingPost === id) {
        handleCancel();
      }
      
      toast.success('Artículo eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar artículo:', err);
      toast.error('Error al eliminar el artículo');
    } finally {
      setSaving(false);
    }
  };

  // Previsualizar artículo
  const handlePreview = (post) => {
    // Almacenar datos temporalmente (en localStorage, por ejemplo)
    localStorage.setItem('preview_post', JSON.stringify(post));
    
    // Abrir en nueva pestaña
    window.open(`/blog/preview`, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión del Blog</h1>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => router.push('/dashboard/admin')}
          >
            ← Volver al panel
          </button>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingPost ? 'Editar Artículo' : 'Crear Nuevo Artículo'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Título del artículo"
                required
              />
            </div>
            
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                Resumen
              </label>
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                rows={2}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Breve resumen del artículo"
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Contenido *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={10}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Contenido del artículo..."
                required
              />
              <p className="mt-1 text-xs text-gray-500">Puedes usar formato Markdown para dar formato al texto</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="general">General</option>
                  <option value="noticias">Noticias</option>
                  <option value="nutricion">Nutrición y Alimentación</option>
                  <option value="medicina-preventiva">Medicina Preventiva</option>
                  <option value="tecnologia">Tecnología Médica</option>
                  <option value="anuncios">Anuncios y Eventos</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Etiquetas
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="salud, prevención, etc. (separadas por comas)"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen destacada
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
              </div>
              
              {formData.featuredImageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.featuredImageUrl}
                    alt="Vista previa"
                    className="h-32 w-auto object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={formData.published}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                Publicar (visible para los usuarios)
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              {editingPost && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
              )}
              
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  editingPost ? 'Actualizar' : 'Publicar'
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Artículos del Blog</h2>
          
          {loading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="bg-gray-50 p-4 text-center text-gray-500 rounded-md">
              No hay artículos publicados. Crea el primero.
            </div>
          ) : (
            <div className="space-y-6">
              {blogPosts.map((post) => (
                <div key={post.id} className={`border rounded-lg overflow-hidden ${!post.published ? 'bg-gray-50' : ''}`}>
                  <div className="flex flex-col md:flex-row">
                    {post.featuredImageUrl && (
                      <div className="md:w-1/4">
                        <img
                          src={post.featuredImageUrl}
                          alt={post.title}
                          className="h-48 w-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className={`p-4 ${post.featuredImageUrl ? 'md:w-3/4' : 'w-full'}`}>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-lg">{post.title}</h3>
                            {!post.published && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Borrador</span>
                            )}
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{post.category}</span>
                          </div>
                          
                          <p className="mt-1 text-gray-600 line-clamp-2">{post.summary || post.content.substring(0, 120) + '...'}</p>
                          
                          <div className="mt-2 flex flex-wrap gap-1">
                            {post.tags?.map((tag, i) => (
                              <span key={i} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="mt-2 text-sm text-gray-500">
                            Publicado: {post.createdAt.toLocaleDateString('es-ES')}
                          </div>
                        </div>
                        
                        <div className="flex md:flex-col gap-2 mt-4 md:mt-0">
                          <button
                            onClick={() => handleEdit(post)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Editar
                          </button>
                          
                          <button
                            onClick={() => handlePreview(post)}
                            className="inline-flex items-center px-3 py-1 border border-indigo-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Vista previa
                          </button>
                          
                          <button
                            onClick={() => handleDelete(post.id, post.featuredImageUrl)}
                            className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
