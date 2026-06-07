import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  ThermometerSun, 
  CloudRain, 
  ShieldAlert, 
  Menu, 
  X, 
  Info,
  PenTool,
  Lightbulb,
  Sparkles,
  MessageCircle,
  HelpCircle,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  XCircle
} from 'lucide-react';

// --- Raw Text Content for LLM Context ---
const topicContexts = {
  environment: `Atmospheric Environment and Public Health. 1) LITHOSPHERE: The solid shell of the planet Earth (crust and upper mantle). Types: Oceanic lithosphere (50-100km thick) and Continental lithosphere (40-200km). 2) HYDROSPHERE: The liquid water component (Oceans, Seas, lakes, etc.), covers 70% of Earth. Always in motion (currents). 3) BIOSPHERE: Closed, self-regulating envelope of Earth's air, water, and land where living things exist. Cycles energy and materials (Carbon, Oxygen, Nitrogen). 4) ATMOSPHERE: Mixture of gases surrounding Earth. Layers: Troposphere (0-16km), Stratosphere (16-50km), Mesosphere (50-80km), Thermosphere (80-640km), Exosphere (700km+). Composition: Nitrogen (78.09%), Oxygen (20.95%), Argon (0.93%), CO2 (0.03%). Roles: biological activity, weather, climate, protection from UV rays.`,
  warming: `Global Warming & Climate Change. Global warming is the increase in average temperature of Earth's atmosphere and oceans. Driven mainly by greenhouse gases (CO2, methane, nitrous oxide). Traps solar radiation bouncing off Earth. Causes: 1) Greenhouse gases (water vapor, CO2, methane, ozone). Anthropogenic sources include fossil fuels, deforestation, agriculture. 2) Particulates and soot (global dimming). 3) Solar Activity. 4) Feedback loops. Climate change includes changes in climate state persisting over decades. Causes include natural factors (biogeographical like solar radiation, Earth's orbit) and human activities (transportation, industrialization). Data from ice cores shows CO2 rising from 280ppmv to projected 500-825ppmv by 2100. Developing nations account for less than 25% of emissions.`,
  greenhouse: `Consequences of Greenhouse Effect. Without greenhouse gases, Earth would be -15C, but is now 15C. However, further increases have adverse effects: 1) Effects on Global Climate: 3.5C to 4.5C warming likely. Causes rise in sea level (0.5-1.5m) due to ocean heating and melting glaciers. Increases floods, damages coasts, causes sea water intrusion. Changing patterns of rainfall. 2) Effects on Plants: CO2 fertilization might increase photosynthesis initially, but benefits are offset by lower nitrogen content in plants (less nutrition/protein), increased rate of decomposition, and increased threat of pests (like insecticide-resistant aphids surviving warmer winters). 3) Human Health: Increased infectious diseases (malaria, dengue, yellow fever) as vectors like mosquitoes expand their range. 4) Wildlife: Species forced to migrate towards poles; severe ecological damage.`,
  acidrain: `Acid Rain. Coined in 1872 by Robert Angus Smith. Caused by sulphur dioxide (SO2) and nitrogen oxides (NOx) reacting with moisture to form sulphuric acid (H2SO4) and nitric acid (HNO3). Normal rain pH is 5.0-5.5; acid rain is ~4.0. Deposition types: Wet deposition (rain, snow, fog) and Dry deposition (gases/particles on soil/water). Effects: Chronic (years of acid rain reducing water alkalinity/nutrients) and Episodic (sudden heavy acid storms). Effects on organisms/materials: acidic soil harms crops, makes lakes unfit for aquatic life, leaches toxic minerals like aluminium into water, causes respiratory illnesses, deteriorates buildings/marble (like Taj Mahal), corrodes metal bridges. Prevention: curtail fossil fuels, use low sulphur coal, desulphurisation, renewable energy.`,
  ozone: `Ozone Depletion. Ozone (O3) is blue, pungent, found naturally in the Stratosphere. It absorbs harmful solar UV rays (below 2.4x10^-7m). Depletion Mechanism: Polar vortex isolates cold air, forming polar stratospheric clouds (PSCs). PSCs provide a reactive surface changing inactive Cl into active Cl. Spring sunlight photolyses Cl2, and Cl acts as a catalyst destroying O3. Three principal depletion systems: a) Hydrogen System (OH System) destroys 10%, above 40km. b) Nitrogen System (N2O System) destroys 60%, produced by bacteria in ocean/soil. c) Chlorine System (CFCs like F11, F12) are main human-made destroyers. Consequences: Human health (skin cancer, cataracts, immune damage), terrestrial plants (reduced growth/yield), aquatic ecosystems (damage to zooplankton/larvae), and climate changes (cooling of stratosphere).`
};

