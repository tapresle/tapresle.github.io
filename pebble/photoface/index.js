// ============================================================================
// PhotoWatch Rotate — PebbleKit JS companion
// ============================================================================

// URL of your hosted configuration page (see config/index.html)
const CONFIG_URL_BASE = 'https://YOUR_USERNAME.github.io/YOUR_REPO/config/index.html';
// const CONFIG_URL_BASE = 'http://localhost:8000'; // for local testing

// --- BEGIN: atob Polyfill for iOS ---
// PebbleKit JS on iOS doesn't have a native atob() function.
if (typeof atob === 'undefined') {
  var atob = (function() {
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;

    return function(string) {
      string = String(string).replace(/[\t\n\f\r ]+/g, "");
      if (!b64re.test(string)) {
        throw new TypeError("Failed to execute 'atob': the string is not correctly encoded.");
      }
      string += "==".slice(2 - (string.length & 3));
      var bitmap, result = "", r1, r2, i = 0;
      for (; i < string.length;) {
        bitmap = b64.indexOf(string.charAt(i++)) << 18 | b64.indexOf(string.charAt(i++)) << 12 |
                 (r1 = b64.indexOf(string.charAt(i++))) << 6 | (r2 = b64.indexOf(string.charAt(i++)));
        result += r1 === 64 ? String.fromCharCode(bitmap >> 16 & 255) :
                  r2 === 64 ? String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255) :
                  String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255, bitmap & 255);
      }
      return result;
    };
  })();
}
// --- END: atob Polyfill ---

// AppMessage keys — MUST match appinfo.json "messageKeys" and photowatch.c
const KEY_IMAGE_SIZE  = 0;
const KEY_IMAGE_CHUNK = 1;
const KEY_WATCH_STYLE = 2;
const KEY_IMAGE_INDEX = 3;
const KEY_IMAGE_COUNT = 4;

// Must be smaller than the AppMessage inbox size configured on the watch.
const CHUNK_SIZE = 1800;

// Must match MAX_IMAGES in photowatch.c
const MAX_IMAGES = 6;

/**
 * Converts a Base64 string to a Uint8Array.
 */
function base64ToBytes(base64) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

/**
 * Promise wrapper around Pebble.sendAppMessage so uploads can be sequenced
 * with async/await instead of nested callbacks.
 */
function sendAppMessageP(dict) {
  return new Promise((resolve, reject) => {
    Pebble.sendAppMessage(dict, resolve, (e) => reject(e));
  });
}

/**
 * Sends one image (already resized/encoded by the config page) to a given
 * storage slot on the watch: index -> size -> chunks.
 */
async function sendImageToWatch(bytes, index) {
  await sendAppMessageP({ [KEY_IMAGE_INDEX]: index });
  await sendAppMessageP({ [KEY_IMAGE_SIZE]: bytes.length });

  let offset = 0;
  while (offset < bytes.length) {
    const endIndex = Math.min(offset + CHUNK_SIZE, bytes.length);
    const chunk = Array.from(bytes.slice(offset, endIndex));
    await sendAppMessageP({ [KEY_IMAGE_CHUNK]: chunk });
    offset = endIndex;
  }

  console.log(`Finished sending image ${index} (${bytes.length} bytes).`);
}

/**
 * Sends the full set of images. Tells the watch how many are coming first so
 * it can clear old storage, then streams each one into its slot in turn.
 */
async function sendAllImages(base64Images) {
  const count = Math.min(base64Images.length, MAX_IMAGES);
  if (base64Images.length > MAX_IMAGES) {
    console.log(`Only sending first ${MAX_IMAGES} of ${base64Images.length} images (device limit).`);
  }

  await sendAppMessageP({ [KEY_IMAGE_COUNT]: count });

  for (let i = 0; i < count; i++) {
    const bytes = base64ToBytes(base64Images[i]);
    await sendImageToWatch(bytes, i);
  }

  console.log('All images sent.');
}

// Listen for when the user opens the configuration page
Pebble.addEventListener('showConfiguration', () => {
  let platform = 'pt2'; // default to Pebble Time 2 (rectangular)
  if (Pebble.getActiveWatchInfo) {
    const watchInfo = Pebble.getActiveWatchInfo();
    if (watchInfo.platform === 'gabbro') platform = 'pr2'; // round variant
  }
  Pebble.openURL(`${CONFIG_URL_BASE}?platform=${platform}`);
});

// Listen for when the user closes the configuration page
Pebble.addEventListener('webviewclosed', async (e) => {
  if (!e.response) {
    return; // user cancelled
  }

  let settings;
  try {
    settings = JSON.parse(decodeURIComponent(e.response));
  } catch (err) {
    console.error('Failed to parse configuration response', err);
    return;
  }

  try {
    if (Array.isArray(settings.images) && settings.images.length > 0) {
      await sendAllImages(settings.images);
    }

    if (settings.watch_style !== undefined) {
      await sendAppMessageP({ [KEY_WATCH_STYLE]: parseInt(settings.watch_style, 10) });
      console.log('Sent watch_style: ' + settings.watch_style);
    }
  } catch (err) {
    console.error('Error sending configuration to watch', err);
  }
});

Pebble.addEventListener('ready', () => {
  console.log('PhotoWatch Rotate JS ready.');
});
