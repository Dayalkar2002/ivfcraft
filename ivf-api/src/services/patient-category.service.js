const { executeText } = require('../db/spExecutor');

function getCycleCategoryShortCode(marker) {
  const code = String(marker || '').trim();
  if (!code) return '';
  const upper = code.toUpperCase();
  if (upper === 'OR' || upper === 'ER' || upper === 'OD' || upper === 'IVF' || upper === 'ICSI' || upper === 'FET' || upper === 'FR') {
    return upper;
  }
  if (code.toLowerCase().includes('oocyte rec')) return 'OR';
  if (code.toLowerCase().includes('embryo rec')) return 'ER';
  return code.length <= 4 ? upper : '';
}

function mergePatCategoryShortCode(currentCategory, newShortCode) {
  const code = getCycleCategoryShortCode(newShortCode);
  if (!code) return currentCategory || '';

  const raw = String(currentCategory || '').trim();
  const parts = raw ? raw.split(';').map((p) => p.trim()).filter(Boolean) : [];
  const codes = [];
  const suffix = [];

  for (const part of parts) {
    if (part.toLowerCase().startsWith('donated to') || part.toLowerCase().startsWith('received from')) {
      suffix.push(part);
    } else if (part.includes('+')) {
      part.split('+').forEach((seg) => {
        const c = seg.trim();
        if (c && !codes.includes(c)) codes.push(c);
      });
    } else if (part && !codes.some((c) => c.toLowerCase() === part.toLowerCase())) {
      codes.unshift(part);
    }
  }

  if (!codes.some((c) => c.toLowerCase() === code.toLowerCase())) {
    codes.unshift(code);
  }

  const head = codes.join('+');
  const tail = suffix.join('; ');
  if (head && tail) return `${head}; ${tail}`;
  return head || tail;
}

function trimCategory(value, maxLen = 50) {
  const text = String(value || '').trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim();
}

async function getPatientName(patId) {
  const result = await executeText(
    "SELECT LTRIM(RTRIM(ISNULL(PatName, ''))) AS PatName FROM PatientMaster WHERE PatID = @PatID",
    [{ name: '@PatID', value: Number(patId) }]
  );
  return String(result.recordset?.[0]?.PatName ?? '').trim();
}

async function getPatientCategory(patId) {
  const result = await executeText(
    "SELECT LTRIM(RTRIM(ISNULL(PatCategory, ''))) AS PatCategory FROM PatientMaster WHERE PatID = @PatID",
    [{ name: '@PatID', value: Number(patId) }]
  );
  return String(result.recordset?.[0]?.PatCategory ?? '').trim();
}

async function setPatientCategory(patId, category) {
  await executeText('UPDATE PatientMaster SET PatCategory = @PatCategory WHERE PatID = @PatID', [
    { name: '@PatCategory', value: trimCategory(category) },
    { name: '@PatID', value: Number(patId) },
  ]);
}

async function setPatientCycleCategoryMarker(patId, cycleCategoryMarker) {
  if (!patId || !cycleCategoryMarker) return;
  const current = await getPatientCategory(patId);
  const updated = mergePatCategoryShortCode(current, cycleCategoryMarker);
  if (updated.toLowerCase() === current.toLowerCase()) return;
  await setPatientCategory(patId, updated);
}

async function updateDonorCategoryAfterDonation(donorPatId, recipientPatId, donationDate = new Date()) {
  if (!donorPatId || !recipientPatId) return;

  let recipientName = await getPatientName(recipientPatId);
  if (recipientName.length > 18) recipientName = recipientName.slice(0, 18).trim();

  const monthYear = donationDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  const marker = `Donated to ${recipientName} (${monthYear})`;

  const currentCategory = await getPatientCategory(donorPatId);
  if (currentCategory.includes(marker)) {
    await setPatientCycleCategoryMarker(recipientPatId, 'OR');
    return;
  }

  const updatedCategory = currentCategory ? `${currentCategory}; ${marker}` : marker;
  await setPatientCategory(donorPatId, updatedCategory);
  await setPatientCycleCategoryMarker(recipientPatId, 'OR');
}

module.exports = {
  mergePatCategoryShortCode,
  updateDonorCategoryAfterDonation,
  setPatientCycleCategoryMarker,
};
