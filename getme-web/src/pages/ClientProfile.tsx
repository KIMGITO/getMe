import ProfileCard from '@/components/user/profile-card';
import ProfileForm from '@/components/user/profile-form';

function ClientProfile() {
  return (
   
      <section className="flex-1 overflow-hidden md:px-6">
        <div className="container mx-auto h-full py-6">
          <div className="flex flex-col justify-center items-center md:flex-row gap-4 h-full">
            <div className="md:basis-2/8 w-full  flex justify-center items-stretch  px-2 lg:px-6  overflow-scroll">
              <ProfileCard />
            </div>
            {/* RIGHT */}
            <div className="md:basis-4/8 w-full  flex justify-center items-stretch  px-2 lg:px-6  overflow-scroll">
              <div className="flex flex-col gap-4 h-full w-full card">
                <ProfileForm />
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}

export default ClientProfile;
