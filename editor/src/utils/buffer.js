export function calculateHash(fileBuffer) {
  return crypto.subtle.digest('SHA-1', fileBuffer).then(hashBuffer => uint8ToHex(new Uint8Array(hashBuffer)));
}

export function uint8ToHex(uint8Array) {
  return Array.from(uint8Array).map(b => b.toString(16).padStart(2, '0')).join('');
}
