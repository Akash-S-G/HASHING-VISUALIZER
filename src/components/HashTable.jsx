import React from 'react';
import HashCell from './HashCell';

const HashTable = ({ table, method, animationState, onCellClick }) => {
  return (
    <div className="hash-table" style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
      {table.map((cell, idx) => (
        <HashCell
          key={idx}
          value={cell || (method === 'chaining' ? [] : null)}
          highlighted={animationState && animationState.index === idx}
          chaining={method === 'chaining'}
          onClick={() => onCellClick && onCellClick(idx)}
        />
      ))}
    </div>
  );
};

export default HashTable; 