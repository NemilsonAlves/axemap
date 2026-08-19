export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem('axemap-theme')||'system';var r=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.classList.toggle('dark',r==='dark');document.documentElement.style.colorScheme=r;}catch(e){}})();`;
  // suppressHydrationWarning prevents the React 19 warning about <script> tags
  // rendered in components. The script is inlined in <head> and never re-runs
  // on the client, so suppressing is safe here.
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}