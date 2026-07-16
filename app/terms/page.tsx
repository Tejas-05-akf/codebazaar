export default function TermsPage() {
  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <div className="space-y-6 text-sm text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing or using CodeBazaar, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.</p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. Platform Description</h2>
            <p>CodeBazaar is an online marketplace that connects developers who create digital products ("Sellers") with developers who purchase these products ("Buyers"). Products include but are not limited to code templates, SaaS boilerplates, UI components, and developer tools.</p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. For Buyers</h2>
            <p>All purchases are digital products. Upon successful payment, you receive a license to use the product as specified in the product listing. Each product has a specific license type (Personal, Commercial, Extended, Whitelabel). You agree to abide by the license terms. Refunds are generally not provided for digital products unless the product is significantly misrepresented.</p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. For Sellers</h2>
            <p>By listing a product, you warrant that you have the rights to sell the product. CodeBazaar takes a 30% platform fee on each sale. Sellers receive 70% of the sale price. You must complete KYC verification before receiving payouts. Payouts are processed within 3-5 business days after request.</p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Prohibited Content</h2>
            <p>You may not list products that contain malware, violate intellectual property rights, or are illegal under Indian law. CodeBazaar reserves the right to remove any listing and suspend accounts for violations.</p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. Limitation of Liability</h2>
            <p>CodeBazaar is a platform connecting buyers and sellers. We do not guarantee the quality, safety, or legality of products listed. Buyers are responsible for evaluating products before purchase. CodeBazaar is not liable for any damages arising from the use of products purchased through the platform.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
