import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, Lock, CheckCircle2 } from 'lucide-react';

const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY || 'dummy_key');

interface CheckoutFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  uid: string;
  passType: string;
  amount: number;
}

const CheckoutForm = ({ onSuccess, onCancel, uid, passType, amount }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'An error occurred.');
      setProcessing(false);
      return;
    }

    // Usually we specify a returnUrl here for redirection.
    // For a fully in-game experience without redirect, we can confirm the payment
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href, // If redirect happens
      },
      redirect: 'if_required', // Prevents redirect if not needed (e.g., standard cards)
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed.');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess();
    } else {
      setError('Unexpected state.');
    }
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      <PaymentElement />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button 
        type="submit" 
        disabled={!stripe || processing}
        className="bg-[#00ff00] text-black font-bold p-3 rounded hover:bg-green-400 disabled:opacity-50"
      >
        {processing ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
      </button>
      <button 
        type="button" 
        onClick={onCancel}
        disabled={processing}
        className="text-gray-400 text-sm hover:text-white"
      >
        Cancel
      </button>
    </form>
  );
};

export interface StripeCheckoutModalProps {
  uid: string;
  passType: 'proPlan' | 'godTier' | 'musicPass';
  onClose: () => void;
  onSuccess: () => void;
}

export function StripeCheckoutModal({ uid, passType, onClose, onSuccess }: StripeCheckoutModalProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  let amount = 500;
  if (passType === 'godTier') amount = 1500;
  if (passType === 'musicPass') amount = 200;
  
  let title = 'PRO Plan';
  if (passType === 'godTier') title = 'God of Creation Tier';
  if (passType === 'musicPass') title = 'Music Pass';

  useEffect(() => {
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, passType })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) setError(data.error);
      else setClientSecret(data.clientSecret);
    })
    .catch(err => setError(err.message));
  }, [uid, passType]);

  return (
    <div className="os-modal-overlay flex items-center justify-center z-[9999]" onClick={onClose}>
      <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-600 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Lock className="text-green-500" /> Secure Checkout
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
        </div>
        
        <div className="mb-6 flex justify-between items-center bg-black/30 p-4 rounded border border-gray-700/50">
          <div>
            <div className="text-gray-400 text-xs">PURCHASING</div>
            <div className="font-bold text-lg text-white">{title}</div>
          </div>
          <div className="text-xl font-black text-green-400 font-mono">
            ${(amount / 100).toFixed(2)}
          </div>
        </div>

        {error ? (
          <div className="bg-red-900/40 text-red-400 p-4 rounded border border-red-800 text-sm text-center">
             {error === "STRIPE_SECRET_KEY environment variable is required" 
              ? "Payment system is not fully configured (Missing Stripe Keys in Server). Please contact the developer." 
              : error}
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
            <CheckoutForm 
              onSuccess={onSuccess} 
              onCancel={onClose} 
              uid={uid} 
              passType={passType} 
              amount={amount} 
            />
          </Elements>
        ) : (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center">
            <div className="animate-spin w-8 h-8 flex justify-center items-center mb-4">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full" />
            </div>
            Initializing Secure Vault...
          </div>
        )}
      </div>
    </div>
  );
}
