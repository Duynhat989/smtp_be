const OpenAI = require("openai");
const crypto = require('crypto');


class Gpt {
    constructor(myKey) {
        this.myKey = myKey
        this.openai = new OpenAI({ apiKey: this.myKey });
    }
    async chat(sendMessage) {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { "role": "system", "content": "You are a helpful assistant." },
                { "role": "user", "content": "Hello!" }
            ],
            stream: true,
        });

        for await (const chunk of completion) {
            sendMessage(`${chunk.choices[0].delta.content}`)
        }
    }
}
module.exports = {
    Gpt
}