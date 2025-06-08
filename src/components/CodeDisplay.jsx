import { useState, useEffect } from 'react'
import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs/components/prism-core'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-csharp' // C++ shares many similarities, can use this for highlight
import 'prismjs/components/prism-python'

const hashFunctionCodes = {
  division: {
    javascript: `function divisionHash(key, size) {
  return key % size;
}`,
    cpp: `int divisionHash(int key, int size) {
  return key % size;
}`,
    java: `public int divisionHash(int key, int size) {
  return key % size;
}`,
    python: `def division_hash(key, size):
  return key % size`,
  },
  multiplication: {
    javascript: `function multiplicationHash(key, size) {
  const A = 0.6180339887; // Golden ratio conjugate
  return Math.floor(size * ((key * A) % 1));
}`,
    cpp: `int multiplicationHash(int key, int size) {
  double A = 0.6180339887;
  return (int)(size * fmod((double)key * A, 1.0));
}`,
    java: `public int multiplicationHash(int key, int size) {
  double A = 0.6180339887;
  return (int) (size * ((key * A) % 1));
}`,
    python: `def multiplication_hash(key, size):
  A = 0.6180339887
  return int(size * ((key * A) % 1))`,
  },
  polynomial: {
    javascript: `function polynomialRollingHash(key, size) {
  const p = 31; // A prime number
  const str = String(key);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * p + str.charCodeAt(i)) % size;
  }
  return hash;
}`,
    cpp: `int polynomialRollingHash(int key, int size) {
  int p = 31;
  std::string str = std::to_string(key);
  long long hash = 0;
  for (char c : str) {
    hash = (hash * p + c) % size;
  }
  return (int)hash;
}`,
    java: `public int polynomialRollingHash(int key, int size) {
  int p = 31;
  String str = String.valueOf(key);
  long hash = 0;
  for (int i = 0; i < str.length(); i++) {
    hash = (hash * p + str.charAt(i)) % size;
  }
  return (int) hash;
}`,
    python: `def polynomial_rolling_hash(key, size):
  p = 31
  s = str(key)
  h = 0
  for char_code in map(ord, s):
    h = (h * p + char_code) % size
  return h`,
  },
  universal: {
    javascript: `function universalHash(key, size) {
  // Using a simple universal hash family: ((a * k + b) mod p) mod m
  // where p is a prime larger than m and k
  const a = 3; // Randomly chosen prime
  const b = 7; // Randomly chosen integer
  const p = 1000000007; // A large prime number
  return ((a * key + b) % p) % size;
}`,
    cpp: `int universalHash(int key, int size) {
  long long a = 3, b = 7, p = 1000000007;
  return (int)(((a * key + b) % p) % size);
}`,
    java: `public int universalHash(int key, int size) {
  long a = 3, b = 7, p = 1000000007L;
  return (int) (((a * key + b) % p) % size);
}`,
    python: `def universal_hash(key, size):
  a, b, p = 3, 7, 1000000007
  return ((a * key + b) % p) % size`,
  },
  midSquare: {
    javascript: `function midSquareHash(key, size) {
  const square = key * key;
  const strSquare = String(square);
  // Take middle two digits, adjust for edge cases
  const mid = Math.floor(strSquare.length / 2);
  let midDigits = 0;
  if (strSquare.length % 2 === 0) {
    midDigits = parseInt(strSquare.slice(mid - 1, mid + 1));
  } else {
    midDigits = parseInt(strSquare.slice(mid, mid + 1));
  }
  return midDigits % size;
}`,
    cpp: `int midSquareHash(int key, int size) {
  long long square = (long long)key * key;
  std::string strSquare = std::to_string(square);
  int mid = strSquare.length() / 2;
  int midDigits = 0;
  if (strSquare.length() % 2 == 0) {
    midDigits = std::stoi(strSquare.substr(mid - 1, 2));
  } else {
    midDigits = std::stoi(strSquare.substr(mid, 1));
  }
  return midDigits % size;
}`,
    java: `public int midSquareHash(int key, int size) {
  long square = (long) key * key;
  String strSquare = String.valueOf(square);
  int mid = strSquare.length() / 2;
  int midDigits = 0;
  if (strSquare.length() % 2 == 0) {
    midDigits = Integer.parseInt(strSquare.substring(mid - 1, mid + 1));
  } else {
    midDigits = Integer.parseInt(strSquare.substring(mid, mid + 1));
  }
  return midDigits % size;
}`,
    python: `def mid_square_hash(key, size):
  square = key * key
  s_square = str(square)
  mid = len(s_square) // 2
  if len(s_square) % 2 == 0:
    mid_digits = int(s_square[mid-1 : mid+1])
  else:
    mid_digits = int(s_square[mid])
  return mid_digits % size`,
  },
  folding: {
    javascript: `function foldingHash(key, size) {
  const strKey = String(key);
  let sum = 0;
  for (let i = 0; i < strKey.length; i += 2) {
    const part = parseInt(strKey.slice(i, i + 2)); // Take two digits at a time
    sum += part;
  }
  return sum % size;
}`,
    cpp: `int foldingHash(int key, int size) {
  std::string strKey = std::to_string(key);
  int sum = 0;
  for (size_t i = 0; i < strKey.length(); i += 2) {
    std::string partStr = strKey.substr(i, 2);
    sum += std::stoi(partStr);
  }
  return sum % size;
}`,
    java: `public int foldingHash(int key, int size) {
  String strKey = String.valueOf(key);
  int sum = 0;
  for (int i = 0; i < strKey.length(); i += 2) {
    int end = Math.min(i + 2, strKey.length());
    int part = Integer.parseInt(strKey.substring(i, end));
    sum += part;
  }
  return sum % size;
}`,
    python: `def folding_hash(key, size):
  s_key = str(key)
  total_sum = 0
  for i in range(0, len(s_key), 2):
    part = int(s_key[i:i+2])
    total_sum += part
  return total_sum % size`,
  },
  custom: {
    javascript: `// Custom hash function will be provided by the user in Visualizer.jsx
// Example: function customHash(key, size) { return key % size; }`,
    cpp: `// Custom hash function would be defined by the user.`,
    java: `// Custom hash function would be defined by the user.`,
    python: `// Custom hash function would be defined by the user.`,
  },
}

