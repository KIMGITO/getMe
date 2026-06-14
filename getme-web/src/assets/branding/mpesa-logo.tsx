export function MpesaLogo({ className = "h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Green brand marker swoosh segment */}
      <path d="M10 5C25 5 32 22 45 22C58 22 62 8 80 8C95 8 105 20 115 22" stroke="#4CAF50" strokeWidth="6" strokeLinecap="round"/>
      {/* M-Pesa typography markers */}
      <text x="5" y="38" fill="#1B5E20" fontSize="24" fontWeight="900" fontFamily="sans-serif">M-PESA</text>
    </svg>
  );
}