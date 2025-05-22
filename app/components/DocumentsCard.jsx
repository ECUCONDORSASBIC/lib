const DocumentsCard = ({ documents }) => (
  <div className="bg-white rounded-xl shadow p-4">
    <h3 className="text-base font-semibold text-primary mb-2">Documentos Útiles</h3>
    <ul className="space-y-2">
      {documents.map(doc => (
        <li key={doc.url}>
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center text-sm"
          >
            <span className="material-icons mr-2 text-lg align-middle">picture_as_pdf</span>
            {doc.title}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default DocumentsCard;
