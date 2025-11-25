'use client';

import { useState, useEffect } from 'react';

export default function Calculator() {
  const [display, setDisplay] = useState('');
  const [error, setError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; btnIdx: number }>>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleButtonClick = (value: string, e: React.MouseEvent<HTMLButtonElement>, btnIdx: number) => {
    setError('');
    
    // Add ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const rippleX = e.clientX - rect.left;
    const rippleY = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x: rippleX, y: rippleY, btnIdx };
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
    
    if (value === 'AC') {
      setDisplay('');
    } else if (value === '⌫') {
      setDisplay(prev => prev.slice(0, -1));
    } else if (value === '=') {
      calculateResult();
    } else {
      setDisplay(prev => prev + value);
    }
  };

  const calculateResult = () => {
    try {
      const express = display.replace(/\s/g, '');
      
      if (!express) {
        setError('Empty expression');
        return;
      }

      let oprtInd = -1;
      let foundOprt = false;

      for (let i = 0; i < express.length; i++) {
        if (i === 0 && express[i] === '-') continue;

        if ('+-*/'.includes(express[i])) {
          if (foundOprt) {
            setError('Multiple operators detected');
            setDisplay('');
            return;
          }
          oprtInd = i;
          foundOprt = true;
        }
      }

      if (oprtInd === -1) {
        setError('No operator found');
        setDisplay('');
        return;
      }

      if (oprtInd === 0 || oprtInd === express.length - 1) {
        setError('Invalid operator position');
        setDisplay('');
        return;
      }

      const leftStr = express.slice(0, oprtInd);
      const op = express[oprtInd];
      const rightStr = express.slice(oprtInd + 1);

      const num1 = parseNumber(leftStr);
      const num2 = parseNumber(rightStr);

      let result: number;
      switch (op) {
        case '+':
          result = num1 + num2;
          break;
        case '-':
          result = num1 - num2;
          break;
        case '*':
          result = num1 * num2;
          break;
        case '/':
          if (num2 === 0) {
            setError('Cannot divide by zero');
            setDisplay('');
            return;
          }
          result = num1 / num2;
          break;
        default:
          setError('Invalid operator');
          setDisplay('');
          return;
      }

      setDisplay(result.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation error');
      setDisplay('');
    }
  };

  const parseNumber = (numStr: string): number => {
    const isPercent = numStr.endsWith('%');
    if (isPercent) numStr = numStr.slice(0, -1);

    const number = parseFloat(numStr);
    if (isNaN(number)) {
      throw new Error(`Invalid number: ${numStr}`);
    }

    return isPercent ? number / 100 : number;
  };

  const buttons = [
    'AC', '⌫', '%', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '00', '.', '='
  ];

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }
        
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.3); }
          50% { box-shadow: 0 0 40px rgba(6, 182, 212, 0.6); }
        }
        
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, rgb(15, 23, 42) 0%, rgb(30, 41, 59) 50%, rgb(15, 23, 42) 100%)'
      }}>
        {/* Animated cursor light effect */}
        <div 
          className="pointer-events-none fixed top-0 left-0 w-full h-full"
          style={{
            background: `radial-gradient(circle 600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(6, 182, 212, 0.15), transparent 40%)`,
            transition: 'background 0.1s ease'
          }}
        />

        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 4 + 2 + 'px',
                height: Math.random() * 4 + 2 + 'px',
                background: `rgba(6, 182, 212, ${Math.random() * 0.5 + 0.2})`,
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animation: `float ${Math.random() * 10 + 15}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        <div className="w-full max-w-md relative z-10" style={{
          animation: 'slideIn 0.6s ease-out'
        }}>
          <div className="rounded-3xl shadow-2xl p-8 border relative overflow-hidden" style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(6, 182, 212, 0.3)',
            animation: 'glow 3s ease-in-out infinite'
          }}>
            {/* Animated border gradient */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
              background: 'linear-gradient(45deg, transparent, rgba(6, 182, 212, 0.1), transparent)',
              backgroundSize: '200% 200%',
              animation: 'gradientShift 3s ease infinite'
            }} />

            <h1 className="text-3xl font-bold text-center mb-2 relative" style={{
              background: 'linear-gradient(to right, rgb(34, 211, 238), rgb(59, 130, 246))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'slideIn 0.8s ease-out 0.2s both'
            }}>
              Calculator
            </h1>
            <p className="text-center text-sm mb-6 relative" style={{ 
              color: 'rgb(148, 163, 184)',
              animation: 'slideIn 0.8s ease-out 0.3s both'
            }}>
              Input two numbers only
            </p>
            
            <div className="mb-6 relative" style={{
              animation: 'slideIn 0.8s ease-out 0.4s both'
            }}>
              <input
                type="text"
                value={display}
                disabled
                className="w-full rounded-2xl px-6 py-4 text-right text-2xl font-mono border-2 focus:outline-none transition-all"
                style={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  borderColor: 'rgba(6, 182, 212, 0.4)',
                  color: 'rgb(207, 250, 254)',
                  boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3), 0 0 20px rgba(6, 182, 212, 0.2)'
                }}
                placeholder="0"
              />
              {error && (
                <div className="absolute -bottom-6 left-0 right-0 text-xs text-center font-semibold" style={{
                  color: 'rgb(248, 113, 113)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  textShadow: '0 0 10px rgba(248, 113, 113, 0.5)'
                }}>
                  {error}
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3 mt-8">
              {buttons.map((btn, idx) => {
                const isOperator = ['/', '*', '-', '+', '='].includes(btn);
                const isSpecial = ['AC', '⌫', '%'].includes(btn);
                
                return (
                  <button
                    key={idx}
                    onClick={(e) => handleButtonClick(btn, e, idx)}
                    className="h-16 rounded-xl font-semibold text-lg transition-all duration-200 active:scale-95 hover:scale-105 hover:shadow-2xl relative overflow-hidden"
                    style={{
                      background: isOperator
                        ? 'linear-gradient(135deg, rgb(6, 182, 212) 0%, rgb(37, 99, 235) 100%)'
                        : isSpecial
                        ? 'linear-gradient(135deg, rgb(51, 65, 85) 0%, rgb(71, 85, 105) 100%)'
                        : 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.8) 100%)',
                      color: isOperator ? 'white' : isSpecial ? 'rgb(103, 232, 249)' : 'rgb(241, 245, 249)',
                      boxShadow: btn === '=' ? '0 10px 25px -3px rgba(6, 182, 212, 0.5)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
                      animation: `slideIn 0.5s ease-out ${0.5 + idx * 0.03}s both`
                    }}
                    onMouseEnter={(e) => {
                      if (isOperator) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgb(34, 211, 238) 0%, rgb(59, 130, 246) 100%)';
                        e.currentTarget.style.boxShadow = '0 0 30px rgba(6, 182, 212, 0.6)';
                      } else if (isSpecial) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgb(71, 85, 105) 0%, rgb(100, 116, 139) 100%)';
                      } else {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(71, 85, 105, 0.8) 0%, rgba(100, 116, 139, 0.8) 100%)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isOperator) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgb(6, 182, 212) 0%, rgb(37, 99, 235) 100%)';
                        e.currentTarget.style.boxShadow = btn === '=' ? '0 10px 25px -3px rgba(6, 182, 212, 0.5)' : '0 4px 6px rgba(0, 0, 0, 0.1)';
                      } else if (isSpecial) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgb(51, 65, 85) 0%, rgb(71, 85, 105) 100%)';
                      } else {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.8) 100%)';
                      }
                    }}
                  >
                    {btn}
                    {ripples
                      .filter(ripple => ripple.btnIdx === idx)
                      .map(ripple => (
                        <span
                          key={ripple.id}
                          className="absolute rounded-full pointer-events-none"
                          style={{
                            left: ripple.x,
                            top: ripple.y,
                            width: '5px',
                            height: '5px',
                            background: 'rgba(255, 255, 255, 0.6)',
                            transform: 'translate(-50%, -50%)',
                            animation: 'ripple 0.6s linear'
                          }}
                        />
                      ))}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="text-center mt-6 text-sm" style={{ 
            color: 'rgb(100, 116, 139)',
            animation: 'slideIn 1s ease-out 1.2s both'
          }}>
            Made with Next.js & TypeScript
          </div>
        </div>
      </div>
    </>
  );
}