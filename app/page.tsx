'use client';

import { MarketplaceProvider } from '@/context/MarketplaceContext';
import { HeroSection } from '@/components/home/HeroSection';
import { TrustedBy } from '@/components/home/TrustedBy';
import { BrowseByCategory } from '@/components/home/BrowseByCategory';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { WhyCodeBazaar } from '@/components/home/WhyCodeBazaar';
import { SellerBenefits } from '@/components/home/SellerBenefits';
import { Testimonials } from '@/components/home/Testimonials';
import { FAQSection } from '@/components/home/FAQSection';
import { SellerCTA } from '@/components/home/SellerCTA';

export default function HomePage() {
  return (
    <MarketplaceProvider>
      <div className="flex flex-col">
        <HeroSection />
        <TrustedBy />
        <BrowseByCategory />
        <FeaturedProducts />
        <WhyCodeBazaar />
        <Testimonials />
        <SellerBenefits />
        <FAQSection />
        <SellerCTA />
      </div>
    </MarketplaceProvider>
  );
}
