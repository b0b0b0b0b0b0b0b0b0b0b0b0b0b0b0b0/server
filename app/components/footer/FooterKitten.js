'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
const PURR_URL = '/sounds/kitten-purr.mp3';
const FLUSH_MS = 700;
const MAX_BATCH = 5;
const ACHIEVEMENTS = [
    { count: 1, title: 'Первое знакомство', text: 'Ты погладил котика! Он запомнил тебя' },
    { count: 5, title: 'Котик замурчал', text: 'Ему нравится, продолжай' },
    { count: 10, title: 'Лучший друг', text: 'Котик мурчит, когда видит тебя' },
    { count: 25, title: 'Котик в восторге', text: 'Столько ласки котик ещё не видел' },
    { count: 50, title: 'Повелитель мурчания', text: 'Котик зовёт тебя по имени' },
    { count: 77, title: 'Счастливая лапка', text: 'Семьдесят семь! Котик загадал желание' },
    { count: 100, title: 'Легенда modrinth.black', text: 'Сто поглаживаний! Котик рассказал о тебе друзьям' },
    { count: 150, title: 'Тёплые ладошки', text: 'Котик греется о твою руку' },
    { count: 200, title: 'Мастер почесушек', text: 'Ты знаешь, где котика чесать' },
    { count: 300, title: 'Мурлыка-марафонец', text: 'Котик мурчит без остановки' },
    { count: 500, title: 'Котик-обнимашка', text: 'Пятьсот! Котик хочет обниматься' },
    { count: 777, title: 'Кото-джекпот', text: 'Три семёрки! Котику выпала удача' },
    { count: 1000, title: 'Тысяча мурчаний', text: 'Котик рассказал о тебе всем котикам' },
    { count: 2000, title: 'Котик-хранитель', text: 'Теперь котик охраняет твой сон' },
    { count: 5000, title: 'Вечная любовь', text: 'Котик твой навсегда' },
];
const EARS = [
    { outer: 'M5.7 5.6 5 0.9 10.1 3.2', inner: 'M6.6 5 6.3 2.6 8.8 3.7Z' },
    { outer: 'M18.3 5.6 19 0.9 13.9 3.2', inner: 'M17.4 5 17.7 2.6 15.2 3.7Z' },
];
let purrContext = null;
let purrBuffer = null;
let purrLoading = null;
function playPurr() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx)
            return;
        if (!purrContext)
            purrContext = new AudioCtx();
        const ctx = purrContext;
        if (ctx.state === 'suspended')
            ctx.resume();
        const start = (buffer) => {
            const at = ctx.currentTime;
            const length = 1.6 + Math.random() * 0.4;
            const offset = Math.random() * Math.max(0, buffer.duration - length);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.playbackRate.value = 0.96 + Math.random() * 0.08;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.0001, at);
            gain.gain.exponentialRampToValueAtTime(0.45, at + 0.25);
            gain.gain.setValueAtTime(0.45, at + length - 0.6);
            gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
            source.connect(gain).connect(ctx.destination);
            source.start(at, offset, length + 0.05);
        };
        if (purrBuffer) {
            start(purrBuffer);
            return;
        }
        if (!purrLoading) {
            purrLoading = fetch(PURR_URL)
                .then((response) => response.arrayBuffer())
                .then((data) => ctx.decodeAudioData(data))
                .then((buffer) => {
                purrBuffer = buffer;
                return buffer;
            })
                .catch(() => null);
        }
        purrLoading.then((buffer) => {
            if (buffer)
                start(buffer);
        });
    }
    catch { }
}
function KittenFace({ mood, look }) {
    return (<svg className="fk-face" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
      {EARS.map((ear, index) => (<g key={ear.outer} className={`fk-ear fk-ear--${index ? 'right' : 'left'}`}>
          <path d={ear.outer} strokeLinejoin="round" className="fk-fill"/>
          <path d={ear.inner} stroke="none" className="fk-inner"/>
        </g>))}
      <circle cx="12" cy="12" r="9" className="fk-fill"/>
      <ellipse cx="7.6" cy="13.4" rx="1.5" ry="0.9" stroke="none" className={`fk-cheek${mood === 'happy' ? ' fk-cheek--blush' : ''}`}/>
      <ellipse cx="16.4" cy="13.4" rx="1.5" ry="0.9" stroke="none" className={`fk-cheek${mood === 'happy' ? ' fk-cheek--blush' : ''}`}/>
      {mood === 'happy' ? (<path d="M7.9 10.6q1.3-1.8 2.6 0M13.5 10.6q1.3-1.8 2.6 0"/>) : mood === 'blink' ? (<path d="M8 10.2h2.4M13.6 10.2h2.4"/>) : (<g stroke="none">
          {[9.2, 14.8].map((cx) => (<g key={cx}>
              <circle cx={cx + look.x * 0.7} cy={10 + look.y * 0.6} r="1.35" fill="currentColor"/>
              <circle cx={cx + look.x * 0.7 - 0.45} cy={10 + look.y * 0.6 - 0.45} r="0.42" fill="white"/>
            </g>))}
        </g>)}
      <path d="M11.4 12.5h1.2l-.6.7Z" fill="currentColor" strokeWidth="1" strokeLinejoin="round"/>
      {mood === 'happy' ? (<path d="M10.6 13.4q1.4 1.8 2.8 0"/>) : (<path d="M12 13.3q-.4 1.4-1.6 1.1M12 13.3q.4 1.4 1.6 1.1"/>)}
      <path d="M3.6 12.2 6.4 12.8M3.9 14.6l2.6-.7M20.4 12.2l-2.8.6M20.1 14.6l-2.6-.7" strokeWidth="1"/>
    </svg>);
}
export default function FooterKitten() {
    const ref = useRef(null);
    const [look, setLook] = useState({ x: 0, y: 0 });
    const [mood, setMood] = useState('look');
    const [hop, setHop] = useState(false);
    const [hearts, setHearts] = useState([]);
    const [pets, setPets] = useState(null);
    const [signedIn, setSignedIn] = useState(null);
    const [loginHref, setLoginHref] = useState('/login');
    const [toast, setToast] = useState(null);
    const moodTimer = useRef(undefined);
    const toastTimer = useRef(undefined);
    const flushTimer = useRef(undefined);
    const pending = useRef(0);
    const sending = useRef(false);
    const heartId = useRef(0);
    const calm = useRef(false);
    useEffect(() => {
        setLoginHref(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        fetch('/api/kitten', { cache: 'no-store' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
            const value = typeof data?.pets === 'number' ? data.pets : null;
            setSignedIn(value !== null);
            setPets(value);
        })
            .catch(() => setSignedIn(false));
    }, []);
    useEffect(() => {
        calm.current = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
        if (calm.current)
            return undefined;
        const onMove = (event) => {
            const rect = ref.current?.getBoundingClientRect();
            if (!rect)
                return;
            const dx = event.clientX - (rect.left + rect.width / 2);
            const dy = event.clientY - (rect.top + rect.height / 2);
            const length = Math.hypot(dx, dy) || 1;
            const reach = Math.min(1, length / 220);
            setLook({ x: (dx / length) * reach, y: (dy / length) * reach });
        };
        let blinkTimer;
        const blink = () => {
            blinkTimer = setTimeout(() => {
                setMood((current) => {
                    if (current !== 'look')
                        return current;
                    clearTimeout(moodTimer.current);
                    moodTimer.current = setTimeout(() => setMood('look'), 150);
                    return 'blink';
                });
                blink();
            }, 2400 + Math.random() * 3200);
        };
        blink();
        window.addEventListener('pointermove', onMove);
        return () => {
            window.removeEventListener('pointermove', onMove);
            clearTimeout(blinkTimer);
            clearTimeout(moodTimer.current);
            clearTimeout(toastTimer.current);
            clearTimeout(flushTimer.current);
        };
    }, []);
    const flush = useCallback(() => {
        if (sending.current || pending.current <= 0)
            return;
        const add = Math.min(MAX_BATCH, pending.current);
        pending.current -= add;
        sending.current = true;
        fetch('/api/kitten', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ add }),
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
            if (typeof data?.pets === 'number')
                setPets(data.pets + pending.current);
        })
            .catch(() => { })
            .finally(() => {
            sending.current = false;
            if (pending.current > 0)
                flushTimer.current = setTimeout(flush, FLUSH_MS);
        });
    }, []);
    const pet = useCallback(() => {
        clearTimeout(moodTimer.current);
        setMood('happy');
        moodTimer.current = setTimeout(() => setMood('look'), 1300);
        playPurr();
        if (signedIn) {
            setPets((current) => {
                const next = (current ?? 0) + 1;
                const unlocked = ACHIEVEMENTS.find((item) => item.count === next);
                if (unlocked) {
                    clearTimeout(toastTimer.current);
                    setToast(unlocked);
                    toastTimer.current = setTimeout(() => setToast(null), 4200);
                }
                return next;
            });
            pending.current += 1;
            clearTimeout(flushTimer.current);
            if (pending.current >= MAX_BATCH)
                flush();
            else
                flushTimer.current = setTimeout(flush, FLUSH_MS);
        }
        if (calm.current)
            return;
        setHop(false);
        requestAnimationFrame(() => setHop(true));
        const fresh = Array.from({ length: 5 }, (_, index) => ({
            id: ++heartId.current,
            x: (Math.random() - 0.5) * 70,
            rise: 46 + Math.random() * 34,
            sway: (Math.random() - 0.5) * 24,
            delay: index * 55,
        }));
        setHearts((current) => [...current, ...fresh]);
        setTimeout(() => setHearts((current) => current.filter((heart) => !fresh.includes(heart))), 1500);
    }, [signedIn, flush]);
    const count = pets ?? 0;
    const nextGoal = ACHIEVEMENTS.find((item) => item.count > count);
    const unlockedCount = ACHIEVEMENTS.filter((item) => item.count <= count).length;
    return (<div className="fk">
      <div className="fk-stage">
        <button ref={ref} type="button" className={`fk-button${hop ? ' fk-button--hop' : ''}`} onClick={pet} onAnimationEnd={() => setHop(false)} aria-label="Погладить котика">
          <KittenFace mood={mood} look={look}/>
        </button>
        {hearts.map((heart) => (<span key={heart.id} className="fk-heart" style={{
                '--fk-x': `${heart.x}px`,
                '--fk-rise': `${-heart.rise}px`,
                '--fk-sway': `${heart.sway}px`,
                animationDelay: `${heart.delay}ms`,
            }} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.4 5 6.9 5c2 0 3.5 1.1 5.1 3 1.6-1.9 3.1-3 5.1-3 3.5 0 5.7 3.6 4.4 6.8C19.5 16.4 12 21 12 21z"/>
            </svg>
          </span>))}
      </div>

      <div className="fk-info">
        {signedIn ? (<>
            <p className="fk-say">{count ? 'Мур! Погладь ещё' : 'Погладь котика'}</p>
            <p className="fk-count">
              {count ? `Поглажено: ${count}` : 'Он очень ждёт'}
              {nextGoal && count > 0 ? ` · до ачивки ${nextGoal.count - count}` : ''}
            </p>
            {unlockedCount > 0 && (<p className="fk-count">Ачивок: {unlockedCount} из {ACHIEVEMENTS.length}</p>)}
          </>) : (<>
            <p className="fk-say">Погладь котика</p>
            <p className="fk-count">
              {signedIn === false ? (<a href={loginHref} className="fk-login">Войди, чтобы котик тебя запомнил</a>) : ('Котик просыпается…')}
            </p>
          </>)}
      </div>

      {toast && (<div className="fk-toast" role="status" aria-live="polite">
          <span className="fk-toast-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>
            </svg>
          </span>
          <span className="fk-toast-text">
            <span className="fk-toast-kicker">Ачивка получена</span>
            <span className="fk-toast-title">{toast.title}</span>
            <span className="fk-toast-desc">{toast.text}</span>
          </span>
        </div>)}
    </div>);
}
