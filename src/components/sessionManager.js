export const saveSession = (state) => {
  const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "session.json";
  link.click();
};

export const loadSession = (file, dispatch) => {
  const reader = new FileReader();
  reader.onload = () => {
    const json = JSON.parse(reader.result);
    dispatch({ type: 'SET_TABLE', payload: json.table });
    // restore method, stats, etc.
  };
  reader.readAsText(file);
};
