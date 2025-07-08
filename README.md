# ⌨️ Figma Keyboard Typing Simulator Plugin

A professional Figma plugin that automates the setup of keyboard typing interactions in Prototyping mode using Figma Variables and keypress triggers.

## ✨ Features

- **Automated Setup**: Automatically creates keyboard interactions for A-Z, 0-9, Space, and Backspace
- **Variable Management**: Creates or uses existing String and Boolean variables
- **Caps Lock Support**: Optional caps lock toggle functionality
- **Custom Keys**: Add custom characters and symbols
- **Beautiful UI**: Clean, professional interface with real-time preview
- **Batch Processing**: Apply to multiple selected layers at once
- **Reset on Load**: Optional text clearing when prototype starts

## 🚀 What This Plugin Does

Instead of manually creating 50+ prototype interactions like:
- `On Key Press "a": Set variable keys = keys + "a"`
- `On Key Press "b": Set variable keys = keys + "b"`
- `On Key Press "BACKSPACE": Set variable keys = RemoveLastCharacter(keys)`

This plugin does it all automatically for any selected input field or layer.

## 📦 Installation

### Method 1: Figma Plugin Directory (Recommended)
1. Open Figma
2. Go to **Plugins** → **Browse plugins in Community**
3. Search for "Keyboard Typing Simulator"
4. Click **Install**

### Method 2: Development Installation
1. Download the plugin files
2. Open Figma
3. Go to **Plugins** → **Development** → **Import plugin from manifest**
4. Select the `manifest.json` file
5. The plugin will appear in your development plugins

## 🛠️ File Structure

```
keyboard-typing-simulator/
├── manifest.json          # Plugin manifest
├── code.ts               # Main plugin logic
├── ui.html               # Plugin UI
└── README.md            # This file
```

## 🎯 Usage

### Basic Usage

1. **Select Target Layer(s)**
   - Select any text layer, frame, component, or instance
   - The plugin works with multiple selections

2. **Open Plugin**
   - Go to **Plugins** → **Keyboard Typing Simulator**

3. **Configure Variables**
   - Choose existing String variable or create new one (e.g., "keys")
   - Optionally enable Caps Lock with Boolean variable

4. **Select Key Types**
   - ✅ Alphabetic Keys (A-Z)
   - ✅ Numeric Keys (0-9)
   - ✅ Spacebar
   - ✅ Backspace
   - ⚪ Caps Lock Toggle (optional)
   - ⚪ Reset on Load (optional)

5. **Add Custom Keys** (optional)
   - Enter custom characters in the text area
   - One character per line

6. **Apply Setup**
   - Click "Apply Keyboard Setup"
   - The plugin will create all necessary interactions

### Advanced Configuration

#### Caps Lock Toggle
- Enable this to add caps lock functionality
- Creates a Boolean variable to track caps state
- Pressing Caps Lock toggles between upper/lower case

#### Custom Keys
Add special characters or symbols:
```
!
@
#
$
%
&
*
```

#### Reset on Load
- Clears the text variable when prototype starts
- Useful for consistent starting state

## 🔧 Technical Details

### Generated Interactions

For each selected layer, the plugin creates:

**Alphabetic Keys (A-Z):**
```javascript
// Without Caps Lock
On Key Press "A": Set variable keys = keys + "a"

// With Caps Lock
On Key Press "A": Set variable keys = {caps_enabled} ? keys + "A" : keys + "a"
```

**Numeric Keys (0-9):**
```javascript
On Key Press "0": Set variable keys = keys + "0"
```

**Special Keys:**
```javascript
On Key Press "SPACE": Set variable keys = keys + " "
On Key Press "BACKSPACE": Set variable keys = RemoveLastCharacter(keys)
```

**Caps Lock Toggle:**
```javascript
On Key Press "CAPS_LOCK": Set variable caps_enabled = !caps_enabled
```

**Reset on Load:**
```javascript
On Load: Set variable keys = ""
```

### Variable Requirements

- **String Variable**: Stores the typed text
- **Boolean Variable**: (Optional) Tracks caps lock state

### Supported Layer Types

- Text layers
- Frames
- Components
- Instances

## 🎨 UI Features

### Status Indicators
- **Green**: Ready with valid selection
- **Yellow**: Waiting for selection
- **Red**: Invalid selection or error

### Real-time Preview
- Shows which keys will be configured
- Updates as you change settings
- Displays custom keys

### Error Handling
- Clear error messages
- Validation of inputs
- Graceful fallbacks

## 🔄 Workflow Integration

### Typical Prototype Setup

1. **Create Input Field**
   - Design your input field UI
   - Add text layer for displaying typed text

2. **Set up Variables**
   - Create String variable for text storage
   - Optionally create Boolean for caps lock

3. **Apply Plugin**
   - Select input field
   - Run plugin with desired settings
   - All interactions are automatically created

4. **Bind Text Display**
   - Set your text layer to display the variable
   - Text will update as users type

5. **Test Prototype**
   - Enter presentation mode
   - Click on input field
   - Start typing on your keyboard!

## 🐛 Troubleshooting

### Common Issues

**Plugin doesn't work:**
- Ensure you have a valid selection
- Check that selected layers support interactions
- Verify you're in a Figma file (not FigJam)

**Variables not found:**
- Refresh the plugin to reload variables
- Check variable names are correct
- Ensure variables exist in current document

**Keyboard not responding in prototype:**
- Make sure you clicked on the input field first
- Verify interactions were created correctly
- Check that variables are properly bound

### Error Messages

- **"No nodes selected"**: Select at least one layer
- **"Invalid selection"**: Selected layers don't support interactions
- **"Variable not found"**: Check variable name and existence

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This plugin is open source and available under the MIT License.

## 🆘 Support

Need help? 
- Check the troubleshooting section above
- Review Figma's prototyping documentation
- Submit issues on the GitHub repository

## 🙏 Acknowledgments

- Built with Figma Plugin API
- UI inspired by modern design systems
- Thanks to the Figma developer community

---

**Made with ❤️ for the Figma community**
