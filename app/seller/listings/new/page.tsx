'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Sparkles, Check, Upload, X } from 'lucide-react';

const categories = ['Dashboard', 'E-commerce', 'Mobile App', 'Backend', 'Data Engineering', 'UI Components', 'DevOps', 'API'];
const licenseTypes = ['PERSONAL', 'COMMERCIAL', 'EXTENDED', 'WHITELABEL'];

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function NewListingPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: '',
    price: '',
    licenseType: 'COMMERCIAL',
    shortDescription: '',
    description: '',
    techStack: [] as string[],
    demoUrl: '',
    thumbnailUrl: '',
    screenshots: [] as string[],
  });
  const [techInput, setTechInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleAddTech = () => {
    if (techInput.trim() && !form.techStack.includes(techInput.trim())) {
      setForm({ ...form, techStack: [...form.techStack, techInput.trim()] });
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setForm({ ...form, techStack: form.techStack.filter((t) => t !== tech) });
  };

  const handleAIGenerate = () => {
    setAiLoading(true);
    setTimeout(() => {
      setForm({
        ...form,
        title: form.title || 'React SaaS Dashboard Starter',
        shortDescription: 'A production-ready React dashboard with dark mode, charts, and auth. Built with TypeScript and Tailwind CSS.',
        description: 'A comprehensive React dashboard starter kit designed for SaaS applications. Features include:\n\n- Dark/Light mode toggle\n- Responsive layout with sidebar navigation\n- Recharts integration for data visualization\n- Authentication flows (login, signup, forgot password)\n- User management table\n- Settings page\n- 15+ reusable UI components\n- Form validation with React Hook Form\n- Toast notifications\n\nTech Stack: React 18, TypeScript, Tailwind CSS, Vite, React Router, Recharts',
        techStack: form.techStack.length ? form.techStack : ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Recharts'],
      });
      setAiLoading(false);
      toast.success('AI listing generated!');
    }, 2000);
  };

  const handleSubmit = async () => {
    if (!user) { toast.error('Please login'); return; }
    if (!form.title || !form.category || !form.price || !form.shortDescription) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    const slug = generateSlug(form.title) + '-' + Date.now().toString(36);
    const { data, error } = await supabase.from('products').insert({
      seller_id: user.id,
      title: form.title,
      slug,
      description: form.description,
      short_description: form.shortDescription,
      price: parseInt(form.price) * 100,
      category: form.category,
      tech_stack: form.techStack,
      license_type: form.licenseType,
      status: 'PENDING_REVIEW',
      demo_url: form.demoUrl || null,
      thumbnail_url: form.thumbnailUrl || null,
      screenshots: form.screenshots,
    }).select().single();

    if (error) {
      toast.error('Failed to create product: ' + error.message);
    } else {
      toast.success('Product submitted for review!');
      window.location.href = '/seller/listings';
    }
    setLoading(false);
  };

  const canProceed = () => {
    if (step === 1) return form.title && form.category && form.price && form.shortDescription;
    if (step === 2) return true;
    if (step === 3) return form.description;
    return true;
  };

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/seller/listings'}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">New Product Listing</h1>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`flex-1 h-2 rounded-full ${s <= step ? 'bg-[#FF6B35]' : 'bg-muted'}`} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {step === 1 && 'Step 1: Basic Info'}
              {step === 2 && 'Step 2: Media & Demo'}
              {step === 3 && 'Step 3: Details & Description'}
              {step === 4 && 'Step 4: Review & Submit'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input placeholder="e.g., React SaaS Dashboard Starter" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setForm({ ...form, category: cat })}
                        className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                          form.category === cat ? 'bg-[#FF6B35] text-white' : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Price (₹) *</Label>
                  <Input type="number" placeholder="e.g., 499" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  <p className="text-xs text-muted-foreground">Price in INR. GST will be included automatically.</p>
                </div>
                <div className="space-y-2">
                  <Label>License Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {licenseTypes.map((lt) => (
                      <button
                        key={lt}
                        onClick={() => setForm({ ...form, licenseType: lt })}
                        className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                          form.licenseType === lt ? 'bg-[#FF6B35] text-white' : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {lt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Short Description *</Label>
                  <Textarea placeholder="One-line description for cards and search results" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label>Thumbnail URL</Label>
                  <Input placeholder="https://..." value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} />
                  <p className="text-xs text-muted-foreground">Paste a Pexels or direct image URL. Recommended: 1280x720px</p>
                </div>
                <div className="space-y-2">
                  <Label>Demo URL</Label>
                  <Input placeholder="https://demo.yoursite.com" value={form.demoUrl} onChange={(e) => setForm({ ...form, demoUrl: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Screenshot URLs (one per line)</Label>
                  <Textarea
                    placeholder="https://...\nhttps://..."
                    value={form.screenshots.join('\n')}
                    onChange={(e) => setForm({ ...form, screenshots: e.target.value.split('\n').filter(Boolean) })}
                    className="min-h-[100px]"
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label>Tech Stack</Label>
                  <div className="flex gap-2">
                    <Input placeholder="e.g., React" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTech()} />
                    <Button type="button" variant="outline" onClick={handleAddTech}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {form.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary" className="gap-1">
                        {tech}
                        <button onClick={() => handleRemoveTech(tech)}><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Full Description *</Label>
                    <Button variant="ghost" size="sm" className="gap-1 text-[#FF6B35]" onClick={handleAIGenerate} disabled={aiLoading}>
                      <Sparkles className="h-4 w-4" /> {aiLoading ? 'Generating...' : 'AI Generate'}
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Describe your product in detail: features, tech stack, use cases, installation instructions..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="min-h-[200px]"
                  />
                </div>
              </>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center gap-4">
                    {form.thumbnailUrl && <img src={form.thumbnailUrl} alt="" className="h-16 w-16 rounded object-cover" />}
                    <div>
                      <h3 className="font-semibold">{form.title}</h3>
                      <p className="text-sm text-muted-foreground">{form.shortDescription}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Category:</span> {form.category}</div>
                    <div><span className="text-muted-foreground">Price:</span> ₹{form.price}</div>
                    <div><span className="text-muted-foreground">License:</span> {form.licenseType}</div>
                    <div><span className="text-muted-foreground">Tech:</span> {form.techStack.join(', ')}</div>
                  </div>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-700 dark:text-amber-400">
                  Your product will be submitted for admin review. Approval typically takes 1-2 business days.
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              {step < 4 ? (
                <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                  Next <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 gap-1" onClick={handleSubmit} disabled={loading}>
                  <Check className="h-4 w-4" /> {loading ? 'Submitting...' : 'Submit for Review'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
