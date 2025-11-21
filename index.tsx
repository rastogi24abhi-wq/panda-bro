import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Types
type GameState = 'IDLE' | 'EATING' | 'STYLING' | 'SLEEPING';
type OutfitState = {
  head: number;
  glasses: number;
  neck: number;
};

type ChatMessage = {
  sender: 'user' | 'panda';
  text: string;
};

// --- Icons ---
const BrushIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2c-2.5 0-5.2 1.5-6 4.2-1 3.3.5 6.2 2.5 8.3C5 16.5 5 18 5 22h7c0-4 0-5.5-1-7.5 2-2.1 3.5-5 2.5-8.3-.8-2.7-3.5-4.2-6-4.2Z"/></svg>
);
const TreatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" /><path d="M10 8c0 3 2 4.5 2 6" /><path d="M14 8c0 3-2 4.5-2 6" /><path d="M12 14v7" /></svg>
);
const SleepIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /><path d="M19 3v4" /><path d="M21 5h-4" /></svg>
);
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
);
const DressUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/><path d="M12 6V4a2 2 0 0 0-2-2h-4"/></svg>
);
const HatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22h20"/><path d="M5 22v-8.5a6.5 6.5 0 0 1 12.9 0V22"/><path d="M12 16v1"/><path d="M12 11v1"/></svg>
);
const GlassesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="12" r="4"/><circle cx="18" cy="12" r="4"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
);
const NecklaceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10Z"/><path d="M12 6v2"/><path d="M12 16v2"/></svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);


// --- Wardrobe Data ---
const HEAD_ITEMS = ['BOW', 'CROWN', 'BERET', 'PARTY', 'NONE'];
const GLASSES_ITEMS = ['NONE', 'ROUND', 'HEART', 'STAR'];
const NECK_ITEMS = ['NONE', 'PEARLS', 'SCARF', 'BOWTIE'];

