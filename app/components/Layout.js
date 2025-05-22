// components/Layout.js
export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-sky-400 text-white p-4 font-bold">Altamedic</nav>
      <main>{children}</main>
    </div>
  );
}
