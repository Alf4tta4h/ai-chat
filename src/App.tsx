import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { X, Eye, Check, Copy } from 'lucide-react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { jsPDF } from "jspdf";
import 'react-tabs/style/react-tabs.css';
import { GeminiApi } from './services/geminiApi';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { InputArea } from './components/InputArea';
import { SettingsModal } from './components/SettingsModal';
import { useChatHistory } from './hooks/useChatHistory';
import { useApiConfig } from './hooks/useApiConfig';
import { useCustomTheme } from './hooks/useCustomTheme';

// Import bahasa-bahasa tambahan
import js from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import ts from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import html from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import kotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift';
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php';
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby';
import scala from 'react-syntax-highlighter/dist/esm/languages/prism/scala';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';

// Daftarkan bahasa-bahasa
SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('html', html);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('c', c);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('kotlin', kotlin);
SyntaxHighlighter.registerLanguage('rust', rust);
SyntaxHighlighter.registerLanguage('swift', swift);
SyntaxHighlighter.registerLanguage('php', php);
SyntaxHighlighter.registerLanguage('ruby', ruby);
SyntaxHighlighter.registerLanguage('scala', scala);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('markdown', markdown);

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

function App() {
  const {
    chatHistory,
    currentChatId,
    messages,
    startNewChat,
    updateChatTitle,
    switchChat,
    deleteChat,
    updateMessages
  } = useChatHistory();

  const { apiConfig, setApiConfig } = useApiConfig();
  const { customTheme, setCustomTheme, applyCustomTheme, resetTheme } = useCustomTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fungsi untuk menghasilkan judul otomatis
  const generateChatTitle = useCallback((messages: Message[]): string => {
    const userMessage = messages.find(m => m.role === 'user');
    if (userMessage) {
      const words = userMessage.content.split(' ').slice(0, 5).join(' ');
      return words.length < 30 ? words : words.substring(0, 30) + '...';
    }
    return 'New Chat';
  }, []);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (input: string) => {
    if (!input.trim()) return;

    setIsLoading(true);
    setIsGenerating(true);

    const userMessage: Message = { role: 'user', content: input };
    
    console.log('Adding user message:', userMessage);
    updateMessages(prevMessages => {
      const newMessages = [...prevMessages, userMessage];
      console.log('New messages state:', newMessages);
      return newMessages;
    });

    if (!currentChatId) {
      startNewChat();
    }

    updateChatTitle(currentChatId!, generateChatTitle([...messages, userMessage]));

    abortControllerRef.current = new AbortController();

    try {
      if (apiConfig.provider === 'gemini') {
        const geminiApi = new GeminiApi({
          apiKey: apiConfig.apiKey,
          model: apiConfig.model,
        });
        const stream = geminiApi.generateContentStream(input);
        let assistantMessage = '';
        // Tambahkan pesan asisten kosong
        updateMessages(prevMessages => [...prevMessages, { role: 'assistant', content: '' }]);
        for await (const chunk of stream) {
          assistantMessage += chunk;
          // Update pesan asisten yang sudah ada
          updateMessages(prevMessages => {
            const newMessages = [...prevMessages];
            newMessages[newMessages.length - 1].content = assistantMessage;
            return newMessages;
          });
        }
      } else {
        let response: Response | undefined;
        if (apiConfig.provider === 'openai') {
          response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiConfig.apiKey}`,
            },
            body: JSON.stringify({
              model: apiConfig.model,
              messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
              stream: true,
            }),
            signal: abortControllerRef.current.signal,
          });
        } else if (apiConfig.provider === 'claude') {
          response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiConfig.apiKey,
            },
            body: JSON.stringify({
              model: apiConfig.model,
              messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
              stream: true,
            }),
            signal: abortControllerRef.current.signal,
          });
        } else {
          response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: apiConfig.model,
              prompt: input,
              stream: true,
              options: {
                temperature: 0.7,
                top_k: 40,
                top_p: 0.9,
                repeat_penalty: 1.1,
                max_tokens: 2048,
              },
            }),
            signal: abortControllerRef.current.signal,
          });
        }

        if (response && !response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (response) {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let assistantMessage = '';
          updateMessages([...messages, { role: 'assistant', content: '' }]);

          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            const parsedLines = lines
              .map((line) => line.replace(/^data: /, '').trim())
              .filter((line) => line !== '' && line !== '[DONE]')
              .map((line) => JSON.parse(line));

            for (const parsedLine of parsedLines) {
              if (apiConfig.provider === 'openai') {
                const { choices } = parsedLine;
                const { delta } = choices[0];
                const { content } = delta;
                if (content) {
                  assistantMessage += content;
                  updateMessages(prevMessages => {
                    const newMessages = [...prevMessages];
                    newMessages[newMessages.length - 1].content = assistantMessage;
                    return newMessages;
                  });
                }
              } else {
                if (parsedLine.done) {
                  break;
                }
                const { response } = parsedLine;
                if (response) {
                  assistantMessage += response;
                  updateMessages(prevMessages => {
                    const newMessages = [...prevMessages];
                    newMessages[newMessages.length - 1].content = assistantMessage;
                    return newMessages;
                  });
                }
              }
            }
          }
        }
      }

      // Menghapus pesan asisten kosong jika tidak ada respons
      updateMessages(prevMessages => {
        if (prevMessages[prevMessages.length - 1].content === '' && prevMessages[prevMessages.length - 1].role === 'assistant') {
          return prevMessages.slice(0, -1);
        }
        return prevMessages;
      });

    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          console.error('Error:', error.message);
          let errorMessage = error.message;
          if (apiConfig.provider === 'ollama' && errorMessage.includes('connect: connection refused')) {
            errorMessage = 'Failed to connect to Ollama. Make sure Ollama is running on your local machine.';
          }
          updateMessages([
            ...messages,
            { role: 'assistant', content: `Error: ${errorMessage}` },
          ]);
        }
      } else {
        console.error('An unknown error occurred:', error);
        updateMessages([
          ...messages,
          { role: 'assistant', content: 'An unknown error occurred. Please try again.' },
        ]);
      }
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      setIsLoading(false);
      updateMessages([
        ...messages,
        { role: 'assistant', content: 'Generasi teks dihentikan.' },
      ]);
    }
  }, [messages, updateMessages]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        setPreviewImage(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleWebPreview = (code: string, language: string) => {
    let previewContent = '';
    switch (language) {
      case 'html':
        previewContent = code;
        break;
      case 'css':
        previewContent = `
          <html>
            <head>
              <style>${code}</style>
            </head>
            <body>
              <div class="preview-element">Preview Element</div>
            </body>
          </html>
        `;
        break;
      case 'javascript':
        previewContent = `
          <html>
            <head>
              <script>
                function runCode() {
                  try {
                    ${code}
                  } catch (error) {
                    console.error(error);
                  }
                }
              </script>
            </head>
            <body>
              <div id="output"></div>
              <script>
                runCode();
              </script>
            </body>
          </html>
        `;
        break;
      default:
        previewContent = '<p>Preview tidak tersedia untuk jenis kode ini.</p>';
    }

    const blob = new Blob([previewContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
  };

  const renderMessage = useCallback((message: Message, index: number) => {
    const codeRegex = /```(\w+)?\s*(?:\[(.+?)\])?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(message.content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <p key={`text-${lastIndex}`} className="whitespace-pre-wrap mb-2">
            {message.content.slice(lastIndex, match.index)}
          </p>
        );
      }

      let language = match[1]?.toLowerCase() || 'plaintext';
      const fileName = match[2] || '';
      const code = match[3].trim();

      // Pemetaan bahasa
      const languageMap: { [key: string]: string } = {
        'js': 'javascript',
        'jsx': 'jsx',
        'ts': 'typescript',
        'tsx': 'tsx',
        'py': 'python',
        'cs': 'csharp',
        'c++': 'cpp',
        'kt': 'kotlin',
        'rb': 'ruby',
        'sh': 'bash',
        'yml': 'yaml',
        'md': 'markdown',
      };

      language = languageMap[language] || language;

      parts.push(
        <div key={`code-${match.index}`} className="mb-4 overflow-hidden rounded-lg border border-[var(--color-border)]">
          <div className="flex justify-between items-center px-4 py-2 bg-[var(--color-secondary)]">
            <span className="text-sm font-medium">
              {fileName || language}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(code, index)}
                className="p-1 hover:bg-[var(--color-hover)] rounded"
              >
                {copiedIndex === index ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-[var(--color-text)]" />
                )}
              </button>
              {(language === 'html' || language === 'css' || language === 'javascript') && (
                <button
                  onClick={() => handleWebPreview(code, language)}
                  className="p-1 hover:bg-[var(--color-hover)] rounded"
                >
                  <Eye className="w-4 h-4 text-[var(--color-text)]" />
                </button>
              )}
            </div>
          </div>
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1rem',
              backgroundColor: 'var(--color-code-background)',
            }}
            className="syntax-highlighter"
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < message.content.length) {
      parts.push(
        <p key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {message.content.slice(lastIndex)}
        </p>
      );
    }

    return parts.length > 0 ? parts : <p className="whitespace-pre-wrap">{message.content}</p>;
  }, [copiedIndex]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop()?.toLowerCase();
        
        let language = 'plaintext';
        if (fileExtension === 'js') language = 'javascript';
        else if (fileExtension === 'py') language = 'python';
        else if (fileExtension === 'html') language = 'html';
        else if (fileExtension === 'css') language = 'css';

        const codeBlock = `\`\`\`${language}\n${content}\n\`\`\``;
        updateMessages([...messages, { role: 'user', content: `\n\nFile: ${fileName}\n${codeBlock}` }]);
      };
      reader.readAsText(file);
    }
  };

  const exportChat = () => {
    const doc = new jsPDF();
    let y = 10;
    messages.forEach((message) => {
      doc.text(`${message.role}: ${message.content}`, 10, y);
      y += 10;
    });
    doc.save("chat-export.pdf");
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');

        updateMessages([...messages, { role: 'user', content: transcript }]);
      };

      recognition.onerror = (event: any) => {
        console.error(event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      console.error('Speech recognition not supported');
    }
  };

  return useMemo(() => (
    <div className="h-screen flex bg-[var(--color-background)] text-[var(--color-text)]">
      <Sidebar
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onStartNewChat={startNewChat}
        onSwitchChat={switchChat}
        onDeleteChat={deleteChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportChat={exportChat}
      />

      <div className="flex-1 flex flex-col bolt-chat-area">
        <div className="p-2 bg-[var(--color-secondary)] text-right text-sm">
          <span className="mr-2">Provider: {apiConfig.provider}</span>
          <span>Model: {apiConfig.model}</span>
        </div>

        <ChatArea
          messages={messages}
          renderMessage={renderMessage}
          messagesEndRef={messagesEndRef}
        />

        <InputArea
          onSubmit={handleSubmit}
          onFileUpload={handleFileUpload}
          onImageUpload={handleImageUpload}
          onStartListening={startListening}
          isLoading={isLoading}
          isGenerating={isGenerating}
          isListening={isListening}
          onStopGeneration={handleStopGeneration}
        />
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiConfig={apiConfig}
        setApiConfig={setApiConfig}
        customTheme={customTheme}
        setCustomTheme={setCustomTheme}
        applyCustomTheme={applyCustomTheme}
        resetTheme={resetTheme}
      />

      {previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-3/4 h-3/4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <h2 className="text-xl font-bold text-gray-800 mr-4">Web Preview</h2>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Buka di Tab Baru
                </a>
              </div>
              <button
                onClick={() => setPreviewUrl(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <iframe
              src={previewUrl}
              className="flex-grow w-full border-none"
              title="Web Preview"
            />
          </div>
        </div>
      )}
    </div>
  ), [messages, isLoading, isGenerating, isListening, previewImage, previewUrl, isSettingsOpen, chatHistory, currentChatId, customTheme, apiConfig, startNewChat, switchChat, deleteChat, applyCustomTheme, resetTheme]);
}


export default App;