const collisionResolutionCodes = {
  chaining: {
    javascript: `class HashTableChaining {
  constructor(size) {
    this.table = new Array(size).fill(null).map(() => []);
    this.size = size;
  }

  insert(key) {
    const index = key % this.size;
    this.table[index].push(key);
  }

  search(key) {
    const index = key % this.size;
    return this.table[index].includes(key);
  }

  delete(key) {
    const index = key % this.size;
    this.table[index] = this.table[index].filter(item => item !== key);
  }
}`,
    cpp: `// Separate Chaining (using std::list for chains)
#include <vector>
#include <list>

class HashTableChaining {
public:
  std::vector<std::list<int>> table;
  int size;

  HashTableChaining(int s) : size(s) {
    table.resize(size);
  }

  void insert(int key) {
    int index = key % size;
    table[index].push_back(key);
  }

  bool search(int key) {
    int index = key % size;
    for (int item : table[index]) {
      if (item == key) return true;
    }
    return false;
  }

  void remove(int key) {
    int index = key % size;
    table[index].remove(key);
  }
};`,
    java: `// Separate Chaining
import java.util.ArrayList;
import java.util.LinkedList;

class HashTableChaining {
  ArrayList<LinkedList<Integer>> table;
  int size;

  public HashTableChaining(int size) {
    this.size = size;
    table = new ArrayList<>(size);
    for (int i = 0; i < size; i++) {
      table.add(new LinkedList<>());
    }
  }

  public void insert(int key) {
    int index = key % size;
    table.get(index).add(key);
  }

  public boolean search(int key) {
    int index = key % size;
    return table.get(index).contains(key);
  }

  public void delete(int key) {
    int index = key % size;
    table.get(index).remove(Integer.valueOf(key));
  }
}`,
    python: `class HashTableChaining:
  def __init__(self, size):
    self.size = size
    self.table = [[] for _ in range(size)]

  def insert(self, key):
    index = key % self.size
    self.table[index].append(key)

  def search(self, key):
    index = key % self.size
    return key in self.table[index]

  def delete(self, key):
    index = key % self.size
    if key in self.table[index]:
      self.table[index].remove(key)`,
  },
  linear: {
    javascript: `class HashTableLinearProbing {
  constructor(size) {
    this.table = new Array(size).fill(null);
    this.size = size;
  }

  hash(key) {
    return key % this.size;
  }

  insert(key) {
    let index = this.hash(key);
    let probes = 0;
    while (this.table[index] !== null && this.table[index] !== key && probes < this.size) {
      probes++;
      index = (this.hash(key) + probes) % this.size;
    }
    if (probes < this.size) {
      this.table[index] = key;
    } else {
      // Table is full
      console.warn('Table is full, cannot insert:', key);
    }
  }

  search(key) {
    let index = this.hash(key);
    let probes = 0;
    while (this.table[index] !== null && probes < this.size) {
      if (this.table[index] === key) {
        return true;
      }
      probes++;
      index = (this.hash(key) + probes) % this.size;
    }
    return false;
  }

  delete(key) {
    let index = this.hash(key);
    let probes = 0;
    while (this.table[index] !== null && probes < this.size) {
      if (this.table[index] === key) {
        this.table[index] = null; // Or use a special 'deleted' marker
        return true;
      }
      probes++;
      index = (this.hash(key) + probes) % this.size;
    }
    return false;
  }
}`,
    cpp: `// Linear Probing
#include <vector>

class HashTableLinearProbing {
public:
  std::vector<int> table;
  int size;

  HashTableLinearProbing(int s) : size(s) {
    table.assign(size, -1); // -1 indicates empty
  }

  int hash(int key) {
    return key % size;
  }

  void insert(int key) {
    int index = hash(key);
    int probes = 0;
    while (table[index] != -1 && table[index] != key && probes < size) {
      probes++;
      index = (hash(key) + probes) % size;
    }
    if (probes < size) {
      table[index] = key;
    } else {
      // Table is full
    }
  }

  bool search(int key) {
    int index = hash(key);
    int probes = 0;
    while (table[index] != -1 && probes < size) {
      if (table[index] == key) {
        return true;
      }
      probes++;
      index = (hash(key) + probes) % size;
    }
    return false;
  }

  bool remove(int key) {
    int index = hash(key);
    int probes = 0;
    while (table[index] != -1 && probes < size) {
      if (table[index] == key) {
        table[index] = -1; // Mark as empty or special deleted marker
        return true;
      }
      probes++;
      index = (hash(key) + probes) % size;
    }
    return false;
  }
};`,
    java: `// Linear Probing
class HashTableLinearProbing {
  Integer[] table;
  int size;

  public HashTableLinearProbing(int size) {
    this.size = size;
    table = new Integer[size];
  }

  private int hash(int key) {
    return key % size;
  }

  public void insert(int key) {
    int index = hash(key);
    int probes = 0;
    while (table[index] != null && !table[index].equals(key) && probes < size) {
      probes++;
      index = (hash(key) + probes) % size;
    }
    if (probes < size) {
      table[index] = key;
    } else {
      // Table is full
    }
  }

  public boolean search(int key) {
    int index = hash(key);
    int probes = 0;
    while (table[index] != null && probes < size) {
      if (table[index].equals(key)) {
        return true;
      }
      probes++;
      index = (hash(key) + probes) % size;
    }
    return false;
  }

  public boolean delete(int key) {
    int index = hash(key);
    int probes = 0;
    while (table[index] != null && probes < size) {
      if (table[index].equals(key)) {
        table[index] = null; // Or a special 'deleted' marker
        return true;
      }
      probes++;
      index = (hash(key) + probes) % size;
    }
    return false;
  }
}`,
    python: `class HashTableLinearProbing:
  def __init__(self, size):
    self.size = size
    self.table = [None] * size

  def _hash(self, key):
    return key % self.size

  def insert(self, key):
    index = self._hash(key)
    probes = 0
    while self.table[index] is not None and self.table[index] != key and probes < self.size:
      probes += 1
      index = (self._hash(key) + probes) % self.size
    if probes < self.size:
      self.table[index] = key
    else:
      # Table is full
      pass

  def search(self, key):
    index = self._hash(key)
    probes = 0
    while self.table[index] is not None and probes < self.size:
      if self.table[index] == key:
        return True
      probes += 1
      index = (self._hash(key) + probes) % self.size
    return False

  def delete(self, key):
    index = self._hash(key)
    probes = 0
    while self.table[index] is not None and probes < self.size:
      if self.table[index] == key:
        self.table[index] = None  # Or a special 'deleted' marker
        return True
      probes += 1
      index = (self._hash(key) + probes) % self.size
    return False`,
  },
  quadratic: {
    javascript: `class HashTableQuadraticProbing {
  constructor(size) {
    this.table = new Array(size).fill(null);
    this.size = size;
  }

  hash(key) {
    return key % this.size;
  }

  insert(key) {
    let index = this.hash(key);
    let probes = 0;
    while (this.table[index] !== null && this.table[index] !== key && probes < this.size) {
      probes++;
      index = (this.hash(key) + probes * probes) % this.size;
    }
    if (probes < this.size) {
      this.table[index] = key;
    } else {
      // Table is full
      console.warn('Table is full, cannot insert:', key);
    }
  }

  search(key) {
    let index = this.hash(key);
    let probes = 0;
    while (this.table[index] !== null && probes < this.size) {
      if (this.table[index] === key) {
        return true;
      }
      probes++;
      index = (this.hash(key) + probes * probes) % this.size;
    }
    return false;
  }

  delete(key) {
    let index = this.hash(key);
    let probes = 0;
    while (this.table[index] !== null && probes < this.size) {
      if (this.table[index] === key) {
        this.table[index] = null; // Or a special 'deleted' marker
        return true;
      }
      probes++;
      index = (this.hash(key) + probes * probes) % this.size;
    }
    return false;
  }
}`,
    cpp: `// Quadratic Probing
#include <vector>

class HashTableQuadraticProbing {
public:
  std::vector<int> table;
  int size;

  HashTableQuadraticProbing(int s) : size(s) {
    table.assign(size, -1); // -1 indicates empty
  }

  int hash(int key) {
    return key % size;
  }

  void insert(int key) {
    int index = hash(key);
    int probes = 0;
    while (table[index] != -1 && table[index] != key && probes < size) {
      probes++;
      index = (hash(key) + probes * probes) % size;
    }
    if (probes < size) {
      table[index] = key;
    } else {
      // Table is full
    }
  }

  bool search(int key) {
    int index = hash(key);
    int probes = 0;
    while (table[index] != -1 && probes < size) {
      if (table[index] == key) {
        return true;
      }
      probes++;
      index = (hash(key) + probes * probes) % size;
    }
    return false;
  }

  bool remove(int key) {
    int index = hash(key);
    int probes = 0;
    while (table[index] != -1 && probes < size) {
      if (table[index] == key) {
        table[index] = -1; // Mark as empty or special deleted marker
        return true;
      }
      probes++;
      index = (hash(key) + probes * probes) % size;
    }
    return false;
  }
};`,
    java: `// Quadratic Probing
class HashTableQuadraticProbing {
  Integer[] table;
  int size;

  public HashTableQuadraticProbing(int size) {
    this.size = size;
    table = new Integer[size];
  }

  private int hash(int key) {
    return key % size;
  }

  public void insert(int key) {
    int index = hash(key);
    int probes = 0;
    while (table[index] != null && !table[index].equals(key) && probes < size) {
      probes++;
      index = (hash(key) + probes * probes) % size;
    }
    if (probes < size) {
      table[index] = key;
    } else {
      // Table is full
    }
  }

  public boolean search(int key) {
    int index = hash(key);
    int probes = 0;
    while (table[index] != null && probes < size) {
      if (table[index].equals(key)) {
        return true;
      }
      probes++;
      index = (hash(key) + probes * probes) % size;
    }
    return false;
  }

  public boolean delete(int key) {
    int index = hash(key);
    int probes = 0;
    while (table[index] != null && probes < size) {
      if (table[index].equals(key)) {
        table[index] = null; // Or a special 'deleted' marker
        return true;
      }
      probes++;
      index = (hash(key) + probes * probes) % size;
    }
    return false;
  }
}`,
    python: `class HashTableQuadraticProbing:
  def __init__(self, size):
    self.size = size
    self.table = [None] * size

  def _hash(self, key):
    return key % self.size

  def insert(self, key):
    index = self._hash(key)
    probes = 0
    while self.table[index] is not None and self.table[index] != key and probes < self.size:
      probes += 1
      index = (self._hash(key) + probes * probes) % self.size
    if probes < self.size:
      self.table[index] = key
    else:
      # Table is full
      pass

  def search(self, key):
    index = self._hash(key)
    probes = 0
    while self.table[index] is not None and probes < self.size:
      if self.table[index] == key:
        return True
      probes += 1
      index = (self._hash(key) + probes * probes) % self.size
    return False

  def delete(self, key):
    index = self._hash(key)
    probes = 0
    while self.table[index] is not None and probes < self.size:
      if self.table[index] == key:
        self.table[index] = None  # Or a special 'deleted' marker
        return True
      probes += 1
      index = (self._hash(key) + probes * probes) % self.size
    return False`,
  },
  double: {
    javascript: `class HashTableDoubleHashing {
  constructor(size) {
    this.table = new Array(size).fill(null);
    this.size = size;
  }

  hash1(key) {
    return key % this.size;
  }

  hash2(key) {
    // A common choice for h2 is a prime number q less than m, then h2(k) = q - (k % q)
    const q = 7; // Example prime
    return q - (key % q);
  }

  insert(key) {
    let index = this.hash1(key);
    let probes = 0;
    while (this.table[index] !== null && this.table[index] !== key && probes < this.size) {
      probes++;
      index = (this.hash1(key) + probes * this.hash2(key)) % this.size;
    }
    if (probes < this.size) {
      this.table[index] = key;
    } else {
      // Table is full
      console.warn('Table is full, cannot insert:', key);
    }
  }

  search(key) {
    let index = this.hash1(key);
    let probes = 0;
    while (this.table[index] !== null && probes < this.size) {
      if (this.table[index] === key) {
        return true;
      }
      probes++;
      index = (this.hash1(key) + probes * this.hash2(key)) % this.size;
    }
    return false;
  }

  delete(key) {
    let index = this.hash1(key);
    let probes = 0;
    while (this.table[index] !== null && probes < this.size) {
      if (this.table[index] === key) {
        this.table[index] = null; // Or a special 'deleted' marker
        return true;
      }
      probes++;
      index = (this.hash1(key) + probes * this.hash2(key)) % this.size;
    }
    return false;
  }
}`,
    cpp: `// Double Hashing
#include <vector>

class HashTableDoubleHashing {
public:
  std::vector<int> table;
  int size;

  HashTableDoubleHashing(int s) : size(s) {
    table.assign(size, -1); // -1 indicates empty
  }

  int hash1(int key) {
    return key % size;
  }

  int hash2(int key) {
    int q = 7; // A prime smaller than size
    return q - (key % q);
  }

  void insert(int key) {
    int index = hash1(key);
    int probes = 0;
    while (table[index] != -1 && table[index] != key && probes < size) {
      probes++;
      index = (hash1(key) + probes * hash2(key)) % size;
    }
    if (probes < size) {
      table[index] = key;
    } else {
      // Table is full
    }
  }

  bool search(int key) {
    int index = hash1(key);
    int probes = 0;
    while (table[index] != -1 && probes < size) {
      if (table[index] == key) {
        return true;
      }
      probes++;
      index = (hash1(key) + probes * hash2(key)) % size;
    }
    return false;
  }

  bool remove(int key) {
    int index = hash1(key);
    int probes = 0;
    while (table[index] != -1 && probes < size) {
      if (table[index] == key) {
        table[index] = -1; // Mark as empty or special deleted marker
        return true;
      }
      probes++;
      index = (hash1(key) + probes * hash2(key)) % size;
    }
    return false;
  }
};`,
    java: `// Double Hashing
class HashTableDoubleHashing {
  Integer[] table;
  int size;

  public HashTableDoubleHashing(int size) {
    this.size = size;
    table = new Integer[size];
  }

  private int hash1(int key) {
    return key % size;
  }

  private int hash2(int key) {
    int q = 7; // A prime smaller than size
    return q - (key % q);
  }

  public void insert(int key) {
    int index = hash1(key);
    int probes = 0;
    while (table[index] != null && !table[index].equals(key) && probes < size) {
      probes++;
      index = (hash1(key) + probes * hash2(key)) % size;
    }
    if (probes < size) {
      table[index] = key;
    } else {
      // Table is full
    }
  }

  public boolean search(int key) {
    int index = hash1(key);
    int probes = 0;
    while (table[index] != null && probes < size) {
      if (table[index].equals(key)) {
        return true;
      }
      probes++;
      index = (hash1(key) + probes * hash2(key)) % size;
    }
    return false;
  }

  public boolean delete(int key) {
    int index = hash1(key);
    int probes = 0;
    while (table[index] != null && probes < size) {
      if (table[index].equals(key)) {
        table[index] = null; // Or a special 'deleted' marker
        return true;
      }
      probes++;
      index = (hash1(key) + probes * hash2(key)) % size;
    }
    return false;
  }
}`,
    python: `class HashTableDoubleHashing:
  def __init__(self, size):
    self.size = size
    self.table = [None] * size

  def _hash1(self, key):
    return key % self.size

  def _hash2(self, key):
    q = 7  # A prime smaller than size
    return q - (key % q)

  def insert(self, key):
    index = self._hash1(key)
    probes = 0
    while self.table[index] is not None and self.table[index] != key and probes < self.size:
      probes += 1
      index = (self._hash1(key) + probes * self._hash2(key)) % self.size
    if probes < self.size:
      self.table[index] = key
    else:
      # Table is full
      pass

  def search(self, key):
    index = self._hash1(key)
    probes = 0
    while self.table[index] is not None and probes < self.size:
      if self.table[index] == key:
        return True
      probes += 1
      index = (self._hash1(key) + probes * self._hash2(key)) % self.size
    return False

  def delete(self, key):
    index = self._hash1(key)
    probes = 0
    while self.table[index] is not None and probes < self.size:
      if self.table[index] == key:
        self.table[index] = None  # Or a special 'deleted' marker
        return True
      probes += 1
      index = (self._hash1(key) + probes * self._hash2(key)) % self.size
    return False`,
  },
}

