import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const providers = [
  {
    id: "topper",
    name: "Topper",
    description: "Fast and secure crypto purchases with competitive rates",
    icon: "/buy-modal/topper.png",
    url: "https://www.topperpay.com/",
  },
  {
    id: "paybis",
    name: "Paybis",
    description: "Multiple payment methods with global coverage",
    icon: "/buy-modal/paybis.png",
    url: "https://paybis.com/",
  },
  {
    id: "moonpay",
    name: "MoonPay",
    description: "Simple crypto purchases with credit/debit cards",
    icon: "/buy-modal/moonpay.png",
    url: "https://www.moonpay.com/",
  },
  {
    id: "banxa",
    name: "Banxa",
    description: "Regulated payment gateway with local payment options",
    icon: "/buy-modal/banxa.png",
    url: "https://alchemypay.org/",
  },
];

const BuyModal = ({ isOpen, onClose }: BuyModalProps) => {
  const handleProviderClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999]">
          {/* Backdrop — dark overlay with subtle blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0"
            style={{
              background: "rgba(0, 0, 0, 0.55)",
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
            }}
          />

          {/* Modal Container — click outside to close */}
          <div
            className="absolute inset-0 overflow-y-auto px-4 pb-20"
            style={{ paddingTop: "100px" }}
            onClick={onClose}
          >
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full rounded-2xl p-8"
                style={{
                  maxWidth: "460px",
                  background: "#1c1c1e",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                {/* Header — centered */}
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-white mb-3">
                    Replace provider
                  </h2>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Use external providers to process transactions from fiat to cryptocurrency. The rates vary from provider to provider
                  </p>
                </div>

                {/* Provider cards */}
                <div className="space-y-3">
                  {providers.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => handleProviderClick(provider.url)}
                      className="w-full rounded-xl p-5 transition-all duration-200 flex items-center gap-4 group"
                      style={{
                        background: "#2c2c2e",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "#363638";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "#2c2c2e";
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "#1c1c1e",
                          border: "2px solid #2c2c2e",
                        }}
                      >
                        <img
                          src={provider.icon}
                          alt={provider.name}
                          className="w-8 h-8 object-contain"
                        />
                      </div>

                      {/* Text content */}
                      <div className="flex-1 text-left">
                        <h3 className="text-base font-semibold text-white mb-0.5">
                          {provider.name}
                        </h3>
                        <p className="text-sm text-white/50 leading-snug">
                          {provider.description}
                        </p>
                      </div>

                      {/* Arrow icon */}
                      <ChevronRight className="w-5 h-5 text-white/30 flex-shrink-0 group-hover:text-white/60 transition-colors" />
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default BuyModal;