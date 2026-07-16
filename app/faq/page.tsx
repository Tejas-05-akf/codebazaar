import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'What is CodeBazaar?', a: 'CodeBazaar is India\'s marketplace for developer products — code templates, SaaS boilerplates, UI components, and developer tools. Built by Indian developers, for Indian developers.' },
  { q: 'Are prices inclusive of GST?', a: 'Yes, all prices shown on CodeBazaar are GST inclusive. You pay exactly what you see.' },
  { q: 'What license do I get when I purchase a product?', a: 'Each product has a specific license type (Personal, Commercial, Extended, or Whitelabel). The license details are shown on the product page. Please read the license tab before purchasing.' },
  { q: 'How do I download my purchased product?', a: 'After purchase, go to "My Orders" and click the Re-download button. Each product allows up to 5 downloads. If you exceed the limit, contact support.' },
  { q: 'What is your refund policy?', a: 'Due to the nature of digital products, we generally do not offer refunds. However, if the product is significantly misrepresented, contact support within 7 days for review.' },
  { q: 'How do I become a seller?', a: 'Sign up and select "Sell Products" during registration, then complete the KYC onboarding form. Our team will review your KYC within 1-2 business days.' },
  { q: 'How much do sellers earn?', a: 'Sellers earn 70% of every sale. CodeBazaar retains a 30% platform fee. GST and TDS are handled as per Indian tax law.' },
  { q: 'When do I get paid?', a: 'You can request a payout once your pending balance exceeds ₹500. Payouts are processed within 3-5 business days via UPI or bank transfer.' },
  { q: 'Can I use the product for client work?', a: 'Products with a Commercial or higher license can be used for client work. Personal license products are for non-commercial use only.' },
  { q: 'How do I get support?', a: 'Create a support ticket from your dashboard. Our team typically responds within 24 hours. You can also ask our AI assistant for quick questions about specific products.' },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2 text-center">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-center mb-8">Everything you need to know about buying, selling, and using CodeBazaar</p>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-medium text-sm hover:no-underline">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
