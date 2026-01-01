//settings.js
(function() {
    const el = (id) => document.getElementById(id);
    const defaults = { voice: 'luna', lang: 'en-us', spd: 1.0, ptch: 0, wake: 'Hey Nova', wakeOn: true, mic: false, scTog: 'Alt + V', scMute: 'Alt + M' };

    // --- HELPER: Update Slider Background (The "Color Bar" logic) ---
    const updateSliderFill = (input) => {
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        const val = parseFloat(input.value);
        const pct = ((val - min) / (max - min)) * 100;
        
        // Check theme for track color (Light Gray vs Transparent)
        const isDark = document.documentElement.classList.contains('dark');
        const trackColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
        
        // Primary color fill
        input.style.background = `linear-gradient(to right, #8b5cf6 ${pct}%, ${trackColor} ${pct}%)`;
    };

    // --- UI UPDATES ---
    window.updateMicUI = (active) => {
        const btn = el('btn-mic');
        const dot = el('mic-dot');
        const txt = el('mic-txt');
        const vis = el('mic-vis');
        
        btn.innerText = active ? "REVOKE" : "REQUEST";
        btn.dataset.active = active;
        
        if(active) {
            dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] mic-active-pulse"; 
            txt.innerText = "Active";
            txt.className = "text-xs font-bold text-emerald-500 dark:text-emerald-400 transition-colors";
            vis.classList.remove('hidden');
        } else {
            dot.className = "w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
            txt.innerText = "Denied";
            txt.className = "text-xs font-bold text-red-500 dark:text-red-400 transition-colors";
            vis.classList.add('hidden');
        }
    };

    const apply = (s) => {
        const radio = document.querySelector(`input[name="voice_model"][value="${s.voice}"]`);
        if(radio) radio.checked = true;
        
        el('lang').value = s.lang;
        
        // Apply values and update fill color
        el('rng-spd').value = s.spd; el('lbl-spd').innerText = s.spd + 'x';
        updateSliderFill(el('rng-spd'));

        el('rng-ptch').value = s.ptch; el('lbl-ptch').innerText = s.ptch == 0 ? 'Normal' : s.ptch;
        updateSliderFill(el('rng-ptch'));

        el('inp-wake').value = s.wake;
        el('tog-wake').checked = s.wakeOn;
        el('sc-tog').value = s.scTog;
        el('sc-mute').value = s.scMute;
        updateMicUI(s.mic);
        el('settings-grid').classList.remove('invisible');
    };

    const load = () => {
        const local = JSON.parse(localStorage.getItem('novaSettings') || '{}');
        apply({ ...defaults, ...local });
    };

    const save = () => {
        const data = {
            voice: document.querySelector('input[name="voice_model"]:checked')?.value || 'luna',
            lang: el('lang').value, spd: el('rng-spd').value, ptch: el('rng-ptch').value,
            wake: el('inp-wake').value, wakeOn: el('tog-wake').checked,
            mic: el('btn-mic').dataset.active === 'true',
            scTog: el('sc-tog').value, scMute: el('sc-mute').value
        };
        localStorage.setItem('novaSettings', JSON.stringify(data));
        const btn = el('btn-save');
        const original = btn.innerText;
        btn.innerText = "Saved!";
        btn.classList.add('bg-green-600', 'from-green-600', 'to-green-600'); 
        setTimeout(() => { 
            btn.innerText = original; 
            btn.classList.remove('bg-green-600', 'from-green-600', 'to-green-600'); 
        }, 1500);
    };

    // --- LISTENERS ---
    el('btn-save').onclick = save;
    el('btn-discard').onclick = () => confirm("Undo changes?") && load();
    el('btn-mic').onclick = () => updateMicUI(el('btn-mic').dataset.active !== 'true');
    
    // Slider Events: Update text AND fill color
    el('rng-spd').oninput = (e) => { 
        el('lbl-spd').innerText = e.target.value + 'x'; 
        updateSliderFill(e.target);
    };
    el('rng-ptch').oninput = (e) => { 
        el('lbl-ptch').innerText = e.target.value == 0 ? 'Normal' : e.target.value; 
        updateSliderFill(e.target);
    };

    // Re-check slider colors when theme toggles
    const observer = new MutationObserver(() => {
         updateSliderFill(el('rng-spd'));
         updateSliderFill(el('rng-ptch'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const recordKey = (e) => {
        e.preventDefault();
        if(['Control','Alt','Shift','Meta'].includes(e.key)) return;
        const keys = [e.ctrlKey?'Ctrl':'', e.altKey?'Alt':'', e.shiftKey?'Shift':'', e.metaKey?'Cmd':'', e.key.toUpperCase()].filter(Boolean).join(' + ');
        e.target.value = keys;
        e.target.blur();
    };
    el('sc-tog').onkeydown = recordKey;
    el('sc-mute').onkeydown = recordKey;

    load();
})();
