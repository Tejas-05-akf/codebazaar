'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Plus, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function SupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadTickets();
  }, [user]);

  async function loadTickets() {
    const { data } = await supabase
      .from('support_tickets')
      .select('*, product:products(title)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  }

  async function handleSubmit() {
    if (!user) { toast.error('Please login'); return; }
    if (!subject.trim() || !message.trim()) { toast.error('Please fill all fields'); return; }
    setSubmitting(true);
    
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({ user_id: user.id, subject: subject.trim(), status: 'OPEN' })
      .select()
      .single();
    
    if (ticketError || !ticket) {
      toast.error('Failed to create ticket');
      setSubmitting(false);
      return;
    }

    const { error: msgError } = await supabase
      .from('ticket_messages')
      .insert({ ticket_id: ticket.id, sender_id: user.id, message: message.trim() });

    if (msgError) {
      toast.error('Failed to add message');
    } else {
      toast.success('Ticket created!');
      setSubject('');
      setMessage('');
      setShowNew(false);
      loadTickets();
    }
    setSubmitting(false);
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please login to access support</p>
          <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={() => window.location.href = '/login'}>Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Support Tickets</h1>
            <p className="text-muted-foreground">Get help with your purchases and account</p>
          </div>
          <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 gap-2" onClick={() => setShowNew(!showNew)}>
            <Plus className="h-4 w-4" /> New Ticket
          </Button>
        </div>

        {showNew && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Create New Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="What is your issue about?" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea placeholder="Describe your issue in detail..." value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[100px]" />
              </div>
              <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Ticket'}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
              <p className="text-muted-foreground mb-4">Create a ticket if you need help with anything</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <Link key={ticket.id} href={`/support/${ticket.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{ticket.subject}</h3>
                          <Badge
                            variant={ticket.status === 'OPEN' ? 'secondary' : ticket.status === 'RESOLVED' ? 'default' : 'outline'}
                            className={ticket.status === 'RESOLVED' ? 'bg-green-500' : ''}
                          >
                            {ticket.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {ticket.product?.title ? `Product: ${ticket.product.title} • ` : ''}
                          Created {formatDate(ticket.created_at)}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
