import { useEffect, useState } from "react";

export type UseIsSlowProps = {
  isActive: boolean;
  ms?: number;
};

export default function useIsSlow({isActive,ms = 5000}: UseIsSlowProps): boolean {

  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {

    if (!isActive) return;

    const mytimer = setTimeout(() => {
      setIsSlow(true);
    }, ms);

   return () => { clearTimeout(mytimer); setIsSlow(false); };

  }, [isActive, ms]);

  return isActive && isSlow;
}