// Hashing utility functions for different collision resolution methods

// Simple hash function
export function hash(key, size) {
  return key % size;
}

// Chaining: array of arrays
export function insertChaining(table, key) {
  const idx = hash(key, table.length);
  if (!table[idx]) table[idx] = [];
  if (table[idx].includes(key)) return { table, success: false, reason: 'Exists' };
  table[idx] = [...table[idx], key];
  return { table, success: true, index: idx };
}
export function searchChaining(table, key) {
  const idx = hash(key, table.length);
  if (table[idx] && table[idx].includes(key)) return { found: true, index: idx };
  return { found: false, index: idx };
}
export function deleteChaining(table, key) {
  const idx = hash(key, table.length);
  if (table[idx]) {
    const i = table[idx].indexOf(key);
    if (i !== -1) {
      table[idx] = table[idx].filter(v => v !== key);
      return { table, success: true, index: idx };
    }
  }
  return { table, success: false, index: idx };
}

// Linear Probing
export function insertLinear(table, key) {
  const size = table.length;
  let idx = hash(key, size);
  for (let i = 0; i < size; i++) {
    const probeIdx = (idx + i) % size;
    if (table[probeIdx] === null || table[probeIdx] === undefined) {
      table[probeIdx] = key;
      return { table, success: true, index: probeIdx, probes: i+1 };
    }
    if (table[probeIdx] === key) return { table, success: false, reason: 'Exists', index: probeIdx };
  }
  return { table, success: false, reason: 'Full' };
}
export function searchLinear(table, key) {
  const size = table.length;
  let idx = hash(key, size);
  for (let i = 0; i < size; i++) {
    const probeIdx = (idx + i) % size;
    if (table[probeIdx] === key) return { found: true, index: probeIdx, probes: i+1 };
    if (table[probeIdx] === null || table[probeIdx] === undefined) break;
  }
  return { found: false };
}
export function deleteLinear(table, key) {
  const size = table.length;
  let idx = hash(key, size);
  for (let i = 0; i < size; i++) {
    const probeIdx = (idx + i) % size;
    if (table[probeIdx] === key) {
      table[probeIdx] = null;
      return { table, success: true, index: probeIdx };
    }
    if (table[probeIdx] === null || table[probeIdx] === undefined) break;
  }
  return { table, success: false };
}

// Quadratic Probing
export function insertQuadratic(table, key) {
  const size = table.length;
  let idx = hash(key, size);
  for (let i = 0; i < size; i++) {
    const probeIdx = (idx + i * i) % size;
    if (table[probeIdx] === null || table[probeIdx] === undefined) {
      table[probeIdx] = key;
      return { table, success: true, index: probeIdx, probes: i+1 };
    }
    if (table[probeIdx] === key) return { table, success: false, reason: 'Exists', index: probeIdx };
  }
  return { table, success: false, reason: 'Full' };
}
export function searchQuadratic(table, key) {
  const size = table.length;
  let idx = hash(key, size);
  for (let i = 0; i < size; i++) {
    const probeIdx = (idx + i * i) % size;
    if (table[probeIdx] === key) return { found: true, index: probeIdx, probes: i+1 };
    if (table[probeIdx] === null || table[probeIdx] === undefined) break;
  }
  return { found: false };
}
export function deleteQuadratic(table, key) {
  const size = table.length;
  let idx = hash(key, size);
  for (let i = 0; i < size; i++) {
    const probeIdx = (idx + i * i) % size;
    if (table[probeIdx] === key) {
      table[probeIdx] = null;
      return { table, success: true, index: probeIdx };
    }
    if (table[probeIdx] === null || table[probeIdx] === undefined) break;
  }
  return { table, success: false };
}

// Double Hashing
export function doubleHash(key, size) {
  return 7 - (key % 7);
}
export function insertDouble(table, key) {
  const size = table.length;
  let idx = hash(key, size);
  let step = doubleHash(key, size);
  for (let i = 0; i < size; i++) {
    const probeIdx = (idx + i * step) % size;
    if (table[probeIdx] === null || table[probeIdx] === undefined) {
      table[probeIdx] = key;
      return { table, success: true, index: probeIdx, probes: i+1 };
    }
    if (table[probeIdx] === key) return { table, success: false, reason: 'Exists', index: probeIdx };
  }
  return { table, success: false, reason: 'Full' };
}
export function searchDouble(table, key) {
  const size = table.length;
  let idx = hash(key, size);
  let step = doubleHash(key, size);
  for (let i = 0; i < size; i++) {
    const probeIdx = (idx + i * step) % size;
    if (table[probeIdx] === key) return { found: true, index: probeIdx, probes: i+1 };
    if (table[probeIdx] === null || table[probeIdx] === undefined) break;
  }
  return { found: false };
}
export function deleteDouble(table, key) {
  const size = table.length;
  let idx = hash(key, size);
  let step = doubleHash(key, size);
  for (let i = 0; i < size; i++) {
    const probeIdx = (idx + i * step) % size;
    if (table[probeIdx] === key) {
      table[probeIdx] = null;
      return { table, success: true, index: probeIdx };
    }
    if (table[probeIdx] === null || table[probeIdx] === undefined) break;
  }
  return { table, success: false };
} 