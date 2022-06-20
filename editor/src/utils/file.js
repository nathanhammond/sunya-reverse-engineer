export function readFile(file) {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.onloadend = (e) => {
      resolve(e.target.result);
    };
    reader.readAsArrayBuffer(file);
  });
}
