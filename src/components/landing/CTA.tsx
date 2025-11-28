import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaTools, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';

const CTACard = ({ icon: Icon, title, description, buttonText, buttonLink, color, glowColor, borderColor }: any) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className="relative flex flex-col items-center text-center"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
            viewport={{ once: true, amount: 0.3 }}
        >
            {/* Contenedor del Icono */}
            <motion.div
                className="relative w-48 h-48 rounded-2xl bg-gray-900/50 backdrop-blur-sm border-2 flex items-center justify-center"
                animate={{
                    borderColor: isHovered ? borderColor : 'rgba(55, 65, 81, 0.5)', // border-gray-600 with opacity
                    boxShadow: isHovered ? `0 0 40px ${glowColor}` : '0 0 0px rgba(0,0,0,0)',
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
                <motion.div
                    className={`text-6xl ${color}`}
                    animate={{ scale: isHovered ? 1.1 : 1 }}
                >
                    <Icon />
                </motion.div>
            </motion.div>

            {/* Contenido de Texto y Botón */}
            <div className="mt-8">
                <motion.h3
                    className="text-3xl font-bold text-white mb-4"
                    animate={{ color: isHovered ? borderColor : '#FFF' }}
                >
                    {title}
                </motion.h3>
                <p className="text-gray-400 mb-8 max-w-sm">
                    {description}
                </p>
                <motion.div
                    className="inline-block rounded-full"
                    whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${glowColor}` }}
                >
                    <Link
                        href={buttonLink}
                        className="inline-flex items-center justify-center px-8 py-3 font-bold text-white rounded-full group cursor-pointer"
                        style={{ backgroundColor: borderColor }}
                    >
                        {buttonText}
                        <motion.div
                            className="ml-2"
                            animate={{ x: isHovered ? 5 : 0, opacity: isHovered ? 1 : 0 }}
                        >
                            <FaArrowRight />
                        </motion.div>
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
};

const CTA = () => {
    return (
        <section className="py-24 bg-gray-950 relative overflow-hidden">
            {/* --- FONDO MEJORADO --- */}
            <div className="absolute inset-0 z-0">
                {/* Gradiente de base */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-950" />

                {/* Patrón de grid animado */}
                <motion.div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: 'linear-gradient(to right, #007BFF 1px, transparent 1px), linear-gradient(to bottom, #007BFF 1px, transparent 1px)',
                        backgroundSize: '80px 80px',
                    }}
                    animate={{ backgroundPositionX: ['0px', '80px'], backgroundPositionY: ['0px', '80px'] }}
                    transition={{ duration: 100, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
                />

                {/* Orbes de color flotantes */}
                <motion.div
                    className="absolute top-[10%] left-[15%] w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
                    animate={{ x: [-50, 50, -50], y: [0, 100, 0] }}
                    transition={{ duration: 30, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-[10%] right-[15%] w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
                    animate={{ x: [50, -50, 50], y: [0, -100, 0] }}
                    transition={{ duration: 35, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                />
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="container mx-auto px-6 relative z-10">
                <motion.h2
                    className="text-4xl md:text-5xl font-bold mb-16 text-white text-center"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    Da el Siguiente <span className="text-primary-blue">Paso</span>
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <CTACard
                        icon={FaSearch}
                        title="Encuentra un Profesional"
                        description="Navega por categorías, revisa perfiles detallados con calificaciones y contacta al técnico perfecto para tu proyecto. La solución que buscas está a solo unos clics de distancia."
                        buttonText="Buscar Ahora"
                        buttonLink="/cliente/buscar" // Assuming this is the search page
                        color="text-cyan-400"
                        borderColor="#22d3ee" // cyan-400
                        glowColor="rgba(34, 211, 238, 0.3)"
                    />
                    <CTACard
                        icon={FaTools}
                        title="Ofrece Tus Servicios"
                        description="Únete a nuestra creciente red de profesionales. Crea tu perfil, muestra tus mejores trabajos y conecta con miles de clientes potenciales en tu área que necesitan tu talento."
                        buttonText="Registrarme"
                        buttonLink="/Registro"
                        color="text-orange-400"
                        borderColor="#fb923c" // orange-400
                        glowColor="rgba(251, 146, 60, 0.3)"
                    />
                </div>
            </div>
        </section>
    );
};

export default CTA;