// --- Helper Component to Render LaTeX in UI ---
const FormatLatex = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(\$.*?\$)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          let math = part.slice(1, -1);
          math = math.replace(/_(\d+)/g, '<sub>$1</sub>');
          math = math.replace(/\^(\d+)/g, '<sup>$1</sup>');
          math = math.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>');
          math = math.replace(/_\{([^}]+)\}/g, '<sub>$1</sub>');
          math = math.replace(/\\rightarrow/g, ' → ');
          math = math.replace(/\\circ/g, '°');
          math = math.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2');
          return <span key={index} className="font-serif italic text-blue-800" dangerouslySetInnerHTML={{ __html: math }} />;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

// --- Basic Markdown Formatter for AI output ---
const FormatMarkdown = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-blue-900">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
};

// --- Diagram Container Component ---
const DiagramBox = ({ title, type, children }) => {
  const isLecturer = type === 'lecturer';
  return (
    <div className={`my-8 border rounded-xl overflow-hidden shadow-sm ${isLecturer ? 'border-blue-200' : 'border-emerald-200'}`}>
      <div className={`px-4 py-2 flex items-center gap-2 border-b ${isLecturer ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200'}`}>
        {isLecturer ? <PenTool size={18} className="text-blue-600" /> : <Lightbulb size={18} className="text-emerald-600" />}
        <span className={`text-sm font-semibold ${isLecturer ? 'text-blue-800' : 'text-emerald-800'}`}>
          {isLecturer ? 'Lecturer\'s Diagram (Reconstructed)' : 'Added Visualization (For Understanding)'}
        </span>
      </div>
      <div className="p-6 bg-white">
        <h4 className="text-center font-bold mb-6 text-gray-700">{title}</h4>
        <div className="flex justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('environment');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // AI Study Buddy State
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [aiMode, setAiMode] = useState('idle');
  const [aiContent, setAiContent] = useState(null);
  const [quizState, setQuizState] = useState({});

  const navItems = [
    { id: 'environment', icon: <BookOpen size={20} />, label: '1. Atmospheric Environment' },
    { id: 'warming', icon: <ThermometerSun size={20} />, label: '2. Global Warming & Climate Change' },
    { id: 'greenhouse', icon: <CloudRain size={20} />, label: '3. Consequences of Greenhouse Effect' },
    { id: 'acidrain', icon: <CloudRain size={20} />, label: '4. Acid Rain' },
    { id: 'ozone', icon: <ShieldAlert size={20} />, label: '5. Ozone Depletion' },
  ];

  useEffect(() => {
    setAiMode('idle');
    setAiContent(null);
    setQuizState({});
  }, [activeTab]);

  const callGeminiAPI = async (prompt, schema = null) => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY || ""; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    if (schema) {
      payload.generationConfig = {
        responseMimeType: "application/json",
        responseSchema: schema
      };
    }

    const delays = [1000, 2000, 4000, 8000, 16000];
    let lastError;

    for (let i = 0; i < 5; i++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        return data.candidates[0].content.parts[0].text;
      } catch (e) {
        lastError = e;
        if (i < 4) await new Promise(r => setTimeout(r, delays[i]));
      }
    }
    throw lastError;
  };

  const handleSimplify = async () => {
    setAiMode('loading');
    setAiContent(null);
    
    const contextText = topicContexts[activeTab];
    const prompt = `You are an expert, friendly environmental science tutor. Summarize the following study notes clearly and concisely, as if explaining to a beginner. Use bullet points and bold text to make it easy to read. Be encouraging.\\n\\nNotes:\\n${contextText}`;

    try {
      const response = await callGeminiAPI(prompt);
      setAiContent(response);
      setAiMode('summary');
    } catch (error) {
      setAiContent("Sorry, I had trouble connecting. Please try again later!");
      setAiMode('summary');
    }
  };

  const handleGenerateQuiz = async () => {
    setAiMode('loading');
    setAiContent(null);
    setQuizState({});
    
    const contextText = topicContexts[activeTab];
    const prompt = `You are an expert examiner. Create exactly 3 multiple-choice questions based ONLY on the following study notes.\\n\\nNotes:\\n${contextText}`;
    
    const schema = {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          options: { type: "ARRAY", items: { type: "STRING" } },
          correctOptionIndex: { type: "INTEGER" },
          explanation: { type: "STRING" }
        },
        required: ["question", "options", "correctOptionIndex", "explanation"]
      }
    };

    try {
      const responseText = await callGeminiAPI(prompt, schema);
      const quizData = JSON.parse(responseText);
      setAiContent(quizData);
      setAiMode('quiz');
    } catch (error) {
      setAiContent("Failed to generate quiz. Please try again.");
      setAiMode('summary');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'environment':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Topic: Atmospheric Environment and Public Health</h1>
            <p className="text-lg text-gray-700">The total global environment consist of four major realms (ICH 206)</p>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4">1) LITHOSPHERE</h2>
              <p className="text-gray-700 leading-relaxed">The solid shell of Earth (crust and upper mantle). Types: Oceanic (50-100km) and Continental (40-200km).</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4">2) HYDROSPHERE</h2>
              <p className="text-gray-700 leading-relaxed">Liquid water component covering 70% of Earth's surface. Always in motion through currents.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4">3) BIOSPHERE</h2>
              <p className="text-gray-700 leading-relaxed">Closed, self-regulating envelope where living things exist. Cycles energy and materials (Carbon, Oxygen, Nitrogen).</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4">4) ATMOSPHERE</h2>
              <p className="text-gray-700 mb-4">Mixture of gases surrounding Earth with distinct layers and composition.</p>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Composition:</h3>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Nitrogen - 78.09%</li>
                <li>Oxygen - 20.95%</li>
                <li>Argon - 0.93%</li>
                <li>Carbon Dioxide - 0.03%</li>
              </ul>
            </div>
          </div>
        );

      case 'warming':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Global Warming & Climate Change</h1>
            <p className="text-gray-700 leading-relaxed mb-4">
              Global warming is the increase in average temperature of Earth's atmosphere and oceans, primarily caused by greenhouse gases like CO2, methane, and nitrous oxide.
            </p>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4">Causes</h2>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Greenhouse gases (fossil fuels, deforestation)</li>
                <li>Particulates and soot (global dimming)</li>
                <li>Solar Activity</li>
                <li>Feedback loops</li>
              </ul>
            </div>
          </div>
        );

      case 'greenhouse':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Consequences of Greenhouse Effect</h1>
            <p className="text-gray-700 leading-relaxed mb-4">
              Without greenhouse gases, Earth would be -15°C. However, excessive greenhouse effect causes adverse effects on climate, plants, human health, and wildlife.
            </p>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Effects</h2>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Rise in sea level (0.5-1.5m)</li>
                <li>CO2 fertilization effects on plants</li>
                <li>Increased infectious diseases</li>
                <li>Species migration towards poles</li>
              </ul>
            </div>
          </div>
        );

      case 'acidrain':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Acid Rain</h1>
            <p className="text-gray-700 leading-relaxed mb-4">
              Coined in 1872 by Robert Angus Smith. Caused by SO2 and NOx reacting with moisture. Normal rain pH: 5.0-5.5; Acid rain: ~4.0
            </p>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Effects</h2>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Acidic soil harms crops and vegetation</li>
                <li>Makes lakes unfit for aquatic life</li>
                <li>Leaches toxic minerals like aluminum</li>
                <li>Respiratory and cardiac illness</li>
                <li>Building and monument deterioration</li>
              </ul>
            </div>
          </div>
        );

      case 'ozone':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Ozone Depletion</h1>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ozone (O3) is naturally found in the Stratosphere and absorbs harmful UV rays. Depletion caused by CFCs and other gases.
            </p>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Consequences</h2>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Human health: skin cancer, cataracts, immune damage</li>
                <li>Terrestrial plants: reduced growth and yield</li>
                <li>Aquatic ecosystems: damage to zooplankton and larvae</li>
                <li>Climate: stratosphere cooling</li>
              </ul>
            </div>
          </div>
        );

      default:
        return <div>Select a topic</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans flex relative overflow-hidden">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed md:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 w-72 flex-shrink-0 z-50
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-xl font-bold text-blue-900">ICH 206 Guide</h1>
            <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={24} className="text-gray-500" />
            </button>
          </div>
          
          <nav className="space-y-2 flex-grow overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors
                  ${activeTab === item.id 
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 max-w-4xl w-full mx-auto pb-24 h-screen overflow-y-auto">
        <div className="md:hidden sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center z-30 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="mr-4 text-gray-600">
            <Menu size={24} />
          </button>
          <span className="font-bold text-gray-800">ICH 206 Study Guide</span>
        </div>

        <div className="p-6 md:p-12">
          {renderContent()}
        </div>
      </main>

      {!isAiPanelOpen && (
        <button 
          onClick={() => setIsAiPanelOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 group"
        >
          <Sparkles size={24} className="group-hover:animate-pulse" />
          <span className="font-bold hidden md:inline-block pr-2">Study Buddy</span>
        </button>
      )}

      <div className={`fixed top-0 right-0 h-screen w-full md:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-blue-100 ${isAiPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-600" />
              <h2 className="font-bold text-indigo-900">AI Study Buddy</h2>
            </div>
            <button onClick={() => setIsAiPanelOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-full p-1">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
            
            {aiMode === 'idle' && (
              <div className="text-center space-y-6 mt-10">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Sparkles size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">How can I help you study?</h3>
                  <p className="text-gray-500 text-sm">Current: <span className="font-semibold text-blue-700">{navItems.find(i => i.id === activeTab)?.label}</span></p>
                </div>
                
                <div className="flex flex-col gap-3 mt-8">
                  <button onClick={handleSimplify} className="flex items-center gap-3 p-4 bg-white border border-indigo-100 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group text-left">
                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 group-hover:scale-110 transition-transform">
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block">✨ Simplify Topic</span>
                      <span className="text-xs text-gray-500">Get a beginner-friendly summary</span>
                    </div>
                    <ChevronRight size={16} className="ml-auto text-gray-400" />
                  </button>

                  <button onClick={handleGenerateQuiz} className="flex items-center gap-3 p-4 bg-white border border-blue-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all group text-left">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
                      <HelpCircle size={20} />
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block">✨ Generate Quiz</span>
                      <span className="text-xs text-gray-500">Test yourself with questions</span>
                    </div>
                    <ChevronRight size={16} className="ml-auto text-gray-400" />
                  </button>
                </div>
              </div>
            )}

            {aiMode === 'loading' && (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <RefreshCw size={40} className="text-indigo-500 animate-spin" />
                <p className="text-indigo-800 font-medium animate-pulse">Analyzing notes...</p>
              </div>
            )}

            {aiMode === 'summary' && typeof aiContent === 'string' && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50">
                  <FormatMarkdown text={aiContent} />
                </div>
                <button onClick={() => setAiMode('idle')} className="w-full py-3 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
                  Ask Something Else
                </button>
              </div>
            )}

            {aiMode === 'quiz' && Array.isArray(aiContent) && (
              <div className="space-y-8">
                {aiContent.map((q, qIndex) => {
                  const isAnswered = quizState[qIndex] !== undefined;
                  const selectedAnswer = quizState[qIndex];
                  const isCorrect = selectedAnswer === q.correctOptionIndex;

                  return (
                    <div key={qIndex} className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                      <p className="font-semibold text-gray-800 mb-4">{qIndex + 1}. {q.question}</p>
                      
                      <div className="space-y-2">
                        {q.options.map((option, oIndex) => {
                          let btnClass = "w-full text-left p-3 rounded-lg border transition-colors text-sm ";
                          if (!isAnswered) {
                            btnClass += "border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700";
                          } else {
                            if (oIndex === q.correctOptionIndex) {
                              btnClass += "border-green-500 bg-green-50 text-green-800 font-medium";
                            } else if (oIndex === selectedAnswer) {
                              btnClass += "border-red-400 bg-red-50 text-red-800";
                            } else {
                              btnClass += "border-gray-100 bg-gray-50 text-gray-400 opacity-50";
                            }
                          }

                          return (
                            <button 
                              key={oIndex}
                              disabled={isAnswered}
                              onClick={() => setQuizState(prev => ({...prev, [qIndex]: oIndex}))}
                              className={btnClass}
                            >
                              <div className="flex justify-between items-center">
                                <span>{option}</span>
                                {isAnswered && oIndex === q.correctOptionIndex && <CheckCircle2 size={16} className="text-green-600" />}
                                {isAnswered && oIndex === selectedAnswer && oIndex !== q.correctOptionIndex && <XCircle size={16} className="text-red-500" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {isAnswered && (
                        <div className={`mt-4 p-3 rounded-lg text-sm ${isCorrect ? 'bg-green-100/50 text-green-900 border border-green-200' : 'bg-orange-50 text-orange-900 border border-orange-200'}`}>
                          <p className="font-bold mb-1">{isCorrect ? 'Great!' : 'Not quite.'}</p>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button onClick={() => setAiMode('idle')} className="w-full py-3 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100">
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
