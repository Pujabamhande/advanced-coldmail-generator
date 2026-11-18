const axios = require('axios');
const EmailHistory = require('../models/EmailHistory');

exports.generateEmail = async (req, res) => {
  try {
    const { prompt } = req.body;
    const tone = 'professional';

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    if (typeof prompt !== 'string') {
      return res.status(400).json({ message: 'Prompt must be a string' });
    }

    if (prompt.trim().length === 0) {
      return res.status(400).json({ message: 'Prompt cannot be empty' });
    }

    if (prompt.length > 2000) {
      return res.status(400).json({ message: 'Prompt cannot exceed 2000 characters' });
    }

    // Call Groq API (Free tier - No quota issues!)
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ message: 'AI service is not configured' });
    }

    const systemPrompt = `You are an expert email-writing assistant. Follow the purpose, audience, and details in the user's request; do not assume every request is for job outreach.

For work or business emails, use a professional tone. For personal emails to friends or family and celebrations such as birthdays, use a warm, genuinely friendly, natural voice rather than formal or business language.

Write from the sender's perspective using first person ("I", "we") where appropriate, and address the recipient directly. Do not write about the sender as a third person. Do not invent shared memories, personal details, names, achievements, metrics, or other facts; omit unknown details or use a simple greeting without a placeholder.

When the user includes an email draft or message text, treat it as source material even if they do not explicitly say "rewrite." Produce one complete, polished email and preserve all relevant supplied names, facts, metrics, achievements, requests, and sign-off details. Do not shorten it by dropping important information, invent facts, or repeat the same message. Keep the email body separate from the subject line.

If the user includes both an email and a LinkedIn message, put only the complete email in emailBody and put the LinkedIn message in linkedInDM. Never join these messages together. If the request is not business outreach, leave linkedInDM and followUpEmail empty.

Return ONLY valid JSON with exactly these string fields:
{
  "subject": "A suitable subject line",
  "emailBody": "The requested email",
  "linkedInDM": "A relevant short message, or an empty string when not applicable",
  "followUpEmail": "A relevant follow-up, or an empty string when not applicable"
}

Do not include markdown or explanations. For requests unrelated to outreach (such as a birthday greeting), write the requested email and leave linkedInDM and followUpEmail empty.`;

    const aiResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt.trim()
          }
        ],
        temperature: 0.7,
        max_completion_tokens: 4096,
        reasoning_effort: 'low',
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'email_campaign',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                subject: { type: 'string' },
                emailBody: { type: 'string' },
                linkedInDM: { type: 'string' },
                followUpEmail: { type: 'string' }
              },
              required: ['subject', 'emailBody', 'linkedInDM', 'followUpEmail'],
              additionalProperties: false
            }
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    // Parse the Groq response
    if (!aiResponse.data.choices || !aiResponse.data.choices[0] || !aiResponse.data.choices[0].message) {
      throw new Error('Invalid response from Groq API');
    }

    const choice = aiResponse.data.choices[0];
    const generatedText = choice.message.content;

    if (choice.finish_reason === 'length') {
      return res.status(502).json({
        message: 'The AI response was cut off before the email was complete. Please try again.'
      });
    }

    if (typeof generatedText !== 'string' || generatedText.trim().length === 0) {
      console.error('Groq returned an empty response:', {
        finishReason: choice.finish_reason
      });
      return res.status(502).json({
        message: 'The AI returned an empty response. Please try again.'
      });
    }
    
    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    let parsedResponse;
    
    try {
      parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(generatedText);
    } catch (parseError) {
      console.error('Groq returned invalid JSON:', parseError.message);
      return res.status(502).json({ 
        message: 'Failed to parse AI response', 
        error: 'The AI generated invalid JSON. Please try again.' 
      });
    }

    const emailData = {
      subject: typeof parsedResponse.subject === 'string' ? parsedResponse.subject.trim() : '',
      emailBody: typeof parsedResponse.emailBody === 'string' ? parsedResponse.emailBody.trim() : '',
      linkedInDM: typeof parsedResponse.linkedInDM === 'string' ? parsedResponse.linkedInDM.trim() : '',
      followUpEmail: typeof parsedResponse.followUpEmail === 'string' ? parsedResponse.followUpEmail.trim() : ''
    };

    // Validate response data
    if (!emailData.subject || !emailData.emailBody) {
      return res.status(502).json({
        message: 'The AI returned an incomplete email. Please try again.'
      });
    }

    // Save to history
    const historyEntry = await EmailHistory.create({
      userId: req.user._id,
      prompt: prompt.trim(),
      subject: emailData.subject,
      emailBody: emailData.emailBody,
      linkedInDM: emailData.linkedInDM,
      followUpEmail: emailData.followUpEmail
    });

    res.status(200).json(historyEntry);
  } catch (error) {
    console.error('AI Generation Error:', error.response?.data || error.message);
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        message: 'Too many requests. Please wait a moment before trying again.',
        error: 'Rate limit exceeded'
      });
    }

    if (error.response?.status === 401) {
      return res.status(502).json({
        message: 'Groq rejected the API key. Check that GROQ_API_KEY in the backend environment is valid.'
      });
    }

    if (error.response?.status === 403 || error.response?.status === 404) {
      return res.status(502).json({
        message: 'Groq could not access the configured model. Check the API key permissions and model availability.'
      });
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        message: 'The request to Groq timed out. Please try again.'
      });
    }

    if (error.response) {
      return res.status(502).json({
        message: error.response.data?.error?.message || 'Groq rejected the request. Check the model and request configuration.'
      });
    }

    return res.status(502).json({
      message: 'Could not connect to Groq. Check the backend network connection and try again.'
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await EmailHistory.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history' });
  }
};