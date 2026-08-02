import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import axios from "axios";
import useThemeStore from "../store/useThemeStore";
import { Copy, Download, Check, Play, Code2, Sparkles, FileCode } from "lucide-react";

// Connect to socket server
const socket = io("http://localhost:5001");

const CODE_TEMPLATES = {
  javascript: `// JavaScript Starter Template
function greet(name) {
  console.log("Hello, " + name + "!");
}

greet("Collaborator");`,
  python: `# Python Starter Template
def greet(name):
    print(f"Hello, {name}!")

greet("Collaborator")`,
  c: `// C Starter Template
#include <stdio.h>

int main() {
    printf("Hello, Collaborator!\\n");
    return 0;
}`,
  cpp: `// C++ Starter Template
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, Collaborator!" << endl;
    return 0;
}`,
  java: `// Java Starter Template
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Collaborator!");
    }
}`,
};

const FILE_EXTENSIONS = {
  javascript: "js",
  python: "py",
  c: "c",
  cpp: "cpp",
  java: "java",
};

const CodeEditor = () => {
  const { theme } = useThemeStore();
  const [code, setCode] = useState(CODE_TEMPLATES.javascript);
  const [language, setLanguage] = useState("javascript");
  const [editorTheme, setEditorTheme] = useState(theme === "light" ? "vs" : "vs-dark");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEditorTheme(theme === "light" ? "vs" : "vs-dark");
  }, [theme]);

  const languageOptions = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "c", label: "C" },
    { value: "cpp", label: "C++" },
    { value: "java", label: "Java" },
  ];

  const themeOptions = [
    { value: "vs-dark", label: "VS Dark" },
    { value: "vs", label: "VS Light" },
    { value: "hc-black", label: "High Contrast" },
  ];

  // Socket listeners
  useEffect(() => {
    socket.on("codeChange", (newCode) => {
      setCode(newCode);
    });

    socket.on("languageChange", (newLang) => {
      setLanguage(newLang);
    });

    return () => {
      socket.off("codeChange");
      socket.off("languageChange");
    };
  }, []);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", newCode);
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (CODE_TEMPLATES[newLang] && (code === "" || code === "// Start coding..." || Object.values(CODE_TEMPLATES).includes(code))) {
      setCode(CODE_TEMPLATES[newLang]);
      socket.emit("codeChange", CODE_TEMPLATES[newLang]);
    }
    socket.emit("languageChange", newLang);
  };

  const handleLoadTemplate = () => {
    if (CODE_TEMPLATES[language]) {
      const template = CODE_TEMPLATES[language];
      setCode(template);
      socket.emit("codeChange", template);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const ext = FILE_EXTENSIONS[language] || "txt";
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `code_session.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCompile = async () => {
    setIsLoading(true);
    setOutput("Running...");
    try {
      const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language,
        source: code,
      });
      setOutput(response.data.run.stdout || response.data.run.stderr || "No output");
    } catch (error) {
      setOutput("Error: " + (error.response?.data?.message || "Compilation failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-white' : 'bg-gray-900'}`}>
      {/* Controls Header */}
      <div className={`flex flex-wrap gap-2 justify-between items-center p-2.5 border-b ${
        theme === 'light' ? 'border-gray-200 bg-gray-50/90' : 'border-gray-800 bg-gray-900/90'
      }`}>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Selector */}
          <div className="flex items-center gap-1">
            <Code2 className="w-4 h-4 text-blue-500" />
            <select
              value={language}
              onChange={handleLanguageChange}
              className={`${
                theme === 'light' ? 'bg-white border-gray-300 text-gray-800' : 'bg-gray-800 border-gray-700 text-gray-200'
              } border rounded-lg px-2.5 py-1 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none`}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Selector */}
          <select
            value={editorTheme}
            onChange={(e) => setEditorTheme(e.target.value)}
            className={`${
              theme === 'light' ? 'bg-white border-gray-300 text-gray-800' : 'bg-gray-800 border-gray-700 text-gray-200'
            } border rounded-lg px-2.5 py-1 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none`}
            title="Editor Theme"
          >
            {themeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Font Size Selector */}
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className={`${
              theme === 'light' ? 'bg-white border-gray-300 text-gray-800' : 'bg-gray-800 border-gray-700 text-gray-200'
            } border rounded-lg px-2 py-1 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none`}
            title="Font Size"
          >
            {[12, 13, 14, 15, 16, 17, 18, 20].map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>

          {/* Load Template Button */}
          <button
            onClick={handleLoadTemplate}
            className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border transition-all ${
              theme === 'light' 
                ? 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300' 
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
            }`}
            title="Insert boilerplate starter code"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Template</span>
          </button>
        </div>

        {/* Action Buttons: Copy, Download, Run */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyCode}
            className={`p-1.5 rounded-lg border transition-all ${
              theme === 'light' 
                ? 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300' 
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
            }`}
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownloadCode}
            className={`p-1.5 rounded-lg border transition-all ${
              theme === 'light' 
                ? 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300' 
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
            }`}
            title="Download File"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleCompile}
            disabled={isLoading}
            className={`text-white px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all ${
              isLoading ? 'bg-blue-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          theme={editorTheme}
          language={language}
          value={code}
          onChange={handleCodeChange}
          options={{
            fontSize,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
            lineNumbers: "on",
            padding: { top: 10 },
          }}
        />
      </div>

      {/* Output Console Panel */}
      <div className={`border-t p-3 ${
        theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-gray-800 bg-gray-900/90'
      }`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-xs font-semibold uppercase tracking-wider ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            Console Output:
          </span>
          <button 
            onClick={() => setOutput("")} 
            className={`text-[10px] hover:underline ${
              theme === 'light' ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            Clear
          </button>
        </div>
        <pre className={`p-2.5 rounded-lg text-xs overflow-auto max-h-32 font-mono border ${
          theme === 'light' 
            ? 'bg-white text-gray-800 border-gray-200' 
            : 'bg-gray-950 text-emerald-400 border-gray-800'
        }`}>
          {output || "Output will appear here after execution..."}
        </pre>
      </div>
    </div>
  );
};

export default CodeEditor;

