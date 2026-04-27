import { motion } from "framer-motion";

const EvolutionSection = () => {
  return (
    <section
      style={{ background: "#000000" }}
      className="py-28 px-6"
    >
      <div className="w-full max-w-[1600px] mx-auto text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            color: "#ffffff",
            fontSize: "2.25rem",
            fontWeight: 700,
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            lineHeight: 1.2,
            marginBottom: "1.25rem",
          }}
        >
          Everyone can use digital currency
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{
            color: "#9ca3af",
            fontSize: "1.6rem",
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            lineHeight: 1.7,
            maxWidth: "1560px",
            margin: "0 auto 4rem auto",
          }}
        >
          From the initial experience of digital currency trading to the first purchase of financial products, the platform will help you easily earn coins
        </motion.p>

        {/* GIF */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <img
            src="/evolution.gif"
            alt="Evolution of humanity, money and technology"
            style={{
              width: "100%",
              maxWidth: "1560px",
              height: "auto",
              display: "block",
              margin: "0 auto",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default EvolutionSection;
