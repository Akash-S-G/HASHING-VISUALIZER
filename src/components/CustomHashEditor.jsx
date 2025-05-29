import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';

const CustomHashEditor = ({ onChange }) => {
  const [code, setCode] = useState('');

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    onChange(newCode);
  };

  return (
    <Editor
      value={code}
      onValueChange={handleCodeChange}
      highlight={code => highlight(code, languages.js)}
      padding={10}
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 12,
      }}
    />
  );
};

export default CustomHashEditor;
