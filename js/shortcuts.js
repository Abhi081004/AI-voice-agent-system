
(function() {
    function initTheme() {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage))) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
    initTheme();

    const defaults = { 
        voice: 'luna', lang: 'en-us', spd: 1.0, ptch: 0, 
        wake: 'Hey Nova', wakeOn: true, mic: false, 
        scTog: 'Alt + V', scMute: 'Alt + M' 
    };

    function getSettings() { return { ...defaults, ...JSON.parse(localStorage.getItem('novaSettings') || '{}') }; }
    function saveSettings(s) { localStorage.setItem('novaSettings', JSON.stringify(s)); }

    function showGlobalToast(msg, icon = 'check') {
        const existing = document.getElementById('global-toast');
        if(existing) existing.remove();

        const t = document.createElement('div');
        t.id = 'global-toast';
        t.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-white dark:bg-[#1a1825] border border-slate-200 dark:border-[#8b5cf6]/30 pl-4 pr-6 py-3 rounded-full shadow-xl shadow-slate-200/50 dark:shadow-[#8b5cf6]/20 backdrop-blur-md transition-all duration-300 translate-y-24 opacity-0 text-slate-800 dark:text-white font-sans';
        
        t.innerHTML = `
            <div class="w-6 h-6 rounded-full bg-violet-100 dark:bg-[#8b5cf6]/20 flex items-center justify-center text-violet-600 dark:text-[#8b5cf6]">
                <span class="material-symbols-rounded text-sm">${icon}</span>
            </div>
            <p class="text-sm font-medium">${msg}</p>
        `;
        document.body.appendChild(t);
        requestAnimationFrame(() => t.classList.remove('translate-y-24', 'opacity-0'));
        setTimeout(() => { t.classList.add('translate-y-24', 'opacity-0'); setTimeout(() => t.remove(), 300); }, 3000);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const btnTheme = document.getElementById('btn-theme-toggle');
        if(btnTheme) {
            btnTheme.addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
                const isDark = document.documentElement.classList.contains('dark');
                localStorage.theme = isDark ? 'dark' : 'light';
                showGlobalToast(isDark ? 'Dark Mode Enabled' : 'Light Mode Enabled', isDark ? 'dark_mode' : 'light_mode');
            });
        }

        document.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
            const s = getSettings();
            
            const match = (combo) => {
                if(!combo) return false;
                const parts = combo.split(' + ');
                const key = parts.pop();
                return e.key.toUpperCase() === key && e.ctrlKey === parts.includes('Ctrl') && e.altKey === parts.includes('Alt') && e.shiftKey === parts.includes('Shift');
            };

            if (match(s.scTog)) {
                e.preventDefault(); s.wakeOn = !s.wakeOn; saveSettings(s);
                showGlobalToast(`Voice Mode: ${s.wakeOn ? 'ON' : 'OFF'}`, s.wakeOn ? 'mic' : 'mic_off');
                const toggle = document.getElementById('tog-wake'); if(toggle) toggle.checked = s.wakeOn;
            }
            if (match(s.scMute)) {
                e.preventDefault(); s.mic = !s.mic; saveSettings(s);
                showGlobalToast(s.mic ? "Mic Unmuted" : "Mic Muted", s.mic ? 'graphic_eq' : 'volume_off');
                if(window.updateMicUI) window.updateMicUI(s.mic);
            }
        });
    });
})();
