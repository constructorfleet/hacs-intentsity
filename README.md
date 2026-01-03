# Intentsity

[![GitHub Release][releases-shield]][releases]
[![GitHub Activity][commits-shield]][commits]
[![License][license-shield]](LICENSE)

[![hacs][hacsbadge]][hacs]
![Project Maintenance][maintenance-shield]

<!--
Uncomment and customize these badges if you want to use them:

[![BuyMeCoffee][buymecoffeebadge]][buymecoffee]
[![Discord][discord-shield]][discord]
-->

**✨ Develop in the cloud:** Want to contribute or customize this integration? Open it directly in GitHub Codespaces - no local setup required!

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/constructorfleet/hacs-intentsity?quickstart=1)

## ✨ Features

- **Easy Setup**: Simple configuration through the UI - no YAML required
- **Air Quality Monitoring**: Track AQI and PM2.5 levels in real-time
- **Filter Management**: Monitor filter life and get replacement alerts
- **Smart Control**: Adjust fan speed, target humidity, and operating modes
- **Child Lock**: Safety feature to prevent accidental changes
- **Diagnostic Info**: View filter life, runtime hours, and device statistics
- **Reconfigurable**: Change credentials anytime without removing the integration
- **Options Flow**: Adjust settings like update interval after setup
- **Custom Services**: Advanced control with built-in service calls



## 🚀 Quick Start

### Step 1: Install the Integration

**Prerequisites:** This integration requires [HACS](https://hacs.xyz/) (Home Assistant Community Store) to be installed.

Click the button below to open the integration directly in HACS:

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=jpawlowski&repository=hacs-intentsity&category=integration)

Then:

1. Click "Download" to install the integration
2. **Restart Home Assistant** (required after installation)

> **Note:** The My Home Assistant redirect will first take you to a landing page. Click the button there to open your Home Assistant instance.

<details>
<summary>**Manual Installation (Advanced)**</summary>

If you prefer not to use HACS:

1. Download the `custom_components/intentsity/` folder from this repository
2. Copy it to your Home Assistant's `custom_components/` directory
3. Restart Home Assistant

</details>

### Step 2: Add and Configure the Integration

**Important:** You must have installed the integration first (see Step 1) and restarted Home Assistant!

#### Option 1: One-Click Setup (Quick)

Click the button below to open the configuration dialog:

[![Open your Home Assistant instance and start setting up a new integration.](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=intentsity)

Follow the setup wizard:

1. Enter your username
2. Enter your password
3. Click Submit

That's it! The integration will start loading your data.

#### Option 2: Manual Configuration

1. Go to **Settings** → **Devices & Services**
2. Click **"+ Add Integration"**
3. Search for "Intentsity"
4. Follow the same setup steps as Option 1

### Step 3: Adjust Settings (Optional)

After setup, you can adjust options:

1. Go to **Settings** → **Devices & Services**
2. Find **Intentsity**
3. Click **Configure** to adjust:
   - Update interval (how often to refresh data)
   - Enable debug logging

You can also **Reconfigure** your credentials anytime without removing the integration.

### Step 4: Start Using!

The integration creates several entities for your air purifier:

- **Sensors**: Air quality index, PM2.5 levels, filter life remaining, total runtime
- **Binary Sensors**: API connection status, filter replacement alert
- **Switches**: Child lock, LED display control
- **Select**: Fan speed (Low/Medium/High/Auto)
- **Number**: Target humidity (30-80%)
- **Button**: Reset filter timer
- **Fan**: Air purifier fan control

Find all entities in **Settings** → **Devices & Services** → **Intentsity** → click on the device.



## Custom Services

The integration provides services for advanced automation:

### `intentsity.example_action`

Perform a custom action (customize this for your needs).

**Example:**

```yaml
service: intentsity.example_action
data:
  # Add your parameters here
```

### `intentsity.reload_data`

Manually refresh data from the API without waiting for the update interval.

**Example:**

```yaml
service: intentsity.reload_data
```

Use these services in automations or scripts for more control.

## Configuration Options

### During Setup

Name | Required | Description
-- | -- | --
Username | Yes | Your account username
Password | Yes | Your account password

### After Setup (Options)

You can change these anytime by clicking **Configure**:

Name | Default | Description
-- | -- | --
Update Interval | 1 hour | How often to refresh data
Enable Debugging | Off | Enable extra debug logging

## Troubleshooting

### Authentication Issues

#### Reauthentication

If your credentials expire or change, Home Assistant will automatically prompt you to reauthenticate:

1. Go to **Settings** → **Devices & Services**
2. Look for **"Action Required"** or **"Configuration Required"** message on the integration
3. Click **"Reconfigure"** or follow the prompt
4. Enter your updated credentials
5. Click Submit

The integration will automatically resume normal operation with the new credentials.

#### Manual Credential Update

You can also update credentials at any time without waiting for an error:

1. Go to **Settings** → **Devices & Services**
2. Find **Intentsity**
3. Click the **3 dots menu** → **Reconfigure**
4. Enter new username/password
5. Click Submit

#### Connection Status

Monitor your connection status with the **API Connection** binary sensor:

- **On** (Connected): Integration is receiving data normally
- **Off** (Disconnected): Connection lost or authentication failed
  - Check the binary sensor attributes for diagnostic information
  - Verify credentials if authentication failed
  - Check network connectivity

### Enable Debug Logging

To enable debug logging for this integration, add the following to your `configuration.yaml`:

```yaml
logger:
  default: info
  logs:
    custom_components.intentsity: debug
```

### Common Issues

#### Authentication Errors

If you receive authentication errors:

1. Verify your username and password are correct
2. Check that your account has the necessary permissions
3. Wait for the automatic reauthentication prompt, or manually reconfigure
4. Check the API Connection binary sensor for status

#### Device Not Responding

If your device is not responding:

1. Check the **API Connection** binary sensor - it should be "On"
2. Check your network connection
3. Verify the device is powered on
4. Check the integration diagnostics (Settings → Devices & Services → Intentsity → 3 dots → Download diagnostics)


## 🧠 Intent Management UI & API

### Intent Editor Panel

Intentsity now includes a full-featured **Intent Management Editor** accessible from the Home Assistant sidebar. This UI allows you to:

- View all defined intents
- Create, edit, clone, and delete intents
- Edit intent JSON directly with validation
- Changes are saved instantly and reflected in automations

**How to access:**

1. Open Home Assistant
2. Click the **Intentsity** panel in the sidebar
3. Use the editor to manage your intents visually

### WebSocket API

All intent CRUD operations are available via Home Assistant's WebSocket API. This enables advanced automations, scripting, and third-party integrations.

**Example (list intents):**

```
{
  "id": 1,
  "type": "intentsity/list_intents",
  "entry_id": "<your_config_entry_id>"
}
```

See `custom_components/intentsity/websocket.py` for all available commands and payloads.

### Backend Testing

The backend coordinator and WebSocket API are covered by unit tests:

- Coordinator: Data loading, error handling, and update logic
- WebSocket: Handler registration and callability

**To run all tests:**

```
./script/test -v
```

All tests must pass before submitting changes.

---
## 🤝 Contributing

Contributions are welcome! Please open an issue or pull request if you have suggestions or improvements.

### 🛠️ Development Setup

Want to contribute or customize this integration? You have two options:

#### Cloud Development (Recommended)

The easiest way to get started - develop directly in your browser with GitHub Codespaces:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/constructorfleet/hacs-intentsity?quickstart=1)

