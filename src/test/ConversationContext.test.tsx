import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ConversationProvider, useConversation, Message } from '../contexts/ConversationContext';

describe('ConversationContext', () => {
  // Test adding a message
  it('should add a message to conversation history', () => {
    const { result } = renderHook(() => useConversation(), {
      wrapper: ConversationProvider,
    });

    const testMessage: Message = {
      id: '1',
      role: 'user',
      content: 'Hello',
      timestamp: new Date(),
    };

    act(() => {
      result.current.addMessageToHistory(testMessage);
    });

    expect(result.current.conversationHistory).toHaveLength(1);
    expect(result.current.conversationHistory[0]).toEqual(testMessage);
  });

  // Test clearing conversation history
  it('should clear conversation history', () => {
    const { result } = renderHook(() => useConversation(), {
      wrapper: ConversationProvider,
    });

    const testMessages: Message[] = [
      { id: '1', role: 'user', content: 'Hello', timestamp: new Date() },
      { id: '2', role: 'assistant', content: 'Hi there', timestamp: new Date() },
    ];

    act(() => {
      testMessages.forEach(msg => result.current.addMessageToHistory(msg));
      result.current.clearConversationHistory();
    });

    expect(result.current.conversationHistory).toHaveLength(0);
  });

  // Test setting system and user prompts
  it('should update system and user prompts', () => {
    const { result } = renderHook(() => useConversation(), {
      wrapper: ConversationProvider,
    });

    act(() => {
      result.current.setSystemPrompt('Test system prompt');
      result.current.setUserPrompt('Test user prompt');
    });

    expect(result.current.systemPrompt).toBe('Test system prompt');
    expect(result.current.userPrompt).toBe('Test user prompt');
  });

  // Test that hook throws error when used outside provider
  it('should throw an error when used outside ConversationProvider', () => {
    const hookCall = () => {
      renderHook(() => useConversation());
    };

    expect(hookCall).toThrow('useConversation must be used within a ConversationProvider');
  });
});
