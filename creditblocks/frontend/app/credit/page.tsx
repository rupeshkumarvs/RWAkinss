import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsBar } from '@/components/landing/StatsBar';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FeatureCards } from '@/components/landing/FeatureCards';
import { ContractAddresses } from '@/components/landing/ContractAddresses';
import { IntegrationCode } from '@/components/landing/IntegrationCode';
import { EcosystemDiagram } from '@/components/landing/EcosystemDiagram';
import { OwnerCard } from '@/components/landing/OwnerCard';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';

export const metadata = {
  title: 'CreditBlocks - AI Credit Passport on QIE',
  description: 'AI-powered soulbound NFT credit passports. One score. Every DeFi protocol on QIE.',
};

export default function CreditPage() {
  return (
    <main className="bg-[#080808] text-white min-h-screen overflow-hidden">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <FeatureCards />
      <ContractAddresses />
      <IntegrationCode />
      <EcosystemDiagram />
      <OwnerCard />
      <FinalCTA />
      <Footer />
    </main>
  );
}