- ✅ Zero local setup required
- ✅ Pre-configured development environment
- ✅ Home Assistant included for testing
- ✅ 60 hours/month free for personal accounts

#### Local Development

Prefer working on your machine? You'll need:

- Docker Desktop
- VS Code with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

Then:

1. Clone this repository
2. Open in VS Code
3. Click "Reopen in Container" when prompted

Both options give you the same fully-configured development environment with Home Assistant, Python 3.13, and all necessary tools.

---

## 🤖 AI-Assisted Development

> **ℹ️ Transparency Notice**
>
> This integration was developed with assistance from AI coding agents (GitHub Copilot, Claude, and others). While the codebase follows Home Assistant Core standards, AI-generated code may not be reviewed or tested to the same extent as manually written code.
>
> AI tools were used to:
>
> - Generate boilerplate code following Home Assistant patterns
> - Implement standard integration features (config flow, coordinator, entities)
> - Ensure code quality and type safety
> - Write documentation and comments
>
> Please be aware that AI-assisted development may result in unexpected behavior or edge cases that haven't been thoroughly tested. If you encounter any issues, please [open an issue](../../issues) on GitHub.
>
> *Note: This section can be removed or modified if AI assistance was not used in your integration's development.*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by [@constructorfleet][user_profile]**

---

[commits-shield]: https://img.shields.io/github/commit-activity/y/constructorfleet/hacs-intentsity.svg?style=for-the-badge
[commits]: https://github.com/constructorfleet/hacs-intentsity/commits/main
[hacs]: https://github.com/hacs/integration
[hacsbadge]: https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge
[license-shield]: https://img.shields.io/github/license/constructorfleet/hacs-intentsity.svg?style=for-the-badge
[maintenance-shield]: https://img.shields.io/badge/maintainer-%40constructorfleet-blue.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/release/constructorfleet/hacs-intentsity.svg?style=for-the-badge
[releases]: https://github.com/constructorfleet/hacs-intentsity/releases
[user_profile]: https://github.com/jpawlowski

<!-- Optional badge definitions - uncomment if needed:
[buymecoffee]: https://www.buymeacoffee.com/jpawlowski
[buymecoffeebadge]: https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?style=for-the-badge
[discord]: https://discord.gg/Qa5fW2R
[discord-shield]: https://img.shields.io/discord/330944238910963714.svg?style=for-the-badge
-->
