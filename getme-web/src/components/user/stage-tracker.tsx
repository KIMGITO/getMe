  function StageTracker({
    stages,
    activeIndex,
  }: {
    stages: any[];
    activeIndex: number;
  }) {
    return (
      <div className="px-4 pb-4">
        <p className="text-xs text-gray-400 mb-2">Delivery stages</p>
        <div className="flex items-start">
          {stages.map((stage, i) => {
            const isDone = i < activeIndex;
            const isActive = i === activeIndex;
            const isPending = i > activeIndex;

            return (
              <div key={stage.id} className="flex items-start flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs z-10
                      ${isDone ? 'bg-tertiary text-on-tertiary' : ''}
                      ${isActive ? 'bg-transparent   ring-2' : ''}
                      ${isPending ? 'bg-gray-100 border border-gray-300 text-gray-400' : ''}
                    `}
                  >
                    {isDone ? (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span>{stage.icon}</span>
                    )}
                  </div>
                  <span
                    className={`text-center mt-1 leading-tight text-[10px]
                      ${isActive ? 'text-info font-black-tight' : 'text-gray-400'}
                    `}
                  >
                    {stage.label}
                  </span>
                </div>
                {i < stages.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mt-3 mx-0.5
                      ${i < activeIndex ? 'bg-indigo-600' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  export default StageTracker;