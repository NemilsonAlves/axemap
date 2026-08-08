export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem('axemap-theme')||'system';var r=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.classList.toggle('dark',r==='dark');document.documentElement.style.colorScheme=r;}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}