import { describe, it, expect } from 'vitest';
import { encryptBackupData, decryptBackupData } from '../cryptoBackup';

describe('cryptoBackup - Zero-Knowledge AES-GCM Encrypted Backup', () => {
  const sampleState = {
    tracker: {
      'Month 1': [
        {
          week: 'Week 1',
          days: [
            { day: 'Monday', quantCount: 18, quantCompleted: true, notes: 'Crushed algebra formulas' }
          ]
        }
      ]
    },
    studyPlan: [{ week: 'Week 1', status: 'Completed' }],
    mocks: [{ id: 1, totalScore: 102, status: 'Taken' }],
    settings: { theme: 'dark', targetExam: 'cat' }
  };

  it('encrypts and decrypts state accurately with correct passphrase', async () => {
    const passphrase = 'SuperSecretCat2026Passphrase!';
    const blob = await encryptBackupData(sampleState, passphrase);

    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(50);

    const buffer = await blob.arrayBuffer();
    const decryptedJson = await decryptBackupData(buffer, passphrase);
    const parsed = JSON.parse(decryptedJson);

    expect(parsed.settings.targetExam).toBe('cat');
    expect(parsed.mocks[0].totalScore).toBe(102);
    expect(parsed.tracker['Month 1'][0].days[0].quantCount).toBe(18);
    expect(parsed.tracker['Month 1'][0].days[0].notes).toBe('Crushed algebra formulas');
  });

  it('rejects decryption when an incorrect passphrase is supplied', async () => {
    const correctPassphrase = 'CorrectPassphrase123';
    const wrongPassphrase = 'WrongPassphrase999';

    const blob = await encryptBackupData(sampleState, correctPassphrase);
    const buffer = await blob.arrayBuffer();

    await expect(decryptBackupData(buffer, wrongPassphrase)).rejects.toThrow(
      /Decryption failed: Incorrect passphrase or corrupted backup file/i
    );
  });

  it('rejects decryption when file format is corrupted or missing magic header', async () => {
    const fakeBuffer = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50]).buffer;

    await expect(decryptBackupData(fakeBuffer, 'somePassphrase')).rejects.toThrow(
      /Not a recognized CATALyze encrypted backup/i
    );
  });

  it('rejects empty passphrases during encryption and decryption', async () => {
    await expect(encryptBackupData(sampleState, '')).rejects.toThrow(
      /Encryption passphrase cannot be empty/i
    );
    await expect(encryptBackupData(sampleState, '   ')).rejects.toThrow(
      /Encryption passphrase cannot be empty/i
    );

    const validBlob = await encryptBackupData(sampleState, 'validPass');
    const buffer = await validBlob.arrayBuffer();

    await expect(decryptBackupData(buffer, '')).rejects.toThrow(
      /Passphrase cannot be empty/i
    );
  });
});
