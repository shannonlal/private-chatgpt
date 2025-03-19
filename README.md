# Private ChatGPT

## OpenAI Integration

This project integrates OpenAI's Chat Completions API to provide an interactive chat experience.

### Prerequisites

- Node.js (v18+)
- pnpm package manager
- OpenAI API Key

### Configuration

1. Copy `.env-sample` to `.env`
2. Add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Features

- Real-time chat with OpenAI models
- Conversation history management
- System and user prompt support
- Error handling
- Responsive UI

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `OPENAI_MODEL`: OpenAI model to use (default: gpt-4o)
- `OPENAI_MAX_TOKENS`: Maximum tokens for completion
- `OPENAI_TEMPERATURE`: Creativity/randomness of responses

### Development

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Run development server:
   ```bash
   pnpm dev
   ```

### Project Structure

- `src/pages/api/chat.ts`: OpenAI API route handler
- `src/components/chat/PromptInput.tsx`: User input component
- `src/components/chat/MessageDisplay.tsx`: Chat message display
- `src/contexts/ConversationContext.tsx`: Conversation state management

### Error Handling

The application includes comprehensive error handling:

- API call errors
- Input validation
- User-friendly error messages

### Technologies

- Next.js
- TypeScript
- Tailwind CSS
- OpenAI SDK
- Vercel Analytics

### License

[Add your license information]
