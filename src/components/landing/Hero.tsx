import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { HiArrowNarrowDown, HiArrowNarrowRight } from 'react-icons/hi';
import Image from 'next/image';

const Hero = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.3 },
        },
    } as const;

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
    } as const;

    const ctaVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, delay: 1 } },
    } as const;

    const scrollIndicatorVariants: Variants = {
        animate: { y: [0, 10, 0], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } },
    };

    const headline = "Conectamos Confianza y Profesionalismo.";
    const subtitle = "La plataforma #1 que conecta profesionales verificados con clientes que necesitan servicios de calidad, de forma rápida y segura.";

    return (
        <section className="relative text-center py-20 md:py-32 overflow-hidden bg-black min-h-screen flex items-center">
            {/* --- FONDO MEJORADO --- */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    className="absolute top-[-20%] left-[-20%] w-[50rem] h-[50rem] bg-cyan-500/10 rounded-full blur-3xl"
                    animate={{ x: [-100, 100, -100], y: [0, 150, 0] }}
                    transition={{ duration: 40, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-[-20%] right-[-20%] w-[50rem] h-[50rem] bg-orange-500/10 rounded-full blur-3xl"
                    animate={{ x: [100, -100, 100], y: [0, -150, 0] }}
                    transition={{ duration: 45, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                />
                <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 80 80%22><path fill=%22%23ffffff%22 d=%22M40 40L0 0h80L40 40zM0 80h80L40 40L0 80z%22/></svg>')] bg-repeat" style={{ backgroundSize: '40px' }} />
            </div>

            <div className="relative z-10 container mx-auto px-6 flex flex-col lg:flex-row items-center justify-between">
                {/* Columna Izquierda: Contenido de Texto */}
                <motion.div
                    className="lg:w-1/2 text-left lg:pr-12 mb-10 lg:mb-0"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-6xl font-bold leading-tight mb-4 text-white"
                    >
                        {headline}
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl"
                    >
                        {subtitle}
                    </motion.p>
                    <motion.div
                        variants={ctaVariants}
                        className="flex flex-col sm:flex-row gap-4 justify-start"
                    >
                        <motion.a
                            href="#contact"
                            className="bg-primary-blue text-white font-bold py-3 px-8 rounded-full hover:bg-blue-600 transition-colors duration-300 inline-flex items-center justify-center group shadow-lg shadow-primary-blue/30"
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Buscar Técnicos
                            <HiArrowNarrowRight className="ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                        </motion.a>
                        <motion.a
                            href="/Registro"
                            className="border-2 border-orange-500 text-orange-500 font-bold py-3 px-8 rounded-full hover:bg-orange-500 hover:text-white transition-colors duration-300 inline-flex items-center justify-center group shadow-lg shadow-orange-500/30"
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Únete como Técnico
                            <HiArrowNarrowRight className="ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                        </motion.a>
                    </motion.div>
                </motion.div>

                {/* Columna Derecha: Imagen del Escudo */}
                <motion.div
                    variants={itemVariants}
                    className="lg:w-1/2 flex items-center justify-center"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1, transition: { delay: 0.5, duration: 0.8, type: 'spring' } }}
                        whileHover={{ scale: 1.05, rotate: 2, transition: { duration: 0.3 } }}
                        drag
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        dragElastic={0.1}
                        className="relative w-full max-w-md lg:max-w-lg aspect-square"
                    >
                        <Image
                            src="/Escudo.png"
                            alt="Escudo de ConfiaPE"
                            fill
                            className="object-contain"
                            priority
                        />
                    </motion.div>
                </motion.div>

                {/* Indicador de Scroll */}
                <motion.div
                    variants={scrollIndicatorVariants}
                    initial="initial"
                    animate="animate"
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-blue text-3xl"
                >
                    <HiArrowNarrowDown />
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
