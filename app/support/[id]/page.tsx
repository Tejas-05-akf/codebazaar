'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Bot, User, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    loadData();
  }, [id, user]);

  async function loadData() {
    const { data: ticketData } = await supabase
      .from('support_tickets')
      .select('*, product:products(title)')
      .eq('id', id)
      .single();
    if (!ticketData) return;
    setTicket(ticketData);

    const { data: messagesData } = await supabase
      .from('ticket_messages')
      .select('*, sender:profiles(name)')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });
    setMessages(messagesData || []);
    setLoading(false);
  }

  async function handleSend() {
    if (!user || !reply.trim()) return;
    setSending(true);
    const { error } = await supabase
      .from('ticket_messages')
      .insert({ ticket_id: id, sender_id: user.id, message: reply.trim() });
    if (error) {
      toast.error('Failed to send message');
    } else {
      setReply('');
      loadData();
    }
    setSending(false);
  }

  async function handleAIReply() {
    if (!ticket) return;
    setSending(true);
    // Simulate AI reply
    await new Promise((r) => setTimeout(r, 1500));
    const { error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: id,
        sender_id: '00000000-0000-0000-0000-000000000001',
        message: 'Thank you for reaching out. I have reviewed your ticket and will provide an update shortly. If this is urgent, please include more details about the issue.',
        is_ai: true,
      });
    if (error) {
      toast.error('Failed to generate AI reply');
    } else {
      loadData();
      toast.success('AI reply added');
    }
    setSending(false);
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please login</p>
          <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={() => window.location.href = '/login'}>Login</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading ticket...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Ticket not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button variant="ghost" size="sm" className="mb-4 gap-1" onClick={() => window.location.href = '/support'}>
          <ArrowLeft className="h-4 w-4" /> Back to Tickets
        </Button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-bold">{ticket.subject}</h1>
            <Badge
              variant={ticket.status === 'OPEN' ? 'secondary' : ticket.status === 'RESOLVED' ? 'default' : 'outline'}
              className={ticket.status === 'RESOLVED' ? 'bg-green-500' : ''}
            >
              {ticket.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {ticket.product?.title ? `Product: ${ticket.product.title} • ` : ''}
            Created {formatDate(ticket.created_at)}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-4 ${
                msg.sender_id === user.id
                  ? 'bg-[#FF6B35] text-white'
                  : msg.is_ai
                  ? 'bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800'
                  : 'bg-card border'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {msg.is_ai ? <Bot className="h-4 w-4 text-purple-500" /> : <User className="h-4 w-4" />}
                  <span className="text-xs font-medium">{msg.is_ai ? 'AI Assistant' : msg.sender?.name || 'Support'}</span>
                  <span className="text-xs opacity-70">{formatDate(msg.created_at)}</span>
                </div>
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Textarea
            placeholder="Write your reply..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex gap-2">
            <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 gap-2" onClick={handleSend} disabled={sending || !reply.trim()}>
              <Send className="h-4 w-4" /> {sending ? 'Sending...' : 'Send'}
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleAIReply} disabled={sending}>
              <Bot className="h-4 w-4" /> AI Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
