import React from 'react';
// import { motion } from 'framer-motion'; // Uncomment if using Framer Motion

const HashCell = ({ value, highlighted, chaining, onClick }) => {
  return (
    <div
      className={`hash-cell${highlighted ? ' highlighted' : ''}`}
      style={{
        width: 60,
        height: 60,
        border: '2px solid #444',
        display: 'flex',
        flexDirection: chaining ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: 'center',
        background: highlighted ? 'yellow' : '#fff',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
      }}
      onClick={onClick}
    >
      {chaining ? (
        <div className="chaining-list" style={{ width: '100%' }}>
          {Array.isArray(value) && value.length > 0 ? value.map((v, i) => (
            <div key={i} className="chaining-item" style={{ borderBottom: '1px solid #ccc', padding: 2 }}>{v}</div>
          )) : <span style={{ color: '#bbb' }}>empty</span>}
        </div>
      ) : (
        value !== undefined && value !== null ? value : <span style={{ color: '#bbb' }}>empty</span>
      )}
    </div>
  );
};

export default HashCell; 