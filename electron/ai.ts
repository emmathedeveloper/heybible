import { GoogleGenAIOptions, GoogleGenAI, LiveConnectConfig, Modality, Type, LiveServerMessage, FunctionResponse, Session, Blob } from "@google/genai";
import { AppWindows, windows } from "./window-management";

export let AISession: Session | undefined

export const startAISession = async (windows: AppWindows) => {

    if(!windows.main || !windows.projector) return

    const options: GoogleGenAIOptions = {
        vertexai: false,
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY,

    };
    const model = 'gemini-2.5-flash-native-audio-preview-12-2025';

    const ai = new GoogleGenAI(options);
    const config: LiveConnectConfig = {
        systemInstruction: {
            parts: [{
                text: `You are a real-time Bible reference assistant supporting a live preaching session. You do NOT fetch or generate verse text yourself. Instead, you identify the correct reference and trigger the appropriate tool call to retrieve it.
You have access to three tools:
---
## TOOLS
### 1. \`get_bible_passage\`
Used to fetch a specific chapter or verse.
Parameters:
- \`book\` (string, required) — Full book name e.g. "John", "Romans", "Genesis"
- \`chapter\` (integer, required) — Chapter number
- \`verse\` (integer, optional) — Specific verse number. Defaults to 1 if not provided.
Note: This tool always uses the currently active translation set by \`set_bible_version\`. Do not pass a version parameter here.
---
### 2. \`navigate_to_verse\`
Used when the preacher wants to move relative to the current verse — forward, backward, or a specific number of verses away.
Parameters:
- \`direction\` (string, required) — "next", "previous", or "jump"
- \`steps\` (integer, optional) — Number of verses to move. Defaults to 1 if not provided. Relevant for "next" and "previous".
- \`target_verse\` (integer, optional) — Used when direction is "jump" and the preacher names a specific verse number to land on within the current chapter.
---
### 3. \`set_bible_version\`
Used to set or switch the active Bible translation for the session.
Parameters:
- \`version\` (string, required) — Translation code e.g. "NIV", "KJV", "ESV", "NLT", "NKJV", "AMP", "MSG"
---
## BEHAVIOR RULES
- Never generate verse text yourself. Always use a tool call to retrieve it.
- Speed over ceremony. Resolve the reference quickly and fire the tool. Skip filler.
- set_bible_version is only called when the preacher explicitly asks to change translation.
- If a story could match multiple passages, surface the top options briefly and confirm before calling the tool.
- Track current position so navigate_to_verse has accurate context.
- Tone: quiet, reliable background assistant. No filler phrases. Resolve fast, call the tool, move on.` }]
        },
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        speechConfig: {
            voiceConfig: {
                prebuiltVoiceConfig: {
                    voiceName: 'Zephyr',
                },
            },
        },
        tools: [
            { googleSearch: {} },
            {
                functionDeclarations: [
                    {
                        name: 'get_bible_passage',
                        description: 'Fetch a specific Bible chapter or verse using the currently active translation.',
                        parameters: {
                            type: Type.OBJECT,
                            properties: {
                                book: {
                                    type: Type.STRING,
                                    description: 'Full book name e.g. "John", "Romans", "Genesis"',
                                },
                                chapter: {
                                    type: Type.INTEGER,
                                    description: 'Chapter number',
                                },
                                verse: {
                                    type: Type.INTEGER,
                                    description: 'Specific verse number. Defaults to 1 if not provided.',
                                },
                            },
                            required: ['book', 'chapter'],
                        },
                    },
                    {
                        name: 'navigate_to_verse',
                        description: 'Move relative to the current verse — forward, backward, or jump to a specific verse.',
                        parameters: {
                            type: Type.OBJECT,
                            properties: {
                                direction: {
                                    type: Type.STRING,
                                    enum: ['next', 'previous', 'jump'],
                                    description: 'Direction to navigate',
                                },
                                steps: {
                                    type: Type.INTEGER,
                                    description: 'Number of verses to move. Defaults to 1. Used with "next" and "previous".',
                                },
                                target_verse: {
                                    type: Type.INTEGER,
                                    description: 'Specific verse number to jump to within the current chapter. Used with "jump".',
                                },
                            },
                            required: ['direction'],
                        },
                    },
                    {
                        name: 'set_bible_version',
                        description: 'Set or switch the active Bible translation for the session.',
                        parameters: {
                            type: Type.OBJECT,
                            properties: {
                                version: {
                                    type: Type.STRING,
                                    description: 'Translation code e.g. "NIV", "KJV", "ESV", "NLT", "NKJV", "AMP", "MSG"',
                                },
                            },
                            required: ['version'],
                        },
                    },
                ],
            },
        ],
    };

    AISession = await ai.live.connect({
        model: model,
        config,
        callbacks: {
            onopen: () => {
                console.log('Live Session Opened');
            },
            onmessage: async (message: LiveServerMessage) => {

                if (message.toolCall) {
                    const functionCalls = message.toolCall.functionCalls;

                    if (functionCalls && functionCalls.length > 0) {
                        const toolResponses: FunctionResponse[] = [];

                        for (const call of functionCalls) {
                            console.log(`Tool call: ${call.name}`, call.args);
                            let result: object = {};

                            if (call.name === 'get_bible_passage') {
                                const { book, chapter, verse } = call.args as {
                                    book: string;
                                    chapter: number;
                                    verse?: number;
                                };

                                result = {
                                    book,
                                    chapter,
                                    verse
                                }

                                console.log(result)

                                windows.main?.webContents.send("get-bible-passage" , { book , chapter , verse })
                                
                            } else if (call.name === 'navigate_to_verse') {
                                const { direction, steps, target_verse } = call.args as {
                                    direction: 'next' | 'previous' | 'jump';
                                    steps?: number;
                                    target_verse?: number;
                                };

                                result = { direction, steps, target_verse }
                                
                                windows.main?.webContents.send("navigate-to-verse" , { direction , steps , target_verse })
                            } else if (call.name === 'set_bible_version') {
                                const { version } = call.args as { version: string };

                                result = { version }
                                
                                windows.main?.webContents.send("set-bible-version" , { version })
                            }

                            toolResponses.push({
                                id: call.id,
                                name: call.name,
                                response: { output: result },
                            });
                        }

                        // Send all tool results back to the session
                        AISession?.sendToolResponse({ functionResponses: toolResponses });
                    }
                }

                // Handle audio output transcription
                if (message.serverContent && message.serverContent.outputTranscription) {
                    console.log('Received output transcription:', message.serverContent.outputTranscription.text);
                    // const transcription = message.serverContent.outputTranscription.text;
                    // clients.forEach((client) => {
                    //     if (client.readyState === WebSocket.OPEN) {
                    //         client.send(JSON.stringify({ type: 'textStream', data: transcription }));
                    //     }
                    // });
                }

                // Handle audio data
                if (
                    message.serverContent &&
                    message.serverContent.modelTurn &&
                    message.serverContent.modelTurn.parts &&
                    message.serverContent.modelTurn.parts.length > 0
                ) {
                    // message.serverContent.modelTurn.parts.forEach((part) => {
                    //     if (part.inlineData && part.inlineData.data) {
                    //         const audioData = part.inlineData.data;
                    //         clients.forEach((client) => {
                    //             if (client.readyState === WebSocket.OPEN) {
                    //                 client.send(JSON.stringify({ type: 'audioStream', data: audioData }));
                    //             }
                    //         });
                    //     }
                    // });
                }
            },
            onerror: (e: ErrorEvent) => {
                console.log('Live Session Error:', JSON.stringify(e));
            },
            onclose: (e: CloseEvent) => {
                console.log('Live Session Closed — code:', e.code, '| reason:', e.reason, '| wasClean:', e.wasClean);
            },
        },
    });
}

export function endAISession(){
    if(AISession){
        AISession.close()

        windows.projector?.close()

        AISession = undefined
    }
}

export function createBlob(audioData: string): Blob {
  return { data: audioData, mimeType: 'audio/pcm;rate=16000' };
}