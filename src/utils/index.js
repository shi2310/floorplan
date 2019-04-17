export function getBBoxString(map, bound) {
  const b = bound || map.getBounds();
  const wrapBound = map.wrapLatLngBounds(b);
  const limit = 179.9999;
  return [
    Math.max(wrapBound.getWest(), -limit),
    wrapBound.getSouth(),
    Math.min(wrapBound.getEast(), limit),
    wrapBound.getNorth(),
  ].join(',');
}

export function getBounds(path = []) {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  path.forEach(item => {
    const lat = item[1];
    if (lat > maxLat) maxLat = lat;
    if (lat < minLat) minLat = lat;

    const lng = item[0];
    if (lng > maxLng) maxLng = lng;
    if (lng < minLng) minLng = lng;
  });
  return [[minLng, minLat], [maxLng, maxLat]];
}

/**
 * @param dataURI
 * @returns {Blob}
 */
export function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI
    .split(',')[0]
    .split(':')[1]
    .split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}
