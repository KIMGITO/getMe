import { BiPhone, BiUser } from 'react-icons/bi';
import Dropdown from '../UI/Dropdown';
import Input from '../UI/Input';
import SubmitButton from '../UI/submit-btn';

function ProfileForm() {
  return (
    <div className=" flex flex-col  space-y-6   w-full">
    <div className="flex flex-col gap-4">
      <span className="title-sm">Language</span>

      <Dropdown
        label=""
        variant="flushed"
        options={[
          { label: 'English', value: 'en' },
          { label: 'French', value: 'fr' },
        ]}
        className="md:max-w-1/2"
      />
      </div>
      <div className="flex flex-col gap-4">
        <span className="title-sm">Emergency Contact</span>
        <div className="flex gap-4 flex-row">
          <Input
            label=""
            variant="flushed"
            Icon={BiUser}
            placeholder="Contact Name"
            className="rounded-full"
          />
          <Input
            label=""
            variant="flushed"
            Icon={BiPhone}
            placeholder="Contact Phone"
            className="rounded-full"
          />
        </div>
      </div>
      <div className="flex justify-end">
      <SubmitButton label="Save" className="w-1/2 mt-4"></SubmitButton>

      </div>
    </div>
  );
}

export default ProfileForm;
