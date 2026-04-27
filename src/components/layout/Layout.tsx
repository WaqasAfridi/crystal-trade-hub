import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ChatBot from "../ChatBot";

const NO_FOOTER_ROUTES = ["/spot/crypto", "/futures/crypto", "/futures/stocks", "/futures/fx"];

const Layout = () => {
  const location = useLocation();
  const hideFooter = NO_FOOTER_ROUTES.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-12">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
      <ChatBot />
    </div>
  );
};

export default Layout;
