const MainLayout = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Features */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center px-6 py-8">
        <div>
            <span className="text-4xl mb-2 block">📄</span>
            <h3 className="text-lg font-semibold text-gray-900">Historial completo</h3>
            <p className="text-gray-600 mt-1">
            Guarda tus recetas y evolución visual fácilmente
            </p>
        </div>

        <div>
            <span className="text-4xl mb-2 block">🔒</span>
            <h3 className="text-lg font-semibold text-gray-900">Seguridad garantizada</h3>
            <p className="text-gray-600 mt-1">
            Solo tú puedes ver tus datos
            </p>
        </div>

        <div>
            <span className="text-4xl mb-2 block">🌍</span>
            <h3 className="text-lg font-semibold text-gray-900">Accede desde cualquier lugar</h3>
            <p className="text-gray-600 mt-1">
            Compatible con móvil, tablet o PC
            </p>
        </div>
        </section>
    </div>
  );
};

export default MainLayout;
