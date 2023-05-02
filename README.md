# GPTogether

GPTogether turns GPT prompts into a social experience. Connect with others who are curious about similar topics. Explore the world through the unique lens of collaborative prompting. Inspire together in the age of GPT. Forget social networks. Experience the magic of prompt networks.
GPTogether uses Next.js for the client-side, FastAPI for the backend, and an ML module using vector DB.

## Frontend

This frontend repository is built using Next.js and Tailwind CSS, and includes a comprehensive design system. It integrates Firebase authentication for secure user authentication.
The app allows users to chat with ChatGPT, receive prompt suggestions, and explore similar conversations based on their chats with ChatGPT. Additionally, users can find and connect with people who share similar interests.

[Frontend Setup Instructions](frontend/README.md)

## Backend

GPTogether’s backend code is written in Python which enhances the capabilities of ChatGPT, a large language model trained by OpenAI, based on the GPT-3.5 architecture. It plays a critical role in handling the server-side logic, data storage, and retrieval that powers the chatbot’s natural language processing and conversation management.

[Backend Setup Instructions](backend/README.md)


## NLP


[NLP Setup Instructions](nlp/README.md)


## Demo

[![GPTogether Demo Video](demo.png)](https://www.loom.com/share/258dd1e0c7404e90b30c3d513b7afe4d?user_id_of_reactor=17908495)

## Future features

1. Support for extensions
    
    We didn’t start with an extension because our own app gives us more control and makes the ChatGPT interface less congested. Slight changes to the destination app can break the extension. Now that we have a robust backend ready, we can build an extension to ChatGPT and other apps that want to leverage the capabilities of GPTogether.
    
2. Vector database integration to store vectors data

    Currently, we use Postgres to store vectors, but it is not fundamentally built to store vector data. We plan to use a vector database to store the vector data to enable faster retrieval and processing.

3. Exploration and fine-tuning of other LLMs

4. Tokenomics

    Give incentives to the creators of the most used conversations and prompts.

5. Censorship

   Remember the incident where Samsung workers leaked trade secrets Via ChatGPT? We hope to build in-house algorithms to prevent such incidents. Also, we hope to recommend particular prompts and conversations based on various parameters.

6. In-app chat integration between users

## License

The GPTogether project is licensed under the Apache 2 License. See the [LICENSE file](LICENSE) for more information.

