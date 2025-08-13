import { EXTRA_CONFIG_PREFIX, createExtraConfigName, getExtraConfigIdentifier, isExtraConfig } from './extraConfigs';

describe('extraConfigs utilities', () => {
  describe('isExtraConfig', () => {
    it('should return true for extra config names', () => {
      expect(isExtraConfig(`${EXTRA_CONFIG_PREFIX}test-config`)).toBe(true);
      expect(isExtraConfig(`${EXTRA_CONFIG_PREFIX}another-config-123`)).toBe(true);
    });

    it('should return false for non-extra config names', () => {
      expect(isExtraConfig('grafana')).toBe(false);
      expect(isExtraConfig('prometheus-am')).toBe(false);
      expect(isExtraConfig('regular-alertmanager')).toBe(false);
      expect(isExtraConfig('')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isExtraConfig('~grafana-converted-extra-config')).toBe(false); // missing dash
      expect(isExtraConfig('prefix~grafana-converted-extra-config-test')).toBe(false); // has prefix
    });
  });

  describe('getExtraConfigIdentifier', () => {
    it('should extract identifier from extra config names', () => {
      expect(getExtraConfigIdentifier(`${EXTRA_CONFIG_PREFIX}test-config`)).toBe('test-config');
      expect(getExtraConfigIdentifier(`${EXTRA_CONFIG_PREFIX}my-alertmanager-123`)).toBe('my-alertmanager-123');
    });

    it('should handle names without the prefix', () => {
      expect(getExtraConfigIdentifier('test-config')).toBe('test-config');
      expect(getExtraConfigIdentifier('grafana')).toBe('grafana');
    });
  });

  describe('createExtraConfigName', () => {
    it('should create proper extra config names', () => {
      expect(createExtraConfigName('test-config')).toBe(`${EXTRA_CONFIG_PREFIX}test-config`);
      expect(createExtraConfigName('my-alertmanager')).toBe(`${EXTRA_CONFIG_PREFIX}my-alertmanager`);
    });

    it('should handle empty identifiers', () => {
      expect(createExtraConfigName('')).toBe(EXTRA_CONFIG_PREFIX);
    });
  });

  describe('EXTRA_CONFIG_PREFIX constant', () => {
    it('should have the correct prefix value', () => {
      expect(EXTRA_CONFIG_PREFIX).toBe('~grafana-converted-extra-config-');
    });
  });
});
