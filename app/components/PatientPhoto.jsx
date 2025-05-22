import Image from 'next/image';

const PatientPhoto = ({ src, name }) => (
  <div className="flex flex-col items-center p-4 bg-white shadow rounded-xl">
    <Image
      src={src}
      alt={`Foto de ${name}`}
      width={112}
      height={112}
      className="object-cover border-2 rounded-full shadow-md border-primary"
      priority
    />
    <span className="mt-3 text-base font-semibold text-slate-800">{name}</span>
  </div>
);

export default PatientPhoto;
