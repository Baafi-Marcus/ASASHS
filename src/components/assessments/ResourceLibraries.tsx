import React, { useState } from 'react';
import { PortalCard } from '../PortalCard';
import { PortalButton } from '../PortalButton';

// --- SCIENTIFIC CALCULATOR ---
export const ScientificCalculator: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState('');

  const handleBtn = (val: string) => {
    if (display === '0' && !['.', '+', '-', '*', '/'].includes(val)) {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setHistory('');
  };

  const handleEvaluate = () => {
    try {
      // Replace safe math tokens
      let expr = display
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/(\d+)\^(\d+)/g, 'Math.pow($1, $2)');

      // Evaluate safely
      const result = new Function(`return ${expr}`)();
      if (isNaN(result) || !isFinite(result)) throw new Error('Invalid');
      setHistory(display + ' =');
      setDisplay(String(Number(result.toFixed(8))));
    } catch {
      setDisplay('Error');
    }
  };

  const handleFunc = (fn: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(`${fn}(`);
    } else {
      setDisplay(`${display}${fn}(`);
    }
  };

  return (
    <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-gray-800 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <h3 className="font-bold text-sm text-gray-300 tracking-wider uppercase font-mono">Scientific Calculator</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg font-bold">×</button>
        )}
      </div>

      <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 text-right font-mono min-h-[80px] flex flex-col justify-end">
        <div className="text-xs text-gray-500 h-4 truncate">{history}</div>
        <div className="text-2xl font-black text-school-green-400 tracking-wider truncate">{display}</div>
      </div>

      <div className="grid grid-cols-5 gap-2 text-xs font-bold font-mono">
        {/* Row 1: Sci */}
        <button onClick={() => handleFunc('sin')} className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl">sin</button>
        <button onClick={() => handleFunc('cos')} className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl">cos</button>
        <button onClick={() => handleFunc('tan')} className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl">tan</button>
        <button onClick={() => handleFunc('log')} className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl">log</button>
        <button onClick={() => handleFunc('ln')} className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl">ln</button>

        {/* Row 2: Sci / Clear */}
        <button onClick={() => handleFunc('√')} className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl">√</button>
        <button onClick={() => handleBtn('^')} className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl">^</button>
        <button onClick={() => handleBtn('(')} className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl">(</button>
        <button onClick={() => handleBtn(')')} className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl">)</button>
        <button onClick={handleClear} className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl">C</button>

        {/* Row 3: Nums & Ops */}
        <button onClick={() => handleBtn('7')} className="p-3 bg-gray-800/80 hover:bg-gray-700 rounded-xl text-sm">7</button>
        <button onClick={() => handleBtn('8')} className="p-3 bg-gray-800/80 hover:bg-gray-700 rounded-xl text-sm">8</button>
        <button onClick={() => handleBtn('9')} className="p-3 bg-gray-800/80 hover:bg-gray-700 rounded-xl text-sm">9</button>
        <button onClick={() => handleBtn('/')} className="p-3 bg-amber-600 hover:bg-amber-500 rounded-xl text-sm font-bold">/</button>
        <button onClick={() => handleBtn('π')} className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl">π</button>

        {/* Row 4 */}
        <button onClick={() => handleBtn('4')} className="p-3 bg-gray-800/80 hover:bg-gray-700 rounded-xl text-sm">4</button>
        <button onClick={() => handleBtn('5')} className="p-3 bg-gray-800/80 hover:bg-gray-700 rounded-xl text-sm">5</button>
        <button onClick={() => handleBtn('6')} className="p-3 bg-gray-800/80 hover:bg-gray-700 rounded-xl text-sm">6</button>
        <button onClick={() => handleBtn('*')} className="p-3 bg-amber-600 hover:bg-amber-500 rounded-xl text-sm font-bold">*</button>
        <button onClick={() => handleBtn('e')} className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl">e</button>

        {/* Row 5 */}
        <button onClick={() => handleBtn('1')} className="p-3 bg-gray-800/80 hover:bg-gray-700 rounded-xl text-sm">1</button>
        <button onClick={() => handleBtn('2')} className="p-3 bg-gray-800/80 hover:bg-gray-700 rounded-xl text-sm">2</button>
        <button onClick={() => handleBtn('3')} className="p-3 bg-gray-800/80 hover:bg-gray-700 rounded-xl text-sm">3</button>
        <button onClick={() => handleBtn('-')} className="p-3 bg-amber-600 hover:bg-amber-500 rounded-xl text-sm font-bold">-</button>
        <button onClick={() => setDisplay(display.slice(0, -1) || '0')} className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl">⌫</button>

        {/* Row 6 */}
        <button onClick={() => handleBtn('0')} className="p-3 bg-gray-800/80 hover:bg-gray-700 rounded-xl text-sm col-span-2">0</button>
        <button onClick={() => handleBtn('.')} className="p-3 bg-gray-800/80 hover:bg-gray-700 rounded-xl text-sm">.</button>
        <button onClick={() => handleBtn('+')} className="p-3 bg-amber-600 hover:bg-amber-500 rounded-xl text-sm font-bold">+</button>
        <button onClick={handleEvaluate} className="p-3 bg-school-green-600 hover:bg-school-green-500 rounded-xl text-sm font-bold">=</button>
      </div>
    </div>
  );
};

