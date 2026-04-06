import { Link } from "react-router-dom";
import { Apple, Smartphone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                <span className="text-xs font-bold text-primary">ENX</span>
              </div>
              <span className="text-lg font-bold text-foreground">Enivex</span>
            </Link>
          </div>

          {/* About Us */}
          <div>
            <h3 className="font-bold text-foreground mb-4">About Us</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Company introduction</Link></li>
            </ul>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/finance" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Finance</Link></li>
            </ul>
          </div>

          {/* Assets */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Assets</h3>
            <ul className="space-y-2">
              <li><Link to="/recharge" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Deposit</Link></li>
              <li><Link to="/withdraw" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Withdraw</Link></li>
              <li><Link to="/orders" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Order List</Link></li>
            </ul>
          </div>

          {/* Service */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Service</h3>
            <ul className="space-y-2">
              <li><Link to="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Legal Liability</Link></li>
              <li><Link to="/aml" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Anti-Money Laundering Agreement</Link></li>
            </ul>
          </div>

          {/* Download & Contact */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Enivex, faster and more efficient</p>
            <p className="text-xs text-muted-foreground mb-4">VIPServe:EnivexServer@gmail.com</p>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-xs text-foreground hover:border-primary transition-colors">
                <Apple className="w-4 h-4" />
                Download iOS
              </button>
              <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-xs text-foreground hover:border-primary transition-colors">
                <Smartphone className="w-4 h-4" />
                Download Android
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
