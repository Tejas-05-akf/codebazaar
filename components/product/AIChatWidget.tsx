'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChatWidget({ productSlug, productTitle }: { productSlug: string; productTitle: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hi! I'm your AI assistant for **${productTitle}**. Ask me anything about this product — features, tech stack, compatibility, or pricing!` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        `Great question! ${productTitle} is designed for production use and comes with comprehensive documentation.`,
        `Yes, this product supports all major browsers and is fully responsive. The tech stack is modern and well-tested.`,
        `The price of ₹${(Math.random() * 1000 + 100).toFixed(0)} is competitive for this quality of code. You get lifetime updates and support!`,
        `This product is built with the latest standards. It integrates well with popular tools and frameworks.`,
        `I can assure you that the code quality is excellent — all products on CodeBazaar are reviewed before listing.`,
      ];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setLoading(false);
    }, 1500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#FF6B35] text-white shadow-lg hover:bg-[#FF6B35]/90 transition-all flex items-center justify-center"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 h-[500px] rounded-xl border bg-background shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b p-4 bg-[#FF6B35]/5">
            <div className="rounded-full bg-[#FF6B35] p-2">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Ask about this product</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#FF6B35] text-white'
                    : 'bg-muted'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center gap-1">
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-75" />
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
          <div className="border-t p-3 flex gap-2">
            <Input
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="text-sm"
            />
            <Button size="sm" className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 px-3" onClick={handleSend} disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
