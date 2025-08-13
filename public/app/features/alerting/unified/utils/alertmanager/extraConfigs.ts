export const EXTRA_CONFIG_PREFIX = '~grafana-converted-extra-config-';

export interface ExtraConfiguration {
  identifier: string;
  source?: string;
  createdAt?: string;
}

export interface AlertingConfigResponse {
  extra_config?: ExtraConfiguration[];
}

export function isExtraConfig(name: string): boolean {
  return name.startsWith(EXTRA_CONFIG_PREFIX);
}

export function getExtraConfigIdentifier(name: string): string {
  return name.replace(EXTRA_CONFIG_PREFIX, '');
}

export function createExtraConfigName(identifier: string): string {
  return `${EXTRA_CONFIG_PREFIX}${identifier}`;
}
