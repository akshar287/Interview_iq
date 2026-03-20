"use client";

import React, { useRef, useState, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { Play, Loader2, Maximize2, Minimize2, CheckCircle2, Terminal as TerminalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { executeCode } from "@/lib/actions/technical.action";

interface CodeEditorProps {
  language: string;
  code: string;
  onChange: (value: string | undefined) => void;
  onLanguageChange?: (lang: string) => void;
  onRunMode?: boolean; 
  containerClassName?: string;
  readOnly?: boolean;
}

const DEFAULT_CODE: Record<string, string> = {
  javascript: "console.log('Hello World');",
  python: "print('Hello World')",
  java: "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello World\");\n  }\n}",
  cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << \"Hello World\" << endl;\n  return 0;\n}",
  c: "#include <stdio.h>\n\nint main() {\n  printf(\"Hello World\\n\");\n  return 0;\n}",
  html: "<!-- Write your HTML/React code here -->\n<h1>Hello World</h1>"
};

const PISTON_LANG_MAP: Record<string, string> = {
  javascript: "javascript",
  python: "python",
  java: "java",
  cpp: "c++",
  c: "c",
};

const PISTON_VERSION_MAP: Record<string, string> = {
  javascript: "18.15.0",
  python: "3.10.0",
  java: "15.0.2",
  cpp: "10.2.0",
  c: "10.2.0",
};

export default function CodeEditor({ 
  language, 
  code, 
  onChange, 
  onLanguageChange,
  onRunMode = true,
  containerClassName = "",
  readOnly = false
}: CodeEditorProps) {
  const monaco = useMonaco();
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("voxTheme", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#09090b", // Matches bg-[#09090b]
        },
      });
      monaco.editor.setTheme("voxTheme");
    }
  }, [monaco]);

  useEffect(() => {
    if (!code) {
      onChange(DEFAULT_CODE[language] || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error(err);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleRunCode = async () => {
    if (language === "html") {
      // HTML output is handled by iframe in UI directly
      setOutput("HTML rendered in preview window.");
      return;
    }

    setIsRunning(true);
    setOutput("Executing...");
    
    try {
      const pistonLang = PISTON_LANG_MAP[language];
      const pistonVer = PISTON_VERSION_MAP[language];

      const res = await executeCode({
        language: pistonLang,
        version: pistonVer,
        content: code
      });
      
      if (!res.success) {
        setOutput(`Failed to execute: ${res.message}`);
        return;
      }

      const data = res.data;
      
      if (data.compile && data.compile.code !== 0) {
        setOutput(`Compilation Error:\n${data.compile.stderr || data.compile.output}`);
      } else if (data.run && data.run.code !== 0) {
        setOutput(`Execution Error:\n${data.run.stderr || data.run.output}`);
      } else if (data.run && data.run.output) {
        setOutput(data.run.output);
      } else {
        setOutput("Execution finished with no output.");
      }
    } catch (error: any) {
      setOutput(`Failed to execute code: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`flex flex-col border border-white/10 rounded-xl overflow-hidden bg-[#09090b] ${isFullscreen ? "h-screen w-screen z-[9999]" : "h-full w-full"} ${containerClassName}`}
    >
      <div className="flex items-center justify-between px-3 md:px-4 py-2 bg-white/5 border-b border-white/10 shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <TerminalIcon className="text-white/40 size-3 md:size-4 shrink-0" />
          {onLanguageChange && !readOnly ? (
            <select 
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-white/80 text-[10px] md:text-xs font-mono uppercase tracking-wider focus:outline-none cursor-pointer hover:text-white transition-colors py-1 rounded"
            >
              <option value="javascript" className="bg-[#09090b]">Javascript</option>
              <option value="python" className="bg-[#09090b]">Python</option>
              <option value="java" className="bg-[#09090b]">Java</option>
              <option value="cpp" className="bg-[#09090b]">C++</option>
              <option value="c" className="bg-[#09090b]">C</option>
              <option value="html" className="bg-[#09090b]">HTML/React</option>
            </select>
          ) : (
            <span className="text-white/60 text-[10px] md:text-xs font-mono uppercase tracking-widest truncate">{language}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {onRunMode && language !== "html" && (
            <button 
              onClick={handleRunCode} 
              disabled={isRunning || readOnly}
              className="h-7 md:h-8 px-2 md:px-3 text-[9px] md:text-[10px] font-black bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 rounded-md flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={10} fill="currentColor" className="group-hover:scale-110 transition-transform" />}
              RUN
            </button>
          )}
          <button 
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Maximize Editor"}
            className="p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-90 bg-white/5 md:bg-transparent"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {/* Editor Pane */}
        <div className={`flex-1 min-h-0 border-b lg:border-b-0 lg:border-r border-white/10 ${onRunMode ? "lg:w-2/3" : "w-full"}`}>
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={onChange}
            theme="voxTheme"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "monospace",
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              readOnly,
              wordWrap: "on"
            }}
          />
        </div>

        {/* Output/Preview Pane */}
        {onRunMode && (
          <div className="flex-1 min-h-[150px] lg:h-full lg:w-1/3 flex flex-col bg-[#050505]">
            <div className="px-4 py-1.5 bg-white/5 border-b border-white/10 text-white/40 text-xs font-mono uppercase tracking-widest flex items-center gap-2 shrink-0">
              {language === "html" ? "Preview" : "Console Output"}
            </div>
            <div className="flex-1 min-h-0 p-4 overflow-auto">
              {language === "html" ? (
                <iframe
                  title="HTML Preview"
                  sandbox="allow-scripts"
                  srcDoc={code}
                  className="w-full h-full bg-white rounded flex-1 border-0"
                />
              ) : (
                <pre className="font-mono text-sm text-white/80 whitespace-pre-wrap break-all">
                  {output || <span className="text-white/20 italic">Click Run to see output...</span>}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
