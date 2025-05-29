import React from 'react';

const Controls = ({ inputValue, setInputValue, method, setMethod, onInsert, onSearch, onDelete, onReset }) => {
  return (
    <div className="controls">
      <input
        type="number"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        placeholder="Enter value"
      />
      <select value={method} onChange={e => setMethod(e.target.value)}>
        <option value="chaining">Chaining</option>
        <option value="linear">Linear Probing</option>
        <option value="quadratic">Quadratic Probing</option>
        <option value="double">Double Hashing</option>
      </select>
      <button onClick={onInsert}>Insert</button>
      <button onClick={onSearch}>Search</button>
      <button onClick={onDelete}>Delete</button>
      <button onClick={onReset}>Reset</button>
    </div>
  );
};

export default Controls; 