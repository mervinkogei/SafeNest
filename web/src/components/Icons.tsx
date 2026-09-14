export function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (name) {
    case 'menu':
      return <svg {...props}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    case 'close':
      return <svg {...props}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case 'shield':
      return <svg {...props}><path d="M12 3l8 3v6c0 5-3.4 8.4-8 9-4.6-.6-8-4-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></svg>;
    case 'book':
      return <svg {...props}><path d="M4 5h8a3 3 0 013 3v12H7a3 3 0 00-3 3V5z" /><path d="M15 5h5v15h-5" /></svg>;
    case 'home':
      return <svg {...props}><path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9z" /></svg>;
    case 'plus':
      return <svg {...props}><path d="M12 5v14M5 12h14" /></svg>;
    case 'folder':
      return <svg {...props}><path d="M3 7h6l2 2h10v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>;
    case 'phone':
      return <svg {...props}><path d="M7 3h4l1 5-2 1a12 12 0 006 6l1-2 5 1v4a2 2 0 01-2 2C10 20 4 14 4 5a2 2 0 012-2z" /></svg>;
    case 'users':
      return <svg {...props}><path d="M16 19v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1" /><circle cx="10" cy="8" r="3" /><path d="M20 19v-1a4 4 0 00-3-3.87M16 4.13a3 3 0 010 5.74" /></svg>;
    case 'alert':
      return <svg {...props}><path d="M12 9v4M12 17h.01" /><path d="M10.3 4.9L2.8 18a2 2 0 001.7 3h14.9a2 2 0 001.7-3L13.7 4.9a2 2 0 00-3.4 0z" /></svg>;
    case 'inbox':
      return <svg {...props}><path d="M3 12h5l2 3h4l2-3h5v7H3v-7z" /><path d="M3 12l3-8h12l3 8" /></svg>;
    case 'eye':
      return <svg {...props}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>;
    case 'bell':
      return <svg {...props}><path d="M6 8a6 6 0 1112 0c0 7 3 7 3 9H3c0-2 3-2 3-9" /><path d="M10 20a2 2 0 004 0" /></svg>;
    case 'chat':
      return <svg {...props}><path d="M4 5h16v11H8l-4 4V5z" /></svg>;
    case 'logout':
      return <svg {...props}><path d="M10 7V5a2 2 0 012-2h7v18h-7a2 2 0 01-2-2v-2" /><path d="M4 12h11M12 9l3 3-3 3" /></svg>;
    case 'globe':
      return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></svg>;
    default:
      return <svg {...props}><circle cx="12" cy="12" r="8" /></svg>;
  }
}

export function riskIcon(riskType?: string) {
  if (riskType === 'threat' || riskType === 'grooming_indicator') return 'alert';
  if (riskType === 'cyberbullying' || riskType === 'harassment') return 'chat';
  return 'shield';
}
