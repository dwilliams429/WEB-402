const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';


const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-goog-api-key': process.env.GOOGLE_API_KEY
});

router.post('/generate-recipe', async (req, res) => {
    const { ingredients, dietaryPreferences, allergies } = req.body;

    const prompt = `Generate a detailed recipe using ONLY: ${ingredients.join(", ")}.
Follow these preferences: ${dietaryPreferences.join(", ")}, allergies: ${allergies.join(", ")}.
Return:
Title:
Prep Time:
Cook Time:
Servings:
Ingredients:
Instructions:`;

    try {
        const response = await axios.post(
            `${GEMINI_URL}`,
            {
                contents: [{ parts: [{ text: prompt }] }]
            },
            { headers: getHeaders() }
        );

        const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        res.json({ result: text });
    } catch (err) {
        console.error(err.response?.data);
        res.status(500).send('Error generating recipe');
    }
});

router.post('/generate-meal-plan', async (req, res) => {
    const { preferences, mealsDescription } = req.body;

    const prompt = `Create a meal plan: ${mealsDescription}.
User Preferences: ${preferences.join(", ")}.
Format by Day → Meal → Dish.`;

    try {
        const response = await axios.post(
            `${GEMINI_URL}`,
            {
                contents: [{ parts: [{ text: prompt }] }]
            },
            { headers: getHeaders() }
        );

        const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        res.json({ result: text });
    } catch (err) {
        console.error(err.response?.data);
        res.status(500).send('Error generating meal plan');
    }
});

module.exports = router;
