'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Star,
  Download,
  ExternalLink,
  Check,
  Shield,
  MessageCircle,
  Rocket,
  Code2,
  Server,
  Palette,
  Search,
  FileText,
  Wrench,
  Clock,
  User as UserIcon,
  X,
  Send,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ProductDetailData {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  category: string;
  price: number;
  setup_price: number | null;
  tech_stack: string[];
  license_type: string;
  demo_url: string | null;
  contact_whatsapp: string | null;
  thumbnail_url: string | null;
  screenshots: string[];
  download_count: number;
  average_rating: number;
  review_count: number;
  seller_id: string;
  seller: { name: string; email: string } | null;
}

function formatPrice(paise: number): string {
  return '₹' + (paise / 100).toLocaleString('en-IN');
}

function buildWhatsappUrl(phone: string | null, productTitle: string): string | null {
  if (!phone) return null;
  const message = `Hi, I am interested in ${productTitle} from CodeBazaar for my business. I'd like to know more about the pricing and setup options.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

const includedItems = [
  { icon: Code2, label: 'Full source code' },
  { icon: Palette, label: 'Responsive UI (mobile + desktop)' },
  { icon: Server, label: 'Database schema & migrations' },
  { icon: FileText, label: 'Deployment guide & docs' },
  { icon: Search, label: 'SEO tags pre-configured' },
  { icon: Wrench, label: 'Free future updates' },
];

const setupIncluded = [
  { icon: Rocket, label: 'Custom domain setup' },
  { icon: Server, label: 'Hosting configuration' },
  { icon: Palette, label: 'Logo & content replacement' },
  { icon: Clock, label: '30 days priority support' },
  { icon: Check, label: 'Everything in Source Code License' },
];

export function ProductDetail({ product }: { product: ProductDetailData }) {
  const { user } = useAuth();
  const [activeImage, setActiveImage] = useState(0);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryPlan, setInquiryPlan] = useState<'source' | 'setup'>('setup');
  const [submitting, setSubmitting] = useState(false);

  const whatsappUrl = buildWhatsappUrl(product.contact_whatsapp, product.title);
  const allImages = [product.thumbnail_url, ...product.screenshots].filter(Boolean) as string[];
  const hasImages = allImages.length > 0;
  const setupPrice = product.setup_price;

  const handleInquirySubmit = async () => {
    if (!inquiryName.trim() || !inquiryEmail.trim()) {
      toast.error('Please enter your name and email');
      return;
    }
    if (!user) {
      toast.error('Please login or chat on WhatsApp to submit an inquiry');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('support_tickets').insert({
      user_id: user.id,
      product_id: product.id,
      subject: `Inquiry: ${product.title} — ${inquiryPlan === 'setup' ? 'Turnkey Setup' : 'Source Code License'}`,
      status: 'OPEN',
    });

    if (error) {
      toast.error('Could not submit inquiry. Please try WhatsApp instead.');
    } else {
      toast.success('Inquiry sent! The seller will contact you soon.');
      setShowInquiryModal(false);
      setInquiryName('');
      setInquiryEmail('');
      setInquiryPhone('');
      setInquiryMessage('');
    }
    setSubmitting(false);
  };

  const openInquiryModal = (plan: 'source' | 'setup') => {
    setInquiryPlan(plan);
    setShowInquiryModal(true);
  };

  return (
    <div className="space-y-8 mb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Home</span>
        <span>/</span>
        <span>Browse</span>
        <span>/</span>
        <span className="text-foreground capitalize">{product.category}</span>
        <span>/</span>
        <span className="text-foreground">{product.title}</span>
      </div>

      {/* Top Section: Media + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left - Media Gallery */}
        <div className="space-y-4">
          <div className="aspect-video rounded-xl overflow-hidden border bg-muted relative">
            {hasImages ? (
              <img src={allImages[activeImage]} alt={product.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                <Code2 className="h-20 w-20 text-zinc-700" />
              </div>
            )}
            {product.demo_url && (
              <div className="absolute bottom-3 right-3">
                <a href={product.demo_url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="gap-1.5 bg-black/70 hover:bg-black/90 backdrop-blur-sm">
                    <ExternalLink className="h-3.5 w-3.5" /> Preview Demo
                  </Button>
                </a>
              </div>
            )}
          </div>
          {hasImages && allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === i ? 'border-[#FF6B35]' : 'border-transparent hover:border-muted-foreground'
                  }`}
                >
                  <img src={img} alt={`Screenshot ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {product.demo_url && (
            <div className="rounded-lg border border-[#FF6B35]/30 bg-[#FF6B35]/5 p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#FF6B35]">
                <ExternalLink className="h-4 w-4" />
                Demo Credentials
              </div>
              <p className="text-xs text-muted-foreground">
                Admin login: <span className="font-mono text-foreground">admin@example.com</span> / Password: <span className="font-mono text-foreground">demo123</span>
              </p>
              <a href={product.demo_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#FF6B35] hover:underline">
                Open live demo →
              </a>
            </div>
          )}
        </div>

        {/* Right - Product Info + Pricing */}
        <div className="space-y-6">
          {/* Title + Badges */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge className="capitalize bg-[#FF6B35] text-black hover:bg-[#FF6B35]/90">{product.category}</Badge>
              {product.seller && (
                <Badge variant="outline" className="gap-1">
                  <Shield className="h-3 w-3 text-green-500" />
                  Verified Seller
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <p className="text-muted-foreground">{product.short_description}</p>
          </div>

          {/* Rating row */}
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {product.average_rating?.toFixed(1)} ({product.review_count} reviews)
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-4 w-4 text-muted-foreground" />
              {product.download_count} downloads
            </span>
          </div>

          {/* Dual Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Source Code License */}
            <div className={`rounded-xl border-2 p-4 space-y-3 cursor-pointer transition-all ${
              inquiryPlan === 'source' ? 'border-[#FF6B35]' : 'border-border hover:border-muted-foreground'
            }`} onClick={() => setInquiryPlan('source')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-[#FF6B35]" />
                  <span className="font-semibold text-sm">Source Code License</span>
                </div>
                {inquiryPlan === 'source' && <Check className="h-4 w-4 text-[#FF6B35]" />}
              </div>
              <div className="text-2xl font-bold text-[#FF6B35]">{formatPrice(product.price)}</div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-green-500" /> Instant repo access</li>
                <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-green-500" /> Full source code</li>
                <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-green-500" /> Lifetime license</li>
              </ul>
            </div>

            {/* Complete Turnkey Setup */}
            <div className={`rounded-xl border-2 p-4 space-y-3 cursor-pointer transition-all relative ${
              inquiryPlan === 'setup' ? 'border-[#FF6B35]' : 'border-border hover:border-muted-foreground'
            }`} onClick={() => setInquiryPlan('setup')}>
              {setupPrice && (
                <div className="absolute -top-2.5 right-3 bg-[#FF6B35] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                  RECOMMENDED
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-[#FF6B35]" />
                  <span className="font-semibold text-sm">Complete Turnkey Setup</span>
                </div>
                {inquiryPlan === 'setup' && <Check className="h-4 w-4 text-[#FF6B35]" />}
              </div>
              <div className="text-2xl font-bold text-[#FF6B35]">
                {setupPrice ? formatPrice(setupPrice) : 'Custom Quote'}
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-green-500" /> Custom domain & hosting</li>
                <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-green-500" /> Logo & content replacement</li>
                <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-green-500" /> 30 days support</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white gap-2 flex-1"
              onClick={() => openInquiryModal(inquiryPlan)}
            >
              <Rocket className="h-4 w-4" />
              {inquiryPlan === 'setup' ? 'Get Custom Setup' : 'Request Quote'}
            </Button>
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button size="lg" className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp
                </Button>
              </a>
            )}
            {product.demo_url && (
              <a href={product.demo_url} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" /> Live Demo
                </Button>
              </a>
            )}
          </div>

          {/* Seller Card */}
          {product.seller && (
            <div className="rounded-lg border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-[#FF6B35]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm">{product.seller.name}</span>
                    <Shield className="h-3.5 w-3.5 text-green-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">Verified Indian Developer</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openInquiryModal(inquiryPlan)}
                className="gap-1.5"
              >
                <Send className="h-3.5 w-3.5" /> Ask a Question
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section - Full Width */}
      <div>
        <Tabs defaultValue="included">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="included">What's Included</TabsTrigger>
            <TabsTrigger value="features">Key Features</TabsTrigger>
            <TabsTrigger value="tech">Tech Stack</TabsTrigger>
            <TabsTrigger value="overview">Description</TabsTrigger>
            <TabsTrigger value="license">License</TabsTrigger>
          </TabsList>

          {/* What's Included */}
          <TabsContent value="included" className="mt-4">
            <div className="rounded-lg border p-6">
              <h3 className="font-semibold text-lg mb-4">What's Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {includedItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                    <item.icon className="h-4 w-4 text-[#FF6B35] shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
              {setupPrice && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-[#FF6B35]" />
                    With Complete Turnkey Setup ({formatPrice(setupPrice)}):
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {setupIncluded.map((item) => (
                      <div key={item.label} className="flex items-center gap-3 rounded-lg bg-[#FF6B35]/5 p-3">
                        <item.icon className="h-4 w-4 text-[#FF6B35] shrink-0" />
                        <span className="text-sm">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Key Features */}
          <TabsContent value="features" className="mt-4">
            <div className="rounded-lg border p-6">
              <h3 className="font-semibold text-lg mb-4">Key Features for Your Business</h3>
              <div className="space-y-3">
                {getBusinessFeatures(product.category).map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tech Stack */}
          <TabsContent value="tech" className="mt-4">
            <div className="rounded-lg border p-6">
              <h3 className="font-semibold text-lg mb-4">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {product.tech_stack.map((tech: string) => (
                  <Badge key={tech} variant="secondary" className="text-sm py-2 px-3 gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-[#FF6B35]" />
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Description */}
          <TabsContent value="overview" className="mt-4">
            <div className="rounded-lg border p-6">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{product.description}</div>
              </div>
            </div>
          </TabsContent>

          {/* License */}
          <TabsContent value="license" className="mt-4">
            <div className="space-y-4 rounded-lg border p-6">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#FF6B35]" />
                {product.license_type} License
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                {product.license_type === 'COMMERCIAL' && (
                  <>
                    <p>For commercial use in client projects and your own business products.</p>
                    <p><strong className="text-foreground">Allowed:</strong> Client projects, commercial SaaS, internal company tools, business deployment.</p>
                    <p><strong className="text-foreground">Not allowed:</strong> Reselling the code as a standalone product, creating competing marketplace listings.</p>
                  </>
                )}
                {product.license_type === 'PERSONAL' && (
                  <>
                    <p>For personal use only. Cannot be used in commercial projects or resold.</p>
                    <p><strong className="text-foreground">Allowed:</strong> Learning, personal portfolio, non-commercial hobby projects.</p>
                    <p><strong className="text-foreground">Not allowed:</strong> Client work, SaaS products, commercial redistribution.</p>
                  </>
                )}
                {product.license_type === 'EXTENDED' && (
                  <>
                    <p>For unlimited commercial use including redistribution within your products.</p>
                    <p><strong className="text-foreground">Allowed:</strong> All commercial uses, embedding in products sold to end users, white-label solutions.</p>
                    <p><strong className="text-foreground">Not allowed:</strong> Reselling the code as a standalone template on competing marketplaces.</p>
                  </>
                )}
                {product.license_type === 'WHITELABEL' && (
                  <>
                    <p>Full rights to rebrand and resell as your own product.</p>
                    <p><strong className="text-foreground">Allowed:</strong> All uses including resale, rebranding, and creating derivative products.</p>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowInquiryModal(false)}>
          <div className="bg-background rounded-xl border shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {inquiryPlan === 'setup' ? 'Request Custom Setup' : 'Request Quote'}
              </h2>
              <button onClick={() => setShowInquiryModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              You're inquiring about <span className="font-semibold text-foreground">{product.title}</span> — {inquiryPlan === 'setup' ? 'Complete Turnkey Setup' : 'Source Code License'}
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your name *"
                value={inquiryName}
                onChange={(e) => setInquiryName(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="email"
                placeholder="Email address *"
                value={inquiryEmail}
                onChange={(e) => setInquiryEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="tel"
                placeholder="Phone number (optional)"
                value={inquiryPhone}
                onChange={(e) => setInquiryPhone(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <textarea
                placeholder="Tell us about your business requirements..."
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowInquiryModal(false)}>Cancel</Button>
              {user ? (
                <Button
                  className="flex-1 bg-[#FF6B35] hover:bg-[#FF6B35]/90 gap-2"
                  onClick={handleInquirySubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Submit Inquiry'}
                  {!submitting && <Send className="h-4 w-4" />}
                </Button>
              ) : (
                <a href="/login" className="flex-1">
                  <Button className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 gap-2">
                    Login to Submit
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getBusinessFeatures(category: string): string[] {
  const features: Record<string, string[]> = {
    gym: [
      'Member registration and profile management with photo ID',
      'Trainer scheduling and class booking calendar',
      'QR code-based check-in portal for members and trainers',
      'Automated membership renewal reminders via SMS',
      'UPI payment integration for fees and subscriptions',
      'Attendance tracking and workout history logs',
      'Admin dashboard with revenue analytics and member insights',
    ],
    restaurant: [
      'Table reservation system with time-slot booking',
      'Digital QR menu — customers scan and order from their phone',
      'Online order manager with kitchen display integration',
      'SMS confirmation for reservations and order updates',
      'Multi-branch support for restaurant chains',
      'Bill splitting and UPI payment at table',
      'Admin dashboard with order analytics and peak-hour insights',
    ],
    salon: [
      'Online appointment booking for customers',
      'Staff scheduling and chair/station allocation',
      'Service catalog with pricing and duration',
      'Automated SMS reminders to reduce no-shows',
      'Loyalty program and repeat customer tracking',
      'UPI payment collection and invoice generation',
      'Admin dashboard with revenue and staff performance reports',
    ],
    clinic: [
      'Doctor appointment booking with specialty filter',
      'Digital prescription generation with PDF export',
      'Patient records management with visit history',
      'Appointment reminders via SMS to patients',
      'Billing and insurance claim tracking',
      'Multi-doctor support with individual calendars',
      'Reception dashboard with patient queue management',
    ],
  };

  return features[category] || [
    'Complete business management dashboard',
    'Customer/client management with contact details',
    'Booking and scheduling system',
    'Payment gateway integration (UPI / Razorpay)',
    'SMS and WhatsApp notification support',
    'Admin panel with analytics and reporting',
    'Mobile-responsive design for on-the-go access',
  ];
}
