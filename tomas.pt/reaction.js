document.addEventListener('DOMContentLoaded', () => {
    // Menu Elements
    const menu = document.getElementById('menu');
    const btnVisual = document.getElementById('btn-visual');
    const btnAudio = document.getElementById('btn-audio');
    
    // Test Elements
    const overlay = document.getElementById('test-overlay');
    const message = document.getElementById('message');
    const resultControls = document.getElementById('result-controls');
    const btnRetry = document.getElementById('btn-retry');
    const btnBack = document.getElementById('btn-back');

    let mode = null; // 'visual' or 'audio'
    let state = 'MENU'; // MENU, WAITING, GO, RESULT
    let timeoutId = null;
    let startTime = 0;
    
    // Audio Context Setup
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = new AudioContext();

    function playBeep() {
        // Resume context if suspended (browser policy)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime); // 1000Hz beep
        
        // Quick ramp up and down to avoid clicking
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
    }

    // Event Handlers
    btnVisual.addEventListener('click', () => {
        // Initialize audio context on first user interaction to satisfy browser policies
        if (audioCtx.state === 'suspended') audioCtx.resume();
        startTest('visual');
    });

    btnAudio.addEventListener('click', () => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        startTest('audio');
    });
    
    btnRetry.addEventListener('click', (e) => {
        e.stopPropagation();
        startTest(mode);
    });
    
    btnBack.addEventListener('click', (e) => {
        e.stopPropagation();
        showMenu();
    });

    // Test Interaction (Mouse & Touch)
    overlay.addEventListener('mousedown', handleInteraction);
    overlay.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent ghost clicks and zooming
        handleInteraction(e);
    }, { passive: false });

    function showMenu() {
        state = 'MENU';
        overlay.classList.add('hidden');
        menu.classList.remove('hidden');
        clearTimeout(timeoutId);
    }

    function startTest(selectedMode) {
        mode = selectedMode;
        menu.classList.add('hidden');
        overlay.classList.remove('hidden');
        resultControls.classList.add('hidden');
        
        resetTest();
    }

    function resetTest() {
        state = 'WAITING';
        // Reset classes
        overlay.className = '';
        overlay.classList.add('state-waiting');
        
        message.innerText = mode === 'visual' ? 'Wait for White...' : 'Wait for Beep...';
        message.style.display = 'block';
        
        // Random delay between 2 and 5 seconds
        const delay = Math.floor(Math.random() * 3000) + 2000;
        
        timeoutId = setTimeout(() => {
            triggerStimulus();
        }, delay);
    }

    function triggerStimulus() {
        if (state !== 'WAITING') return; // Safety check
        
        state = 'GO';
        startTime = performance.now();
        
        if (mode === 'visual') {
            overlay.className = 'state-go';
            // Optional: Hide text so it's pure white flash? Or keep instruction?
            // "screen becomes white" -> Pure white is better.
            message.style.display = 'none'; 
        } else {
            // Audio mode
            playBeep();
            // We can keep screen black or show a visual marker. 
            // Standard audio RT tests often don't change screen to test pure audio response time.
            message.innerText = 'CLICK!';
        }
    }

    function handleInteraction(e) {
        // Ignore interactions if we are in menu or showing results (unless clicking buttons which stopPropagation)
        if (state === 'MENU' || state === 'RESULT') return;
        
        if (state === 'WAITING') {
            // Too Early
            clearTimeout(timeoutId);
            state = 'RESULT';
            overlay.className = 'state-early';
            message.innerText = 'Too Early!';
            message.style.display = 'block';
            resultControls.classList.remove('hidden');
            return;
        }
        
        if (state === 'GO') {
            const endTime = performance.now();
            const reactionTime = Math.round(endTime - startTime);
            
            state = 'RESULT';
            overlay.className = 'state-result';
            message.innerText = `${reactionTime} ms`;
            message.style.display = 'block';
            resultControls.classList.remove('hidden');
            
            // Log for debugging or potential stats saving
            console.log(`Mode: ${mode}, Time: ${reactionTime}ms`);
        }
    }
});

0
