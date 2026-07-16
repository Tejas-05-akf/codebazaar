'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Flag, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function ProductReviews({ productId, reviews: initialReviews }: { productId: string; reviews: any[] }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) { toast.error('Please login to leave a review'); return; }
    if (!comment.trim()) { toast.error('Please write a review'); return; }
    setSubmitting(true);
    // Simplified: would need to check if user has a paid order for this product
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        buyer_id: user.id,
        rating,
        comment: comment.trim(),
        is_verified: false,
      })
      .select('*, buyer:profiles(name)')
      .single();
    if (error) {
      toast.error('Failed to submit review: ' + error.message);
    } else {
      setReviews([data, ...reviews]);
      setComment('');
      setRating(5);
      toast.success('Review submitted!');
    }
    setSubmitting(false);
  };

  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: reviews.filter((rev) => rev.rating === r).length,
  }));
  const total = reviews.length;
  const average = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : '0.0';

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Reviews</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <div className="text-5xl font-bold">{average}</div>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <Star key={r} className={`h-4 w-4 ${r <= Math.round(parseFloat(average)) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{total} reviews</p>
          </div>
          <div className="space-y-1">
            {ratingCounts.map((rc) => (
              <div key={rc.rating} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-muted-foreground">{rc.rating}</span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: total ? `${(rc.count / total) * 100}%` : '0%' }} />
                </div>
                <span className="w-6 text-muted-foreground text-right">{rc.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-2 space-y-6">
          {user && (
            <div className="space-y-3 rounded-lg border p-4">
              <h3 className="font-semibold text-sm">Write a Review</h3>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} onClick={() => setRating(r)}>
                    <Star className={`h-5 w-5 ${r <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Share your experience with this product..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[80px]"
              />
              <Button onClick={handleSubmit} disabled={submitting} className="bg-[#FF6B35] hover:bg-[#FF6B35]/90">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          )}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{review.buyer?.name || 'Anonymous'}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <Star key={r} className={`h-3 w-3 ${r <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                      {review.is_verified && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Verified</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                  <div className="flex items-center gap-2">
                    <button className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1">
                      <Flag className="h-3 w-3" /> Flag
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
