import logo from '@assets/branding/symbol.png';

interface FormLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function FormLayout({ title, subtitle, children }: FormLayoutProps) {


  return (
    <div className="p-4 flex-1 min-h-0   max space-y-2  w-full flex items-center justify-center">
      <div className="flex w-full md:w-2xl flex-col items-center justify-center card pb-1 gap-4 px-2 rounded-b-xl  ">
        <div className="flex justify-center items-center bg-black w-14  h-14 rounded-2xl p-2">
          <img src={logo} alt="logo" className="w-32 h-12  object-contain" />
        </div>
        <div className=" bg-surface w-full rounded-xl p-6 flex flex-col space-y-6 ">
          <div className="flex flex-col gap-2">
            <p className="title-lg text-center">{title} </p>
            <p className="text-center body-sm">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default FormLayout;
