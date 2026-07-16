export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="space-y-6 text-sm text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
            <p>We collect information you provide when creating an account, listing products, making purchases, or contacting support. This includes your name, email address, payment information, and KYC documents (for sellers). We also collect usage data and cookies to improve the platform.</p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
            <p>We use your information to: (a) provide and maintain the platform, (b) process transactions, (c) verify seller identities, (d) communicate with you about your account and orders, (e) improve our services, and (f) comply with legal obligations including DPDP Act 2023 requirements.</p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. Information Sharing</h2>
            <p>We do not sell your personal information. We may share information with: (a) payment processors for transaction processing, (b) law enforcement when required by law, (c) service providers who help us operate the platform.</p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. Data Security</h2>
            <p>We implement industry-standard security measures including encryption, secure servers, and access controls. However, no internet-based service can be 100% secure. You are responsible for keeping your password confidential.</p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Your Rights (DPDP Act 2023)</h2>
            <p>Under the Digital Personal Data Protection Act 2023, you have the right to: (a) access your personal data, (b) request correction of inaccurate data, (c) request deletion of your data (with certain exceptions), (d) withdraw consent, (e) nominate a representative to exercise your rights.</p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. Contact Us</h2>
            <p>For privacy-related queries, data access requests, or to exercise your DPDP rights, contact us at privacy@codebazaar.in or create a support ticket.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
