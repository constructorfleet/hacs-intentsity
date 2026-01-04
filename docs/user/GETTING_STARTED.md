# Getting Started with Intentsity

This guide will help you install and set up the Intentsity custom integration for Home Assistant.

## Prerequisites

- Home Assistant 2026.7.0 or newer
- HACS (Home Assistant Community Store) installed

## Installation

### Via HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Go to "Integrations"
3. Click the three dots in the top right corner
4. Select "Custom repositories"
5. Add this repository URL: `https://github.com/constructorfleet/hacs-intentsity`
6. Set category to "Integration"
7. Click "Add"
8. Find "Intentsity" in the integration list
9. Click "Download"
10. Restart Home Assistant

### Manual Installation

1. Download the latest release from the [releases page](https://github.com/constructorfleet/hacs-intentsity/releases)
2. Extract the `intentsity` folder from the archive
3. Copy it to `custom_components/intentsity/` in your Home Assistant configuration directory
4. Restart Home Assistant

## Initial Setup

After installation, add the integration:

1. Go to **Settings** → **Devices & Services**
2. Click **+ Add Integration**
3. Search for "Intentsity"
4. Follow the configuration steps:

### Step 1: Create Intents

Use the frontend panel to manage intents:

1. Open the Intentsity panel from the Home Assistant sidebar.
2. Use the "List Intents" button to view existing intents.
3. Use the "Create Intent" form to add new intents.

### Step 2: Manage Intents

You can update or delete intents using the frontend panel:

- **Update Intent**: Select an intent and modify its details.
- **Delete Intent**: Remove an intent from the store.

## What Gets Created

The integration does not create devices or entities. Instead, it manages intents directly within Home Assistant.

### Intents

- Intents are stored locally and can be used in automations and scripts.
- Use the frontend panel to manage intents efficiently.

## First Steps

### Dashboard Cards

Add entities to your dashboard:

1. Go to your dashboard
2. Click **Edit Dashboard** → **Add Card**
3. Choose card type (e.g., "Entities", "Glance")
4. Select entities from "Intentsity"

Example entities card:

```yaml
type: entities
title: Intentsity
entities:
  - sensor.device_name_sensor
  - binary_sensor.device_name_connectivity
  - switch.device_name_switch
```

### Automations

Use the integration in automations:

**Example - Trigger on sensor change:**

```yaml
automation:
  - alias: "React to sensor value"
    trigger:
      - trigger: state
        entity_id: sensor.device_name_sensor
    action:
      - action: notify.notify
        data:
          message: "Sensor changed to {{ trigger.to_state.state }}"
```

**Example - Control switch based on time:**

```yaml
automation:
  - alias: "Turn on in morning"
    trigger:
      - trigger: time
        at: "07:00:00"
    action:
      - action: switch.turn_on
        target:
          entity_id: switch.device_name_switch
```

## Troubleshooting

### Connection Failed

If setup fails with connection errors:

1. Verify the host/IP address is correct and reachable
2. Check that the API key/token is valid
3. Ensure no firewall is blocking the connection
4. Check Home Assistant logs for detailed error messages

### Entities Not Updating

If entities show "Unavailable" or don't update:

1. Check that the device/service is online
2. Verify API credentials haven't expired
3. Review logs: **Settings** → **System** → **Logs**
4. Try reloading the integration

### Debug Logging

Enable debug logging to troubleshoot issues:

```yaml
logger:
  default: warning
  logs:
    custom_components.intentsity: debug
```

Add this to `configuration.yaml`, restart, and reproduce the issue. Check logs for detailed information.

## Next Steps

- See [CONFIGURATION.md](./CONFIGURATION.md) for detailed configuration options
- See [EXAMPLES.md](./EXAMPLES.md) for more automation examples
- Report issues at [GitHub Issues](https://github.com/constructorfleet/hacs-intentsity/issues)

## Support

For help and discussion:

- [GitHub Discussions](https://github.com/constructorfleet/hacs-intentsity/discussions)
- [Home Assistant Community Forum](https://community.home-assistant.io/)
