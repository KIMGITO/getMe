import Input from '@/components/UI/Input';
import SubmitButton from '@/components/UI/submit-btn';
import FormLayout from '@/layouts/form-layout';
import GuestNavigation from '@/layouts/nav/guest-navigation';
import { BiLock, BiPhone } from 'react-icons/bi';

function Password() {
  return (
   
      <FormLayout title="Authenticate" subtitle="Enter your account password to continue.">
        <div className="flex flex-col space-y-6 p-4">
          <div className="grid grid-cols-1 space-y-6 ">
            <Input
              variant="flushed"
              Icon={BiLock}
              type="password"
              autoComplete="off"
              showPasswordToggle

            />
            <div className="flex  justify-end ">
              <SubmitButton label="Log In" className="w-full  md:w-1/4" />
            </div>
          </div>
        </div>
      </FormLayout>
  );
}

export default Password;
