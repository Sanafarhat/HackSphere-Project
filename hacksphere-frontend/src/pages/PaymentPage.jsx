import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';

export const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Get registration path from location state
  const registrationPath = location.state?.registrationPath || null;
  const registrationData = location.state?.registrationData || {};

  if (!registrationPath) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4 pt-24">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Invalid Access</h1>
          <button onClick={() => navigate('/register')} className="btn-primary">
            Back to Registration
          </button>
        </div>
      </div>
    );
  }

  const handleCompletePayment = async () => {
    setLoading(true);
    // Simulate payment processing (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setCompleted(true);
    setLoading(false);

    // After showing completion, redirect based on path
    setTimeout(() => {
      if (registrationPath === 'option-1') {
        navigate('/dashboard', { state: { paymentCompleted: true } });
      } else if (registrationPath === 'option-2') {
        navigate('/recommended-teams', { state: registrationData });
      } else if (registrationPath === 'option-3') {
        navigate('/recommended-members', { state: registrationData });
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <div className="w-full max-w-lg">
        <div className="glass rounded-2xl p-8 border border-dark-600">
          {!completed ? (
            <>
              <div className="flex items-center gap-3 mb-8">
                <CreditCard className="text-accent-500" size={40} />
                <div>
                  <h1 className="text-3xl font-display font-bold text-white">Complete Payment</h1>
                  <p className="text-gray-300">Secure Checkout</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="bg-dark-800 rounded-lg p-6 border border-dark-600">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-dark-600">
                    <span className="text-gray-300">HackSphere Registration</span>
                    <span className="text-white font-bold">$0.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <span className="text-2xl font-bold gradient-accent">$0.00</span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-4">Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="payment" defaultChecked className="w-4 h-4" />
                    <span className="text-gray-300">Dummy Payment (No charge)</span>
                  </label>
                </div>
              </div>

              <div className="bg-primary-900/20 border border-primary-500/30 rounded-lg p-4 mb-8">
                <p className="text-primary-300 text-sm">
                  ℹ️ This is a demo payment flow. No actual charge will be made.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={20} />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleCompletePayment}
                  disabled={loading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <CreditCard size={20} />
                  <span>{loading ? 'Processing...' : 'Complete Payment'}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent-500/20 rounded-full animate-pulse"></div>
                  <CheckCircle className="text-accent-500" size={80} />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-gray-300 mb-2">You're all set to start your hackathon journey.</p>
              <p className="text-sm text-gray-400">
                Redirecting you to {registrationPath === 'option-1' ? 'Dashboard' : 'Team Recommendations'}...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
