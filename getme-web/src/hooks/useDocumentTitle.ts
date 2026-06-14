import { ROUTES, routeTitles } from '@/constants/routes';
import { useEffect } from 'react';
import { useLocation, matchPath } from 'react-router-dom';

export function useDocumentTitle() {
  const location = useLocation();

  useEffect(() => {
    const matchedPathValue = Object.values(ROUTES).find((path) =>
      matchPath({ path: path, end: true }, location.pathname)
    );

    if (matchedPathValue && routeTitles[matchedPathValue]) {
      const title = routeTitles[matchedPathValue];
      document.title = `${title} | GetME`;
    } else {
      document.title = 'GetME';
    }
  }, [location]);
}