import Input from '@/components/UI/Input';
import SubmitButton from '@/components/UI/submit-btn';
import FormLayout from '@/layouts/form-layout';
import GuestNavigation from '@/layouts/nav/guest-navigation';
import {  BiPhone } from 'react-icons/bi';

function Identifie() {


  
  return (
   
      <FormLayout title='Login to your Account' subtitle='Enter your mobile phone or email  to continue.'>
         <div className="flex flex-col space-y-6 p-4">
            <div className="grid grid-cols-1 space-y-6 ">
              <Input
                variant="flushed"
                placeholder="Phone Number"
                Icon={BiPhone}
              />
             <div className="flex  justify-end "> <SubmitButton label="Continue" className='w-full  md:w-1/4' /></div>
            </div>
          </div>
      </FormLayout>
  );
}

export default Identifie;
