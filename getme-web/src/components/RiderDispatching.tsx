// components/RiderDispatching.tsx
import { BiLoaderAlt, BiCheckCircle } from 'react-icons/bi';

export default function RiderDispatching({ onDone }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center p-6">
      <div className="relative">
        <BiLoaderAlt className="text-6xl text-primary animate-spin" />
        <BiCheckCircle className="absolute -bottom-2 -right-2 text-2xl text-emerald-500 bg-white rounded-full" />
      </div>
      <div>
        <h2 className="text-2xl font-black">Finding Your Rider</h2>
        <p className="text-on-surface-variant">We are dispatching the nearest rider to your market location.</p>
      </div>
      <button onClick={onDone} className="text-sm text-primary font-bold underline">
        Back to Dashboard
      </button>
    </div>
  );
}