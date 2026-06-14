import { BiUpload } from 'react-icons/bi';
import { useAuthStore } from '@/stores/authStore';

function ProfileCard() {

  const  {user} = useAuthStore();
  return (
    <div className="elevation-4 justify-center items-center w-screen  flex flex-col space-y-4 card">
      <div className="relative rounded-2xl h-28 w-28 overflow-hidden text-primary group  cursor-pointer">
        {/* Image */}
        <img
          src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=60"
          className="w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center">
          <BiUpload className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-all" />
        </div>
      </div>
      <div className="flex flex-col gap-2 text-center items-center">
        <span className="title-sm font-black uppercase">{user?.name}</span>
        <span className="body-xs text-xs">{user?.phone || user?.email}</span>
      </div>

      <div className="flex flex-col w-full items-center gap-3">
        <span className="body-lg uppercase">{user?.role || 'Customer'}</span>

        <button className=" elevation-5 p-1 rounded-full hover:border-t w-full flex items-center justify-end">

          <div className="flex items-center gap-3 border bg px-3 py-2 rounded-full bg-surface-container hover:bg-surface-container-high transition">
            <span className="text-sm font-medium">Change</span>

            <img
          src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=60"
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        </button>
      </div>
    </div>
  );
}

export default ProfileCard;