// --- Glamorous Panda Component ---
const GlamPanda = ({ state, outfit, stats }: { state: GameState, outfit: OutfitState, stats: { hunger: number, glam: number, energy: number } }) => {
  const { hunger, energy } = stats;
  const isSleeping = state === 'SLEEPING';
  const isEating = state === 'EATING';
  const isStyling = state === 'STYLING';
  
  // Reactive states
  const isTired = energy < 40;
  const isHungry = hunger < 30;
  const isHappy = hunger > 80 && energy > 80;

  const headType = HEAD_ITEMS[outfit.head];
  const glassesType = GLASSES_ITEMS[outfit.glasses];
  const neckType = NECK_ITEMS[outfit.neck];

  // Sound Effect for Clicking Face
  const playSqueak = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Cute "Peep!" sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.1); // Slide up
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.01); // Attack
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15); // Decay
    
    osc.start(t);
    osc.stop(t + 0.15);
  };

  return (
    <div className={`relative w-72 h-72 transition-all duration-500 
      ${isStyling ? '' : 'animate-float'} 
      ${isEating ? 'animate-wiggle' : ''}
      ${isSleeping ? 'scale-95' : ''}
    `}>
      <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-2xl overflow-visible">
        
        <defs>
          <linearGradient id="furGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F3F4F6" />
          </linearGradient>
          <linearGradient id="blushGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBCFE8" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>
          <filter id="sparkleGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Ears (Behind Head) */}
        <circle cx="45" cy="50" r="24" fill="#374151" />
        <circle cx="155" cy="50" r="24" fill="#374151" />
        <circle cx="45" cy="50" r="12" fill="#FBCFE8" />
        <circle cx="155" cy="50" r="12" fill="#FBCFE8" />

        {/* Feet (Legs) - Sitting facing forward */}
        <ellipse cx="60" cy="195" rx="24" ry="18" fill="#374151" />
        <ellipse cx="140" cy="195" rx="24" ry="18" fill="#374151" />
        
        {/* Foot Pads */}
        <circle cx="60" cy="198" r="9" fill="#FBCFE8" />
        <circle cx="140" cy="198" r="9" fill="#FBCFE8" />
        <circle cx="50" cy="188" r="3.5" fill="#FBCFE8" />
        <circle cx="60" cy="184" r="3.5" fill="#FBCFE8" />
        <circle cx="70" cy="188" r="3.5" fill="#FBCFE8" />
        
        <circle cx="130" cy="188" r="3.5" fill="#FBCFE8" />
        <circle cx="140" cy="184" r="3.5" fill="#FBCFE8" />
        <circle cx="150" cy="188" r="3.5" fill="#FBCFE8" />

        {/* Body */}
        <ellipse cx="100" cy="155" rx="72" ry="62" fill="url(#furGradient)" stroke="#E5E7EB" strokeWidth="2"/>
        
        {/* Tummy Patch */}
        <ellipse cx="100" cy="165" rx="45" ry="35" fill="white" opacity="0.8" />

        {/* Arms - distinct left and right arms */}
        <path d="M42 120 Q 25 145 60 155" stroke="#374151" strokeWidth="22" strokeLinecap="round" fill="none" />
        
        {isEating ? (
            <path d="M158 120 Q 165 140 125 130" stroke="#374151" strokeWidth="22" strokeLinecap="round" fill="none" />
        ) : (
            <path d="M158 120 Q 175 145 140 155" stroke="#374151" strokeWidth="22" strokeLinecap="round" fill="none" />
        )}

        {/* Interactive Face Group */}
        <g onClick={playSqueak} style={{ cursor: 'pointer' }} className="active:scale-95 transition-transform origin-center">
          {/* Head */}
          <circle cx="100" cy="90" r="65" fill="url(#furGradient)" stroke="#E5E7EB" strokeWidth="2" />

          {/* Eye Patches */}
          <g transform="translate(0, 5)">
            <ellipse cx="65" cy="85" rx="18" ry="22" fill="#374151" transform="rotate(-15 65 85)" />
            <ellipse cx="135" cy="85" rx="18" ry="22" fill="#374151" transform="rotate(15 135 85)" />

            {/* Eyes */}
            {isSleeping ? (
              <g stroke="white" strokeWidth="4" fill="none" strokeLinecap="round">
                <path d="M55 88 Q 65 92 75 88" />
                <path d="M125 88 Q 135 92 145 88" />
              </g>
            ) : (
              <g className="animate-blink">
                {/* Left Eye */}
                <circle cx="68" cy="82" r="8" fill="white" />
                <circle cx="65" cy="88" r="9" fill="#1F2937" />
                <circle cx="68" cy="84" r="3" fill="white" filter="url(#sparkleGlow)"/>
                <circle cx="63" cy="90" r="2" fill="white" opacity="0.7"/>
                
                {/* Right Eye */}
                <circle cx="132" cy="82" r="8" fill="white" />
                <circle cx="135" cy="88" r="9" fill="#1F2937" />
                <circle cx="132" cy="84" r="3" fill="white" filter="url(#sparkleGlow)"/>
                <circle cx="137" cy="90" r="2" fill="white" opacity="0.7"/>

                {/* Droopy Eyelids for Tiredness */}
                {isTired && !isEating && (
                  <g fill="#374151">
                      <path d="M50 70 H 80 V 82 H 50 Z" transform="rotate(-15 65 85)" />
                      <path d="M120 70 H 150 V 82 H 120 Z" transform="rotate(15 135 85)" />
                  </g>
                )}
              </g>
            )}
          </g>

          {/* Nose & Mouth */}
          <g transform="translate(0, 5)">
            <ellipse cx="100" cy="100" rx="8" ry="5" fill="#374151" />
            <circle cx="98" cy="99" r="2" fill="white" opacity="0.3" />
            
            {/* Mouth Variants */}
            {isEating ? (
              <path d="M95 110 Q 100 120 105 110 Z" fill="#F87171" />
            ) : isTired && !isSleeping ? (
              // Yawn (Open O)
              <circle cx="100" cy="110" r="6" fill="#374151" />
            ) : isHungry ? (
              // Sad Mouth
              <path d="M92 112 Q 100 106 108 112" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />
            ) : (
              // Happy Smile
              <path d="M92 108 Q 100 115 108 108" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />
            )}
            
            {/* Tiny tongue if very happy */}
            {isHappy && !isEating && !isSleeping && !isTired && (
              <path d="M98 112 Q 100 115 102 112" fill="#F87171" />
            )}
          </g>

          {/* Cheeks (Blush) */}
          <ellipse cx="50" cy="105" rx="10" ry="6" fill="url(#blushGradient)" opacity="0.6" />
          <ellipse cx="150" cy="105" rx="10" ry="6" fill="url(#blushGradient)" opacity="0.6" />
        </g>

        {/* --- Accessories Layer --- */}
        
        {/* Glasses */}
        {!isSleeping && glassesType === 'ROUND' && (
            <g stroke="#1F2937" strokeWidth="3" fill="rgba(255,255,255,0.2)">
                <circle cx="65" cy="90" r="20" />
                <circle cx="135" cy="90" r="20" />
                <path d="M85 90 L 115 90" strokeWidth="2"/>
            </g>
        )}
        {!isSleeping && glassesType === 'HEART' && (
            <g stroke="#EC4899" strokeWidth="3" fill="rgba(255, 192, 203, 0.3)">
                <path d="M65 95 m -22 -10 a 10 10 0 0 1 20 0 a 10 10 0 0 1 20 0 l -20 20 l -20 -20 z" transform="scale(1.1) translate(-5,-5)" />
                <path d="M135 95 m -22 -10 a 10 10 0 0 1 20 0 a 10 10 0 0 1 20 0 l -20 20 l -20 -20 z" transform="scale(1.1) translate(0,-5)" />
                <path d="M85 85 L 115 85" strokeWidth="2" />
            </g>
        )}
        {!isSleeping && glassesType === 'STAR' && (
             <g stroke="#FBBF24" strokeWidth="3" fill="rgba(253, 224, 71, 0.3)">
                <path d="M65 90 l 5 15 l -15 -10 l 20 0 l -15 10 z" transform="scale(2.5) translate(20, 25)" />
                <path d="M135 90 l 5 15 l -15 -10 l 20 0 l -15 10 z" transform="scale(2.5) translate(48, 25)" />
                 <path d="M85 85 L 115 85" strokeWidth="2" />
             </g>
        )}

        {/* Headwear */}
        {headType === 'BOW' && (
            <g transform="translate(100, 35)">
                <path d="M0 10 Q -20 -10 -40 10 Q -20 30 0 10" fill="#F472B6" stroke="#DB2777" strokeWidth="1"/>
                <path d="M0 10 Q 20 -10 40 10 Q 20 30 0 10" fill="#F472B6" stroke="#DB2777" strokeWidth="1"/>
                <circle cx="0" cy="10" r="8" fill="#FBCFE8" stroke="#DB2777" strokeWidth="1"/>
            </g>
        )}
        {headType === 'CROWN' && (
            <g transform="translate(100, 30)">
                <path d="M-30 20 L -30 -10 L -15 10 L 0 -20 L 15 10 L 30 -10 L 30 20 Z" fill="#FCD34D" stroke="#D97706" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="0" cy="-20" r="4" fill="#EF4444" />
                <circle cx="-30" cy="-10" r="3" fill="#3B82F6" />
                <circle cx="30" cy="-10" r="3" fill="#3B82F6" />
            </g>
        )}
        {headType === 'BERET' && (
             <g transform="translate(100, 35)">
                 <ellipse cx="10" cy="0" rx="55" ry="20" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
                 <path d="M10 -20 L 15 -25" stroke="#B91C1C" strokeWidth="3" />
             </g>
        )}
        {headType === 'PARTY' && (
             <g transform="translate(100, 25)">
                 <path d="M-20 35 L 0 -35 L 20 35" fill="#60A5FA" stroke="#2563EB" strokeWidth="2" strokeLinejoin="round" />
                 <circle cx="0" cy="-35" r="6" fill="#FCD34D" />
                 {/* Polka dots */}
                 <circle cx="-5" cy="10" r="3" fill="white" opacity="0.5"/>
                 <circle cx="5" cy="-10" r="3" fill="white" opacity="0.5"/>
                 <circle cx="5" cy="25" r="3" fill="white" opacity="0.5"/>
             </g>
        )}

        {/* Neckwear */}
        {neckType === 'PEARLS' && (
             <g transform="translate(100, 145)">
                <path d="M-40 0 Q 0 35 40 0" stroke="none" fill="none" id="pearlPath" />
                <g fill="#F9FAFB" stroke="#D1D5DB" strokeWidth="1">
                    <circle cx="-35" cy="5" r="6" />
                    <circle cx="-22" cy="12" r="6" />
                    <circle cx="-8" cy="16" r="6" />
                    <circle cx="8" cy="16" r="6" />
                    <circle cx="22" cy="12" r="6" />
                    <circle cx="35" cy="5" r="6" />
                </g>
             </g>
        )}
        {neckType === 'SCARF' && (
             <g transform="translate(100, 140)">
                 <path d="M-45 0 Q 0 30 45 0 Q 40 20 0 40 Q -40 20 -45 0" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
                 <path d="M25 20 L 35 55 L 55 50 L 40 15" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
             </g>
        )}
        {neckType === 'BOWTIE' && (
             <g transform="translate(100, 150)">
                <path d="M0 0 L -20 -10 L -20 10 Z" fill="#10B981" />
                <path d="M0 0 L 20 -10 L 20 10 Z" fill="#10B981" />
                <circle cx="0" cy="0" r="4" fill="#059669" />
             </g>
        )}

        {/* Styling Action: Makeup Brush */}
        {isStyling && (
            <g className="animate-brush origin-center">
                 <path d="M140 130 L 170 160" stroke="#F9A8D4" strokeWidth="6" strokeLinecap="round" />
                 <rect x="130" y="120" width="15" height="20" rx="2" fill="#FBCFE8" transform="rotate(-45 137.5 130)" />
                 <path d="M120 110 Q 130 100 140 110 L 145 125 L 125 145 Z" fill="#EC4899" opacity="0.8" transform="rotate(-45 137.5 130)" />
                 <circle cx="110" cy="100" r="2" fill="#FDE047" className="animate-ping" />
                 <circle cx="120" cy="90" r="3" fill="white" className="animate-pulse" />
            </g>
        )}
        
        {/* Eating Item */}
        {isEating && (
             <g transform="translate(105, 110) rotate(-10)">
                <rect x="2" y="0" width="6" height="40" rx="2" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
                <circle cx="5" cy="-5" r="12" fill="#A78BFA" stroke="#7C3AED" strokeWidth="1" />
                <path d="M-5 -5 L 15 -5 M 5 -15 L 5 5" stroke="white" strokeWidth="2" opacity="0.5"/>
             </g>
        )}

        {/* Sleeping Mask */}
        {isSleeping && (
            <g transform="translate(0, 5)">
                <path d="M50 75 Q 65 65 80 75 L 80 90 Q 65 100 50 90 Z" fill="#A78BFA" stroke="#8B5CF6" strokeWidth="1" />
                <path d="M120 75 Q 135 65 150 75 L 150 90 Q 135 100 120 90 Z" fill="#A78BFA" stroke="#8B5CF6" strokeWidth="1" />
                <path d="M45 82 H 20" stroke="#A78BFA" strokeWidth="3" strokeDasharray="4 2" />
                <path d="M155 82 H 180" stroke="#A78BFA" strokeWidth="3" strokeDasharray="4 2" />
                <path d="M80 82 H 120" stroke="#A78BFA" strokeWidth="2" />
            </g>
        )}

      </svg>
    </div>
  );
};

