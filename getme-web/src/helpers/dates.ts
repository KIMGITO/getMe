export const formatDateDMY = (isoString: string | null | undefined): string => {
  if (!isoString) return '—';

  const date = new Date(isoString);

  if (isNaN(date.getTime())) return '—';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};