// --- PERIODIC TABLE OF ELEMENTS ---
interface ElementData {
  number: number;
  symbol: string;
  name: string;
  mass: number;
  category: 'nonmetal' | 'noble' | 'alkali' | 'alkaline' | 'metalloid' | 'halogen' | 'transition' | 'post-transition';
}

const ELEMENTS: ElementData[] = [
  { number: 1, symbol: 'H', name: 'Hydrogen', mass: 1.008, category: 'nonmetal' },
  { number: 2, symbol: 'He', name: 'Helium', mass: 4.0026, category: 'noble' },
  { number: 3, symbol: 'Li', name: 'Lithium', mass: 6.94, category: 'alkali' },
  { number: 4, symbol: 'Be', name: 'Beryllium', mass: 9.0122, category: 'alkaline' },
  { number: 5, symbol: 'B', name: 'Boron', mass: 10.81, category: 'metalloid' },
  { number: 6, symbol: 'C', name: 'Carbon', mass: 12.011, category: 'nonmetal' },
  { number: 7, symbol: 'N', name: 'Nitrogen', mass: 14.007, category: 'nonmetal' },
  { number: 8, symbol: 'O', name: 'Oxygen', mass: 15.999, category: 'nonmetal' },
  { number: 9, symbol: 'F', name: 'Fluorine', mass: 18.998, category: 'halogen' },
  { number: 10, symbol: 'Ne', name: 'Neon', mass: 20.180, category: 'noble' },
  { number: 11, symbol: 'Na', name: 'Sodium', mass: 22.990, category: 'alkali' },
  { number: 12, symbol: 'Mg', name: 'Magnesium', mass: 24.305, category: 'alkaline' },
  { number: 13, symbol: 'Al', name: 'Aluminium', mass: 26.982, category: 'post-transition' },
  { number: 14, symbol: 'Si', name: 'Silicon', mass: 28.085, category: 'metalloid' },
  { number: 15, symbol: 'P', name: 'Phosphorus', mass: 30.974, category: 'nonmetal' },
  { number: 16, symbol: 'S', name: 'Sulfur', mass: 32.06, category: 'nonmetal' },
  { number: 17, symbol: 'Cl', name: 'Chlorine', mass: 35.45, category: 'halogen' },
  { number: 18, symbol: 'Ar', name: 'Argon', mass: 39.948, category: 'noble' },
  { number: 19, symbol: 'K', name: 'Potassium', mass: 39.098, category: 'alkali' },
  { number: 20, symbol: 'Ca', name: 'Calcium', mass: 40.078, category: 'alkaline' },
  { number: 26, symbol: 'Fe', name: 'Iron', mass: 55.845, category: 'transition' },
  { number: 29, symbol: 'Cu', name: 'Copper', mass: 63.546, category: 'transition' },
  { number: 30, symbol: 'Zn', name: 'Zinc', mass: 65.38, category: 'transition' },
  { number: 47, symbol: 'Ag', name: 'Silver', mass: 107.87, category: 'transition' },
  { number: 79, symbol: 'Au', name: 'Gold', mass: 196.97, category: 'transition' }
];

const CATEGORY_COLORS: Record<string, string> = {
  nonmetal: 'bg-green-900/60 border-green-500 text-green-300',
  noble: 'bg-cyan-900/60 border-cyan-500 text-cyan-300',
  alkali: 'bg-red-900/60 border-red-500 text-red-300',
  alkaline: 'bg-orange-900/60 border-orange-500 text-orange-300',
  metalloid: 'bg-yellow-900/60 border-yellow-500 text-yellow-300',
  halogen: 'bg-purple-900/60 border-purple-500 text-purple-300',
  transition: 'bg-blue-900/60 border-blue-500 text-blue-300',
  'post-transition': 'bg-teal-900/60 border-teal-500 text-teal-300'
};

export const PeriodicTable: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);

  return (
    <div className="bg-gray-950 text-white rounded-3xl p-6 shadow-2xl max-w-2xl w-full border border-gray-800 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
          <h3 className="font-bold text-sm text-gray-300 tracking-wider uppercase font-mono">Periodic Table of Elements (Key Scientific Reference)</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg font-bold">×</button>
        )}
      </div>

      {selectedElement && (
        <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold border ${CATEGORY_COLORS[selectedElement.category]}`}>
              <span className="text-[10px] opacity-75">{selectedElement.number}</span>
              <span className="text-xl">{selectedElement.symbol}</span>
            </div>
            <div>
              <h4 className="font-bold text-lg text-white">{selectedElement.name}</h4>
              <p className="text-xs text-gray-400 capitalize">Category: {selectedElement.category} &bull; Mass: {selectedElement.mass} u</p>
            </div>
          </div>
          <button onClick={() => setSelectedElement(null)} className="text-xs text-gray-400 hover:text-white">Clear</button>
        </div>
      )}

      <div className="grid grid-cols-5 sm:grid-cols-8 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {ELEMENTS.map((el) => (
          <button
            key={el.number}
            onClick={() => setSelectedElement(el)}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition hover:scale-105 shadow-sm ${CATEGORY_COLORS[el.category]} ${selectedElement?.number === el.number ? 'ring-2 ring-white scale-105' : ''}`}
          >
            <span className="text-[9px] opacity-75 font-mono">{el.number}</span>
            <span className="text-base font-black font-mono">{el.symbol}</span>
            <span className="text-[9px] truncate max-w-full opacity-90">{el.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
