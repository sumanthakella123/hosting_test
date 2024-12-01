import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import axios from 'axios';
import { promises as fs } from 'fs';
import { createReadStream, existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import pkg from 'twilio';
const { twiml: { VoiceResponse } } = pkg;

// Get current directory name (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
    session({
        secret: 'supersecretkey',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 30 * 60 * 1000 },
    })
);

// Conversation history template
const conversationHistoryTemplate = [
    {
        role: 'system',
        content:
            'You are Neela, a friendly and knowledgeable phone call assistant from the Albany Hindu Temple in Albany, NY. ' +
            'Provide concise and helpful responses that are no longer than 2 lines. ' +
            'If there are any questions that are not related to temple just tell them you can only answers related to the temple. ' +
            'for anyone who want to make puja booking, coollect their name, email address and Puja Name'+
            'If you cannot answer a question or if the user asks for a manager or human, respond with exactly "TRANSFER_TO_MANAGER" as your message. ' +
            'If you detect frustration or multiple repeated questions from the user, respond with "TRANSFER_TO_MANAGER".',
    },
    {
        role: 'assistant',
        content: "Hello, I'm Neela from Albany Hindu Temple. How can I assist you today?",
    },
];

// Helper function: Generate TTS audio
async function textToSpeech(text, sessionId) {
    try {
        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/cgSgspJ2msm6clMCkdW9`,
            {
                text: text,
                model_id: 'eleven_turbo_v2_5',
                voice_settings: { stability: 0.5, similarity_boost: 0.75 },
            },
            {
                headers: {
                    'xi-api-key': ELEVEN_LABS_API_KEY,
                    Accept: 'audio/mpeg',
                    'Content-Type': 'application/json',
                },
                responseType: 'arraybuffer',
            }
        );

        const audioPath = join(__dirname, 'audio', `${sessionId}.mp3`);
        writeFileSync(audioPath, response.data);
        return audioPath;
    } catch (error) {
        console.error('Error in textToSpeech:', error.message);
        return null;
    }
}

// Helper function: Generate GPT response
async function generateResponse(userInput, conversationHistory) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: conversationHistory,
                max_tokens: 50,
                temperature: 0.7,
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error in generateResponse:', error.message);
        return "TRANSFER_TO_MANAGER";
    }
}

// Helper function: Clean up audio files
async function cleanupAudioFile(sessionId) {
    const audioPath = join(__dirname, 'audio', `${sessionId}.mp3`);
    try {
        if (existsSync(audioPath)) {
            unlinkSync(audioPath);
        }
    } catch (error) {
        console.error('Error cleaning up audio file:', error);
    }
}

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the Albany Hindu Temple Call Handling System');
});

app.post('/voice', async (req, res) => {
    const twiml = new VoiceResponse();

    try {
        req.session.sessionId = uuidv4();
        req.session.conversationHistory = [...conversationHistoryTemplate];
        req.session.transferAttempts = 0;

        const initialMessage = req.session.conversationHistory[1].content;
        const audioPath = await textToSpeech(initialMessage, req.session.sessionId);

        if (audioPath) {
            twiml.play(`${req.protocol}://${req.get('host')}/stream_audio/${req.session.sessionId}`);
        } else {
            twiml.say(initialMessage);
        }
        twiml.redirect('/gather');
    } catch (error) {
        console.error('Error in /voice:', error.message);
        twiml.say('An error occurred. Please try again later.');
    }

    res.type('text/xml').send(twiml.toString());
});

app.post('/gather', (req, res) => {
    const twiml = new VoiceResponse();

    try {
        twiml.gather({
            input: 'speech',
            action: '/process_speech',
            speechTimeout: 'auto',
            language: 'en-US',
        });
    } catch (error) {
        console.error('Error in /gather:', error.message);
        twiml.say('An error occurred. Please try again later.');
    }

    res.type('text/xml').send(twiml.toString());
});

app.post('/process_speech', async (req, res) => {
    const twiml = new VoiceResponse();
    const userInput = req.body.SpeechResult;
    const sessionId = req.session.sessionId;

    if (!userInput) {
        twiml.say("Sorry, I didn't catch that. Could you please repeat?");
        twiml.redirect('/gather');
        return res.type('text/xml').send(twiml.toString());
    }

    try {
        const conversationHistory = req.session.conversationHistory || [...conversationHistoryTemplate];
        
        conversationHistory.push({ role: 'user', content: userInput });
        const gptResponse = await generateResponse(userInput, conversationHistory);

        if (gptResponse === 'TRANSFER_TO_MANAGER') {
            req.session.transferAttempts = (req.session.transferAttempts || 0) + 1;
            
            if (req.session.transferAttempts >= 3) {
                twiml.say("I apologize, but our manager seems unavailable at the moment. Please try calling back later.");
                await cleanupAudioFile(sessionId);
                return res.type('text/xml').send(twiml.toString());
            }

            twiml.say("I'll transfer you to our manager now. Please hold.");
            twiml.dial({
                action: '/handle_transfer_result',
                timeout: 20,
            }, MANAGER_PHONE);
            
            return res.type('text/xml').send(twiml.toString());
        }

        conversationHistory.push({ role: 'assistant', content: gptResponse });
        req.session.conversationHistory = conversationHistory;

        const audioPath = await textToSpeech(gptResponse, sessionId);

        if (audioPath) {
            twiml.play(`${req.protocol}://${req.get('host')}/stream_audio/${sessionId}`);
        } else {
            twiml.say(gptResponse);
        }

        twiml.redirect('/gather');
    } catch (error) {
        console.error('Error in /process_speech:', error.message);
        twiml.say('An error occurred. Please try again later.');
        await cleanupAudioFile(sessionId);
    }

    res.type('text/xml').send(twiml.toString());
});

app.post('/handle_transfer_result', (req, res) => {
    const twiml = new VoiceResponse();
    const dialCallStatus = req.body.DialCallStatus;

    if (dialCallStatus !== 'completed') {
        twiml.say("I apologize, but I couldn't reach our manager. Let me try to help you instead.");
        twiml.redirect('/gather');
    }

    res.type('text/xml').send(twiml.toString());
});

app.get('/stream_audio/:sessionId', (req, res) => {
    const audioPath = join(__dirname, 'audio', `${req.params.sessionId}.mp3`);

    if (existsSync(audioPath)) {
        res.setHeader('Content-Type', 'audio/mpeg');
        const stream = createReadStream(audioPath);
        stream.pipe(res);
        stream.on('end', () => {
            cleanupAudioFile(req.params.sessionId)
                .catch(error => console.error('Error cleaning up audio file:', error));
        });
    } else {
        res.status(404).send('Audio file not found');
    }
});

// Ensure audio directory exists
if (!existsSync(join(__dirname, 'audio'))) {
    mkdirSync(join(__dirname, 'audio'));
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});