const operationSpecificCodes = {
  random: {
    javascript: `function generateRandomKey() {
  return Math.floor(Math.random() * 1000); // Key between 0-999
}`,
    cpp: `int generateRandomKey() {
  // Requires <cstdlib> for rand() and <ctime> for srand(time(NULL))
  // Call srand(time(NULL)) once at program start for better randomness
  return rand() % 1000; // Key between 0-999
}`,
    java: `import java.util.Random;

public int generateRandomKey() {
  Random rand = new Random();
  return rand.nextInt(1000); // Key between 0-999
}`,
    python: `import random

def generate_random_key():
  return random.randint(0, 999) # Key between 0-999`,
  },
}

export function CodeDisplay({
  operation,
  activeKey,
  size,
  hashFunction: hashFunctionId,
  collisionResolution: collisionResolutionId,
}) {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [currentCode, setCurrentCode] = useState('')

  useEffect(() => {
    let code = ''
    const hashFnCode = hashFunctionCodes[hashFunctionId]?.[selectedLanguage]

    if (operation === 'insert' || operation === 'search' || operation === 'delete') {
      const operationSpecificCode = collisionResolutionCodes[collisionResolutionId]?.[operation]?.[selectedLanguage]
      if (hashFnCode && operationSpecificCode) {
        code = `${hashFnCode}\n\n${operationSpecificCode}`
      } else if (operationSpecificCode) { // If only operation code exists
        code = operationSpecificCode
      } else {
        code = `// Code for ${operation} with ${collisionResolutionId} not available in ${selectedLanguage}.`
      }
    } else if (operation === 'random') {
      code = operationSpecificCodes.random[selectedLanguage]
    }
    else {
      // Default: show hash function and collision resolution combined
      const collisionResCode = collisionResolutionCodes[collisionResolutionId]?.[selectedLanguage]
      if (hashFnCode && collisionResCode) {
        code = `${hashFnCode}\n\n${collisionResCode}`
      } else if (hashFnCode) {
        code = hashFnCode
      } else if (collisionResCode) {
        code = collisionResCode
      } else {
        code = '// Select a hash function and collision resolution method to view code.'
      }
    }
    // If no code found, provide a default message
    setCurrentCode(code)
  }, [hashFunctionId, collisionResolutionId, selectedLanguage, operation])

  return (
    <div className="card space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Code ({operation ? operation.charAt(0).toUpperCase() + operation.slice(1) : 'Overview'})
      </h2>

      {/* Language Selector */}
      <div className="flex space-x-2 mb-4">
        {['javascript', 'cpp', 'java', 'python'].map(lang => (
          <button
            key={lang}
            className={`py-2 px-4 rounded-md text-sm font-medium ${selectedLanguage === lang ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
            onClick={() => setSelectedLanguage(lang)}
          >
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm overflow-auto max-h-[600px] shadow-inner">
        <Editor
          value={currentCode}
          onValueChange={() => {}} // Read-only
          highlight={code => {
            const lang = selectedLanguage === 'cpp' ? languages.csharp : languages[selectedLanguage]
            return highlight(code, lang, selectedLanguage)
          }}
          padding={10}
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 14,
            lineHeight: 1.5,
            color: '#f8f8f2',
          }}
          className="min-h-[400px]"
        />
      </div>
    </div>
  )
} 