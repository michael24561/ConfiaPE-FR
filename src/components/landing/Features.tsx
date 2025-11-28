import { motion } from 'framer-motion';
import { FaCode, FaRobot, FaLightbulb } from 'react-icons/fa'; // Appropriate icons

const features = [
    {
        title: 'Desarrollo Web a Medida',
        description: 'Creamos sitios y aplicaciones web optimizadas para tus necesidades, desde landing pages hasta e-commerce.',
        icon: <FaCode className="h-10 w-10 text-primary-blue" />,
    },
    {
        title: 'Automatización de Procesos',
        description: 'Optimizamos tus flujos de trabajo con software que ahorra tiempo y reduce errores, aumentando la eficiencia.',
        icon: <FaRobot className="h-10 w-10 text-primary-blue" />,
    },
    {
        title: 'Consultoría Tecnológica',
        description: 'Te guiamos en la adopción de nuevas tecnologías para que tomes las mejores decisiones estratégicas.',
        icon: <FaLightbulb className="h-10 w-10 text-primary-blue" />,
    },
];

const Features = () => {
    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    } as const;

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 150, damping: 10 } },
    } as const;

    return (
        <motion.section
            id="features"
            className="py-20 bg-gray-950 text-white"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            <div className="container mx-auto px-6">
                <motion.h3
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl md:text-4xl font-bold text-center mb-12"
                >
                    Nuestros <span className="text-primary-blue">Servicios</span>
                </motion.h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5, boxShadow: "0 0 20px rgba(0, 123, 255, 0.6)" }} // Glow effect on hover
                            className="bg-gray-800/70 p-8 rounded-lg border border-gray-700 hover:border-primary-blue transition-all duration-300 transform hover:-translate-y-2 hover:shadow-primary-blue-glow"
                        >
                            <div className="mb-4">{feature.icon}</div>
                            <h4 className="text-xl font-bold mb-2 text-white">{feature.title}</h4>
                            <p className="text-gray-300">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
};

export default Features;