// --- Main App Component ---
const App = () => {
  // Game Stats (0-100)
  const [hunger, setHunger] = useState(70); 
  const [glam, setGlam] = useState(70); 
  const [energy, setEnergy] = useState(90); 
  
  // Game State
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [pandaMessage, setPandaMessage] = useState("Hi! Let's get sparkly!");
  
  // Wardrobe State
  const [outfit, setOutfit] = useState<OutfitState>({ head: 0, glasses: 0, neck: 0 });
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);

  // Chat
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Decay Timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (gameState !== 'SLEEPING') {
        setHunger(h => Math.max(0, h - 1));
        setGlam(g => Math.max(0, g - 1));
        setEnergy(e => Math.max(0, e - 0.5));
      } else {
        setEnergy(e => Math.min(100, e + 3));
        setHunger(h => Math.max(0, h - 0.5));
      }
    }, 2500); 
    return () => clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Actions ---
  const giveTreat = () => {
    if (gameState === 'SLEEPING') {
      setPandaMessage("Zzz... beauty sleep first...");
      return;
    }
    setGameState('EATING');
    setHunger(h => Math.min(100, h + 15));
    setPandaMessage("Yummy! Sweet treat!");
    setTimeout(() => setGameState('IDLE'), 2000);
  };

  const doMakeup = () => {
    if (gameState === 'SLEEPING') {
      setPandaMessage("Can't do makeup while napping!");
      return;
    }
    if (energy < 20) {
      setPandaMessage("Too tired to sparkle...");
      return;
    }
    setGameState('STYLING');
    setGlam(h => Math.min(100, h + 25));
    setEnergy(e => Math.max(0, e - 5));
    setPandaMessage("So pretty! Sparkle sparkle!");
    setTimeout(() => setGameState('IDLE'), 2000);
  };

  const toggleSleep = () => {
    if (gameState === 'SLEEPING') {
      setGameState('IDLE');
      setPandaMessage("I'm awake and ready to glow!");
    } else {
      setGameState('SLEEPING');
      setIsWardrobeOpen(false); // Close wardrobe if sleeping
      setPandaMessage("Beauty sleep time... night night!");
    }
  };

  // Wardrobe Cycling
  const cycleHead = () => setOutfit(p => ({ ...p, head: (p.head + 1) % HEAD_ITEMS.length }));
  const cycleGlasses = () => setOutfit(p => ({ ...p, glasses: (p.glasses + 1) % GLASSES_ITEMS.length }));
  const cycleNeck = () => setOutfit(p => ({ ...p, neck: (p.neck + 1) % NECK_ITEMS.length }));

  // --- AI Chat ---
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const context = `
        Stats: Hunger=${hunger}%, Glamour=${glam}%, Energy=${energy}%.
        Current Activity: ${gameState}.
        Outfit: Hat=${HEAD_ITEMS[outfit.head]}, Glasses=${GLASSES_ITEMS[outfit.glasses]}, Neck=${NECK_ITEMS[outfit.neck]}.
      `;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `User said: "${userMsg}" ${context}`,
        config: {
          systemInstruction: `
            You are "Panda Blushy", a fashion-forward, ultra-cute baby panda.
            - You love your current outfit (mention the hat or glasses if relevant).
            - Call the user "Bestie" or "Stylist".
            - Use emojis: 💖, ✨, 💄, 🎀.
            - Short, bubbly responses (under 20 words).
          `,
        }
      });

      const reply = response.text || "Sparkle?";
      setMessages(prev => [...prev, { sender: 'panda', text: reply }]);
      setPandaMessage(reply);
    } catch (error) {
      console.error("Error chatting:", error);
      setMessages(prev => [...prev, { sender: 'panda', text: "Oops! Out of glitter... try again?" }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 relative z-10 text-gray-800">
      
      {/* Header */}
      <header className="w-full max-w-md bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-4 mb-4 text-center border-4 border-white/50 transition-all">
        <h1 className="text-3xl font-bold text-pink-500 tracking-wide drop-shadow-sm">
          {isWardrobeOpen ? "Panda Blushy's Closet" : "Panda's Sparkle Salon"}
        </h1>
      </header>

      {/* Main Game Area */}
      <main className="w-full max-w-md flex flex-col gap-4">
        
        {/* Stats Bar (Hidden in Wardrobe mode for cleaner look, or kept? Kept for info) */}
        <div className="grid grid-cols-3 gap-3 bg-white/80 p-3 rounded-2xl shadow-md border-2 border-pink-100">
          <StatBar label="Tummy" value={hunger} color="bg-orange-300" icon={<span className="text-lg">🍭</span>} />
          <StatBar label="Glam" value={glam} color="bg-pink-400" icon={<span className="text-lg">✨</span>} />
          <StatBar label="Sleep" value={energy} color="bg-purple-400" icon={<span className="text-lg">💤</span>} />
        </div>

        {/* Panda Stage */}
        <div className="relative h-80 bg-gradient-to-b from-pink-100 to-purple-50 rounded-[2rem] shadow-2xl border-8 border-white flex flex-col items-center justify-end overflow-visible group">
          
          {/* Decor */}
          <div className="absolute top-4 left-6 text-3xl opacity-50 animate-pulse">💖</div>
          <div className="absolute top-10 right-8 text-2xl opacity-40 animate-bounce">⭐</div>
          
          {/* Message Bubble */}
          <div className={`absolute top-6 z-30 max-w-[80%] bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-lg border-2 border-pink-200 transform transition-all duration-300 ${pandaMessage ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <p className="text-pink-600 font-bold text-sm text-center leading-tight">{pandaMessage}</p>
          </div>

          {/* Panda Render */}
          <div className={`relative z-20 mb-2 transform transition-transform duration-500 ${gameState === 'STYLING' ? 'scale-105' : ''}`}>
            <GlamPanda state={gameState} outfit={outfit} stats={{ hunger, glam, energy }} />
          </div>
          
           {/* Sparkle Overlay */}
           {gameState === 'STYLING' && (
             <div className="absolute inset-0 pointer-events-none z-40 flex justify-center items-center">
                <div className="absolute text-4xl animate-ping text-yellow-300 top-1/3 left-1/3">✨</div>
                <div className="absolute text-3xl animate-ping text-white top-1/2 right-1/3 animation-delay-500">✨</div>
             </div>
           )}

          <div className="w-full h-6 bg-purple-100/50 -mb-2 rounded-b-[1.5rem]"></div>
        </div>

        {/* Controls Switcher */}
        <div className="relative h-24"> 
           {/* Using absolute positioning for smooth transition between modes if desired, 
               but simple conditional rendering is safer for layout. */}
           {isWardrobeOpen ? (
              <div className="flex justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <ActionButton onClick={cycleHead} icon={<HatIcon />} label="Hats" color="bg-blue-100 text-blue-600 border-blue-200" />
                <ActionButton onClick={cycleGlasses} icon={<GlassesIcon />} label="Eyes" color="bg-teal-100 text-teal-600 border-teal-200" />
                <ActionButton onClick={cycleNeck} icon={<NecklaceIcon />} label="Neck" color="bg-indigo-100 text-indigo-600 border-indigo-200" />
                <ActionButton onClick={() => {setIsWardrobeOpen(false); setPandaMessage("I look fabulous!");}} icon={<CheckIcon />} label="Done" color="bg-green-100 text-green-600 border-green-200" />
              </div>
           ) : (
              <div className="flex justify-center gap-4">
                <ActionButton 
                  onClick={giveTreat} 
                  icon={<TreatIcon />} 
                  label="Treat" 
                  color="bg-orange-100 text-orange-600 hover:bg-orange-200 border-orange-200"
                  disabled={gameState === 'SLEEPING'}
                />
                <ActionButton 
                  onClick={doMakeup} 
                  icon={<BrushIcon />} 
                  label="Style" 
                  color="bg-pink-100 text-pink-600 hover:bg-pink-200 border-pink-200" 
                  disabled={gameState === 'SLEEPING'}
                />
                <ActionButton 
                  onClick={toggleSleep} 
                  icon={<SleepIcon />} 
                  label={gameState === 'SLEEPING' ? "Wake Up" : "Nap"} 
                  color="bg-purple-100 text-purple-600 hover:bg-purple-200 border-purple-200" 
                />
                 <ActionButton 
                  onClick={() => {
                      if (gameState === 'SLEEPING') {
                          setPandaMessage("Can't dress up while sleeping!");
                      } else {
                          setIsWardrobeOpen(true);
                          setPandaMessage("Ooh! Fashion show time!");
                      }
                  }} 
                  icon={<DressUpIcon />} 
                  label="Dress Up" 
                  color="bg-rose-100 text-rose-600 hover:bg-rose-200 border-rose-200" 
                  disabled={gameState === 'SLEEPING'}
                />
              </div>
           )}
        </div>

        {/* Chat Section */}
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-lg p-4 flex flex-col gap-3 h-60 border-2 border-white">
          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 pr-2">
            {messages.length === 0 && (
              <div className="text-center text-purple-400 text-sm mt-8 italic">
                Say something sweet to Panda Blushy! 💖
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-pink-400 text-white rounded-br-none' 
                    : 'bg-purple-50 text-purple-900 rounded-bl-none border border-purple-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          <div className="flex gap-2 border-t border-pink-100 pt-3">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Chat with Panda Blushy..."
              className="flex-1 bg-pink-50 border-2 border-pink-100 rounded-full px-4 py-2 text-sm text-pink-800 placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
              disabled={isChatLoading}
            />
            <button 
              onClick={handleSendMessage}
              disabled={isChatLoading || !input.trim()}
              className="p-2 bg-pink-400 text-white rounded-full hover:bg-pink-500 disabled:opacity-50 transition-all shadow-md hover:shadow-lg transform active:scale-95 flex-shrink-0"
            >
              <SendIcon />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

// --- Subcomponents ---

const StatBar = ({ label, value, color, icon }: { label: string, value: number, color: string, icon: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
      <span className="flex items-center gap-1">{icon} {label}</span>
    </div>
    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-100">
      <div 
        className={`h-full ${color} transition-all duration-500 ease-out rounded-full`} 
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const ActionButton = ({ onClick, icon, label, color, disabled = false }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex flex-col items-center justify-center gap-1 
      w-20 h-20 rounded-2xl shadow-sm transition-all duration-200 border-2
      ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-300' : `${color} hover:-translate-y-1 hover:shadow-md active:scale-95`}
    `}
  >
    <div className="scale-110 drop-shadow-sm">{icon}</div>
    <span className="text-xs font-bold mt-1">{label}</span>
  </button>
);

const root = createRoot(document.getElementById('root')!);
root.render(<App />);