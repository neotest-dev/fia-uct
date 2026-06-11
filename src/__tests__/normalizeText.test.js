import { describe, it, expect } from 'vitest';
import { normalizeText } from '../utils/normalizeText';

describe('normalizeText', () => {
  it('should remove accents/diacritics from text', () => {
    expect(normalizeText('Información')).toBe('informacion');
    expect(normalizeText('Análisis Matemático II')).toBe('analisis matematico ii');
    expect(normalizeText('Diseño Arquitectónico')).toBe('diseno arquitectonico');
  });

  it('should convert text to lowercase', () => {
    expect(normalizeText('HELLO WORLD')).toBe('hello world');
    expect(normalizeText('InGeNiErÍa')).toBe('ingenieria');
  });

  it('should handle empty or null input', () => {
    expect(normalizeText('')).toBe('');
    expect(normalizeText(null)).toBe('');
    expect(normalizeText(undefined)).toBe('');
  });

  it('should trim whitespace', () => {
    expect(normalizeText('  hola  ')).toBe('hola');
  });

  it('should handle text without accents unchanged', () => {
    expect(normalizeText('arquitectura')).toBe('arquitectura');
    expect(normalizeText('ingenieria civil')).toBe('ingenieria civil');
  });

  it('should handle special Spanish characters', () => {
    expect(normalizeText('niño')).toBe('nino');
    expect(normalizeText('año')).toBe('ano');
    expect(normalizeText('Formación Cristiana')).toBe('formacion cristiana');
  });
});
