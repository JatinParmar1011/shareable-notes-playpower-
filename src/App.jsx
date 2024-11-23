import React, { useState, useEffect } from 'react';
import { PlusCircle, Lock, Unlock } from 'lucide-react';
import RichTextEditor from './components/TextEditor';
import NoteList from './components/NoteList';
import Header from './components/Header';
import Footer from './components/Footer';
import { Toaster, toast } from 'react-hot-toast';
import { generateInsights } from './utils/aiUtils';
import ReactMarkdown from "react-markdown";
import axios from 'axios';
import Modal from './components/Modal'; 

const App = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [insights, setInsights] = useState(null);
  const [grammarIssues, setGrammarIssues] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSetPasswordModalOpen, setIsSetPasswordModalOpen] = useState(false);

  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
    setNotes(savedNotes);
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes]);

  useEffect(() => {
    if (selectedNote) {
      setInsights(null);
      setGrammarIssues([]);
      setIsChecked(false);
      setShowContent(false);
      setPasswordInput('');
    }
  }, [selectedNote]);

  const handleAddNote = () => {
    const baseTitle = 'Untitled';
    const newTitle = generateUniqueTitle(baseTitle);

    const newNote = {
      id: crypto.randomUUID(),
      title: newTitle,
      content: '',
      isPinned: false,
      lastModified: Date.now(),
      password: null,
    };

    setNotes((prevNotes) => [...prevNotes, newNote]);
    setSelectedNote(newNote);
    toast.success('New note created!');
  };

  const generateUniqueTitle = (baseTitle) => {
    let counter = 1;
    let newTitle = baseTitle;
    while (notes.some((note) => note.title === newTitle)) {
      newTitle = `${baseTitle} ${counter}`;
      counter++;
    }
    return newTitle;
  };

  const handleTitleChange = (event) => {
    let updatedTitle = event.target.value.trim();
    if (selectedNote) {
      const updatedNotes = notes.map((note) =>
        note.id === selectedNote.id
          ? { ...note, title: updatedTitle, lastModified: Date.now() }
          : note
      );
      setNotes(updatedNotes);
      setSelectedNote({ ...selectedNote, title: updatedTitle });
    }
  };

  const togglePin = (id) => {
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    );

    const sortedNotes = [...updatedNotes].sort((a, b) => {
      if (a.isPinned === b.isPinned) {
        return b.lastModified - a.lastModified;
      }
      return b.isPinned - a.isPinned;
    });

    setNotes(sortedNotes);
    toast.success('Note pinned/unpinned!');
  };

  const deleteNote = (id) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
    toast.success('Note deleted!');
  };

  const handleNoteContentChange = (content) => {
    if (selectedNote) {
      const updatedNotes = notes.map((note) =>
        note.id === selectedNote.id
          ? { ...note, content, lastModified: Date.now() }
          : note
      );
      setNotes(updatedNotes);
    }
  };

  const setPassword = () => {
    setIsSetPasswordModalOpen(true);
  };

  const confirmSetPassword = () => {
    if (selectedNote) {
      const updatedNotes = notes.map((note) =>
        note.id === selectedNote.id ? { ...note, password: passwordInput } : note
      );
      setNotes(updatedNotes);
      toast.success('Password set!');
      setIsSetPasswordModalOpen(false);
      setPasswordInput('');
    }
  };

  const checkPassword = () => {
    if (selectedNote.password) {
      setIsPasswordModalOpen(true);
    }
  };

  const confirmCheckPassword = () => {
    if (passwordInput === selectedNote.password) {
      setShowContent(true);
      toast.success('Password correct!');
      setIsPasswordModalOpen(false);
    } else {
      toast.error('Incorrect password!');
    }
  };

  const analyzeContent = async () => {
    if (!selectedNote || !selectedNote.content) {
      toast.error('No content to analyze.');
      return;
    }

    try {
      const aiInsights = await generateInsights(selectedNote.content);
      setInsights(aiInsights);
      toast.success('AI insights generated!');
    } catch (error) {
      toast.error('Failed to generate insights. Try again later.');
    }
  };

  const formatInsights = (insights) => {
    const themes = Array.isArray(insights.themes) ? insights.themes : insights.themes?.split(", ") || [];
    const keywords = Array.isArray(insights.keywords) ? insights.keywords : insights.keywords?.split(", ") || [];
    return { themes: themes.join(", "), keywords: keywords.join(", ") };
  };

  const checkGrammar = async () => {
    if (!selectedNote || !selectedNote.content) {
      toast.error('No content to check.');
      return;
    }

    setIsChecked(true);
    setGrammarIssues([]);

    try {
      const response = await axios.post("https://api.languagetool.org/v2/check", null, {
        params: {
          text: selectedNote.content,
          language: "en-US",
        },
      });

      setGrammarIssues(response.data.matches);
      toast.success('Grammar checked!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to check grammar.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <Toaster />

      <main className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        <div className="lg:w-1/4 w-full bg-white shadow-md p-6 overflow-y-auto">
          <div className="mb-6">
            <button
              onClick={handleAddNote}
              className="w-full py-3 bg-purple-600 text-white hover:bg-purple-700 rounded-lg text-lg font-semibold  transition-all duration-300 flex items-center justify-center"
            >
              <PlusCircle className="mr-2" size={20} /> Create New Note
            </button>
          </div>
          {notes.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>No Notes yet.</p>
            </div>
          ) : (
            <NoteList
              notes={notes}
              togglePin={togglePin}
              deleteNote={deleteNote}
              setSelectedNote={setSelectedNote}
              selectedNote={selectedNote}
            />
          )}
        </div>

        <div className="lg:w-3/4 w-full p-6 overflow-y-auto bg-[#EEEEEE]">
          {selectedNote ? (
            <>
              <div className="mb-4 flex items-center gap-4">
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={handleTitleChange}
                  placeholder="Enter your note title here..."
                  className="text-2xl font-semibold text-gray-900 w-full bg-transparent border-2 border-gray-300 rounded-md p-2 transition-all duration-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500 hover:border-gray-400 outline-none"
                />
                <button
                  onClick={setPassword}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                >
                  {selectedNote.password ? <Lock size={20} /> : <Unlock size={20} />}
                </button>
              </div>

              {selectedNote.password && !showContent ? (
                <div>
                  <button onClick={checkPassword} className="bg-green-500 text-white px-4 py-2 rounded-md">
                    Unlock
                  </button>
                </div>
              ) : (
                <>
                  <RichTextEditor
                    selectedNote={selectedNote}
                    handleNoteContentChange={handleNoteContentChange}
                  />
                  <button
                    onClick={analyzeContent}
                    className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                  >
                    Generate AI Insights
                  </button>
                  <button
                    onClick={checkGrammar}
                    className="mt-4 ml-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg ```javascript
                    hover:bg-blue-700"
                  >
                    Check Grammar
                  </button>
                </>
              )}
              {insights && (
                <div className="mt-4 p-4 bg-[#D4BEE4] bg-opacity-40 rounded-md">
                  <h2 className="font-semibold text-lg">AI Insights:</h2>
                  <ReactMarkdown>
{`**Summary:** ${insights.summary}\n\n**Key Themes:** ${formatInsights(insights).themes}\n\n**Keywords:** ${formatInsights(insights).keywords}`}
</ReactMarkdown> 
                </div>
              )}
              {isChecked && grammarIssues.length > 0 && (
                <div className="mt-4 p-4 bg-red-100 rounded-md">
                  <h2 className="font-semibold text-lg">Grammar Issues:</h2>
                  <ul className="list-disc ml-6">
                    {grammarIssues.map((issue, index) => (
                      <li key={index}>
                        <strong>Issue:</strong> {issue.message} <br />
                        <strong>Suggestion:</strong>{" "}
                        {issue.replacements.map((rep) => rep.value).join(", ")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {isChecked && grammarIssues.length === 0 && (
                <div className="mt-4 p-4 bg-green-100 rounded-md">
                  <h2 className="font-semibold text-lg">No grammar issues found.</h2>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500">
              <p>Select a note to view or edit</p>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Password Set Modal */}
      <Modal
        isOpen={isSetPasswordModalOpen}
        onClose={() => setIsSetPasswordModalOpen(false)}
        title="Set Password"
        onConfirm={confirmSetPassword}
      >
        <input
          type="password"
          placeholder="Enter new password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          className="border p-2 rounded-md w-full"
        />
      </Modal>

      {/* Password Check Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Enter Password"
        onConfirm={confirmCheckPassword}
      >
        <input
          type="password"
          placeholder="Enter password to unlock"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          className="border p-2 rounded-md w-full"
        />
      </Modal>
    </div>
  );
};

export default App;