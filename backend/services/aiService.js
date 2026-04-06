const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

if (GROQ_API_KEY) {
  console.log('GROQ AI key loaded successfully');
} else {
  console.log('GROQ AI not initialized: key missing');
}

const SYSTEM_PROMPT = `You are Circuit Fix Hub AI Assistant, an expert in electronic circuit 
diagnosis and repair. You help users identify and fix circuit problems including:
- Short circuits and open circuits
- Component failures (resistors, capacitors, ICs, transistors)
- Design errors and schematic issues
- Soldering problems and PCB defects
- Signal integrity and power supply issues
- Grounding and thermal problems

Provide clear, step-by-step guidance. Use technical terms but explain them. 
Always prioritize safety (warn about high voltage, proper discharge procedures, etc.).
Format responses with clear headings and numbered steps when appropriate.`;

const groqRequest = async (messages, maxTokens = 800, temperature = 0.7) => {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ API key missing');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GROQ API error ${response.status}: ${errorBody}`);
  }

  return response.json();
};

const analyzeCircuitIssue = async (issue) => {
  if (!GROQ_API_KEY) {
    return getFallbackAnalysis(issue);
  }

  try {
    const prompt = `
Analyze this circuit issue:

Title: ${issue.title}
Description: ${issue.description}
Category: ${issue.category}
Components: ${issue.components?.map(c => `${c.name} (${c.value})`).join(', ') || 'Not specified'}

Provide:
1. **Root Cause Analysis**: Most likely causes
2. **Diagnostic Steps**: How to verify the problem
3. **Suggested Fixes**: Ranked by probability
4. **Confidence Level**: 0-100%
5. **Safety Warnings**: If applicable

Format as JSON with fields: analysis, suggestedFixes (array), confidence (number), diagnosticSteps (array), safetyWarnings (array)
    `;

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ];

    const result = await groqRequest(messages, 1000, 0.7);
    const content = result.choices[0]?.message?.content || result.choices?.[0]?.text || '';

    try {
      return JSON.parse(content);
    } catch {
      return {
        analysis: content,
        suggestedFixes: [],
        confidence: 70,
        diagnosticSteps: [],
        safetyWarnings: []
      };
    }
  } catch (error) {
    console.error('GROQ API error:', error);
    return getFallbackAnalysis(issue);
  }
};

const chatWithAI = async (message, conversationHistory = []) => {
  if (!GROQ_API_KEY) {
    return getFallbackChatResponse(message);
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10),
      { role: 'user', content: message }
    ];

    const result = await groqRequest(messages, 800, 0.7);
    return result.choices[0]?.message?.content || result.choices?.[0]?.text || '';
  } catch (error) {
    console.error('GROQ Chat API error:', error);
    return getFallbackChatResponse(message);
  }
};

// Fallback responses when OpenAI is not configured
const getFallbackAnalysis = (issue) => {
  const categoryFixes = {
    'short-circuit': [
      'Check for solder bridges between adjacent pins',
      'Inspect PCB traces for damage or unintended connections',
      'Test continuity between power and ground',
      'Look for damaged insulation on wires'
    ],
    'open-circuit': [
      'Check all solder joints for cold solder',
      'Test continuity along the affected trace',
      'Inspect connectors and wire terminations',
      'Look for cracked PCB traces'
    ],
    'component-failure': [
      'Test the suspected component with a multimeter',
      'Check for visual signs of damage (burn marks, swelling)',
      'Verify component ratings match design specifications',
      'Replace with known good component to test'
    ],
    'power-issue': [
      'Verify input voltage levels',
      'Check voltage regulator output',
      'Test capacitors on power rail',
      'Look for excessive current draw'
    ],
    'default': [
      'Systematically check all connections',
      'Verify component values match schematic',
      'Check power supply voltages',
      'Inspect for physical damage'
    ]
  };

  const fixes = categoryFixes[issue.category] || categoryFixes['default'];

  return {
    analysis: `Based on the issue category "${issue.category}", this appears to be a common circuit problem. A systematic approach to diagnosis is recommended.`,
    suggestedFixes: fixes,
    confidence: 60,
    diagnosticSteps: [
      'Visual inspection of the circuit',
      'Power supply verification',
      'Component testing with multimeter',
      'Signal tracing with oscilloscope if available'
    ],
    safetyWarnings: [
      'Always disconnect power before making changes',
      'Be cautious of charged capacitors',
      'Use proper ESD protection'
    ]
  };
};

const getFallbackChatResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('short circuit') || lowerMessage.includes('short')) {
    return `**Short Circuit Troubleshooting:**

1. **Disconnect power immediately** to prevent damage
2. **Visual inspection** - Look for:
   - Solder bridges between pins
   - Damaged traces touching each other
   - Foreign metallic objects on the board
3. **Continuity test** - Use a multimeter to check between power and ground
4. **Isolate sections** - Remove components one by one to find the short
5. **Thermal imaging** - If available, power briefly and look for hot spots

⚠️ **Safety**: Always ensure the circuit is completely de-energized before probing.`;
  }

  if (lowerMessage.includes('not working') || lowerMessage.includes('doesn\'t work')) {
    return `**General Circuit Debugging Steps:**

1. **Check power supply** - Verify correct voltage at all power pins
2. **Visual inspection** - Look for obvious damage, loose connections
3. **Verify connections** - Check against schematic
4. **Test components** - Use multimeter to test individual parts
5. **Signal tracing** - Follow the signal path from input to output
6. **Check ground connections** - Poor grounding causes many issues

Would you like me to help with a specific component or section?`;
  }

  return `I can help you with circuit troubleshooting! Here are some things I can assist with:

- **Diagnosing** short circuits, open circuits, and component failures
- **Suggesting fixes** based on symptoms
- **Explaining** how circuit components work
- **Guiding** you through measurement procedures
- **Recommending** tools and techniques

Please describe your circuit problem in detail, including:
- What the circuit should do
- What's actually happening
- Any error symptoms (smoke, heat, wrong values)
- Components involved

The more detail you provide, the better I can help!`;
};

module.exports = { analyzeCircuitIssue, chatWithAI };