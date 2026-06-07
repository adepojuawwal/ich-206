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
  const [aiMode, setAiMode] = useState('idle'); // 'idle', 'loading', 'summary', 'quiz'
  const [aiContent, setAiContent] = useState(null);
  const [quizState, setQuizState] = useState({}); // Tracks user's answers for the quiz

  const navItems = [
    { id: 'environment', icon: <BookOpen size={20} />, label: '1. Atmospheric Environment' },
    { id: 'warming', icon: <ThermometerSun size={20} />, label: '2. Global Warming & Climate Change' },
    { id: 'greenhouse', icon: <CloudRain size={20} />, label: '3. Consequences of Greenhouse Effect' },
    { id: 'acidrain', icon: <CloudRain size={20} />, label: '4. Acid Rain' },
    { id: 'ozone', icon: <ShieldAlert size={20} />, label: '5. Ozone Depletion' },
  ];

  // Reset AI state when changing tabs
  useEffect(() => {
    setAiMode('idle');
    setAiContent(null);
    setQuizState({});
  }, [activeTab]);

  const callGeminiAPI = async (prompt, schema = null) => {
    const apiKey = ""; 
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
    const prompt = `You are an expert, friendly environmental science tutor. Summarize the following study notes clearly and concisely, as if explaining to a beginner. Use bullet points and bold text to make it easy to read. Be encouraging.\n\nNotes:\n${contextText}`;

    try {
      const response = await callGeminiAPI(prompt);
      setAiContent(response);
      setAiMode('summary');
    } catch (error) {
      setAiContent("Sorry, I had trouble connecting to my brain. Please try again later!");
      setAiMode('summary');
    }
  };

  const handleGenerateQuiz = async () => {
    setAiMode('loading');
    setAiContent(null);
    setQuizState({});
    
    const contextText = topicContexts[activeTab];
    const prompt = `You are an expert examiner. Create exactly 20 multiple-choice questions based ONLY on the following study notes to test the student's knowledge. Make the questions challenging but fair.\n\nNotes:\n${contextText}`;
    
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
      setAiContent("Failed to generate quiz. The internet might be down or I'm too tired!");
      setAiMode('summary'); // Fallback to displaying error as text
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'environment':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Topic: Atmospheric Environment and Public Health</h1>
            <p className="text-lg text-gray-700">The total global environment consist of four major realms; which include (ICH206):</p>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4">1) LITHOSPHERE</h2>
              <p className="text-gray-700 leading-relaxed">
                The lithosphere is the solid shell of the planet Earth. That means the crust, plus the part of the upper mantle that behaves elastically on long time scales. Under the lithosphere there is the Asthenosphere, the weaker, hotter and deeper part of the upper mantle. The lithosphere provides a conductive lid atop the convecting mantle: It reduces transport through the Earth. There are 2 types of lithosphere i.e. 
                <br/><br/>
                1. <strong>Oceanic lithosphere</strong> (it associate with Oceanic Crust and exist in ocean basin of 50-100 km thick).<br/>
                2. <strong>Continental lithosphere</strong> which associate with continental Crust. Its thickness is between 40-200km.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4">2) HYDROSPHERE</h2>
              <p className="text-gray-700 leading-relaxed">
                The hydrosphere is the liquid water component of the Earth. It includes the Oceans, Seas, lakes, pond, Rivers and Streams. It covers about 70% of the surface of the Earth and is home for many plants and Animals. The hydrosphere, like the atmosphere, is always in motion. These type of motions are in the form of current that move the warm waters in the tropic toward the poles, and colder water from the polar regions toward the tropics. The current exist on the surface of the ocean and at great depths in the ocean up to about 4km.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4">3) BIOSPHERE</h2>
              <p className="text-gray-700 leading-relaxed">
                Biosphere irregularly shaped envelope of the Earth's air, water and land encompassing the heights and depths at which living things exist. The biosphere is a closed and self-regulating system, sustained by grand-scale cycles of energy and of materials in particular, Carbon, Oxygen, Nitrogen, certain minerals and water. The fundamental recycling process are photosynthesis, respiration and the fixing of Nitrogen by bacteria.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4">4) ATMOSPHERE</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Atmosphere is the mixture of gases surrounding a celestial body with sufficient gravity to maintain it. The studies of earth's atmosphere is well studied, and the science is known as meteorology.
              </p>
              
              <h3 className="text-xl font-bold text-gray-800 mb-3">Layers of Earth's Atmosphere</h3>
              <p className="text-gray-700 mb-4">The Earth's atmosphere is composed of distinct layers - which are:</p>
              
              <ul className="space-y-4 text-gray-700">
                <li><strong>a) Troposphere:</strong> It extends upward from the earth surface to height of 8.1km (5 miles) at the pole to about 11.3 km (7 miles) in mid latitudes and to about 16.1km (10 miles) at the equator. The temperature of troposphere decreases with altitude at an average of about <FormatLatex text="$3.6^\circ F$" /> per 1000 ft reaching about <FormatLatex text="$-70^\circ F$" /> at its apex. Above the apex (Tropopause) is an atmospheric ozone layer lower part of Stratosphere.</li>
                <li><strong>b) STRATOSPHERE:</strong> Temperature changes little with altitude in the stratosphere which extend upward about 50 km (30 miles).</li>
                <li><strong>c) Mesosphere:</strong> Above stratosphere is mesosphere which extend to about 80km (50 miles) above the earth. The temperature sharply decreases from around <FormatLatex text="$20^\circ F (-10^\circ C)$" /> at the base of mesosphere to <FormatLatex text="$-166^\circ F (-110^\circ C)$" /> before it begins to rise at the top of the mesosphere.</li>
                <li><strong>d) THERMOSPHERE:</strong> It extends upwards from the mesosphere to about 640km (400 miles). Its temperature increases rapidly with altitude because of the absorption of short wave radiation by ionization process.</li>
                <li><strong>e) EXOSPHERE:</strong> The final layer is the exosphere, which gradually get thinner as it reaches into the vacuum of space at around 700km (435 miles) above the Earth surface. The atmosphere is so attenuated at this altitude that average air molecules travel without colliding is equal to radius of the earth. The density of the atmosphere at an altitude of about 9700km (6,000 miles) is comparable to that of interplanetary space.</li>
              </ul>

              <DiagramBox title="Layers of the Atmosphere (Altitude Guide)" type="visualization">
                <div className="w-full max-w-sm flex flex-col items-center">
                  <div className="w-full bg-purple-900 text-white text-center py-4 rounded-t-lg mb-1 border-b-2 border-dashed border-white relative">
                    <span className="font-bold">Exosphere</span>
                    <span className="absolute right-4 text-xs opacity-75">~700km+</span>
                  </div>
                  <div className="w-full bg-indigo-800 text-white text-center py-4 mb-1 border-b-2 border-dashed border-white relative">
                    <span className="font-bold">Thermosphere</span>
                    <span className="absolute right-4 text-xs opacity-75">~80 - 640km</span>
                  </div>
                  <div className="w-full bg-blue-600 text-white text-center py-4 mb-1 border-b-2 border-dashed border-white relative">
                    <span className="font-bold">Mesosphere</span>
                    <span className="absolute right-4 text-xs opacity-75">~50 - 80km</span>
                  </div>
                  <div className="w-full bg-cyan-500 text-white text-center py-4 mb-1 border-b-2 border-dashed border-white relative">
                    <span className="font-bold">Stratosphere</span>
                    <span className="absolute right-4 text-xs opacity-75">~16 - 50km</span>
                  </div>
                  <div className="w-full bg-sky-300 text-gray-900 text-center py-4 rounded-b-lg border-b-4 border-green-600 relative">
                    <span className="font-bold">Troposphere</span>
                    <span className="absolute right-4 text-xs opacity-75">0 - 16km</span>
                  </div>
                  <div className="mt-2 w-full h-4 bg-green-600 rounded-b-full"></div>
                  <span className="text-xs text-gray-500 mt-1">Earth's Surface</span>
                </div>
              </DiagramBox>

              <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">Composition and Characteristics of the Earth's Atmosphere</h3>
              <p className="text-gray-700 mb-4">
                The first 64-80 km above the Earth contain 99% of the total mass of the Earth's atmosphere and is generally of a uniform composition, except for a high concentration of ozone, known as ozone layer. Calculated according to their relative volumes, the gaseous constituent of the atmosphere are:
              </p>
              
              <ul className="list-disc ml-6 text-gray-700 mb-6 font-semibold">
                <li>Nitrogen - (78.09%)</li>
                <li>Oxygen - (20.95%)</li>
                <li>Argon - (0.93%)</li>
                <li>Carbon dioxide - (0.03%)</li>
              </ul>

              <DiagramBox title="Atmospheric Gas Composition" type="visualization">
                <div className="flex items-center gap-8">
                  <div className="relative w-48 h-48 rounded-full" style={{
                    background: 'conic-gradient(#3b82f6 0% 78.09%, #10b981 78.09% 99.04%, #f59e0b 99.04% 99.97%, #ef4444 99.97% 100%)'
                  }}></div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500 rounded"></div><span>Nitrogen (78.09%)</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-500 rounded"></div><span>Oxygen (20.95%)</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-amber-500 rounded"></div><span>Argon (0.93%)</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded"></div><span><FormatLatex text="$CO_2$" /> & Trace (0.03%)</span></div>
                  </div>
                </div>
              </DiagramBox>

              <p className="text-gray-700 leading-relaxed mb-6">
                Minute traces of Neon, Helium, methane, krypton, Hydrogen, Xenon, and Ozone. The lower atmosphere contains varying amount of water vapor, which determines its Humidity. Activities like condensation & sublimation within atmosphere lead to cloud or fog, and the resulting water droplet or ice crystal may precipitate to the ground as: rain, snow, hail, dew, sleet or frost. The atmosphere also contain dust of meteoric as well as terrestrial origin and micro organisms, pollen grain, salt particles and various gaseous and solid impurities resulting from human activities (anthropogenic). The concentration of these trace compounds are increased or other forms of pollutant introduced and bio accumulate over time, then it becomes hazardous to living organisms.
              </p>

              <h3 className="text-xl font-bold text-gray-800 mb-3">Roles of Earth's Atmosphere:</h3>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>A region for most biological activity and exert considerable influence on the ocean and lakes</li>
                <li>Weather (day-to-day fluctuation of environmental variables (wind, hurricanes))</li>
                <li>Climates - Is the normal or long-term average state of the atmosphere</li>
                <li>Protection from harmful ultraviolent-rays</li>
              </ul>
            </div>
          </div>
        );

      case 'warming':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">ICH 206 (ENVIRONMENTAL POLLUTION 1)</h1>
            <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-600 mb-6 inline-block">
              <ul className="space-y-1 font-medium">
                <li>1.1. Global warming</li>
                <li>1.1.1. Causes of global warming</li>
                <li>1.1.2. Effect of global warming</li>
                <li>1.2. Effect of global warming on selected part of the world.</li>
                <li>1.3. Controlling measures of the global warming and climate change</li>
                <li>1.4. Measures to reduce global warming.</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4">Global Warming</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Global warming is the increase in the average temperature of Earth's atmosphere and oceans. Many of the observed changes since the 1950s are unprecedented in the instrumental temperature record, which extends back to the mid-19th century and in paleoclimate proxy records covering thousands of years. It is extremely likely that human influence has been the dominant cause of the observed warming since the mid-20th Century. The largest human influence has been the emission of greenhouse gases such as; <FormatLatex text="$CO_2$" />, methane, nitrous oxide.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Global warming occurs when <FormatLatex text="$CO_2$" /> and other air pollutants and green house gases collect in the atmosphere and absorb sunlight and solar radiation that have bounced off the earth's surface. Normally, this radiation would escape into space - but these pollutants, which can last for years to centuries in the atmosphere, trap the heat and cause the planet to get hotter.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Scientist agree that earth's rising temperature are fueling longer and hotter heat waves, more frequent drought, heavier rainfall, and more powerful hurricanes. The earth's ocean temperature are getting warmer - means that tropical storms can pick up more energy. Therefore, global warming is capable of turning a category 3 storms to a more dangerous category 4 storms.
            </p>

            <DiagramBox title="Mechanism of Greenhouse Effect" type="lecturer">
               <div className="flex flex-col md:flex-row items-center gap-8 p-4 bg-blue-50 rounded-xl w-full max-w-2xl border border-blue-200 shadow-inner">
                  <div className="relative w-full h-64 border-b-4 border-green-600">
                    {/* Sun */}
                    <div className="absolute top-2 left-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900">Sun</div>
                    
                    {/* Atmosphere line */}
                    <div className="absolute top-24 left-0 w-full border-t-2 border-dashed border-blue-400">
                       <span className="absolute right-2 -top-5 text-xs text-blue-600 font-bold">Atmosphere</span>
                    </div>
                    
                    {/* Solar Radiation incoming */}
                    <svg className="absolute inset-0 w-full h-full" style={{zIndex: 0}}>
                       <defs>
                         <marker id="arrow-yellow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                           <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                         </marker>
                         <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                           <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                         </marker>
                       </defs>
                       {/* Incoming straight */}
                       <path d="M 60 40 L 150 250" stroke="#f59e0b" strokeWidth="2" fill="none" markerEnd="url(#arrow-yellow)" />
                       {/* Bouncing off atmosphere */}
                       <path d="M 70 40 L 150 90 L 220 20" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4" fill="none" markerEnd="url(#arrow-yellow)" />
                       {/* Infrared re-emitted */}
                       <path d="M 200 250 Q 250 150 220 100 Q 180 50 250 20" stroke="#ef4444" strokeWidth="3" fill="none" markerEnd="url(#arrow-red)" />
                       {/* Trapped heat */}
                       <path d="M 280 250 Q 320 150 300 120 Q 280 150 320 250" stroke="#ef4444" strokeWidth="3" fill="none" markerEnd="url(#arrow-red)" />
                    </svg>

                    <div className="absolute bottom-2 left-32 text-xs font-bold bg-white/80 p-1 rounded">Earth's Surface</div>
                    <div className="absolute top-32 left-10 text-[10px] w-32 bg-white/80 p-1 rounded">Some solar radiation is reflected by the earth and atmosphere</div>
                    <div className="absolute top-[160px] right-2 text-[10px] w-48 bg-white/80 p-1 rounded">Infrared radiation is emitted from the earth's surface. Some passes through, but most is absorbed and re-emitted in all directions by greenhouse gas molecules.</div>
                  </div>
               </div>
            </DiagramBox>

            <p className="text-gray-700 leading-relaxed mb-4">
              Many of the climate system is unequivocal, and Scientist are more than 90% certain that it is primarily caused by increase concentrations of green house gases produced by human activities such as fossil fuel burning, industrialization and deforestation. Warming and related changes will vary from region to region around the globe. The effect of an increase in global temperature include a rise in sea level and a change in the amount and pattern of precipitation as well as probable expansion of subtropical deserts. It is expected to be strongest in the Arctic and would be associated with the continuing retreat of glaciers, permafrost and sea ice.
            </p>

            <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mt-8 mb-4">CAUSES OF GLOBAL WARMING</h2>
            <p className="text-gray-700 mb-4">Global warming is a result of increase of temperature of earth's atmosphere due to several factors that can be natural or man-made. These factors can be discussed under the following headings:</p>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-2">1) Greenhouse gases</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  The green house effect is the process by which absorption and emission of infrared radiation by gases in the atmosphere warm a planet's lower atmosphere and surface. Naturally occurring amount of greenhouse gas have a mean warming effect about <FormatLatex text="$33^\circ C$" />. The major greenhouse gases are water vapor (causes 36-70% of the greenhouse effect); <FormatLatex text="$CO_2$" /> (9-26%), methane (<FormatLatex text="$CH_4$" />) (4-9%) and ozone (3-7%).
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Human activity since the Industrial Revolution has increased the amount of greenhouse gases in the atmosphere, leading to increased radiative forcing from <FormatLatex text="$CO_2$" />, methane, tropospheric ozone, CFCs and nitrous oxide. Fossil fuel burning has produced about three-quarters of the increase in <FormatLatex text="$CO_2$" /> from human activity over the past 20 years. The rest of this increase is caused mostly by changes in land use, particularly deforestation.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-2">2) Particulates and soot</h3>
                <p className="text-gray-700 leading-relaxed">
                  Global dimming, a gradual reduction in the amount of global direct irradiance at the Earth's surface, was observed from 1961-1990. The main causes of this dimming is particulates produced by volcanoes and human made pollutants, which exerts a cooling effect by increasing the reflectivity of incoming sunlight.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-2">3) Solar Activity</h3>
                <p className="text-gray-700 leading-relaxed">
                  Solar variations causes change in solar energy reaching the Earth have been the cause of past climate changes and global warming. The effect of changes in solar forcing in recent decades is uncertain, but small, with some studies showing a slight cooling effect, while others studies show a slight warming effect.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-2">4) Feedback</h3>
                <p className="text-gray-700 leading-relaxed">
                  Feedback is a process in which changing one quantity changes a second quantity, and the change in the second quantity in turn changes the first. Positive feedback amplifies the change... (rest implied).
                </p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-blue-900 mt-8 mb-4">Greenhouse Gases and Anthropogenic Sources</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="py-3 px-4 text-left font-bold text-gray-700 border-b">Greenhouse gases</th>
                    <th className="py-3 px-4 text-left font-bold text-gray-700 border-b">Anthropogenic Sources</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-800">Carbon dioxide (<FormatLatex text="$CO_2$" />)</td>
                    <td className="py-3 px-4 text-gray-700">Fossil-fuel burning, wood fuel, Deforestation and land use change. Cement manufacturing.</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">Methane (<FormatLatex text="$CH_4$" />)</td>
                    <td className="py-3 px-4 text-gray-700">Coal Production and transmission, Enteric fermentation from ruminants (e.g. cattle, sheep, goats), wetland rice cultivation, land fill waste site, Burning and decay of Biomass.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-800">Chlorofluorocarbons (CFCs)</td>
                    <td className="py-3 px-4 text-gray-700">used for solvents, refrigerants, aerosol spray propellants, used for solvents.</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">Perfluoromethane (<FormatLatex text="$CF_4$" />)</td>
                    <td className="py-3 px-4 text-gray-700">Productions of aluminum</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-800">Nitrous oxide (<FormatLatex text="$N_2O$" />)</td>
                    <td className="py-3 px-4 text-gray-700">Tropical deforestation and wildfires, Fertilisers, Fossil-fuel burning, Land conversion for agriculture.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mt-12 mb-4">CLIMATE CHANGE</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Climate change can be defined as a change in the state of the climate that can be identified by changes in the mean and/or the variability of its properties, and that persist for an extended period typically decades or longer. Climate change is said to exist when the level of climatic deviation from the normal is very significant over a long period of time and such deviation have clear and permanent impact on the ecosystem.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              The global temperature have change from glacial through cold, moderate and warm during different geological times. The global climate system is made up of atmosphere, the oceans, Ice sheet (Cryosphere), living organisms (biosphere), the soil, sediments and rocks (Geosphere) that part to a greater or less extent, the movement of heat around the Earth's surface. A dramatic change in the climate systems either due to natural forces or unsustainable human activities results in climate change.
            </p>

            <h3 className="text-xl font-bold text-gray-800 mb-3">CAUSES OF CLIMATE CHANGE</h3>
            <p className="text-gray-700 mb-4">Climate change is caused by two basic factors namely: Natural processes (Biogeographical) and Human activities (anthropogenic).</p>
            
            <ul className="space-y-4 text-gray-700 mb-8">
              <li><strong>(1) Natural factor (Biogeographical):</strong> The natural processes are the astronomical and extraterrestrial factors. These factor are the eccentricity of earth's orbit, obliquity of ecliptic and orbital precession. Other factors include: Solar radiation quantity (Sunspot) and quality (ultra violet radiation change). A higher solar quality and quantity and period of perihelion (when the earth is nearest to the sun), result in warming up of the Earth surface which lead to global warming. The incident radiation on the earth during aphelion (when the earth is farthest away from the sun) is always low and if this combines with low solar quality and quantity, global cooling is experienced.</li>
              <li><strong>(2) Human activities:</strong> include, transportation, industrialization, urbanization, burning of fossil, agriculture, water pollution and deforestation.</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-800 mb-3">Rate of Climate Change</h3>
            <p className="text-gray-700 mb-4">
              Data from the ice-cores data shows a gradual increase prior to Industrial period which was 280 ppmv. This increased to 325 ppmv by 1950 and it is estimated to double (500 ppmv) or triple (825 ppmv) by the year 2100.
            </p>

            <DiagramBox title="Atmospheric CO₂ Trends" type="lecturer">
              <div className="flex flex-col gap-8 w-full">
                {/* Graph 1 */}
                <div className="relative w-full h-48 border-l-2 border-b-2 border-gray-800 bg-white px-4">
                  {/* Y Axis Labels */}
                  <div className="absolute -left-10 top-0 text-xs">1200</div>
                  <div className="absolute -left-10 top-8 text-xs">1000</div>
                  <div className="absolute -left-8 top-16 text-xs">800</div>
                  <div className="absolute -left-8 top-24 text-xs">600</div>
                  <div className="absolute -left-8 top-32 text-xs">400</div>
                  <div className="absolute -left-8 top-40 text-xs">200</div>
                  
                  {/* X Axis Labels */}
                  <div className="absolute bottom-[-20px] left-[15%] text-xs">1200</div>
                  <div className="absolute bottom-[-20px] left-[35%] text-xs">1600</div>
                  <div className="absolute bottom-[-20px] left-[55%] text-xs">1800</div>
                  <div className="absolute bottom-[-20px] left-[75%] text-xs">2000</div>
                  <div className="absolute bottom-[-20px] left-[95%] text-xs">2100</div>

                  {/* Line */}
                  <svg className="absolute inset-0 w-full h-full overflow-visible">
                    <path d="M 0 140 Q 100 135 200 140 Q 300 145 350 130" stroke="black" strokeWidth="2" fill="none" />
                    <path d="M 350 130 Q 400 90 450 0" stroke="black" strokeWidth="2" fill="none" />
                    {/* Dotted projections */}
                    <path d="M 350 130 L 450 -30" stroke="black" strokeWidth="1.5" strokeDasharray="4" fill="none" />
                    <path d="M 350 130 L 450 30" stroke="black" strokeWidth="1.5" strokeDasharray="4" fill="none" />
                  </svg>
                  
                  <div className="absolute top-20 left-[20%] text-xs italic bg-white px-1">data from ice cores</div>
                  <div className="absolute top-24 left-[50%] text-xs italic bg-white px-1">Direct measurements</div>
                  <div className="absolute top-0 right-0 text-xs italic bg-white px-1 font-bold text-red-600">Range of future project</div>
                </div>
              </div>
            </DiagramBox>

            <p className="text-gray-700 leading-relaxed mb-4">
              The pre-industrial value of <FormatLatex text="$CH_4$" /> was 770 ppbv. This increased... and is expected to rise to 3700 ppbv by 2100.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4">
              The natural source (swamp decay) contributed 38% to atmospheric <FormatLatex text="$CH_4$" />, followed by fossil fuel (17%), animal (17%), rice (10%) and landfill (8%). The nitrous oxide (<FormatLatex text="$N_2O$" />) contributed 7.9% of the GHGs and its current concentration is 319 ppbv. The Fluorine gases (HFCs, PFCs, CFCs and <FormatLatex text="$SF_6$" />) combined contributed 1.1% as at 2004.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              The developed nations emit more of the GHGs. While they accounted for over 75% of the total emissions, the developing nations are responsible for less than 25%. Industries, water pollution and agricultural practices to a large extent and vehicle fumes to a lesser extent are the major sources of greenhouse gas emission in the developed countries. Nigeria like most developing countries is not an industrialized nation, so automobiles are therefore the major sources of air pollution in the urban area. This is because most vehicles imported to the country are either fairly used or old ones which emit heavy hydrocarbons into the atmosphere (Cars, PMTs, Okada, generators with greater % of their gas been flared).
            </p>

            <h3 className="text-xl font-bold text-gray-800 mb-3">Effect of Climate Changes</h3>
            <p className="text-gray-700 mb-4">
              Climate change has started impacting and will continue to affect global temperature, water resources, ecosystems, agriculture and health among others. Continued GHGs emission at or above the current rates would cause further warming and induce many changes in the global climate system during the 21st century that would very likely be larger than those observed during the 20th century.
            </p>
            <ul className="list-disc ml-6 text-gray-700 space-y-2">
              <li>(1) Climate change and forest: Sub-Arctic boreal forest are likely to be particularly badly affected, with tree lines gradually retreating north as...</li>
              <li>(2) Impact on deforestation.</li>
              <li>(3) Impact on fresh water in term of flooding and drought.</li>
              <li>(4) Climate change and oceans.</li>
            </ul>

          </div>
        );

      case 'greenhouse':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Consequences of Green House Effect</h1>
            
            <p className="text-gray-700 leading-relaxed mb-6 font-medium italic bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm">
              Pathshala Note: The rate of increase in chlorofluorocarbons is the fastest - 6% per year. They contribute 17% of the total greenhouse effect.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              Before the greenhouse gases started trapping the solar energy, the average temperature of the earth was <FormatLatex text="$-15^\circ C$" />. The greenhouse gases raised the earth's mean temperature to its present value of <FormatLatex text="$15^\circ C$" />. Thus, the most trivial consequence of the greenhouse effect is that without it our planet would have been uninhabitable. However, any further increase in the atmospheric levels of greenhouse gases must be stopped. Otherwise the increase in greenhouse effect would have adverse environmental implications.
            </p>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4">1. Effects on Global Climate</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If the present emission trends of greenhouse gases continue, a global warming of <FormatLatex text="$3.5^\circ C$" /> to <FormatLatex text="$4.5^\circ C$" /> is likely to occur. This may seem to be a small temperature change. However, records from the geological past indicate that average global temperatures have varied over a range of no more than <FormatLatex text="$2^\circ C$" /> since the end of last glaciations. In fact, the period 1550-1850 is termed as Little Ice Age because this period saw extensive glacial advances in almost all alpine regions of the world. Global warming would have the following effects on global climate:
              </p>

              <h4 className="text-lg font-bold text-gray-800 mt-6 mb-2">(a) Rise in Sea level</h4>
              <p className="text-gray-700 leading-relaxed mb-4">
                The most serious outcome of global warming would be a rise in sea level. It has been estimated that the sea level may rise 0.5 to 1.5 m in the next 50 to 100 years. The reason is heating of ocean water and melting of glaciers on mountains. The ice cap in East Antarctica is not expected to melt in the foreseeable future, but the West Antarctica ice sheet, which is partially in contact with ocean water, may break up and melt, causing sea level to rise even more than 1.5m.
              </p>
              
              <p className="text-gray-700 font-semibold mb-2">Higher sea level would:</p>
              <ul className="list-roman ml-8 text-gray-700 space-y-1 mb-4">
                <li>i) Increase the frequency and severity of floods</li>
                <li>ii) Damage coastal areas</li>
                <li>iii) Cause loss of soil replenishment</li>
                <li>iv) Cause sea water intrusion into river and other aquatic systems near the oceans</li>
              </ul>

              <p className="text-gray-700 leading-relaxed mb-4">
                One third of the world population lives in low lying coastal areas. A large part of the population of some countries is at risk if sea level rises substantially. For example, half the population of Bangladesh lives at elevations less than 5m. If present trends continue, Bangladesh will lose up to 18% of its habitable land by 2050. Likewise, a combination of sea level rise and loss of soil replenishment on the Nile delta is expected to destroy as much as 19% of Egypt's arable land by the middle of this century. Of the 1,196 islands comprising Maldives, almost all are at 3m height from sea level and many people live at the height of less than 2m. If the West Antarctica ice sheet begins to melt, the Pacific Ocean would rise to such dangerous levels that all the densely populated coastal cities from Shanghai to San Francisco would be threatened. If the Arctic ice cap begins to melt, then Greenland, Iceland, Norway, Sweden, Finland, Siberia and Alaska would be adversely affected.
              </p>

              <h4 className="text-lg font-bold text-gray-800 mt-6 mb-2">(b) Evaporation of water from aquatic systems</h4>
              <p className="text-gray-700 leading-relaxed mb-4">
                Global warming will cause more water to evaporate from the aquatic systems and create water vapour. The extra water vapour is a greenhouse gas that results in heating up of the atmosphere.
              </p>

              <h4 className="text-lg font-bold text-gray-800 mt-6 mb-2">(c) Changing patterns of rainfall</h4>
              <p className="text-gray-700 leading-relaxed">
                There will be large shifts in agriculturally productive areas due to changes in patterns of rainfall.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4">2. Effects on Plants</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The increasing amounts of carbon dioxide in the atmosphere will affect plant growth in several ways. These include:
              </p>

              <h4 className="text-lg font-bold text-gray-800 mt-4 mb-2">(a) Carbon dioxide fertilization</h4>
              <p className="text-gray-700 leading-relaxed mb-4">
                At first glance, increase in the concentration of atmospheric carbon dioxide appears to benefit agricultural processes. A carbon dioxide rich environment is expected to enhance plant growth by increasing the rate of photosynthesis. During photosynthesis, plants require carbon dioxide molecules and solar energy. The carbon dioxide diffuses into the plant through the stomata in the outer layer of leaf cells. The gas ultimately reaches the chloroplasts organelles in which photosynthesis takes place. Increased rate of photosynthesis due to increased concentration of carbon dioxide in the atmosphere is called 'carbon dioxide fertilization'.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Studies on wheat, moong bean and mustard indicate that plant biomass may increase by 25 to 30% by carbon dioxide fertilization. Similar studies on citrus trees and cotton plants also show faster growth rate. Positive response to increased carbon dioxide levels in isolated laboratory experiments do not necessarily translate into increased growth for the plants in natural environment. Competition for scarce resources limits the plant's response to higher levels of carbon dioxide. The requirements for fertilizers and biocides put the underdeveloped and developing nations at a disadvantage. For many countries, even water is a limited and expensive resource. Even if nutrients, light and water are present in abundance, it does not mean that the rate of photosynthesis would increase with increasing carbon dioxide concentration. Most plants record an increase in photosynthesis only initially. Later, this rate tends to fall. This may be due to one or both of the following reasons:
              </p>
              <ul className="list-roman ml-8 text-gray-700 space-y-2 mb-4">
                <li>i) Increased photosynthesis results in excess accumulation of starch in chloroplasts, thereby hindering the functioning of organelles.</li>
                <li>ii) In the presence of greater amount of carbon dioxide, a plant's ability to produce carbohydrates exceeds its ability to move the starch produced to actively growing parts of the plants, thus slowing down photosynthesis.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-6">
                Of course, such mechanisms do not operate in all plants. Where these are not applicable, enhanced carbon dioxide levels do increase the pace of photosynthesis. Such is the case with most herbs and weeds, the higher yields of which are in no way beneficial to humanity.
              </p>

              <h4 className="text-lg font-bold text-gray-800 mt-4 mb-2">(b) Lower nitrogen content</h4>
              <p className="text-gray-700 leading-relaxed mb-6">
                Dead plant material, such as fallen leaves and twigs are rich in nitrogen. These act as natural fertilizers, providing nitrogen based nutrients to the soil and thereby increasing soil productivity. However, plants grown in higher concentrations of carbon dioxide have less nitrogen and more carbon content. The litter of such plants, therefore, fails to increase soil fertility and nutrient cycling. Moreover, less nitrogen in plants means less protein content. In order to obtain enough nitrogen, insect pests feeding on carbon dioxide fertilized plants would eat more leaf. This negates any benefit of crop yield boom in a carbon dioxide rich environment, if at all such a boom occurs.
              </p>

              <h4 className="text-lg font-bold text-gray-800 mt-4 mb-2">(c) Increased rate of decomposition</h4>
              <p className="text-gray-700 leading-relaxed mb-6">
                As a result of increased global temperature due to greenhouse effect, the rate of decomposition of dead plant matter and soil organic matter will increase. The decomposition will yield more carbon dioxide, adding to the greenhouse phenomenon.
              </p>

              <h4 className="text-lg font-bold text-gray-800 mt-4 mb-2">(d) Increased threat of pests</h4>
              <p className="text-gray-700 leading-relaxed mb-6">
                As a result of global warming, farmers in temperate countries would be struggling with increased numbers of insecticide-resistant pests. For example, peach potato aphid, Myzus persicae, a major agricultural pest, feeding on the sap of potatoes and sugar beet, has become more active in recent years. It is resistant to virtually all the insecticides. Earlier, the biggest challenge facing the aphids was to survive the winters. Aphids cannot move quickly when the temperature is low and so if they fall to the ground they die of starvation before they get back to their host plant. Now, however global warming has removed the brake that winter had so far provided.
              </p>

              <h4 className="text-lg font-bold text-gray-800 mt-4 mb-2">(e) Evaporation of water from soil</h4>
              <p className="text-gray-700 leading-relaxed">
                Due to increase in temperature, the moisture content of soil would decrease and so would its fertility towards many crops.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4">3. Effect on Human Health</h2>
              <p className="text-gray-700 leading-relaxed">
                The global increase in the average temperature of the atmosphere is expected to increase the cases of infectious diseases, which includes malaria, schistosomiasis, sleeping sickness, dengue and yellow fever. The greenhouse effect will thus enhance the problem for the developing countries where these diseases are already more frequent. Global warming will increase the range of animal species like mosquitoes, flies and snails - the vectors that transmit infectious diseases. The Aedes aegypti mosquito, which spreads dengue and yellow fever, has extended its range in regions like Costa Rica, Colombia, Kenya and India due to greenhouse effect.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4">4. Effects on Wildlife</h2>
              <p className="text-gray-700 leading-relaxed">
                Greenhouse effect will seriously affect wildlife. With every rise of <FormatLatex text="$1^\circ C$" />, plant and tree species will have to move about 90 km towards the poles to survive. Many will simply not be able to spread fast enough. The strain will be greatest in the higher latitudes because they will heat up fastest; winter temperatures in latitudes between <FormatLatex text="$60^\circ$" /> and <FormatLatex text="$90^\circ$" /> are expected to warm up double the global average. The change in patterns of rainfall will cause severe ecological damage and rise in sea level will affect the coastal habitats. As species of trees and plants disappear, the animals that depend on them will disappear as well. As the average global temperature continues to increase there will be no place left for re-establishing habitats.
              </p>
            </div>
          </div>
        );

      case 'acidrain':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">3. Acid Rain</h1>
            <p className="text-gray-700 leading-relaxed mb-4">
              Robert Angus Smith first coined the term acid rain in 1872 even though the phenomenon was known since 1853. Rainwater is naturally slightly acidic due to dissolved carbon dioxide. Acid rain is rain or any other form of precipitation such as snow, sleet, fog, dew etc which is unusually acidic i.e. containing a higher concentration of hydrogen ions than normal rain. Acid rain looks like normal rain but its highly acidic nature makes it dangerous for the environment and humans.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              The burning of fossil fuels (coal, gas and oil) is responsible for the production of sulphur dioxide and nitrogen oxides which increase the acidity of rain or precipitation. Though these oxides are emitted into the atmosphere from natural sources such as volcanoes, oceans, biological decay and forest fires, their amounts have increased rapidly due to human activities such as combustion of fuels in power plants, factories and automobiles. Acid rain and acid precipitation depend upon the chemical nature of air pollutants and moisture in the atmosphere. The effects of acid rain on trees and freshwater bodies were first observed in Scandinavian countries during the 1970s and 1980s. This became a global problem when it was recognized that the source of the emissions may be far away from the place where the precipitation takes place.
            </p>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8 mb-6">
              <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4">3.1 Causes of acid rain</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Chemical reactions in the atmosphere are responsible for acid rain. In this process, sulphur dioxide and nitrogen dioxide react with moisture to produce sulphuric and nitric acid. The oxides can travel long distances and become a part of rain, sleet, snow, fog, etc. many miles away as they are water soluble and can be easily carried by wind.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Normal, mildly acidic rain is neutralized by alkaline chemicals in air, soil, bedrock, lakes and streams. Acid rain, however, may be too acidic to be neutralized in this way. Over a period of time, these neutralizing materials can be washed away by acid rain.
              </p>

              <DiagramBox title="Causes of Acid Rain" type="lecturer">
                 <div className="flex flex-col items-center p-4 bg-gray-50 border rounded-lg w-full max-w-2xl">
                    <div className="relative w-full h-80">
                       {/* Factory */}
                       <div className="absolute bottom-0 left-0 w-24 h-24 bg-gray-800 rounded-tr flex flex-col items-center justify-end pb-2">
                          <div className="w-4 h-12 bg-gray-700 absolute -top-12 left-4"></div>
                          <div className="w-4 h-16 bg-gray-700 absolute -top-16 left-12"></div>
                          <span className="text-white text-xs font-bold">Factory</span>
                       </div>
                       
                       {/* Emissions */}
                       <svg className="absolute inset-0 w-full h-full" style={{zIndex: 1}}>
                         <defs>
                           <marker id="arrow-gray" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                             <path d="M 0 0 L 10 5 L 0 10 z" fill="#4b5563" />
                           </marker>
                         </defs>
                         <path d="M 50 200 Q 150 150 200 80" stroke="#4b5563" strokeWidth="2" strokeDasharray="4" fill="none" markerEnd="url(#arrow-gray)" />
                       </svg>
                       <div className="absolute top-28 left-24 text-sm font-bold text-gray-700 rotate-[-30deg]">SO₂ & NOₓ</div>
                       
                       {/* Clouds */}
                       <div className="absolute top-4 left-40 w-48 h-20 bg-gray-300 rounded-full opacity-80 blur-sm"></div>
                       <div className="absolute top-8 left-32 w-64 h-24 bg-gray-200 rounded-full shadow-lg flex items-center justify-center flex-col z-10">
                          <span className="text-xs font-bold text-blue-900"><FormatLatex text="$NO_x + H_2O$" /> = Nitric Acid (<FormatLatex text="$HNO_3$" />)</span>
                          <span className="text-xs font-bold text-blue-900"><FormatLatex text="$SO_2 + H_2O$" /> = Sulphuric Acid (<FormatLatex text="$H_2SO_4$" />)</span>
                       </div>
                       
                       {/* Rain / Snow / Particles */}
                       <svg className="absolute inset-0 w-full h-full" style={{zIndex: 0}}>
                         <defs>
                           <marker id="arrow-blue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                             <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                           </marker>
                         </defs>
                         <path d="M 220 100 L 200 250" stroke="#3b82f6" strokeWidth="15" fill="none" opacity="0.3" markerEnd="url(#arrow-blue)" />
                         <path d="M 300 100 L 280 250" stroke="#3b82f6" strokeWidth="15" fill="none" opacity="0.3" markerEnd="url(#arrow-blue)" />
                         <path d="M 380 100 L 380 250" stroke="#3b82f6" strokeWidth="15" fill="none" opacity="0.3" markerEnd="url(#arrow-blue)" />
                       </svg>

                       <div className="absolute bottom-12 left-[180px] text-xs font-bold text-blue-900 rotate-90">Acid Particles</div>
                       <div className="absolute bottom-12 left-[260px] text-xs font-bold text-blue-900 rotate-90">Acid Snow</div>
                       <div className="absolute bottom-12 left-[380px] text-xs font-bold text-blue-900 rotate-90">Acid Rain</div>
                       
                       {/* Ground */}
                       <div className="absolute bottom-0 left-24 right-0 h-10 bg-green-800 rounded-tl-full border-t-4 border-green-600"></div>
                    </div>
                 </div>
              </DiagramBox>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8 mb-6">
              <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4">3.2 Types of acid rain or deposition</h2>
              <p className="text-gray-700 leading-relaxed mb-4">Acid rain deposition can be categorized into two parts:</p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-6">
                <li><strong>a) Wet deposition</strong> - In wet areas, acid falls with rain, sleet, hail, snow and fog.</li>
                <li><strong>b) Dry deposition</strong> - This refers to acidic gases and particles which get deposited on soil, vegetation and water on earth's surface.</li>
              </ul>

              <DiagramBox title="Wet and Dry Deposition flowchart" type="lecturer">
                 <div className="flex flex-col items-center w-full max-w-3xl font-sans text-xs sm:text-sm">
                   <div className="grid grid-cols-3 gap-4 w-full text-center">
                      
                      {/* Sources Column */}
                      <div className="flex flex-col items-center justify-end space-y-8 h-full">
                         <div className="font-bold text-lg">SOURCES</div>
                         <div className="flex items-end gap-2 text-gray-600 font-bold">
                           <div className="flex flex-col items-center">
                             <span>VOC, <FormatLatex text="$SO_2$" />, <FormatLatex text="$NO_x$" />, Hg</span>
                             <div className="w-16 h-12 bg-gray-800 rounded mt-2 flex items-end justify-around pb-1"><div className="w-2 h-6 bg-gray-600"></div><div className="w-2 h-8 bg-gray-600"></div></div>
                           </div>
                           <div className="flex flex-col items-center">
                             <span>VOC, <FormatLatex text="$NO_x$" /></span>
                             <div className="text-2xl">🌲🌲</div>
                           </div>
                         </div>
                      </div>
                      
                      {/* Atmosphere Column */}
                      <div className="col-span-2 flex flex-col items-center space-y-6 bg-blue-50 p-4 rounded border border-blue-200">
                         <div className="flex w-full justify-between gap-4">
                            <div className="bg-gray-800 text-white p-3 rounded w-1/2">
                               Gaseous pollutants in atmosphere
                            </div>
                            <div className="flex items-center text-gray-600">↔</div>
                            <div className="bg-gray-800 text-white p-3 rounded w-1/2">
                               Particulate pollutants in atmosphere
                            </div>
                         </div>
                         
                         <div className="flex justify-center w-full relative">
                            <div className="bg-gray-800 text-white p-3 rounded w-2/3 z-10 text-center">
                               Pollutants in cloud water and precipitates
                            </div>
                            {/* Arrows pointing down */}
                            <svg className="absolute inset-0 w-full h-full -z-0">
                               <defs>
                                 <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                   <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
                                 </marker>
                               </defs>
                               <path d="M 120 -10 L 200 10" stroke="black" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
                               <path d="M 280 -10 L 200 10" stroke="black" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
                            </svg>
                         </div>
                         
                         <div className="flex justify-between w-full mt-4 border-t-4 border-green-600 pt-4 relative">
                            <div className="flex flex-col items-center text-gray-600 font-bold">
                               <span>↓</span>
                               <span>Dry Deposition</span>
                            </div>
                            <div className="flex flex-col items-center text-blue-600 font-bold">
                               <span>↓</span>
                               <span>Wet Deposition</span>
                            </div>
                            <div className="flex flex-col items-center text-gray-600 font-bold">
                               <span>↓</span>
                               <span>Dry Deposition</span>
                            </div>
                         </div>
                      </div>
                   </div>
                 </div>
              </DiagramBox>

              <p className="text-gray-700 leading-relaxed mt-4">
                The pH scale is used for the measurement of rain acidity. As well-known, the pH scale is from 0 to 14, in which 1 to 6 is acidic region while, 8 to 14 is basic region and pH 7 is neutral. Normal rain has a pH of 5.0 to 5.5 while typical acid rain has a pH as low as 4.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8 mb-6">
              <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4">3.3 Chemical reaction involved in formation of acid rain</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nitric oxide reacts with oxygen to form nitrogen dioxide and nitrogen dioxide dissolves in water to form nitric acid which is washed down as acid rain. However, this is the smaller component of acid rain.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-center text-lg mb-6 border">
                <p><FormatLatex text="$2NO(g) + O_2(g) \rightarrow 2NO_2$" /></p>
                <p className="mt-2"><FormatLatex text="$2NO_2(g) + H_2O(l) \rightarrow HNO_2 + HNO_3$" /></p>
              </div>

              <p className="text-gray-700 leading-relaxed mb-4">
                The major part of acid rain is sulphuric acid. This is formed by the reaction of sulphur dioxide with oxygen to form sulphur trioxide, which further dissolves in water to produce sulphuric acid.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg font-mono text-center text-lg mb-6 border">
                <p><FormatLatex text="$SO_2(g) + \frac{1}{2}O_2(g) \rightarrow SO_3(g)$" /></p>
                <p className="mt-2"><FormatLatex text="$H_2O(l) + SO_3(g) \rightarrow H_2SO_4(aq)$" /></p>
              </div>

              <p className="text-gray-700 leading-relaxed mb-4">
                Air pollution plays a huge role in acid rain as air is the medium in which pollutants released combine with rain water or atmospheric moisture and are washed down to the surface of the earth.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8 mb-6">
              <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4">3.4 Effects of acid rain</h2>
              
              <h3 className="text-xl font-bold text-gray-800 mb-3">3.4.1 Types of effects of acid rain:</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                There are two kinds of effects of acid rain in streams and lakes - chronic and episodic.
              </p>

              <DiagramBox title="Effect of Acid Rain" type="lecturer">
                 <div className="flex flex-col items-center">
                    <div className="bg-gray-800 text-white px-8 py-3 rounded shadow-md font-bold text-lg mb-4">Effect of Acid Rain</div>
                    <div className="flex gap-16">
                       <div className="flex flex-col items-center relative">
                          <div className="h-4 w-0.5 bg-gray-400 absolute -top-4"></div>
                          <div className="bg-gray-700 text-white px-6 py-2 rounded shadow font-semibold">Chronic</div>
                       </div>
                       <div className="flex flex-col items-center relative">
                          <div className="h-4 w-0.5 bg-gray-400 absolute -top-4"></div>
                          <div className="bg-gray-700 text-white px-6 py-2 rounded shadow font-semibold">Episodic</div>
                       </div>
                    </div>
                    {/* Connecting line */}
                    <div className="w-32 h-0.5 bg-gray-400 absolute mt-[56px]"></div>
                 </div>
              </DiagramBox>

              <p className="text-gray-700 leading-relaxed mb-6">
                Chronic effect is the effect of years of acid rain. Water alkalinity is reduced by long periods of acid rain and resulting in reduction of nutrients such as calcium. In an aquatic ecosystem, the plants and animals may develop weakness due to imbalance in nutrients. On the other hand, episodic effect is the immediate effect of acid rain. Acidity of water in water bodies may be increased suddenly by this effect. Heavy rainstorm is an example of episodic effect. Acid rain episodes may cause sudden changes in water chemistry by increasing levels of toxic substances such as aluminium.
              </p>

              <h3 className="text-xl font-bold text-gray-800 mb-3">3.4.2 Effect on living organisms, materials and the environment</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Acid rain increases the acidity of soil, rivers, lakes and streams which can lead to the following consequences:
              </p>
              
              <ul className="list-disc ml-6 text-gray-700 space-y-3 mb-6">
                <li>Soil becomes acidic, affecting the growth of trees, plants and crops.</li>
                <li>Water bodies which become too acidic are unfit to support healthy aquatic ecosystems since some acid intolerant species may perish or move away, thus changing species distribution.</li>
                <li>Acid rain leaches normally insoluble minerals from soil and rocks and adds them to water bodies, increasing hardness and toxicity of water due to added calcium, magnesium, aluminium etc. Aluminium nitrate or sulphate formed by the reaction of aluminium minerals with acid rain are soluble and thus ready for uptake by plants. Such water becomes unfit for irrigation and consumption by humans, domestic animals and wildlife.</li>
                <li>Acid deposition as particles of nitrate and sulphate can be carried deep into the lungs with respiration, causing respiratory and cardiac illness and aggravating conditions such as asthma and bronchitis.</li>
                <li>Acid rain and acid deposition causes buildings and monuments to deteriorate. Many buildings and statues of historical importance are built with stone such as marble, containing calcium carbonate. Sulphuric acid in acid rain converts calcium carbonate into calcium sulphate, which can cause discoloration and pitting of the stone. The yellowing of the Taj Mahal, earlier famous for its pure white marble structure, is an example of this phenomenon.</li>
                <li>Corrosion of metal structures like bridges is accelerated by high acidity of rain.</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8 mb-6">
              <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4">3.5 Prevention of acid rain</h2>
              <p className="text-gray-700 leading-relaxed">
                In view of the far-reaching effects of acid rain, it is important to take steps to mitigate this phenomenon. Some preventive steps can be - curtailing the use of fossil fuels by simple steps like more walking and cycling instead of driving, switching to low sulphur coal, desulphurisation of coal before burning, removing sulphur oxides from waste gases coming out of chimney stacks, road traffic restriction, bringing more renewable energy sources such as solar, wind and geothermal into use, use of battery operated and fuel efficient vehicles etc.
              </p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-200 mt-8 mb-6">
              <h2 className="text-xl font-bold text-blue-900 mb-2">4. Summary</h2>
              <p className="text-gray-800 leading-relaxed text-sm">
                We have discussed about greenhouse gases which result in the altering of global temperature and are hence responsible for global warming. Greenhouse effect is the excessive warming of the atmosphere, due to absorption of long wavelength radiation followed by re-radiation by gases like carbon dioxide, water vapour, methane and nitrous oxide. Due to high anthropogenic concentration of greenhouse gases, the atmosphere is overheating and inducing a global warming. This overheating is causing the glaciers to melt, rise in sea level and deterioration of plant and animal life.
                <br/><br/>
                Acid rain is another such phenomenon, which is caused by the pollutant gases sulphur and nitrogen oxides. These gases produce acids with atmospheric water vapour, which precipitate on earth as acid rain and acid deposition. The main sources are the emission of oxides of sulphur and nitrogen from industries and automobiles. We have also had a look at the mitigation measures like use of renewable energy sources, low fossil fuel burning, etc. that can reduce both the greenhouse effect and acid rain.
              </p>
            </div>
          </div>
        );

      case 'ozone':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Ozone Depletion</h1>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              Ozone gas is perceptibly blue in colour and has a characteristic pungent smell. It occurs throughout the atmosphere, but only in small quantities. In industrial societies ozone is now being generated at ground level by the action of sunlight on gaseous pollutants, but the Earth's natural ozone can be found in the <strong>STRATOSPHERE</strong>.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4">
              Ordinary oxygen absorbs UV with wavelength below about <FormatLatex text="$2.4 \times 10^{-7}m$" />. This provides the energy needed to split up or photodissociate the molecules into a pair of highly reactive oxygen atoms. Once released, an <FormatLatex text="$O$" /> atom can combine with an intact oxygen molecules, forming ozone. This process not only produces ozone, it also filters out most of the incoming solar UV with wavelength less than <FormatLatex text="$2.0 \times 10^{-7}m$" /> to <FormatLatex text="$2.4 \times 10^{-7}m$" /> region as well. Ozone is known to constantly being created and destroyed in the Stratosphere. There are a number of pollutant trace gases like NO, <FormatLatex text="$NO_2$" />, Cl, ClO which can easily react with <FormatLatex text="$O_3$" /> to produce <FormatLatex text="$O_2$" />. This is commonly known as "Ozone depletion".
            </p>

            <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mt-8 mb-4">Mechanism involved in ozone depletion</h2>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
               <h3 className="text-lg font-bold text-gray-800 mb-2">1. Polar Vortex Formation</h3>
               <p className="text-gray-700 mb-2">→ Formation of winter vortex leads to isolation of cold, dark air mass over polar for long periods.</p>
               
               <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">2. Very Low Temperature</h3>
               <p className="text-gray-700 mb-2">Vortex leads to very low temperature in the stratosphere which in turn form polar stratospheric clouds (PSCs).</p>

               <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">3. De-humidification & Pre-conditioning</h3>
               <p className="text-gray-700 mb-2">These processes lead to low water vapor concentrations and removal of active nitrogen oxide by absorption of <FormatLatex text="$HNO_3$" /> into the PSCs. This no longer neutralises the Cl atoms.</p>
               <p className="text-gray-700 mb-2">→ PSC provides a reactive surface for changing inactive Cl into an active state ready to react once sunlight appears in the spring.</p>
               <div className="bg-gray-50 p-3 rounded my-2 font-mono text-center">
                  <FormatLatex text="$HCl + ClONO_2 \rightarrow Cl_2 + HNO_3$" />
               </div>

               <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">4. Spring Sunlight & Catalysis</h3>
               <p className="text-gray-700 mb-2">The arrival of UV radiation photolyses the <FormatLatex text="$Cl_2$" /> and leads to the form of active Cl. The ozone destruction:</p>
               <div className="bg-gray-50 p-3 rounded my-2 font-mono text-center">
                  <p><FormatLatex text="$Cl_2 + hv \rightarrow Cl + Cl$" /></p>
                  <p><FormatLatex text="$Cl + O_3 \rightarrow ClO + O_2$" /></p>
               </div>
            </div>

            <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mt-8 mb-4">OZONE DEPLETION PROCESS</h2>
            <p className="text-gray-700 mb-4">Generally, there are three principal ways of <FormatLatex text="$O_3$" /> depletion:</p>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-2">(a) Hydrogen System (OH System)</h3>
                <p className="text-gray-700 mb-2">It destroys about 10% of <FormatLatex text="$O_3$" />. The reaction is seen above 40 km over the earth's crust.</p>
                <div className="bg-gray-50 p-4 rounded font-mono text-center">
                  <p><FormatLatex text="$H_2O + O(^1D) \rightarrow 2OH$" /></p>
                  <p><FormatLatex text="$OH + O_3 \rightarrow HO_2 + O_2$" /></p>
                  <p><FormatLatex text="$HO_2 + O \rightarrow OH + O_2$" /></p>
                  <p className="mt-2 pt-2 border-t font-bold border-gray-300">Net: <FormatLatex text="$O + O_3 \rightarrow 2O_2$" /></p>
                </div>
                <p className="text-gray-700 mt-2 text-sm italic">OH group can also form by oxidation of CH₄.</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-2">(b) Nitrogen System (<FormatLatex text="$N_2O$" /> System)</h3>
                <p className="text-gray-700 mb-2">60% of ozone destruction occurs through <FormatLatex text="$N_2O$" /> system. It produced by bacterial action of microorganism in ocean and soil (denitrification) diffused upward from troposphere to stratosphere where it reacts with O in presence of light to produce NO which then destroy <FormatLatex text="$O_3$" />.</p>
                <div className="bg-gray-50 p-4 rounded font-mono text-center">
                  <p><FormatLatex text="$N_2O + O(^1D) \rightarrow 2NO$" /></p>
                  <p><FormatLatex text="$N_2O + hv \rightarrow N_2 + O$" /></p>
                  <p><FormatLatex text="$NO + O_3 \rightarrow NO_2 + O_2$" /></p>
                  <p><FormatLatex text="$NO_2 + O \rightarrow NO + O_2$" /></p>
                  <p className="mt-2 pt-2 border-t font-bold border-gray-300">Net: <FormatLatex text="$O_3 + O \rightarrow 2O_2$" /></p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-2">(c) CHLORINE SYSTEM (Cl System)</h3>
                <p className="text-gray-700 mb-2">Neutral chlorine contributes only very little to <FormatLatex text="$O_3$" /> destruct. But CFCs, F11, F12 are the main <FormatLatex text="$O_3$" /> destroyers. They are inert in the troposphere but get dissociated into Stratosphere.</p>
                <div className="bg-gray-50 p-4 rounded font-mono text-center">
                  <p><FormatLatex text="$CFCl_3, CF_2Cl_2 \xrightarrow{hv (190-210nm)} Cl$" /></p>
                  <p><FormatLatex text="$Cl + O_3 \rightarrow ClO + O_2$" /></p>
                  <p><FormatLatex text="$ClO + O \rightarrow Cl + O_2$" /></p>
                  <p className="mt-2 pt-2 border-t font-bold border-gray-300">Net: <FormatLatex text="$O + O_3 \rightarrow 2O_2$" /></p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-blue-900 border-b pb-2 mt-8 mb-4">Consequences of OZONE DEPLETION</h2>
            <p className="text-gray-700 mb-4">Ozone depletion in the Stratosphere leads to an increase of UV-B on ground with its harmful effects on health, ecosystem, aquatic system, materials. Generally:</p>
            
            <ul className="list-disc ml-6 text-gray-700 space-y-4 mb-8">
              <li><strong>(1) Human Health:</strong> skin cancer due to melanin absorption of UV, damage to body immune system, damage to eyes especially in the development of cataracts.</li>
              <li><strong>(2) Terrestrial plants:</strong> typically, sensitive plants show reduced growth and smaller leaves, unable to photosynthesis as efficiently as other plants reduce seed and fruit production.</li>
              <li><strong>(3) Aquatic ecosystem:</strong> life in the oceans is also vulnerable to UV-radiation. Moreover, certainly enhanced UV-B has been shown to damage a range of small aquatic organisms, zooplanktons, larval crabs, shrimp and juvenile fish.</li>
              <li><strong>(4) Climate:</strong> As ozone cycles through its round of creation and destruction, there is overall absorption of solar radiation, which is ultimately dumped as heat into the stratosphere. This warms the stratosphere and produces the inversion at the tropopause. Any depletion of stratospheric ozone is predicted to cool this region and hence change the temperature structure of the atmosphere to some extent.</li>
            </ul>

          </div>
        );

      default:
        return <div>Select a topic</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans flex relative overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto pb-24 h-screen overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center z-30 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="mr-4 text-gray-600">
            <Menu size={24} />
          </button>
          <span className="font-bold text-gray-800">ICH 206 Study Guide</span>
        </div>

        {/* Dynamic Content */}
        <div className="p-6 md:p-12 animate-in fade-in duration-500">
          {renderContent()}
        </div>
      </main>

      {/* AI Study Buddy Floating Button */}
      {!isAiPanelOpen && (
        <button 
          onClick={() => setIsAiPanelOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 group"
        >
          <Sparkles size={24} className="group-hover:animate-pulse" />
          <span className="font-bold hidden md:inline-block pr-2">Study Buddy</span>
        </button>
      )}

      {/* AI Study Buddy Sliding Panel */}
      <div className={`fixed top-0 right-0 h-screen w-full md:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-blue-100 ${isAiPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* AI Header */}
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-600" />
              <h2 className="font-bold text-indigo-900">AI Study Buddy</h2>
            </div>
            <button onClick={() => setIsAiPanelOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-full p-1">
              <X size={20} />
            </button>
          </div>

          {/* AI Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
            
            {/* Initial Menu State */}
            {aiMode === 'idle' && (
              <div className="text-center space-y-6 mt-10">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Sparkles size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">How can I help you study?</h3>
                  <p className="text-gray-500 text-sm">I will analyze your current section: <br/><span className="font-semibold text-blue-700">"{navItems.find(i => i.id === activeTab)?.label}"</span></p>
                </div>
                
                <div className="flex flex-col gap-3 mt-8">
                  <button onClick={handleSimplify} className="flex items-center gap-3 p-4 bg-white border border-indigo-100 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group text-left">
                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 group-hover:scale-110 transition-transform">
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block">✨ Simplify Topic</span>
                      <span className="text-xs text-gray-500">Get a beginner-friendly summary.</span>
                    </div>
                    <ChevronRight size={16} className="ml-auto text-gray-400" />
                  </button>

                  <button onClick={handleGenerateQuiz} className="flex items-center gap-3 p-4 bg-white border border-blue-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all group text-left">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
                      <HelpCircle size={20} />
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block">✨ Generate Quiz</span>
                      <span className="text-xs text-gray-500">Test yourself with 3 practice questions.</span>
                    </div>
                    <ChevronRight size={16} className="ml-auto text-gray-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {aiMode === 'loading' && (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <RefreshCw size={40} className="text-indigo-500 animate-spin" />
                <p className="text-indigo-800 font-medium animate-pulse">Analyzing notes and thinking...</p>
              </div>
            )}

            {/* Summary State */}
            {aiMode === 'summary' && typeof aiContent === 'string' && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50 relative">
                  <FormatMarkdown text={aiContent} />
                </div>
                <button onClick={() => setAiMode('idle')} className="w-full py-3 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
                  Ask Something Else
                </button>
              </div>
            )}

            {/* Quiz State */}
            {aiMode === 'quiz' && Array.isArray(aiContent) && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <div className="mb-2">
                  <h3 className="font-bold text-lg text-blue-900 border-b pb-2">Practice Quiz</h3>
                  <p className="text-sm text-gray-500 mt-2">Topic: {navItems.find(i => i.id === activeTab)?.label}</p>
                </div>

                {aiContent.map((q, qIndex) => {
                  const isAnswered = quizState[qIndex] !== undefined;
                  const selectedAnswer = quizState[qIndex];
                  const isCorrect = selectedAnswer === q.correctOptionIndex;

                  return (
                    <div key={qIndex} className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                      <p className="font-semibold text-gray-800 mb-4">{qIndex + 1}. {q.question}</p>
                      
                      <div className="space-y-2">
                        {q.options.map((option, oIndex) => {
                          // Styling logic for answers
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
                                {isAnswered && oIndex === q.correctOptionIndex && <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />}
                                {isAnswered && oIndex === selectedAnswer && oIndex !== q.correctOptionIndex && <XCircle size={16} className="text-red-500 flex-shrink-0" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Reveal */}
                      {isAnswered && (
                        <div className={`mt-4 p-3 rounded-lg text-sm ${isCorrect ? 'bg-green-100/50 text-green-900 border border-green-200' : 'bg-orange-50 text-orange-900 border border-orange-200'}`}>
                          <p className="font-bold mb-1">{isCorrect ? 'Great job!' : 'Not quite.'}</p>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}

                <button onClick={() => setAiMode('idle')} className="w-full py-3 mt-4 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors shadow-sm">
                  Finish & Try Something Else
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
