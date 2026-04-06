import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatBot = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 h-96 bg-card border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-border bg-secondary/50">
              <h3 className="font-semibold text-foreground text-sm">Enivex Support</h3>
              <p className="text-xs text-muted-foreground">How can we help you?</p>
            </div>
            <div className="flex-1 p-4 flex items-center justify-center">
              <p className="text-sm text-muted-foreground text-center">Welcome to Enivex! Send us a message and we'll get back to you shortly.</p>
            </div>
            <div className="p-3 border-t border-border">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-50"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </>
  );
};

export default ChatBot;
