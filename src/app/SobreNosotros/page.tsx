import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SobreNosotros() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />

      <main className="flex-grow pt-24 pb-16 px-4 sm:px-8">
        {/* Hero Section con gradiente */}
        <section className="max-w-6xl mx-auto text-center mb-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 blur-3xl -z-10 rounded-full"></div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 animate-fadeIn">
            Sobre Nosotros
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            En <span className="font-bold text-blue-600">ConfiaPE</span>, trabajamos para conectar a las personas
            con técnicos de confianza, promoviendo la formalización y la calidad
            en los servicios técnicos del Perú.
          </p>
        </section>

        {/* Sección de historia con imagen decorativa */}
        <section className="max-w-5xl mx-auto mb-20">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-blue-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">
                Nuestra Historia
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">
              ConfiaPE nació como respuesta a una realidad común en el mercado
              peruano: la dificultad para encontrar técnicos confiables, puntuales
              y con tarifas justas. Identificamos que la falta de transparencia y
              la informalidad generaban desconfianza tanto en los clientes como en
              los profesionales. Por eso, decidimos crear una plataforma digital
              que permita a los usuarios contratar servicios técnicos de manera
              <span className="font-bold text-blue-600"> segura, rápida y transparente</span>, y a los técnicos
              acceder a más oportunidades laborales formales y verificadas.
            </p>
          </div>
        </section>

        {/* Misión y Visión con diseño mejorado */}
        <section className="max-w-6xl mx-auto mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Misión */}
            <div className="group relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-xl p-8 md:p-10 text-white hover:scale-105 transition-transform duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4">Misión</h3>
                <p className="text-blue-50 leading-relaxed">
                  Ser la plataforma de referencia en la región La Libertad para la
                  contratación de servicios técnicos del hogar al 2028, reconocida
                  como sinónimo de <span className="font-semibold text-white">confianza, transparencia y
                  profesionalismo</span> en un sector tradicionalmente informal.
                  ConfiaPE aspira a formalizar el trabajo de cientos de técnicos
                  independientes y facilitar miles de servicios exitosos, marcando
                  un nuevo estándar de calidad en el Perú.
                </p>
              </div>
            </div>

            {/* Visión */}
            <div className="group relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-xl p-8 md:p-10 text-white hover:scale-105 transition-transform duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4">Visión</h3>
                <p className="text-indigo-50 leading-relaxed">
                  Generar confianza y transparencia en la contratación de servicios
                  técnicos especializados, conectando a usuarios con profesionales
                  verificados y calificados mediante una plataforma digital segura,
                  eficiente y adaptada al contexto peruano. Buscamos reducir la
                  informalidad, empoderar a los técnicos independientes y garantizar
                  experiencias positivas para todos los participantes del ecosistema.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de valores renovada */}
        <section className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Nuestros Valores
            </h2>
            <p className="text-gray-600 text-lg">Los principios que guían nuestro trabajo</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Confianza */}
            <div className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-t-4 border-blue-500">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors duration-300">
                <svg className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-bold text-xl text-gray-800 mb-2">Confianza</h4>
              <p className="text-gray-600 leading-relaxed">
                Validamos cuidadosamente a cada técnico para garantizar la
                seguridad y tranquilidad de nuestros usuarios.
              </p>
            </div>

            {/* Transparencia */}
            <div className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-t-4 border-indigo-500">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-500 transition-colors duration-300">
                <svg className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h4 className="font-bold text-xl text-gray-800 mb-2">Transparencia</h4>
              <p className="text-gray-600 leading-relaxed">
                Ofrecemos información clara, precios justos y reseñas verificadas
                para que cada usuario pueda decidir con seguridad.
              </p>
            </div>

            {/* Innovación */}
            <div className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-t-4 border-purple-500">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors duration-300">
                <svg className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="font-bold text-xl text-gray-800 mb-2">Innovación</h4>
              <p className="text-gray-600 leading-relaxed">
                Usamos tecnología moderna para facilitar la búsqueda, contratación
                y pago de servicios técnicos en un solo lugar.
              </p>
            </div>

            {/* Compromiso social */}
            <div className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-t-4 border-pink-500">
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-500 transition-colors duration-300">
                <svg className="w-7 h-7 text-pink-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-xl text-gray-800 mb-2">Compromiso Social</h4>
              <p className="text-gray-600 leading-relaxed">
                Impulsamos la formalización laboral de los técnicos y promovemos
                el crecimiento económico local.
              </p>
            </div>
          </div>
        </section>

        {/* Call to action final */}
        <section className="max-w-4xl mx-auto mt-20">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-10 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h3>
              <p className="text-blue-100 text-lg mb-6">
                Únete a ConfiaPE y forma parte del cambio en el sector de servicios técnicos
              </p>
              <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-300 shadow-lg hover:shadow-xl">
                Explorar Servicios
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}