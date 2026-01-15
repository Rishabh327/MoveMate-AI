
import React from 'react';
import { PackingItem, Fragility } from '../types';

interface PackingListProps {
  items: PackingItem[];
  onDeleteItem: (id: string) => void;
  onClearList: () => void;
}

const FragilityBadge: React.FC<{ level: Fragility }> = ({ level }) => {
  const colors = {
    [Fragility.LOW]: 'bg-green-100 text-green-700 border-green-200',
    [Fragility.MEDIUM]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [Fragility.HIGH]: 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${colors[level]}`}>
      {level}
    </span>
  );
};

const PackingList: React.FC<PackingListProps> = ({ items, onDeleteItem, onClearList }) => {
  const sortedItems = [...items].sort((a, b) => b.timestamp - a.timestamp);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-gray-400">
        <i className="fas fa-box-open text-5xl mb-4 opacity-20"></i>
        <p className="text-center text-sm">No items added yet. Start scanning your room to build your list automatically.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b bg-white sticky top-0 z-10">
        <h2 className="font-bold text-gray-800 flex items-center">
          <i className="fas fa-clipboard-list mr-2 text-blue-600"></i>
          Your List ({items.length})
        </h2>
        <button 
          onClick={onClearList}
          className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          Clear All
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-3">
        {sortedItems.map((item) => (
          <div 
            key={item.id} 
            className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center group animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 mr-3">
              <i className={`fas ${getCategoryIcon(item.category)}`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {item.category}
                </span>
                <FragilityBadge level={item.fragility} />
              </div>
            </div>
            <button 
              onClick={() => onDeleteItem(item.id)}
              className="ml-2 text-gray-300 hover:text-red-500 p-2 transition-colors md:opacity-0 md:group-hover:opacity-100"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const getCategoryIcon = (category: string): string => {
  const cat = category.toLowerCase();
  if (cat.includes('kitchen') || cat.includes('cook')) return 'fa-utensils';
  if (cat.includes('elect') || cat.includes('tech')) return 'fa-laptop';
  if (cat.includes('furn')) return 'fa-couch';
  if (cat.includes('decor')) return 'fa-paint-roller';
  if (cat.includes('cloth') || cat.includes('wear')) return 'fa-shirt';
  if (cat.includes('book')) return 'fa-book';
  return 'fa-box';
};

export default PackingList;
