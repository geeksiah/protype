figma.showUI(__html__, { 
  width: 400, 
  height: 600,
  themeColors: true 
});

interface PluginMessage {
  type: string;
  data?: any;
}

interface KeyConfig {
  enabled: boolean;
  keys: string[];
}

interface PluginSettings {
  variableName: string;
  includeAlphabetic: boolean;
  includeNumeric: boolean;
  includeSpace: boolean;
  includeBackspace: boolean;
  enableCapsLock: boolean;
  capsVariableName: string;
  resetOnLoad: boolean;
  customKeys: string[];
}

// Store current selection
let currentSelection: SceneNode[] = [];

// Listen for selection changes
figma.on('selectionchange', () => {
  currentSelection = figma.currentPage.selection;
  figma.ui.postMessage({
    type: 'selection-changed',
    data: {
      hasSelection: currentSelection.length > 0,
      selectionCount: currentSelection.length,
      validSelection: currentSelection.length > 0 && currentSelection.every(node => 
        node.type === 'TEXT' || node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE'
      )
    }
  });
});

// Get all string variables in the document
function getStringVariables(): Variable[] {
  const variables: Variable[] = [];
  const collections = figma.variables.getLocalVariableCollections();
  
  collections.forEach(collection => {
    collection.variableIds.forEach(id => {
      const variable = figma.variables.getVariableById(id);
      if (variable && variable.resolvedType === 'STRING') {
        variables.push(variable);
      }
    });
  });
  
  return variables;
}

// Get all boolean variables in the document
function getBooleanVariables(): Variable[] {
  const variables: Variable[] = [];
  const collections = figma.variables.getLocalVariableCollections();
  
  collections.forEach(collection => {
    collection.variableIds.forEach(id => {
      const variable = figma.variables.getVariableById(id);
      if (variable && variable.resolvedType === 'BOOLEAN') {
        variables.push(variable);
      }
    });
  });
  
  return variables;
}

// Create a new string variable
async function createStringVariable(name: string): Promise<Variable> {
  let collection = figma.variables.getLocalVariableCollections()[0];
  
  if (!collection) {
    collection = figma.variables.createVariableCollection('Keyboard Variables');
  }
  
  const variable = figma.variables.createVariable(name, collection, 'STRING');
  variable.setValueForMode(collection.defaultModeId, '');
  
  return variable;
}

// Create a new boolean variable
async function createBooleanVariable(name: string): Promise<Variable> {
  let collection = figma.variables.getLocalVariableCollections()[0];
  
  if (!collection) {
    collection = figma.variables.createVariableCollection('Keyboard Variables');
  }
  
  const variable = figma.variables.createVariable(name, collection, 'BOOLEAN');
  variable.setValueForMode(collection.defaultModeId, false);
  
  return variable;
}

// Generate key mappings
function generateKeyMappings(settings: PluginSettings): { [key: string]: string } {
  const mappings: { [key: string]: string } = {};
  
  // Alphabetic keys
  if (settings.includeAlphabetic) {
    for (let i = 65; i <= 90; i++) {
      const char = String.fromCharCode(i);
      const lowerChar = char.toLowerCase();
      
      if (settings.enableCapsLock) {
        mappings[char] = `{${settings.capsVariableName}} ? {${settings.variableName}} + "${char}" : {${settings.variableName}} + "${lowerChar}"`;
      } else {
        mappings[char] = `{${settings.variableName}} + "${lowerChar}"`;
      }
    }
  }
  
  // Numeric keys
  if (settings.includeNumeric) {
    for (let i = 48; i <= 57; i++) {
      const char = String.fromCharCode(i);
      mappings[char] = `{${settings.variableName}} + "${char}"`;
    }
  }
  
  // Space
  if (settings.includeSpace) {
    mappings['SPACE'] = `{${settings.variableName}} + " "`;
  }
  
  // Backspace
  if (settings.includeBackspace) {
    mappings['BACKSPACE'] = `RemoveLastCharacter({${settings.variableName}})`;
  }
  
  // Custom keys
  settings.customKeys.forEach(key => {
    if (key.trim()) {
      mappings[key.toUpperCase()] = `{${settings.variableName}} + "${key}"`;
    }
  });
  
  return mappings;
}

