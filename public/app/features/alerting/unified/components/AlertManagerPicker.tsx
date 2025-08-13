import { css } from '@emotion/css';
import { ComponentProps, useMemo } from 'react';

import { GrafanaTheme2, SelectableValue } from '@grafana/data';
import { t } from '@grafana/i18n';
import { Badge, Icon, InlineField, Select, SelectMenuOptions, Stack, Tooltip, useStyles2 } from '@grafana/ui';

import { useAlertmanager } from '../state/AlertmanagerContext';
import { getExtraConfigIdentifier, isExtraConfig } from '../utils/alertmanager/extraConfigs';
import { AlertManagerDataSource, GRAFANA_RULES_SOURCE_NAME } from '../utils/datasource';

interface Props {
  disabled?: boolean;
}

function getAlertManagerLabel(alertManager: AlertManagerDataSource) {
  if (alertManager.name === GRAFANA_RULES_SOURCE_NAME) {
    return 'Grafana';
  }

  return alertManager.displayName || alertManager.name;
}

export const AlertManagerPicker = ({ disabled = false }: Props) => {
  const styles = useStyles2(getStyles);
  const { selectedAlertmanager, availableAlertManagers, setSelectedAlertmanager } = useAlertmanager();

  const options = useMemo(() => {
    // Group alertmanagers
    const grafanaAM = availableAlertManagers.find((am) => am.name === GRAFANA_RULES_SOURCE_NAME);
    const extraConfigs = availableAlertManagers.filter((am) => isExtraConfig(am.name));
    const datasourceAMs = availableAlertManagers.filter(
      (am) => am.name !== GRAFANA_RULES_SOURCE_NAME && !isExtraConfig(am.name)
    );

    const groupedOptions: Array<SelectableValue<string> | { label: string; options: Array<SelectableValue<string>> }> =
      [];

    // Add Grafana alertmanager first
    if (grafanaAM) {
      groupedOptions.push({
        label: getAlertManagerLabel(grafanaAM),
        value: grafanaAM.name,
        imgUrl: grafanaAM.imgUrl,
        meta: grafanaAM.meta,
      });
    }

    // Add extra configs as a group
    if (extraConfigs.length > 0) {
      const convertedConfigsLabel = t(
        'alerting.alert-manager-picker.converted-configs-group',
        'Converted Configurations'
      );
      groupedOptions.push({
        label: convertedConfigsLabel,
        options: extraConfigs.map((ec) => ({
          label: getAlertManagerLabel(ec),
          value: ec.name,
          imgUrl: ec.imgUrl,
          meta: ec.meta,
        })),
      });
    }

    // Add datasource alertmanagers in a group
    if (datasourceAMs.length > 0) {
      groupedOptions.push({
        label: t('alerting.alert-manager-picker.external-alertmanagers-group', 'External Alertmanagers'),
        options: datasourceAMs.map((ds) => ({
          label: getAlertManagerLabel(ds),
          value: ds.name,
          imgUrl: ds.imgUrl,
          meta: ds.meta,
        })),
      });
    }

    return groupedOptions;
  }, [availableAlertManagers]);

  const isDisabled = disabled || options.length === 1;
  const label = isDisabled ? 'Alertmanager' : 'Choose Alertmanager';

  // Check if the selected alertmanager is an extra config
  const isSelectedExtraConfig = selectedAlertmanager && isExtraConfig(selectedAlertmanager);

  return (
    <InlineField className={styles.field} label={label} disabled={isDisabled} data-testid="alertmanager-picker">
      <div className={styles.pickerContainer}>
        <Select
          aria-label={label}
          width={29}
          className="ds-picker select-container"
          backspaceRemovesValue={false}
          onChange={(value) => {
            if (value?.value) {
              setSelectedAlertmanager(value.value);
            }
          }}
          options={options}
          noOptionsMessage={t(
            'alerting.alert-manager-picker.noOptionsMessage-no-datasources-found',
            'No datasources found'
          )}
          value={selectedAlertmanager}
          getOptionLabel={(o) => o.label}
          components={{ Option: CustomOption }}
        />
        {isSelectedExtraConfig && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <Badge
              text={t('alerting.alert-manager-picker.converted-badge', 'Converted')}
              color="blue"
              className={styles.selectedBadge}
            />
            <Tooltip
              content={t(
                'alerting.alert-manager-picker.selected-converted-tooltip',
                "This configuration was imported using the Prometheus API and merged with Grafana's alerting setup. It can be changed only via the API."
              )}
              placement="bottom"
            >
              <Icon name="info-circle" size="sm" className={styles.infoIcon} />
            </Tooltip>
          </Stack>
        )}
      </div>
    </InlineField>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  field: css({
    margin: 0,
  }),
  pickerContainer: css({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  }),
  badgeWrapper: css({
    display: 'inline-block',
    cursor: 'help',
  }),
  selectedBadge: css({
    flexShrink: 0,
  }),
  infoIcon: css({
    color: theme.colors.text.secondary,
    cursor: 'pointer',
    '&:hover': {
      color: theme.colors.text.primary,
    },
  }),
  optionContent: css({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    whiteSpace: 'pre-line',
  }),
});

// custom option that overwrites the default "white-space: nowrap" for Alertmanager names that are really long
// and adds read-only badge for converted configs
const CustomOption = (props: ComponentProps<typeof SelectMenuOptions>) => {
  const styles = useStyles2(getStyles);
  const { data } = props;
  const alertManagerName = String(data?.value || '');

  if (isExtraConfig(alertManagerName)) {
    const identifier = getExtraConfigIdentifier(alertManagerName);
    return (
      <SelectMenuOptions
        {...props}
        renderOptionLabel={() => (
          <div className={styles.optionContent}>
            <span>{identifier}</span>
            <Tooltip
              content={t(
                'alerting.alert-manager-picker.read-only-tooltip',
                'This imported Alertmanager configuration was loaded via the Prometheus API. This configuration is merged with the main Grafana configuration and is read-only in the UI.'
              )}
            >
              <Badge
                text={t('alerting.alert-manager-picker.read-only-badge', 'Read-only')}
                color="darkgrey"
                aria-label={t(
                  'alerting.alert-manager-picker.read-only-badge-description',
                  'This is an imported configuration that cannot be edited'
                )}
              />
            </Tooltip>
          </div>
        )}
      />
    );
  }

  return (
    <SelectMenuOptions
      {...props}
      renderOptionLabel={({ label }) => <div className={styles.optionContent}>{label}</div>}
    />
  );
};
