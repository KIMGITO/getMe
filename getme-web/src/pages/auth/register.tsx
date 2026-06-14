import Input from '@/components/UI/Input';
import { SignupButton } from '@/components/UI/AuthButtons'; // Swapped to our unified handler button
import FormLayout from '@/layouts/form-layout';
import { useState } from 'react';
import { BiUser, BiPhone, BiLock } from 'react-icons/bi';
import { GiShoppingCart } from 'react-icons/gi';
import { TbTruckDelivery } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { authService } from '@/services/authService';
import { useToastStore } from '@/stores/useToastStore';
import { useAuthStore } from '@/stores/authStore';

function Register() {
  const navigate = useNavigate();

  // Track inputs inside local reactive states
  const [registerAs, setRegisterAs] = useState<'client' | 'rider'>('client');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const {setAuthSession} = useAuthStore();

  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const toast = useToastStore((state) => state.toast);
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name || !phone) {
      setErrorMsg('Please fill all  required data.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.register({
        name,
        phone,
        password,
        role: registerAs,
      });

      console.log(data);

      if (data.access_token) {
        setAuthSession(data.user, data.access_token);
      }

      if (data.user.role === 'client') {
        toast({
          message: 'Success',
          variant: 'success',
          description: data.message,
          duration: 5000,
          position: 'top-center',
        });
        navigate(ROUTES.CLIENT_HOME);
      } else {
        navigate(ROUTES.LANDING);
        toast({
          message: 'Success',
          variant: 'success',
          description: data.message,
          duration: 5000,
          position: 'bottom-right',
        });
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response?.data?.errors);
      } else {
        setErrorMsg(err.response?.data?.message);
        toast({
          message: 'Error',
          variant: 'error',
          description: err.response?.data?.message,
          duration: 5000,
          position: 'bottom-right',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormLayout
      title="Create your account"
      subtitle="Register to get started using the services."
    >
      {/* Wrap everything in a semantic HTML form element */}
      <form
        onSubmit={handleRegisterSubmit}
        className="flex flex-col space-y-6 p-4"
      >
        {/* Role Toggle Selector */}
        <div
          className={`flex justify-around border-b border-outline-variant p-4 gap-4 ${errors?.role?.[0] ? 'border-b-red-500' : ''}`}
        >
          <button
            type="button" // Critical to prevent the form from submitting on toggle click
            onClick={() => setRegisterAs('client')}
            className={`flex-1 max-w-[160px] p-4 rounded-xl text-center flex flex-col justify-center items-center transition-all border ${
              registerAs === 'client'
                ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                : 'border-outline-variant text-on-surface-variant bg-surface hover:bg-surface-container-low'
            }`}
          >
            <GiShoppingCart className="text-2xl mb-1" />
            <p className="text-sm">Order Errands</p>
            <span className="text-xs mt-1 opacity-70">Customer</span>
          </button>

          <button
            type="button"
            onClick={() => setRegisterAs('rider')}
            className={`flex-1 max-w-[160px] p-4 rounded-xl text-center flex flex-col justify-center items-center transition-all border ${
              registerAs === 'rider'
                ? 'border-secondary bg-secondary/10 text-secondary font-bold shadow-sm'
                : 'border-outline-variant text-on-surface-variant bg-surface hover:bg-surface-container-low'
            }`}
          >
            <TbTruckDelivery className="text-2xl mb-1" />
            <p className="text-sm">Deliver & Earn</p>
            <span className="text-xs mt-1 opacity-70">Rider</span>
          </button>
        </div>

        {/* Informational Error Overlay Panel */}
        {errors?.role?.[0] && (
          <div className=" text-center relative  -top-4 text-xs font-semibold text-error   rounded-xl">
            {errors?.role?.[0]}
          </div>
        )}

        {/* Informational Error Overlay Panel */}
        {errorMsg && (
          <div className="p-3 text-xs font-semibold text-error bg-error/10  rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Core Input Field Modules */}
        <div className="grid grid-cols-1 gap-6">
          <Input
            variant="flushed"
            placeholder="Full Name"
            Icon={BiUser}
            value={name}
            onChange={(e) => {
              (setName(e.target.value), setErrorMsg(null));
            }}
            error={errors?.name?.[0]}
          />
          <Input
            variant="flushed"
            placeholder="Phone Number"
            Icon={BiPhone}
            value={phone}
            onChange={(e) => {
              (setPhone(e.target.value), setErrorMsg(null));
            }}
            error={errors?.phone?.[0]}
          />
          <Input
            variant="flushed"
            Icon={BiLock}
            value={password}
            type="password"
            showPasswordToggle
            onChange={(e) => {
              (setPassword(e.target.value), setErrorMsg(null));
            }}
            error={errors?.password?.[0]}
          />

          {/* Form Action submission handler */}
          <SignupButton
            type="submit"
            isLoading={isLoading}
            className="w-full mt-2"
          />
        </div>
      </form>
    </FormLayout>
  );
}

export default Register;


