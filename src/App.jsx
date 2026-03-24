// Complete App.js - Fixed Version with Carousel & Download Button
import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  Database,
  Target,
  Award,
  TrendingUp,
  Home,
  History,
  CheckCircle,
  Loader2,
  Sparkles,
  Brain,
  Eye,
  Medal,
  Cpu,
  Activity,
  Layers,
  Star,
  Rocket,
  Zap,
  BarChart,
  Settings,
  RefreshCw,
  X,
  FolderUp,
  FileSpreadsheet,
  BarChart3,
  Crown,
  Lightbulb,
  ShieldCheck,
  ArrowRight,
  Menu,
  Compass,
  AlertCircle,
  Play,
  Timer,
  Gauge,
  Binary,
  GitBranch,
  Network,
  Fingerprint,
  Radar,
  Download,
  Info,
  TrendingDown,
  Minus,
  Plus
} from "lucide-react";

const API_BASE_URL = "https://automl-backend-hw8s.onrender.com";

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [datasetPreview, setDatasetPreview] = useState(null);
  const [target, setTarget] = useState("");
  const [targetPreview, setTargetPreview] = useState([]);
  const [targetStats, setTargetStats] = useState(null);
  const [targetDistribution, setTargetDistribution] = useState(null);
  const [features, setFeatures] = useState([]);
  const [inputData, setInputData] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trainingAnimation, setTrainingAnimation] = useState(false);
  const [trainingPhase, setTrainingPhase] = useState(0);
  const [trainingMessage, setTrainingMessage] = useState("");
  const [modelId, setModelId] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [bestModel, setBestModel] = useState("");
  const [bestParams, setBestParams] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [trainError, setTrainError] = useState(null);
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [recommendation, setRecommendation] = useState("");
  const [activeTab, setActiveTab] = useState("models");
  const [hoveredModel, setHoveredModel] = useState(null);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [particles, setParticles] = useState([]);
  const [downloading, setDownloading] = useState(false);

  // Generate particles for training animation
  useEffect(() => {
    if (trainingAnimation) {
      const interval = setInterval(() => {
        setParticles(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 20,
            size: Math.random() * 4 + 2,
            speed: Math.random() * 3 + 1,
            opacity: Math.random() * 0.6 + 0.3
          }
        ].slice(-50));
      }, 200);
      return () => clearInterval(interval);
    }
  }, [trainingAnimation]);

  useEffect(() => {
    if (trainingAnimation) {
      const animate = setInterval(() => {
        setParticles(prev => 
          prev.map(p => ({ ...p, y: p.y - p.speed })).filter(p => p.y > -50)
        );
      }, 30);
      return () => clearInterval(animate);
    }
  }, [trainingAnimation]);

  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      handleUpload(uploadedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1
  });

  const handleUpload = async (fileToUpload = file) => {
    if (!fileToUpload) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", fileToUpload);

      const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setDatasetId(res.data.dataset_id);
      setColumns(res.data.columns);
      setDatasetPreview(res.data.preview || { rows: [], columns: res.data.columns });
      
      const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        filename: fileToUpload.name,
        columns: res.data.columns.length,
        rows: res.data.preview?.rows?.length || 0
      };
      setHistory(prev => [historyEntry, ...prev].slice(0, 10));
      
      setLoading(false);
      
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      setLoading(false);
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    }
  };

  const fetchTargetPreview = async (selectedTarget) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/preview-target`, {
        target: selectedTarget,
        dataset_id: datasetId  
      });
      const previewData = res.data.preview || [];
      setTargetPreview(previewData);
      
      // Calculate target statistics
      const numericValues = previewData.filter(v => !isNaN(parseFloat(v)) && isFinite(v)).map(v => parseFloat(v));
      if (numericValues.length > 0) {
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        const sorted = [...numericValues].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const range = max - min;
        
        // Calculate distribution (simple histogram)
        const numBins = 5;
        const binWidth = range / numBins;
        const bins = Array(numBins).fill(0);
        numericValues.forEach(val => {
          const binIndex = Math.min(Math.floor((val - min) / binWidth), numBins - 1);
          bins[binIndex]++;
        });
        
        setTargetStats({ min, max, mean, median, range });
        setTargetDistribution({ bins, binWidth, min });
      } else {
        setTargetStats(null);
        setTargetDistribution(null);
      }
    } catch (err) {
      console.error("Preview error:", err);
      setTargetStats(null);
      setTargetDistribution(null);
    }
  };

  const trainModel = async () => {
    if (!target || isTraining) return;

    try {
      setIsTraining(true);
      setTrainError(null);
      setTrainingAnimation(true);
      setTrainingPhase(0);
      
      const phases = [
        { name: "NEURAL SYNAPSE", message: "Establishing neural connections...", color: "from-purple-500 to-pink-500" },
        { name: "FEATURE EXTRACTION", message: "Analyzing patterns in data...", color: "from-blue-500 to-cyan-500" },
        { name: "ENSEMBLE LEARNING", message: "Training multiple architectures...", color: "from-green-500 to-emerald-500" },
        { name: "HYPERPARAMETER TUNING", message: "Optimizing for peak performance...", color: "from-orange-500 to-red-500" },
        { name: "CROSS-VALIDATION", message: "Validating model robustness...", color: "from-indigo-500 to-purple-500" },
        { name: "MODEL SELECTION", message: "Crowning the champion...", color: "from-yellow-500 to-amber-500" }
      ];
      
      for (let i = 0; i < phases.length; i++) {
        setTrainingPhase(i);
        setTrainingMessage(phases[i].message);
        await new Promise(resolve => setTimeout(resolve, 900));
      }
      
      const res = await axios.post(`${API_BASE_URL}/train`, {
        target: target,
        dataset_id: datasetId
      });

      setFeatures(res.data.features || []);
      setBestModel(res.data.best_model || "");
      setBestParams(res.data.best_params || {});
      setLeaderboard(res.data.leaderboard || []);
      setTrainingComplete(true);
      setModelId(res.data.model_id || "");
      
      if (res.data.leaderboard && res.data.leaderboard.length > 0) {
        const bestModelData = res.data.leaderboard.find(m => m.model === res.data.best_model);
        const recommendationMsg = `${res.data.best_model} achieved ${(bestModelData?.cv_score ? (bestModelData.cv_score * 100).toFixed(2) : "0")}% accuracy - recommended for production.`;
        setRecommendation(recommendationMsg);
        
        const bestIndex = res.data.leaderboard.findIndex(m => m.model === res.data.best_model);
        setSelectedModelIndex(bestIndex >= 0 ? bestIndex : 0);
        setCurrentCarouselIndex(bestIndex >= 0 ? bestIndex : 0);
      }
      
      setTimeout(() => {
        setTrainingAnimation(false);
        setIsTraining(false);
        setCurrentStep(2);
      }, 800);
      
    } catch (err) {
      console.error("TRAIN ERROR:", err);
      setTrainError(err.response?.data?.message || err.message || "Training failed");
      setTrainingAnimation(false);
      setIsTraining(false);
    }
  };

  const handleInputChange = (col, value) => {
    setInputData({
      ...inputData,
      [col]: parseFloat(value) || 0
    });
  };

  const predict = async () => {
    if (Object.keys(inputData).length !== features.length) return;

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/predict`, {
        input: inputData,
        model_id: modelId
      });
      setPrediction(res.data);
    } catch (err) {
      console.error("PREDICT ERROR:", err);
      alert("Prediction failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const downloadModel = async () => {
    if (!modelId) {
      alert("Model not available! Please train a model first.");
      return;
    }

    try {
      setDownloading(true);
      const response = await axios.get(
        `${API_BASE_URL}/download-model/${modelId}`,
        {
          responseType: "blob",
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${bestModel || modelId}_model.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setDownloading(false);
      alert("Model downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      setDownloading(false);
      alert("Download failed: " + (error.response?.data?.message || error.message));
    }
  };

  const resetToHome = () => {
    setCurrentStep(0);
    setFile(null);
    setColumns([]);
    setDatasetPreview(null);
    setTarget("");
    setTargetPreview([]);
    setTargetStats(null);
    setTargetDistribution(null);
    setFeatures([]);
    setInputData({});
    setPrediction(null);
    setBestModel("");
    setBestParams({});
    setLeaderboard([]);
    setTrainingComplete(false);
    setShowHistory(false);
    setSelectedModelIndex(0);
    setCurrentCarouselIndex(0);
    setTrainError(null);
    setIsTraining(false);
    setRecommendation("");
    setActiveTab("models");
    setModelId("");
  };

  const goToNext = () => {
    if (columns.length > 0) {
      setCurrentStep(1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setPrediction(null);
    }
  };

  const nextCarousel = () => {
    if (leaderboard.length > 0) {
      setCurrentCarouselIndex((prev) => (prev + 1) % leaderboard.length);
    }
  };

  const prevCarousel = () => {
    if (leaderboard.length > 0) {
      setCurrentCarouselIndex((prev) => (prev - 1 + leaderboard.length) % leaderboard.length);
    }
  };

  // Spectacular Training Animation Component
  const TrainingAnimation = () => {
    const phases = [
      { name: "NEURAL SYNAPSE", message: "Establishing neural connections...", color: "from-purple-500 to-pink-500" },
      { name: "FEATURE EXTRACTION", message: "Analyzing patterns in data...", color: "from-blue-500 to-cyan-500" },
      { name: "ENSEMBLE LEARNING", message: "Training multiple architectures...", color: "from-green-500 to-emerald-500" },
      { name: "HYPERPARAMETER TUNING", message: "Optimizing for peak performance...", color: "from-orange-500 to-red-500" },
      { name: "CROSS-VALIDATION", message: "Validating model robustness...", color: "from-indigo-500 to-purple-500" },
      { name: "MODEL SELECTION", message: "Crowning the champion...", color: "from-yellow-500 to-amber-500" }
    ];
    
    const currentPhase = phases[trainingPhase];
    const progress = ((trainingPhase + 1) / phases.length) * 100;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
              filter: 'blur(1px)',
            }}
          />
        ))}
        
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500 rounded-full blur-[100px] animate-pulse delay-1000" />
        </div>
        
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          <div className="relative mb-8">
            <div className="text-[180px] md:text-[240px] font-black text-transparent bg-clip-text bg-gradient-to-r from-white/10 to-white/5 select-none">
              {String(trainingPhase + 1).padStart(2, '0')}
            </div>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent">
            {currentPhase?.name}
          </h2>
          
          <p className="text-xl text-gray-400 mb-12">
            {trainingMessage}
            <span className="inline-block w-2 h-2 bg-amber-500 rounded-full ml-1 animate-pulse" />
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${currentPhase?.color} rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <div className="flex justify-center gap-2 mt-8">
            {phases.map((phase, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-500 ${
                  idx <= trainingPhase 
                    ? `w-8 bg-gradient-to-r ${phase.color}` 
                    : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Page 1: Upload Page
  const renderStep0 = () => (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
        </div>
        <div className="relative z-10 text-center px-4 py-16">
          <div className="inline-block mb-6 group">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-500">
              <Brain className="w-12 h-12 text-black" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-4">
            ML<span className="bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">STUDIO</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
            Upload your dataset. Let AI find your perfect model.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed transition-all duration-500 cursor-pointer p-12 text-center overflow-hidden group ${
                isDragActive 
                  ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.3)]' 
                  : 'border-gray-700 hover:border-amber-500/50 hover:bg-gray-900/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className={`w-16 h-16 mx-auto mb-4 transition-all duration-300 ${isDragActive ? 'text-amber-500 scale-110' : 'text-gray-600 group-hover:text-amber-500'}`} />
              {isDragActive ? (
                <p className="text-amber-500 text-lg font-mono">DROP YOUR CSV FILE</p>
              ) : (
                <>
                  <p className="text-gray-400 mb-2 font-mono">Drag & drop your CSV file</p>
                  <p className="text-gray-600 text-sm mb-4">or</p>
                  <button className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold tracking-wide hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 transform hover:scale-105">
                    BROWSE FILES
                  </button>
                  <p className="text-gray-600 text-xs mt-4">Supports .csv files</p>
                </>
              )}
            </div>

            {file && (
              <div className="mt-6 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileSpreadsheet className="w-8 h-8 text-amber-500" />
                    <div>
                      <p className="font-mono text-white text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  {loading && <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />}
                </div>
              </div>
            )}

            {datasetPreview && (
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="border border-gray-700 p-4 text-center bg-gradient-to-br from-gray-900/50 to-black rounded-lg">
                  <Database className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{datasetPreview.columns?.length || 0}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">FEATURES</p>
                </div>
                <div className="border border-gray-700 p-4 text-center bg-gradient-to-br from-gray-900/50 to-black rounded-lg">
                  <BarChart3 className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{datasetPreview.rows?.length || 0}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">SAMPLES</p>
                </div>
              </div>
            )}
          </div>

          <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-900/30 backdrop-blur-sm">
            <div className="border-b border-gray-700 p-4 bg-gray-900/50">
              <h3 className="font-mono text-white flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4 text-amber-500" />
                DATASET PREVIEW
              </h3>
            </div>
            <div className="p-4 overflow-x-auto max-h-[400px]">
              {datasetPreview ? (
                <table className="min-w-full text-sm">
                  <thead className="border-b border-gray-700">
                    <tr>
                      {datasetPreview.columns?.slice(0, 5).map((col, idx) => (
                        <th key={idx} className="text-left py-2 px-3 text-amber-500 font-mono text-xs">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {datasetPreview.rows?.slice(0, 8).map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                        {Object.values(row).slice(0, 5).map((val, i) => (
                          <td key={i} className="py-2 px-3 text-gray-400 text-xs font-mono">
                            {String(val).substring(0, 30)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-16">
                  <Database className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                  <p className="text-gray-500">No dataset loaded</p>
                  <p className="text-gray-600 text-xs mt-1">Upload a CSV file to see preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {columns.length > 0 && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={goToNext}
              className="group px-12 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold tracking-wider hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 flex items-center gap-3 transform hover:scale-105"
            >
              <span>CONTINUE TO TARGET</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowHistory(true)}
        className="fixed bottom-6 right-6 border border-gray-700 p-3 hover:border-amber-500 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 bg-gray-900/50 backdrop-blur-sm rounded-full group"
      >
        <History className="w-5 h-5 text-gray-500 group-hover:text-amber-500 transition" />
      </button>

      {showHistory && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowHistory(false)}>
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 max-w-md w-full mx-4 p-6 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-white text-lg">UPLOAD HISTORY</h3>
              <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-gray-800 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {history.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No history yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((item) => (
                  <div key={item.id} className="border border-gray-700 p-3 hover:border-amber-500 transition-all duration-300 rounded-lg">
                    <p className="font-mono text-white text-sm">{item.filename}</p>
                    <p className="text-xs text-gray-500">{item.timestamp}</p>
                    <p className="text-xs text-gray-600">{item.columns} features, {item.rows} samples</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Page 2: Enhanced Target Selection with Stats and Distribution
  // Page 2: Modern Target Selection with Clean UI
const renderStep1 = () => (
  <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-6 md:mb-8 flex items-center justify-between">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-all duration-300 border border-gray-700 px-4 md:px-5 py-2 rounded-lg hover:border-amber-500 hover:bg-gray-800/50 text-sm"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span>BACK</span>
        </button>
        <button
          onClick={resetToHome}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-all duration-300 border border-gray-700 px-4 md:px-5 py-2 rounded-lg hover:border-amber-500 hover:bg-gray-800/50 text-sm"
        >
          <Home className="w-4 h-4" />
          <span>HOME</span>
        </button>
      </div>

      <div className="text-center mb-10 md:mb-12">
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-3">
          SELECT <span className="bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">TARGET</span>
        </h2>
        <p className="text-gray-500 text-base">Choose the column you want to predict</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Target Selection Card */}
        <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
          <div className="border-b border-gray-800 p-5 bg-gray-900/50">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" />
              <h3 className="font-mono text-white text-sm tracking-wider">TARGET COLUMN</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <select
              value={target}
              onChange={(e) => {
                const selected = e.target.value;
                setTarget(selected);
                if (selected && datasetId) {
                  fetchTargetPreview(selected);
                }
              }}
              className="w-full p-4 bg-black/50 border border-gray-700 focus:border-amber-500 outline-none text-white font-mono rounded-xl transition-all duration-300 text-base"
            >
              <option value="">Select target column...</option>
              {columns.map((col, i) => (
                <option key={i} value={col}>{col}</option>
              ))}
            </select>

            {target && targetStats && (
              <div className="space-y-5">
                {/* Selected Target Badge */}
                <div className="bg-gradient-to-r from-amber-500/10 to-transparent p-4 rounded-xl border-l-4 border-amber-500">
                  <p className="text-xs text-gray-500 mb-1">SELECTED TARGET</p>
                  <p className="text-2xl font-mono font-bold text-white">{target}</p>
                </div>

                {/* Statistics Grid - Clean Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 rounded-xl p-4 border border-gray-800 hover:border-amber-500/50 transition-all">
                    <p className="text-xs text-gray-500 mb-1">MINIMUM</p>
                    <p className="text-2xl font-bold text-white">{targetStats.min.toFixed(2)}</p>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 border border-gray-800 hover:border-amber-500/50 transition-all">
                    <p className="text-xs text-gray-500 mb-1">MAXIMUM</p>
                    <p className="text-2xl font-bold text-white">{targetStats.max.toFixed(2)}</p>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 border border-gray-800 hover:border-amber-500/50 transition-all">
                    <p className="text-xs text-gray-500 mb-1">MEAN (AVERAGE)</p>
                    <p className="text-2xl font-bold text-amber-500">{targetStats.mean.toFixed(2)}</p>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 border border-gray-800 hover:border-amber-500/50 transition-all">
                    <p className="text-xs text-gray-500 mb-1">MEDIAN</p>
                    <p className="text-2xl font-bold text-amber-500">{targetStats.median.toFixed(2)}</p>
                  </div>
                </div>

                {/* Range Card */}
                <div className="bg-black/30 rounded-xl p-5 border border-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-mono text-gray-400">DATA RANGE</p>
                    <p className="text-xl font-bold text-white">{targetStats.range.toFixed(2)}</p>
                  </div>
                  <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                      style={{ width: '100%' }}
                    />
                    <div 
                      className="absolute inset-y-0 bg-white rounded-full shadow-lg"
                      style={{ left: `${((targetStats.mean - targetStats.min) / targetStats.range) * 100}%`, width: '3px' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>{targetStats.min.toFixed(0)}</span>
                    <span className="text-amber-500">Mean: {targetStats.mean.toFixed(0)}</span>
                    <span>{targetStats.max.toFixed(0)}</span>
                  </div>
                </div>

                {/* Insights Card */}
                <div className="bg-gradient-to-r from-amber-500/5 to-transparent rounded-xl p-5 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <p className="text-xs font-mono text-amber-500 uppercase tracking-wider">Key Insights</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300">
                      <span className="text-amber-500">•</span> Range: <span className="text-white font-mono">{targetStats.range.toFixed(2)}</span> units spread
                    </p>
                    <p className="text-gray-300">
                      <span className="text-amber-500">•</span> Mean vs Median: <span className="text-white font-mono">{Math.abs(targetStats.mean - targetStats.median).toFixed(2)}</span> difference
                    </p>
                    <p className="text-gray-300">
                      <span className="text-amber-500">•</span> Distribution: <span className="text-white">
                        {targetStats.range / targetStats.mean * 100 > 50 ? 'High variability' : 'Moderate variability'}
                      </span>
                    </p>
                    <p className="text-gray-300">
                      <span className="text-amber-500">•</span> Data points: <span className="text-white font-mono">{targetPreview.length}</span> samples
                    </p>
                  </div>
                </div>
              </div>
            )}

            {trainError && (
              <div className="border border-red-500/30 p-4 bg-red-500/10 rounded-xl">
                <p className="text-red-400 text-sm">Error: {trainError}</p>
              </div>
            )}

            {target && (
              <button
                onClick={trainModel}
                disabled={isTraining}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold tracking-wider hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 disabled:opacity-50 rounded-xl transform hover:scale-[1.02] text-base"
              >
                {isTraining ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>INITIATING TRAINING...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Rocket className="w-5 h-5" />
                    <span>START AI TRAINING</span>
                  </div>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Data Preview Card */}
        <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
          <div className="border-b border-gray-800 p-5 bg-gray-900/50">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              <h3 className="font-mono text-white text-sm tracking-wider">DATA PREVIEW</h3>
            </div>
          </div>
          
          <div className="p-6">
            {target ? (
              <div className="space-y-6">
                {/* Distribution Chart - Clean Bars */}
                {targetDistribution && (
                  <div>
                    <p className="text-xs text-gray-500 mb-4 uppercase tracking-wider">Distribution Analysis</p>
                    <div className="space-y-3">
                      {targetDistribution.bins.map((count, idx) => {
                        const binStart = targetDistribution.min + idx * targetDistribution.binWidth;
                        const binEnd = binStart + targetDistribution.binWidth;
                        const maxCount = Math.max(...targetDistribution.bins);
                        const percentage = (count / maxCount) * 100;
                        return (
                          <div key={idx} className="group">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500 font-mono">
                                {binStart.toFixed(1)} - {binEnd.toFixed(1)}
                              </span>
                              <span className="text-xs text-amber-500 font-mono">{count} samples</span>
                            </div>
                            <div className="h-10 bg-gray-800 rounded-lg overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-lg transition-all duration-500 flex items-center justify-end px-3"
                                style={{ width: `${percentage}%` }}
                              >
                                <span className="text-xs text-white font-bold">{percentage.toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Sample Values Grid - Clean Layout */}
                <div>
                  <p className="text-xs text-gray-500 mb-4 uppercase tracking-wider">Sample Values</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {targetPreview.slice(0, 12).map((value, idx) => (
                      <div 
                        key={idx} 
                        className="bg-black/30 rounded-lg p-3 text-center border border-gray-800 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-300 group"
                      >
                        <span className="text-gray-400 text-xs group-hover:text-amber-500 transition">#{idx + 1}</span>
                        <p className="text-white font-mono text-base font-bold mt-1">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                  {targetPreview.length > 12 && (
                    <p className="text-xs text-gray-600 text-center mt-4 pt-2 border-t border-gray-800">
                      + {targetPreview.length - 12} more values
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                  <Target className="w-10 h-10 text-gray-600" />
                </div>
                <p className="text-gray-500 text-base">No target selected</p>
                <p className="text-gray-600 text-sm mt-2">Choose a target column to see statistics</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {trainingAnimation && <TrainingAnimation />}
  </div>
);

  // Page 3: Results Page with Carousel and Download Button
  const renderStep2 = () => {
    // Show loading if leaderboard is empty
    if (!leaderboard || leaderboard.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-all duration-300 border border-gray-700 px-5 py-2.5 rounded-lg hover:border-amber-500 hover:bg-gray-800/50"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span className="text-sm">BACK</span>
              </button>
              <button
                onClick={resetToHome}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-all duration-300 border border-gray-700 px-5 py-2.5 rounded-lg hover:border-amber-500 hover:bg-gray-800/50"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm">HOME</span>
              </button>
            </div>
            
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading model results...</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const currentModel = leaderboard[currentCarouselIndex];
    const isBest = currentModel?.model === bestModel;
    const cvScore = currentModel?.cv_score ? (currentModel.cv_score * 100).toFixed(2) : "0.00";
    const trainScore = currentModel?.train_score ? (currentModel.train_score * 100).toFixed(2) : "0.00";
    const testScore = currentModel?.test_score ? (currentModel.test_score * 100).toFixed(2) : "0.00";

    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-all duration-300 border border-gray-700 px-5 py-2.5 rounded-lg hover:border-amber-500 hover:bg-gray-800/50"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span className="text-sm">BACK</span>
            </button>
            <button
              onClick={resetToHome}
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-all duration-300 border border-gray-700 px-5 py-2.5 rounded-lg hover:border-amber-500 hover:bg-gray-800/50"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm">HOME</span>
            </button>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-6xl md:text-7xl font-black text-white tracking-tighter mb-4">
              MODEL <span className="bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">RESULTS</span>
            </h2>
            <p className="text-gray-500">Your AI-powered analysis is ready</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-700 mb-12 justify-center">
            <button
              onClick={() => setActiveTab("models")}
              className={`px-8 py-3 font-mono text-sm transition-all duration-300 ${
                activeTab === "models" 
                  ? "text-amber-500 border-b-2 border-amber-500" 
                  : "text-gray-500 hover:text-gray-400"
              }`}
            >
              MODELS
            </button>
            <button
              onClick={() => setActiveTab("predict")}
              className={`px-8 py-3 font-mono text-sm transition-all duration-300 ${
                activeTab === "predict" 
                  ? "text-amber-500 border-b-2 border-amber-500" 
                  : "text-gray-500 hover:text-gray-400"
              }`}
            >
              PREDICT
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`px-8 py-3 font-mono text-sm transition-all duration-300 ${
                activeTab === "info" 
                  ? "text-amber-500 border-b-2 border-amber-500" 
                  : "text-gray-500 hover:text-gray-400"
              }`}
            >
              INFO
            </button>
          </div>

          {/* Models Tab - Carousel Slider */}
          {activeTab === "models" && (
            <div>
              {/* Recommendation Banner */}
              {recommendation && (
                <div className="mb-8 border-l-4 border-amber-500 p-4 bg-gradient-to-r from-amber-500/10 to-transparent rounded-r-xl max-w-2xl mx-auto">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-mono text-white text-sm mb-1">AI RECOMMENDATION</h4>
                      <p className="text-sm text-gray-400">{recommendation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Carousel Container */}
              <div className="relative flex items-center justify-center min-h-[550px]">
                {/* Left Navigation Button */}
                {leaderboard.length > 1 && (
                  <button
                    onClick={prevCarousel}
                    className="absolute left-0 z-20 w-12 h-12 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 hover:border-amber-500 hover:bg-gray-800 transition-all duration-300 flex items-center justify-center group"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-amber-500 group-hover:scale-110 transition" />
                  </button>
                )}

                {/* Main Card */}
                <div className="relative w-full max-w-2xl mx-12">
                  <div className="relative">
                    {/* Glow Effect for Best Model */}
                    {isBest && (
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl blur-xl opacity-75 animate-pulse" />
                    )}
                    
                    {/* Main Card */}
                    <div className={`relative bg-gradient-to-br from-gray-900 to-black border rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
                      isBest ? "border-amber-500" : "border-gray-700"
                    }`}>
                      {/* Best Model Badge */}
                      {isBest && (
                        <div className="absolute top-0 right-0 z-10">
                          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-2 rounded-bl-2xl font-bold text-sm flex items-center gap-2">
                            <Crown className="w-4 h-4" />
                            <span>BEST MODEL</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-8 text-center">
                        {/* Model Icon */}
                        <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                          isBest 
                            ? "bg-gradient-to-r from-amber-500 to-amber-600" 
                            : "bg-gray-800"
                        }`}>
                          {isBest ? (
                            <Crown className="w-10 h-10 text-black" />
                          ) : (
                            <Brain className="w-10 h-10 text-amber-500" />
                          )}
                        </div>
                        
                        {/* Model Name */}
                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                          {currentModel?.model}
                        </h3>
                        
                        {/* CV Score */}
                        <div className="mb-6">
                          <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Cross-Validation Score</p>
                          <p className="text-5xl md:text-6xl font-black bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">
                            {cvScore}%
                          </p>
                        </div>
                        
                        {/* Train/Test Scores */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                            <p className="text-xs text-gray-500 mb-1">TRAIN SCORE</p>
                            <p className="text-2xl font-bold text-green-500">{trainScore}%</p>
                            <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                                style={{ width: `${trainScore}%` }}
                              />
                            </div>
                          </div>
                          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                            <p className="text-xs text-gray-500 mb-1">TEST SCORE</p>
                            <p className="text-2xl font-bold text-blue-500">{testScore}%</p>
                            <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
                                style={{ width: `${testScore}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Performance Indicator */}
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <Gauge className="w-4 h-4 text-amber-500" />
                          <span className="text-gray-400">Performance Rating:</span>
                          <span className="text-white font-bold">
                            {parseFloat(cvScore) >= 85 ? "Excellent 🚀" : parseFloat(cvScore) >= 70 ? "Good 👍" : "Moderate 📊"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Navigation Button */}
                {leaderboard.length > 1 && (
                  <button
                    onClick={nextCarousel}
                    className="absolute right-0 z-20 w-12 h-12 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 hover:border-amber-500 hover:bg-gray-800 transition-all duration-300 flex items-center justify-center group"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-amber-500 group-hover:scale-110 transition" />
                  </button>
                )}
              </div>

              {/* Model Indicators */}
              {leaderboard.length > 1 && (
                <>
                  <div className="flex justify-center gap-2 mt-8">
                    {leaderboard.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentCarouselIndex(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          idx === currentCarouselIndex
                            ? "w-8 bg-gradient-to-r from-amber-500 to-amber-400"
                            : "w-2 bg-gray-600 hover:bg-gray-500"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600 font-mono">
                      {currentCarouselIndex + 1} / {leaderboard.length} Models
                    </p>
                  </div>
                </>
              )}

              {/* Download Button */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={downloadModel}
                  disabled={!modelId || downloading}
                  className="group px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center gap-3"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>DOWNLOADING...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>DOWNLOAD BEST MODEL</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Best Model Parameters */}
              {bestModel && Object.keys(bestParams).length > 0 && (
                <div className="mt-8 max-w-2xl mx-auto">
                  <div className="border border-gray-700 p-6 rounded-xl bg-gray-900/50 backdrop-blur-sm">
                    <h4 className="font-mono text-white text-sm mb-4 flex items-center gap-2 justify-center">
                      <Settings className="w-4 h-4 text-amber-500 animate-spin-slow" />
                      BEST MODEL PARAMETERS
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(bestParams).slice(0, 9).map(([key, value]) => (
                        <div key={key} className="border border-gray-700 rounded-lg p-2 bg-gray-800/30">
                          <span className="text-xs text-gray-500 block">{key}:</span>
                          <span className="text-xs font-mono text-amber-500 font-bold break-all">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Educational Footer */}
              <div className="mt-8 max-w-md mx-auto">
                <div className="border border-gray-700 p-4 rounded-xl bg-gradient-to-br from-gray-900/50 to-black text-center">
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gray-600" />
                    <p className="text-xs text-gray-600">📚 Educational purpose only - Results may vary</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Predict Tab - Fixed Box Layout */}
          {activeTab === "predict" && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Side - Feature Input */}
              <div className="space-y-6">
                <div className="relative overflow-hidden border border-gray-700 rounded-2xl bg-gradient-to-br from-gray-900/50 to-black backdrop-blur-sm">
                  <div className="relative p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center animate-pulse">
                        <Brain className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <h3 className="font-mono text-white text-lg tracking-wider">FEATURE ENGINEERING</h3>
                        <p className="text-xs text-gray-500">Adjust values to see real-time predictions</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scroll">
                      {features.map((col, idx) => {
                        const currentValue = inputData[col] || 0;
                        const normalizedValue = Math.min(Math.max(currentValue / 100, 0), 1);
                        
                        return (
                          <div key={idx} className="group relative">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-mono text-gray-400 group-hover:text-amber-500 transition-all duration-300 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                                {col.toUpperCase()}
                              </label>
                              <span className="text-xs font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                {currentValue.toFixed(2)}
                              </span>
                            </div>
                            
                            <div className="relative">
                              <input
                                type="range"
                                min="-10"
                                max="100"
                                step="0.1"
                                value={currentValue}
                                onChange={(e) => handleInputChange(col, e.target.value)}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider"
                                style={{
                                  background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${normalizedValue * 100}%, #374151 ${normalizedValue * 100}%, #374151 100%)`
                                }}
                              />
                              <div className="absolute -bottom-4 left-0 right-0 flex justify-between text-[10px] text-gray-600">
                                <span>Min</span>
                                <span>Optimal</span>
                                <span>Max</span>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => handleInputChange(col, Math.max(-10, currentValue - 5))}
                                className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition"
                              >
                                -5
                              </button>
                              <button
                                onClick={() => handleInputChange(col, currentValue + 5)}
                                className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition"
                              >
                                +5
                              </button>
                              <button
                                onClick={() => handleInputChange(col, 0)}
                                className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition"
                              >
                                Reset
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={predict}
                  disabled={loading || Object.keys(inputData).length !== features.length}
                  className="relative w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold tracking-wider overflow-hidden group rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  {loading ? (
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>ANALYZING PATTERNS...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <Zap className="w-5 h-5" />
                      <span>EXECUTE PREDICTION</span>
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                </button>
                
                {Object.keys(inputData).length > 0 && (
                  <div className="border border-gray-700 rounded-2xl p-4 bg-gray-900/30">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs font-mono text-gray-400">INPUT SUMMARY</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="border border-gray-700 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Features</p>
                        <p className="text-lg font-bold text-white">{Object.keys(inputData).length}</p>
                      </div>
                      <div className="border border-gray-700 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Avg Value</p>
                        <p className="text-lg font-bold text-amber-500">
                          {(Object.values(inputData).reduce((a, b) => a + b, 0) / Object.keys(inputData).length).toFixed(1)}
                        </p>
                      </div>
                      <div className="border border-gray-700 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Range</p>
                        <p className="text-lg font-bold text-white">
                          {Math.min(...Object.values(inputData)).toFixed(0)} - {Math.max(...Object.values(inputData)).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Side - Prediction Result - FIXED INSIDE BOX */}
              <div className="relative">
                {prediction ? (
                  <div className="relative h-full min-h-[500px]">
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-purple-500/20 rounded-2xl blur-xl animate-pulse" />
                    
                    <div className="relative border border-amber-500 rounded-2xl bg-gradient-to-br from-gray-900 to-black p-8 h-full flex flex-col items-center justify-center overflow-hidden">
                      {/* Floating Particles */}
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute rounded-full bg-amber-500/20 animate-float"
                            style={{
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`,
                              width: `${Math.random() * 4 + 2}px`,
                              height: `${Math.random() * 4 + 2}px`,
                              animationDelay: `${Math.random() * 5}s`,
                              animationDuration: `${Math.random() * 3 + 2}s`
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Success Icon with Ripple Effect */}
                      <div className="relative mb-6">
                        <div className="absolute inset-0 rounded-full bg-amber-500/30 animate-ping" />
                        <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-pulse" />
                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center shadow-2xl">
                          <CheckCircle className="w-10 h-10 text-black" />
                        </div>
                      </div>
                      
                      <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-2 font-mono">
                        PREDICTION RESULT
                      </h3>
                      
                      {/* Main Prediction Value */}
                      <p className="text-6xl md:text-7xl font-black bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 bg-clip-text text-transparent mb-4">
                        {typeof prediction.prediction === 'number' ? prediction.prediction.toFixed(2) : prediction.prediction}
                      </p>
                      
                      {/* Confidence Score */}
                      {prediction.confidence && (
                        <div className="mb-6 text-center w-full">
                          <p className="text-xs text-gray-500 mb-1">Confidence Score</p>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-white">{(prediction.confidence * 100).toFixed(1)}%</span>
                            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-1000"
                                style={{ width: `${prediction.confidence * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Model Information */}
                      <div className="w-full border-t border-gray-700 pt-4 mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-amber-500" />
                            <span className="text-gray-500">Model:</span>
                            <span className="text-white font-mono text-xs">{bestModel}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-green-500" />
                            <span className="text-gray-500">Status:</span>
                            <span className="text-green-500">Active</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Insights */}
                      <div className="w-full mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-gray-400">
                            {typeof prediction.prediction === 'number' 
                              ? `This prediction is based on ${features.length} input features with ${bestModel} algorithm.`
                              : `Based on the input values, the model predicts "${prediction.prediction}" with high confidence.`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-700 rounded-2xl h-full min-h-[500px] flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/30 to-black p-8">
                    {/* Animated Neural Network Visualization */}
                    <div className="relative w-48 h-48 mb-6">
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        <circle cx="100" cy="100" r="90" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="5 5" className="animate-spin-slow" />
                        <circle cx="100" cy="100" r="60" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.5" />
                        <circle cx="100" cy="100" r="30" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.3" />
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                          const rad = (angle * Math.PI) / 180;
                          const x = 100 + 75 * Math.cos(rad);
                          const y = 100 + 75 * Math.sin(rad);
                          return (
                            <circle key={i} cx={x} cy={y} r="4" fill="#f59e0b" className="animate-pulse">
                              <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
                            </circle>
                          );
                        })}
                        <circle cx="100" cy="100" r="12" fill="url(#gradient)" className="animate-pulse">
                          <animate attributeName="r" values="12;15;12" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                        <defs>
                          <radialGradient id="gradient">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#d97706" />
                          </radialGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">Ready for Prediction</h3>
                    <p className="text-sm text-gray-500 text-center max-w-xs">
                      Adjust the feature values and click <span className="text-amber-500">"EXECUTE PREDICTION"</span> to see the AI in action
                    </p>
                    
                    {/* Feature Progress */}
                    <div className="w-full mt-6">
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Features Configured</span>
                        <span className="text-amber-500">{Object.keys(inputData).length} / {features.length}</span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${(Object.keys(inputData).length / features.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Tip */}
                    <div className="mt-6 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Tip: Use the sliders to adjust values and see real-time changes
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Info Tab */}
          {activeTab === "info" && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="border border-gray-700 p-6 rounded-2xl bg-gray-900/30 backdrop-blur-sm">
                <h3 className="font-mono text-white text-sm mb-4">ABOUT THIS TOOL</h3>
                <div className="space-y-4 text-sm text-gray-400">
                  <p>ML Studio is an automated machine learning platform that helps you find the best model for your dataset without writing code.</p>
                  <p>Simply upload your CSV file, select the target column you want to predict, and let our AI do the heavy lifting.</p>
                  <p>The system trains multiple algorithms including Gradient Boosting, Random Forest, SVM, and KNN, then selects the best performer based on cross-validation scores.</p>
                </div>
              </div>
              <div className="border border-gray-700 p-6 rounded-2xl bg-gray-900/30 backdrop-blur-sm">
                <h3 className="font-mono text-white text-sm mb-4">HOW IT WORKS</h3>
                <div className="space-y-3">
                  {[
                    "1. Upload your dataset (CSV format)",
                    "2. Select the target column to predict",
                    "3. AI trains multiple models automatically",
                    "4. Compare performance metrics",
                    "5. Make predictions with the best model"
                  ].map((step, idx) => (
                    <p key={idx} className="text-sm text-gray-400 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 text-xs flex items-center justify-center">{idx + 1}</span>
                      {step}
                    </p>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-600">📚 For educational purposes only</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black font-['Inter']">
      {currentStep === 0 && renderStep0()}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      
      <style jsx="true">{`
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px) translateX(0px);
      opacity: 0;
    }
    50% {
      transform: translateY(-20px) translateX(10px);
      opacity: 0.6;
    }
  }
  
  @keyframes float-slow {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-15px);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }
  
  @keyframes pulse-ring {
    0% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes spin-reverse {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }
  
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }
  
  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 5px rgba(245, 158, 11, 0.3);
    }
    50% {
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.6);
    }
  }
  
  @keyframes ripple {
    0% {
      transform: scale(0);
      opacity: 0.5;
    }
    100% {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .animate-slideIn {
    animation: slideIn 0.5s ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.6s ease-out;
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.4s ease-in;
  }
  
  .animate-scaleIn {
    animation: scaleIn 0.4s ease-out;
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-float-slow {
    animation: float-slow 4s ease-in-out infinite;
  }
  
  .animate-pulse-slow {
    animation: pulse 2s ease-in-out infinite;
  }
  
  .animate-pulse-ring {
    animation: pulse-ring 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
  
  .animate-spin-slow {
    animation: spin 8s linear infinite;
  }
  
  .animate-spin-reverse {
    animation: spin-reverse 10s linear infinite;
  }
  
  .animate-bounce {
    animation: bounce 0.5s ease-in-out infinite;
  }
  
  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }
  
  .animate-gradient {
    background-size: 200% 200%;
    animation: gradientShift 3s ease infinite;
  }
  
  /* Custom Range Slider Styles */
  .range-slider {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
  }
  
  .range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: #f59e0b;
    cursor: pointer;
    border-radius: 50%;
    box-shadow: 0 0 10px #f59e0b;
    border: 2px solid white;
    transition: all 0.2s ease;
  }
  
  .range-slider::-webkit-slider-thumb:hover {
    transform: scale(1.3);
    box-shadow: 0 0 20px #f59e0b;
  }
  
  .range-slider::-webkit-slider-runnable-track {
    height: 6px;
    background: #374151;
    border-radius: 3px;
  }
  
  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #1a1a1a;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #f59e0b;
    border-radius: 10px;
    transition: background 0.2s;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #d97706;
  }
  
  /* Custom Scrollbar for Feature List */
  .custom-scroll::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scroll::-webkit-scrollbar-track {
    background: #1f2937;
    border-radius: 10px;
  }
  
  .custom-scroll::-webkit-scrollbar-thumb {
    background: #f59e0b;
    border-radius: 10px;
  }
  
  /* Neural Network Animation */
  .neuron-pulse {
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  /* Card Hover Effects */
  .card-hover {
    transition: all 0.3s ease;
  }
  
  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px -12px rgba(245, 158, 11, 0.2);
  }
  
  /* Glowing Text Effect */
  .glow-text {
    text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
  }
  
  /* Gradient Border Animation */
  .gradient-border {
    position: relative;
    background: linear-gradient(60deg, #f59e0b, #d97706, #f59e0b);
    background-size: 200% 200%;
    animation: gradientShift 3s ease infinite;
  }
  
  /* Loading Ripple Effect */
  .ripple-effect {
    position: relative;
    overflow: hidden;
  }
  
  .ripple-effect::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(245, 158, 11, 0.4);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  .ripple-effect:active::after {
    width: 200px;
    height: 200px;
  }
  
  /* Feature Input Group Hover */
  .feature-group {
    transition: all 0.3s ease;
  }
  
  .feature-group:hover {
    transform: translateX(4px);
  }
  
  /* Prediction Result Animation */
  .prediction-appear {
    animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  /* Neural Network SVG Animation */
  .neuron-node {
    animation: pulse 2s ease-in-out infinite;
  }
  
  .neuron-line {
    animation: pulse 3s ease-in-out infinite;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .animate-float {
      animation-duration: 2s;
    }
    
    .range-slider::-webkit-slider-thumb {
      width: 20px;
      height: 20px;
    }
  }
  
  /* Dark Mode Optimizations */
  @media (prefers-color-scheme: dark) {
    .custom-scroll::-webkit-scrollbar-track {
      background: #111827;
    }
  }
  
  /* Smooth Transitions */
  * {
    transition: all 0.2s ease;
  }
  
  /* Input Focus Effects */
  input:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
  }
  
  /* Button Hover Effects */
  button {
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  button:active {
    transform: scale(0.98);
  }
  
  /* Card Glassmorphism */
  .glass-card {
    backdrop-filter: blur(10px);
    background: rgba(17, 24, 39, 0.5);
  }
  
  /* Status Indicators */
  .status-pulse {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #10b981;
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  /* Tooltip Styles */
  .tooltip {
    position: relative;
  }
  
  .tooltip:hover::before {
    content: attr(data-tip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 8px;
    background: #1f2937;
    color: #f59e0b;
    font-size: 12px;
    border-radius: 4px;
    white-space: nowrap;
    z-index: 10;
  }
  
  /* Loading Spinner Animation */
  .spinner {
    border: 2px solid rgba(245, 158, 11, 0.1);
    border-top-color: #f59e0b;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
`}</style>
    </div>
  );
}

export default App;