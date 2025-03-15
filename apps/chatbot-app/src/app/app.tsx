import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Placeholder pages for our chatbot application
const ChatPage = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4">Chat Interface</h1>
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* Placeholder for chat interface */}
      <p>Welcome to the Chatbot Application</p>
    </div>
  </div>
);

const DocumentUploadPage = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4">Document Upload</h1>
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* Placeholder for document upload interface */}
      <input
        type="file"
        className="block w-full text-sm text-slate-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-blue-50 file:text-blue-700
        hover:file:bg-blue-100"
      />
    </div>
  </div>
);

const SettingsPage = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4">Settings</h1>
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* Placeholder for settings interface */}
      <p>Configure your chatbot settings</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <nav className="bg-primary text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold">Chatbot Application</h1>
              <div className="space-x-4">
                <a href="/" className="hover:underline">Chat</a>
                <a href="/upload" className="hover:underline">Upload</a>
                <a href="/settings" className="hover:underline">Settings</a>
              </div>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/upload" element={<DocumentUploadPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