// Apply keyboard interactions to selected nodes
async function applyKeyboardInteractions(settings: PluginSettings): Promise<void> {
  if (currentSelection.length === 0) {
    throw new Error('No nodes selected');
  }
  
  // Get or create string variable
  let stringVariable: Variable;
  const existingStringVars = getStringVariables();
  const existingVar = existingStringVars.find(v => v.name === settings.variableName);
  
  if (existingVar) {
    stringVariable = existingVar;
  } else {
    stringVariable = await createStringVariable(settings.variableName);
  }
  
  // Get or create caps lock variable if needed
  let capsVariable: Variable | null = null;
  if (settings.enableCapsLock) {
    const existingBooleanVars = getBooleanVariables();
    const existingCapsVar = existingBooleanVars.find(v => v.name === settings.capsVariableName);
    
    if (existingCapsVar) {
      capsVariable = existingCapsVar;
    } else {
      capsVariable = await createBooleanVariable(settings.capsVariableName);
    }
  }
  
  // Generate key mappings
  const keyMappings = generateKeyMappings(settings);
  
  // Apply interactions to each selected node
  for (const node of currentSelection) {
    if (!('reactions' in node)) continue;
    
    // Clear existing keyboard reactions
    node.reactions = node.reactions.filter(reaction => 
      reaction.trigger.type !== 'KEY_DOWN'
    );
    
    // Add new keyboard reactions
    Object.entries(keyMappings).forEach(([key, expression]) => {
      const reaction: Reaction = {
        trigger: {
          type: 'KEY_DOWN',
          device: 'KEYBOARD',
          keyCodes: [key === 'SPACE' ? 32 : key === 'BACKSPACE' ? 8 : key.charCodeAt(0)]
        },
        action: {
          type: 'SET_VARIABLE',
          variableId: stringVariable.id,
          variableModeId: stringVariable.variableCollectionId,
          value: {
            type: 'EXPRESSION',
            expression: expression
          }
        }
      };
      
      node.reactions.push(reaction);
    });
    
    // Add caps lock toggle if enabled
    if (settings.enableCapsLock && capsVariable) {
      const capsReaction: Reaction = {
        trigger: {
          type: 'KEY_DOWN',
          device: 'KEYBOARD',
          keyCodes: [20] // Caps Lock key code
        },
        action: {
          type: 'SET_VARIABLE',
          variableId: capsVariable.id,
          variableModeId: capsVariable.variableCollectionId,
          value: {
            type: 'EXPRESSION',
            expression: `!{${settings.capsVariableName}}`
          }
        }
      };
      
      node.reactions.push(capsReaction);
    }
    
    // Add reset on load if enabled
    if (settings.resetOnLoad) {
      const resetReaction: Reaction = {
        trigger: {
          type: 'ON_LOAD'
        },
        action: {
          type: 'SET_VARIABLE',
          variableId: stringVariable.id,
          variableModeId: stringVariable.variableCollectionId,
          value: {
            type: 'EXPRESSION',
            expression: '""'
          }
        }
      };
      
      node.reactions.push(resetReaction);
    }
  }
}

// Message handler
figma.ui.onmessage = async (msg: PluginMessage) => {
  try {
    switch (msg.type) {
      case 'get-variables':
        figma.ui.postMessage({
          type: 'variables-data',
          data: {
            stringVariables: getStringVariables().map(v => ({ id: v.id, name: v.name })),
            booleanVariables: getBooleanVariables().map(v => ({ id: v.id, name: v.name }))
          }
        });
        break;
        
      case 'get-selection':
        figma.ui.postMessage({
          type: 'selection-data',
          data: {
            hasSelection: currentSelection.length > 0,
            selectionCount: currentSelection.length,
            validSelection: currentSelection.length > 0 && currentSelection.every(node => 
              node.type === 'TEXT' || node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE'
            )
          }
        });
        break;
        
      case 'apply-keyboard-setup':
        await applyKeyboardInteractions(msg.data);
        figma.ui.postMessage({
          type: 'setup-complete',
          data: {
            success: true,
            message: `Keyboard interactions applied to ${currentSelection.length} node(s)`
          }
        });
        break;
        
      case 'close-plugin':
        figma.closePlugin();
        break;
        
      default:
        console.warn('Unknown message type:', msg.type);
    }
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      data: {
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      }
    });
  }
};

// Initialize
figma.ui.postMessage({
  type: 'init',
  data: {
    hasSelection: currentSelection.length > 0,
    selectionCount: currentSelection.length
  }
});
