import HeroSection from "../components/home/HeroSection";
import BrandTicker from "../components/home/BrandTicker";
import MarketTable from "../components/home/MarketTable";
import GettingStarted from "../components/home/GettingStarted";
import ExploreMarket from "../components/home/ExploreMarket";
import InvestmentSection from "../components/home/InvestmentSection";
import EvolutionSection from "../components/home/EvolutionSection";
import FeaturesSection from "../components/home/FeaturesSection";
import FAQSection from "../components/home/FAQSection";
import CTASection from "../components/home/CTASection";

const Index = () => {
  return (
    <div>
      <HeroSection />
      <div style={{ marginTop: "-10px" }}>
        <BrandTicker />
      </div>
      <MarketTable />
      <GettingStarted />
      <ExploreMarket />
      <InvestmentSection />
      <EvolutionSection />
      <FeaturesSection />
      <FAQSection />
      <CTASection />
    </div>
  );
};

export default Index;
