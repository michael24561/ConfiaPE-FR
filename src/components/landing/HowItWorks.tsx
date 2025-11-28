import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FaSearch, FaComments, FaCreditCard } from 'react-icons/fa';

// --- Datos de los Pasos con Colores ---
const steps = [
    {
        number: 1,
        icon: FaSearch,
        title: 'Busca y Compara',
        color: '#22d3ee', // cyan-400
        description: 'Explora cientos de perfiles de técnicos verificados. Utiliza nuestros filtros avanzados para encontrar exactamente lo que necesitas y revisa opiniones de otros clientes.',
    },
    {
        number: 2,
        icon: FaComments,
        title: 'Solicita y Chatea',
        color: '#fb923c', // orange-400
        description: 'Una vez que encuentres al profesional ideal, contacta directamente, coordina detalles y acuerda el alcance del trabajo de forma eficiente.',
    },
    {
        number: 3,
        icon: FaCreditCard,
        title: 'Paga y Califica',
        color: '#38bdf8', // sky-400
        description: 'Cuando el trabajo esté completado a tu satisfacción, realiza el pago de forma segura y califica tu experiencia para ayudar a la comunidad.',
    },
];

// --- Componente para cada Paso ---
const HowItWorksStep = ({ step, index }: { step: any, index: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.4 });

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    } as const;

    const iconVariants = {
        hidden: { scale: 0.5, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { type: 'spring', stiffness: 150, damping: 15, delay: 0.2 }
        },
    } as const;

    const isReversed = index % 2 !== 0;

    return (
        <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="relative grid grid-cols-1 lg:grid-cols-2 items-center gap-12 my-16"
        >
            {/* Columna de Texto */}
            <div className={`text-center lg:text-left ${isReversed ? 'lg:order-2' : ''}`}>
                <p className="text-xl font-bold uppercase mb-3" style={{ color: step.color }}>Paso {step.number}</p>
                <h3 className="text-4xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-gray-300 leading-relaxed text-lg">{step.description}</p>
            </div>

            {/* Columna del Icono */}
            <div className={`flex justify-center ${isReversed ? 'lg:order-1' : ''}`}>
                <motion.div
                    variants={iconVariants}
                    className="relative w-48 h-48 flex items-center justify-center"
                >
                    <motion.div
                        className="absolute inset-0 rounded-full border-4"
                        style={{ borderColor: step.color, boxShadow: `0 0 40px ${step.color}` }}
                        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div className="p-8 bg-gray-800/80 backdrop-blur-sm rounded-full border-2 border-gray-700">
                        {React.createElement(step.icon, { style: { color: step.color }, className: "h-20 w-20" })}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

// --- Componente Principal ---
const HowItWorks = () => {
    const lineRef = useRef(null);
    const isLineInView = useInView(lineRef, { once: true, amount: 0.1 });

    return (
        <section id="how-it-works" className="relative bg-black text-white py-24 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <motion.div
                    className="absolute top-[10%] left-[10%] w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
                    animate={{ x: [-50, 50, -50], y: [0, 100, 0] }}
                    transition={{ duration: 30, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-[15%] right-[15%] w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"
                    animate={{ x: [50, -50, 50], y: [0, -100, 0] }}
                    transition={{ duration: 35, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.h2
                    className="text-4xl md:text-5xl font-bold text-center mb-24"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    ¿Cómo <span className="text-primary-blue">Funciona</span>?
                </motion.h2>

                <div className="relative">
                    {/* Línea de tiempo vertical */}
                    <div ref={lineRef} className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-700/50 transform -translate-x-1/2 hidden lg:block">
                        <motion.div
                            className="w-full bg-gradient-to-b from-cyan-400 via-orange-400 to-sky-400"
                            initial={{ height: 0 }}
                            animate={{ height: isLineInView ? '100%' : 0 }}
                            transition={{ duration: 2, ease: 'easeOut' }}
                        />
                    </div>

                    {steps.map((step, index) => (
                        <HowItWorksStep key={step.number} step={step} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
