import { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Tab, TabPanel, TabPanels, TabList, TabGroup } from '@headlessui/react';
import type { IconType } from 'react-icons';
import {
    FaShieldAlt, FaSearch, FaComments, FaTasks,
    FaRocket, FaUsers, FaImages, FaMoneyBillWave
} from 'react-icons/fa';


// --- Datos Consolidados con Colores ---
const benefitsData = {
    client: {
        title: "Clientes",
        color: "text-cyan-400",
        colorHex: "#22d3ee",
        glowColor: "rgba(34, 211, 238, 0.4)", // Corresponds to cyan-400
        bubbleColor: "#0ea5e9", // Corresponds to sky-500 for a nice blue
        benefits: [
            { icon: FaShieldAlt, title: 'Seguridad Total', description: 'Perfiles verificados, pagos seguros y reputación transparente.' },
            { icon: FaSearch, title: 'Búsqueda Eficiente', description: 'Encuentra al técnico ideal con filtros y calificaciones.' },
            { icon: FaComments, title: 'Comunicación Directa', description: 'Chatea en tiempo real para coordinar cada detalle.' },
            { icon: FaTasks, title: 'Gestión Simplificada', description: 'Administra solicitudes y pagos desde un solo lugar.' },
        ]
    },
    technician: {
        title: "Técnicos",
        color: "text-orange-400",
        colorHex: "#fb923c",
        glowColor: "rgba(251, 146, 60, 0.5)", // Corresponds to orange-400
        bubbleColor: "#f97316", // Corresponds to orange-500
        benefits: [
            { icon: FaRocket, title: 'Crecimiento Profesional', description: 'Aumenta tu visibilidad y accede a estadísticas de tu negocio.' },
            { icon: FaUsers, title: 'Gestión de Clientes', description: 'Organiza tu agenda, recibe solicitudes y optimiza tu tiempo.' },
            { icon: FaImages, title: 'Portafolio Atractivo', description: 'Muestra tus mejores trabajos y destaca tu calidad.' },
            { icon: FaMoneyBillWave, title: 'Pagos Puntuales', description: 'Recibe tus pagos de forma segura y garantizada.' },
        ]
    }
};

// --- Componente de Tarjeta de Beneficio ---
const BenefitCard = ({ icon: Icon, title, description, color, glowColor, colorHex }: { icon: IconType, title: string, description: string, color: string, glowColor: string, colorHex: string }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: cardRef,
        offset: ["start end", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], [-20, 20]);
    const [isHovered, setIsHovered] = useState(false);

    const cardVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.9 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 80, damping: 15 } },
    } as const;

    return (
        <motion.div
            ref={cardRef}
            style={{ y }}
            variants={cardVariants}
            className="relative flex flex-col items-center text-center group select-none"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <motion.div
                className="relative w-36 h-36 rounded-full flex items-center justify-center bg-gray-800/50 border-2 border-gray-700/80 transition-all duration-300 ease-in-out group-hover:border-gray-600 group-hover:scale-105"
                whileHover={{
                    boxShadow: `0 0 50px 10px ${glowColor}`,
                    transition: { duration: 0.2 }
                }}
            >
                <div className="absolute inset-0 rounded-full bg-grid-pattern opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <motion.div
                    className={`relative text-5xl ${color}`}
                    whileHover={{ scale: 1.15, rotate: -8 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                >
                    <Icon />
                </motion.div>
            </motion.div>
            <motion.div
                className="mt-5"
                whileHover={{ y: -5 }}
            >
                <motion.h4
                    className="text-xl font-bold text-white transition-colors duration-300"
                    style={{ color: isHovered ? colorHex : 'white' }}
                    whileHover={{ letterSpacing: "0.02em" }}
                >
                    {title}
                </motion.h4>
                <p className="text-gray-400 text-sm max-w-[200px] mx-auto mt-1 transition-colors duration-300 group-hover:text-gray-300">{description}</p>
            </motion.div>
        </motion.div>
    );
};

// --- Panel que contiene las tarjetas ---
const BenefitsPanel = ({ type }: { type: 'client' | 'technician' }) => {
    const data = benefitsData[type];
    return (
        <motion.div
            key={type}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.3, ease: [0.7, 0, 0.84, 0] } }}
            className="grid grid-cols-2 md:grid-cols-4 gap-y-16 gap-x-8"
        >
            {data.benefits.map((benefit) => (
                <BenefitCard key={benefit.title} {...benefit} color={data.color} glowColor={data.glowColor} colorHex={data.colorHex} />
            ))}
        </motion.div>
    );
};

// --- Componente Principal de Beneficios ---
const Benefits = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <section id="benefits" className="py-24 bg-gray-950 text-white relative overflow-hidden select-none">
            {/* Fondo Decorativo */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(0,123,255,0.1),transparent_40%)]" />
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
                    animate={{ x: [-50, 50, -50], y: [0, 100, 0] }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"
                    animate={{ x: [50, -50, 50], y: [0, -100, 0] }}
                    transition={{ duration: 25, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,<svg_xmlns=%22http://www.w3.org/2000/svg%22_width=%2232%22_height=%2232%22_viewBox=%220_0_32_32%22><path_fill=%22rgba(255,255,255,0.015)%22_d=%22M0_16_L16_0_L32_16_L16_32_Z%22/></svg>')] bg-repeat" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.h3
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    whileHover={{ letterSpacing: "0.01em", textShadow: '0 0 20px rgba(0, 123, 255, 0.7)' }}
                    className="text-4xl md:text-5xl font-bold text-center mb-16"
                >
                    Beneficios <span className="text-primary-blue" style={{ textShadow: '0 0 15px rgba(0, 123, 255, 0.5)' }}>Exclusivos</span>
                </motion.h3>

                <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                    <TabList className="relative flex p-1.5 space-x-2 bg-gray-800/70 backdrop-blur-sm rounded-full max-w-sm mx-auto mb-12 shadow-lg">
                        {Object.values(benefitsData).map(({ title }, index) => (
                            <Tab
                                key={title}
                                className={({ selected }) =>
                                    `w-full rounded-full py-3 text-lg font-semibold leading-5 transition-all duration-300
                  focus:outline-none relative
                  ${selected ? 'text-white' : 'text-gray-400 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]'}`
                                }
                            >
                                {({ selected }) => (
                                    <>
                                        {title}
                                        {selected && (
                                            <motion.div
                                                layoutId="tab-bubble"
                                                className="absolute inset-0 rounded-full -z-10"
                                                style={{ backgroundColor: benefitsData[index === 0 ? 'client' : 'technician'].bubbleColor }}
                                                transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                                            />
                                        )}
                                    </>
                                )}
                            </Tab>
                        ))}
                    </TabList>

                    <AnimatePresence mode="wait">
                        <TabPanels>
                            <TabPanel>
                                <BenefitsPanel type="client" />
                            </TabPanel>
                            <TabPanel>
                                <BenefitsPanel type="technician" />
                            </TabPanel>
                        </TabPanels>
                    </AnimatePresence>
                </TabGroup>
            </div>
        </section>
    );
};

export default Benefits;
