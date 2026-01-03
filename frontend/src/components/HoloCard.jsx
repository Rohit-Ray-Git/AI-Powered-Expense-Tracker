import Tilt from 'react-parallax-tilt';

const HoloCard = ({ children, className = "", variant = "default" }) => {
    const variants = {
        default: "from-[#1a1a1a]/80 to-[#1a1a1a]/40 border-white/5",
        emerald: "from-emerald-900/30 to-emerald-900/10 border-emerald-500/20",
        blue: "from-blue-900/30 to-blue-900/10 border-blue-500/20",
        purple: "from-purple-900/30 to-purple-900/10 border-purple-500/20"
    };

    const variantStyles = variants[variant] || variants.default;

    return (
        <Tilt
            className={`relative rounded-xl border backdrop-blur-md shadow-xl overflow-hidden bg-gradient-to-br ${variantStyles} ${className}`}
            tiltMaxAngleX={5}
            tiltMaxAngleY={5}
            perspective={1000}
            scale={1.02}
            transitionSpeed={1000}
            gyroscope={true}
            glareEnable={true}
            glareMaxOpacity={0.15}
            glareColor="#ffffff"
            glarePosition="all"
            glareBorderRadius="1rem"
        >
            {children}
        </Tilt>
    );
};

export default HoloCard;
