import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

const defaultCode = `// Write a function: (key, size) => hashIndex
(key, size) => {
  // Example: Division method
  return key % size;
}`;

export default function CustomHashEditor({ onChange }) {
  const [code, setCode] = useState(defaultCode);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [sampleKey, setSampleKey] = useState(42);
  const [sampleSize, setSampleSize] = useState(10);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    setError(null);
    try {
      // eslint-disable-next-line no-eval
      const fn = eval(newCode);
      if (typeof fn !== 'function') throw new Error('Not a function');
      const result = fn(sampleKey, sampleSize);
      setPreview(result);
      setError(null);
      onChange(fn);
    } catch (e) {
      setError(e.message);
      setPreview(null);
      onChange(() => -1);
    }
  };

  useEffect(() => {
    handleCodeChange(code);
    // eslint-disable-next-line
  }, [sampleKey, sampleSize]);

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Custom Hash Function Editor
      </h2>
      <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
        Write a JavaScript function of the form <code>(key, size) =&gt; hashIndex</code>.
      </div>
      <Editor
        value={code}
        onValueChange={handleCodeChange}
        highlight={code => Prism.highlight(code, Prism.languages.javascript, 'javascript')}
        padding={12}
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 14,
          background: '#1a202c',
          color: '#f8f8f2',
          borderRadius: 8,
          minHeight: 120,
        }}
        className="mb-2 border border-gray-300 dark:border-gray-600"
      />
      {error && (
        <div className="text-red-500 text-sm mb-2">Error: {error}</div>
      )}
      <div className="flex items-center space-x-2 mb-2">
        <label className="text-sm">Sample key:</label>
        <input
          type="number"
          value={sampleKey}
          onChange={e => setSampleKey(Number(e.target.value))}
          className="input w-20"
        />
        <label className="text-sm">Table size:</label>
        <input
          type="number"
          value={sampleSize}
          onChange={e => setSampleSize(Number(e.target.value))}
          className="input w-20"
        />
        <span className="ml-4 text-sm">Output: <span className="font-mono">{preview !== null ? preview : '—'}</span></span>
      </div>
    </div>
  );
} 