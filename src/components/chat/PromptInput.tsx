import React, { useState, useRef } from 'react';
import { TextArea } from '@/ui-kit/TextArea';
import { Button } from '@/ui-kit/Button';
import { IconSend } from '@/ui-kit/icons/IconSend';
import { IconError } from '@/ui-kit/icons/IconError';
import { useConversation } from '@/contexts/ConversationContext';
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  OpenAIErrorResponse,
} from '../../types/chat';

// Constants for file upload
const MAX_FILES = 5;
const MAX_SINGLE_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TOTAL_FILE_SIZE = 15 * 1024 * 1024; // 15MB total

const ALLOWED_FILE_TYPES = [
  { type: 'application/pdf', extension: '.pdf', description: 'PDF' },
  { type: 'text/csv', extension: '.csv', description: 'CSV' },
  { type: 'text/plain', extension: '.txt', description: 'Text' },
  { type: 'text/markdown', extension: '.md', description: 'Markdown' },
  {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: '.xlsx',
    description: 'Excel',
  },
  { type: 'application/vnd.ms-excel', extension: '.xls', description: 'Excel' },
];

const PromptInput: React.FC = () => {
  // State Management
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use Conversation Context
  const {
    addUserMessageToHistory,
    addAssistantMessageToHistory,
    setSystemPrompt: setContextSystemPrompt,
    setUserPrompt: setContextUserPrompt,
    conversationHistory,
    currentConversationId,
    setCurrentConversation,
  } = useConversation();

  // State for error handling
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // File Upload Handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setFileUploadError(null);

    if (files) {
      const fileList = Array.from(files);

      // Comprehensive Validation
      const validationErrors: string[] = [];

      // Number of files check
      if (uploadedFiles.length + fileList.length > MAX_FILES) {
        validationErrors.push(`Maximum of ${MAX_FILES} files allowed`);
      }

      // Total file size check
      const currentTotalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
      const newFilesTotalSize = fileList.reduce((sum, file) => sum + file.size, 0);

      if (currentTotalSize + newFilesTotalSize > MAX_TOTAL_FILE_SIZE) {
        validationErrors.push(
          `Total file size cannot exceed ${MAX_TOTAL_FILE_SIZE / (1024 * 1024)}MB`
        );
      }

      // Validate each file
      const validFiles = fileList.filter(file => {
        // Individual file size check
        if (file.size > MAX_SINGLE_FILE_SIZE) {
          validationErrors.push(`File ${file.name} exceeds 5MB limit`);
          return false;
        }

        // File type check with detailed error
        const matchingType = ALLOWED_FILE_TYPES.find(allowedType => allowedType.type === file.type);

        if (!matchingType) {
          validationErrors.push(
            `Unsupported file type for ${file.name}. ` +
              `Allowed types: ${ALLOWED_FILE_TYPES.map(t => t.description).join(', ')}`
          );
          return false;
        }

        return true;
      });

      // Set comprehensive error messages
      if (validationErrors.length > 0) {
        setFileUploadError(validationErrors.join(' | '));
        return;
      }

      // Update files, preventing duplicates
      setUploadedFiles(prevFiles => {
        const uniqueNewFiles = validFiles.filter(
          newFile => !prevFiles.some(existingFile => existingFile.name === newFile.name)
        );
        return [...prevFiles, ...uniqueNewFiles].slice(0, MAX_FILES);
      });
    }
  };

  // Remove File Handler
  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };

  // Send Message Handler
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFileUploadError(null);

    // Validate input
    if (!userPrompt.trim() && uploadedFiles.length === 0) return;

    // Add system prompt to context if exists
    if (systemPrompt.trim()) {
      setContextSystemPrompt(systemPrompt.trim());
    }

    setIsLoading(true);

    try {
      let combinedUserPrompt = userPrompt.trim();

      // File parsing logic
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        uploadedFiles.forEach(file => formData.append('documents', file));

        const parseResponse = await fetch('/api/parse-document', {
          method: 'POST',
          body: formData,
        });

        if (!parseResponse.ok) {
          const errorData = await parseResponse.json();
          throw new Error(errorData.error?.message || 'File parsing failed');
        }

        const parseData = await parseResponse.json();
        combinedUserPrompt = `Document Content:\n${parseData.extractedText}\n\nUser Prompt:\n${combinedUserPrompt}`;
      }

      // Add user message to history
      addUserMessageToHistory(userPrompt.trim());

      // Update context user prompt
      setContextUserPrompt(userPrompt.trim());

      // Prepare request payload
      const requestPayload: ChatCompletionRequest = {
        systemPrompt: systemPrompt.trim() || 'You are a helpful AI assistant.',
        userPrompt: combinedUserPrompt,
        conversationHistory: conversationHistory,
        conversationId: currentConversationId,
      };

      // Send request to chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      const data: ChatCompletionResponse | OpenAIErrorResponse = await response.json();

      if (!response.ok) {
        const errorData = data as OpenAIErrorResponse;
        throw new Error(errorData.error.message || 'Failed to get assistant response');
      }

      const completionData = data as ChatCompletionResponse;
      debugger;
      setCurrentConversation(completionData.conversationId);
      // Add assistant response to history
      addAssistantMessageToHistory(completionData.assistantResponse);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      // Clear input fields
      setSystemPrompt('');
      setUserPrompt('');
      setUploadedFiles([]);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
      {!conversationHistory.some(msg => msg.role === 'system') && (
        <div className="mb-4">
          <TextArea
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            placeholder="Optional: Set system prompt to define AI behavior"
            className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
            rows={2}
          />
        </div>
      )}

      <div className="flex flex-col space-y-4">
        <div className="flex items-start space-x-2">
          <TextArea
            value={userPrompt}
            onChange={e => setUserPrompt(e.target.value)}
            placeholder="Enter your message"
            className="flex-1 min-h-[60px] max-h-[200px] resize-y border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
            rows={1}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={(!userPrompt.trim() && uploadedFiles.length === 0) || isLoading}
            className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            <span>{isLoading ? 'Sending...' : 'Send'}</span>
            {isLoading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <IconSend className="w-5 h-5" >Send</IconSend>
            )}
          </Button>
        </div>

        {error && (
          <div className="text-red-600 text-sm flex items-center">
            <IconError className="w-4 h-4 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept={ALLOWED_FILE_TYPES.map(t => t.extension).join(',')}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadedFiles.length >= MAX_FILES}
            className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            Upload files
          </button>
          {uploadedFiles.length > 0 && (
            <span>{`${uploadedFiles.length} file${uploadedFiles.length === 1 ? '' : 's'} selected`}</span>
          )}
        </div>

        {fileUploadError && <div className="text-red-600 text-sm">{fileUploadError}</div>}

        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center bg-gray-100 rounded-md px-2 py-1">
                <span className="text-sm text-gray-600 mr-2">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(file)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
};

export default PromptInput;
