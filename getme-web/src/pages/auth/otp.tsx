import Button from '@/components/UI/Button';
import FormLayout from '@/layouts/form-layout';
import GuestNavigation from '@/layouts/nav/guest-navigation';
import { useEffect, useState } from 'react';
import { HiOutlineRefresh, HiArrowRight } from 'react-icons/hi';

function OTP() {
  const resendDelay = 60;
  const [otp, setOtp] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOTPChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // Move to previous input on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 4);

    if (!pastedData) return;

    const newOtp = [...otp];

    pastedData.split('').forEach((digit, index) => {
      if (index < 4) {
        newOtp[index] = digit;
      }
    });

    setOtp(newOtp);

    const focusIndex = Math.min(pastedData.length - 1, 3);
    document.getElementById(`otp-${focusIndex}`)?.focus();
  };

  const handleResend = () => {
    if (canResend) {
      setCountdown(resendDelay);
      setCanResend(false);
      // onResendOTP?.();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length === 4) {
      console.log('OTP Submitted:', otpCode);
      // Handle OTP verification here
    }
  };
  return (
   
      <FormLayout
        title="Verification Code"
        subtitle="Please enter the 4-digit code sent to your device."
      >
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md mx-auto p-8 rounded-lg elevation-5"
        >
          <div className="space-y-8">
            {/* OTP Input Fields */}
            <div className="flex justify-center gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold rounded-lg border-2 border-gray-300 bg-theme dark:border-gray-700 focus:border-[var(--color-getme-primary)] focus:ring-2 focus:ring-[var(--color-getme-primary)] dark:focus:border-[var(--color-accent-dark)] outline-none transition-all"
                  autoFocus={index === 0}
                  onPaste={handlePaste}
                />
              ))}
            </div>

            {/* Resend Section */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend}
                className={`
              flex items-center justify-center gap-2 mx-auto text-sm font-medium transition-colors
             ${
               canResend
                 ? 'text-[var(--color-getme-primary)] hover:underline hover:opacity-80 dark:text-[var(--color-accent-dark)]'
                 : 'text-gray-400 cursor-not-allowed dark:text-gray-600 opacity-50'
             }
    `}
              >
                <HiOutlineRefresh
                  className={`w-4 h-4 ${!canResend ? 'animate-spin' : ''}`}
                />
                {canResend ? 'Resend Code' : `Resend Code in ${countdown}s`}
              </button>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="sm"
              rightIcon={<HiArrowRight />}
              className="rounded-full"
              disabled={otp.join('').length !== 4}
            >
              Verify & Sign In
            </Button>
 
            <div className="text-center text-sm text-theme">
              <p>
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend}
                  className="text-[var(--color-getme-primary)] hover:underline dark:text-[var(--color-accent-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Click here
                </button>
              </p>
            </div>
          </div>
        </form>
      </FormLayout>
  );
}

export default OTP;
