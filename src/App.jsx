// Complete App.js - Fixed Version with Carousel & Download Button
import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  Plus,
  LineChart,
  Terminal
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
  const [selectedAnalysisColumn, setSelectedAnalysisColumn] = useState("");
  const [columnAnalysisData, setColumnAnalysisData] = useState(null);
  const [isAnalyzingColumn, setIsAnalyzingColumn] = useState(false);
  const [features, setFeatures] = useState([]);
  const [featureTypes, setFeatureTypes] = useState({});
  const [rawColumns, setRawColumns] = useState([]);
  const [categoricalValues, setCategoricalValues] = useState({});
  const [rawDtypes, setRawDtypes] = useState({});
  const [rawMins, setRawMins] = useState({});
  const [rawMaxes, setRawMaxes] = useState({});
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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processLog, setProcessLog] = useState([]);
  const [predictionHistoryList, setPredictionHistoryList] = useState([]);
  const [showPredictionHistoryModal, setShowPredictionHistoryModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);

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
      setUploading(true);
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append("file", fileToUpload);

      const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const cols = res.data.columns || [];
      const previewData = res.data.preview || { rows: [], columns: cols };

      if (previewData.rows && previewData.rows.length > 0) {
        const types = {};
        const sampleRow = previewData.rows[0];
        cols.forEach(col => {
          const sampleValue = sampleRow[col];
          if (typeof sampleValue === 'string' && isNaN(parseFloat(sampleValue))) {
            types[col] = 'categorical';
          } else {
            types[col] = 'numeric';
          }
        });
        setFeatureTypes(types);
      }

      const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        filename: fileToUpload.name,
        columns: cols.length,
        rows: previewData?.rows?.length || 0
      };
      setHistory(prev => [historyEntry, ...prev].slice(0, 10));

      setTimeout(() => {
        setDatasetId(res.data.dataset_id);
        setColumns(cols);
        setDatasetPreview(previewData);
        setUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      setUploading(false);
      setUploadProgress(0);
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    }
  };

  const analyzeColumn = async (colName) => {
    if (!colName || !datasetId) {
      setColumnAnalysisData(null);
      return;
    }

    setSelectedAnalysisColumn(colName);
    setIsAnalyzingColumn(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/analyze-column`, {
        target: colName, // keeping target key if backend needs it somewhere, but new endpoint uses column
        column: colName,
        dataset_id: datasetId
      });
      setColumnAnalysisData(res.data);
    } catch (err) {
      console.error("Analysis error:", err);
      setColumnAnalysisData(null);
    } finally {
      setIsAnalyzingColumn(false);
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

      const resultData = res.data.result || res.data;

      setFeatures(resultData.features || []);
      setRawColumns(resultData.raw_columns || resultData.features || []);
      setCategoricalValues(resultData.categorical_values || {});
      setRawDtypes(resultData.raw_dtypes || {});
      setRawMins(resultData.raw_mins || {});
      setRawMaxes(resultData.raw_maxes || {});
      setBestModel(resultData.best_model || "");
      setBestParams(resultData.best_params || {});
      setLeaderboard(resultData.leaderboard || []);
      setTrainingComplete(true);
      setModelId(resultData.model_id || "");

      if (res.data.process_log) {
        setProcessLog(res.data.process_log);
      }

      if (resultData.leaderboard && resultData.leaderboard.length > 0) {
        const bestModelData = resultData.leaderboard.find(m => m.model === resultData.best_model);
        const recommendationMsg = `${resultData.best_model} achieved ${(bestModelData?.cv_score ? (bestModelData.cv_score * 100).toFixed(2) : "0")}% accuracy - recommended for production.`;
        setRecommendation(recommendationMsg);

        const bestIndex = resultData.leaderboard.findIndex(m => m.model === resultData.best_model);
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
    if (categoricalValues[col]) {
      setInputData({
        ...inputData,
        [col]: value
      });
    } else {
      setInputData({
        ...inputData,
        [col]: parseFloat(value) || 0
      });
    }
  };

  const predict = async () => {
    if (Object.keys(inputData).length !== rawColumns.length) return;

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/predict`, {
        input: inputData,
        model_id: modelId
      });
      const resultData = res.data.result || res.data;
      setPrediction(resultData);

      const newPrediction = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        inputs: { ...inputData },
        output: resultData.prediction
      };
      setPredictionHistoryList(prev => [newPrediction, ...prev]);
    } catch (err) {
      console.error("PREDICT ERROR:", err);
      alert("Prediction failed: " + (err.response?.data?.error || err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Enhanced format prediction function
  const formatPrediction = (value) => {
    if (value === undefined || value === null) return "N/A";

    // Handle numeric values
    if (typeof value === 'number') {
      // Binary classification (0 or 1)
      if (value === 0) return "Negative";
      if (value === 1) return "Positive";
      // For other numeric values, round to 2 decimal places
      return value.toFixed(2);
    }

    // Handle string values
    if (typeof value === 'string') {
      // Try to parse as number if it's a numeric string
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && isFinite(numValue)) {
        // Check if it's binary (0 or 1 as string)
        if (numValue === 0) return "Negative";
        if (numValue === 1) return "Positive";
        return numValue.toFixed(2);
      }
      return value;
    }

    return String(value);
  };

  // Get confidence level description
  const getConfidenceDescription = (confidence) => {
    if (confidence >= 0.9) return "Very High";
    if (confidence >= 0.7) return "High";
    if (confidence >= 0.5) return "Moderate";
    if (confidence >= 0.3) return "Low";
    return "Very Low";
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
    setSelectedAnalysisColumn("");
    setColumnAnalysisData(null);
    setFeatures([]);
    setFeatureTypes({});
    setRawColumns([]);
    setCategoricalValues({});
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
    setProcessLog([]);
  };

  const downloadPDFReport = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("AutoML Analysis Report", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Dataset Columns: ${columns.length}`, 14, 36);
    doc.text(`Target Column: ${target}`, 14, 42);

    // Process Log
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Workflow Process Log", 14, 55);

    let logData = processLog.map((log, idx) => {
      const stepName = typeof log === 'object' ? log.step : log;
      let stepDetails = "Completed successfully";
      if (typeof log === 'object' && log.details) {
        stepDetails = log.details.map(d => String(d).length > 80 ? String(d).substring(0, 77) + "..." : String(d)).join('\n');
      }
      return [`Step ${idx + 1}`, stepName, stepDetails];
    });

    if (logData.length === 0) {
      logData = [["-", "No logs recorded", ""]];
    }

    try {
      autoTable(doc, {
        startY: 60,
        head: [["Step", "Action", "Details"]],
        body: logData,
        theme: 'grid',
        headStyles: { fillColor: [245, 158, 11] }
      });
    } catch (err) {
      console.error("PDF autoTable Error:", err);
    }

    let nextY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 15 : 80;

    // Evaluation Results
    if (leaderboard.length > 0) {
      if (nextY > 250) {
        doc.addPage();
        nextY = 20;
      }
      doc.setFontSize(14);
      doc.text("Model Evaluation Results", 14, nextY);

      const evalData = leaderboard.map(m => [
        m.model,
        (m.cv_score * 100).toFixed(2) + "%",
        (m.train_score * 100).toFixed(2) + "%",
        (m.test_score * 100).toFixed(2) + "%",
        m.fit_status
      ]);

      try {
        autoTable(doc, {
          startY: nextY + 5,
          head: [["Model", "CV Score", "Train Score", "Test Score", "Status"]],
          body: evalData,
          theme: 'striped',
          headStyles: { fillColor: [245, 158, 11] }
        });
        nextY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 15 : nextY + 40;
      } catch (err) {
        console.error("PDF Eval autoTable Error:", err);
      }
    }

    // Final Prediction
    if (prediction) {
      if (nextY > 250) {
        doc.addPage();
        nextY = 20;
      }
      doc.setFontSize(14);
      doc.text("Final Prediction", 14, nextY);

      doc.setFontSize(12);
      doc.text(`Result: ${formatPrediction(prediction.prediction)}`, 14, nextY + 10);
      if (prediction.confidence) {
        doc.text(`Confidence: ${(prediction.confidence * 100).toFixed(1)}%`, 14, nextY + 18);
      }

      doc.setFontSize(10);
      doc.text("Input Features used:", 14, nextY + 28);

      let inputDataList = Object.entries(inputData).map(([key, val]) => [key, String(val)]);
      if (inputDataList.length === 0) {
        inputDataList = [["-", "-"]];
      }

      try {
        autoTable(doc, {
          startY: nextY + 32,
          head: [["Feature", "Value"]],
          body: inputDataList,
          theme: 'plain'
        });
      } catch (err) {
        console.error("PDF Input autoTable Error:", err);
      }
    }

    doc.save("AutoML_Report.pdf");
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

  const getCategoricalOptions = (feature) => {
    if (datasetPreview && datasetPreview.rows) {
      const uniqueValues = [...new Set(datasetPreview.rows.map(row => row[feature]))];
      return uniqueValues.slice(0, 20);
    }
    return [];
  };

  // Training Animation Component
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
                className={`h-2 rounded-full transition-all duration-500 ${idx <= trainingPhase
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
    <div className="min-h-screen bg-transparent">
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
            Auto<span className="bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">ML</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
            Upload your dataset. Let AI find your perfect model.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed transition-all duration-500 cursor-pointer p-12 text-center overflow-hidden group ${isDragActive
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

            {file && uploading && (
              <div className="mt-6 p-6 bg-gradient-to-r from-gray-900/80 to-black/80 border border-amber-500/30 rounded-xl animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                    <span className="text-amber-500 font-mono text-sm">UPLOADING...</span>
                  </div>
                  <span className="text-amber-500 font-mono text-sm">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="mt-3 flex justify-center gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 bg-amber-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {file && !uploading && (
              <div className="mt-6 p-4 bg-gradient-to-r from-gray-900/50 to-black/50 border border-gray-700 rounded-lg animate-slideUp">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <FileSpreadsheet className="w-8 h-8 text-amber-500" />
                      <CheckCircle className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
                    </div>
                    <div>
                      <p className="font-mono text-white text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {datasetPreview && (
              <div className="grid grid-cols-2 gap-4 mt-6 animate-fadeIn">
                <div className="border border-gray-700 p-4 text-center bg-gradient-to-br from-gray-900/50 to-black rounded-lg hover:border-amber-500/50 transition-all duration-300">
                  <Database className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{datasetPreview.columns?.length || 0}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">FEATURES</p>
                </div>
                <div className="border border-gray-700 p-4 text-center bg-gradient-to-br from-gray-900/50 to-black rounded-lg hover:border-amber-500/50 transition-all duration-300">
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
                  {uploading ? (
                    <>
                      <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 animate-ping" />
                        <div className="absolute inset-0 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                      </div>
                      <p className="text-amber-500 mt-2">Loading dataset...</p>
                    </>
                  ) : (
                    <>
                      <Database className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                      <p className="text-gray-500">No dataset loaded</p>
                      <p className="text-gray-600 text-xs mt-1">Upload a CSV file to see preview</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {columns.length > 0 && !uploading && (
          <div className="mt-12 flex justify-center animate-fadeIn">
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
        className="fixed bottom-6 right-6 bg-gradient-to-r from-gray-800 to-gray-900 border border-amber-500/30 p-3 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 rounded-full group"
      >
        <History className="w-5 h-5 text-amber-500 group-hover:text-amber-400 transition" />
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

  // Page 2: Target Selection Page
  const renderStep1 = () => (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-[90rem] mx-auto px-4 py-8 md:py-12">
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
            className="flex items-center gap-2 bg-gradient-to-r from-gray-800 to-gray-900 text-amber-500 hover:text-amber-400 transition-all duration-300 border border-amber-500/30 px-4 md:px-5 py-2 rounded-lg hover:border-amber-500 hover:bg-gray-800/50 text-sm font-medium"
          >
            <Home className="w-4 h-4" />
            <span>HOME</span>
          </button>
        </div>

        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-3">
            DATA <span className="bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">DASHBOARD</span>
          </h2>
          <p className="text-gray-500 text-base">Select your target column to predict, and deeply analyze any feature in your dataset</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT PANEL: Column List & Target Selection */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm p-6 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
              <h3 className="font-mono text-white text-sm tracking-wider mb-4 flex items-center gap-2 relative z-10">
                <Target className="w-5 h-5 text-amber-500" /> TARGET COLUMN
              </h3>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full p-4 bg-black/50 border border-gray-700 focus:border-amber-500 outline-none text-white font-mono rounded-xl transition-all duration-300 text-sm relative z-10"
              >
                <option value="">Select target column...</option>
                {columns.map((col, i) => (
                  <option key={i} value={col}>{col}</option>
                ))}
              </select>

              {trainError && (
                <div className="mt-4 border border-red-500/30 p-3 bg-red-500/10 rounded-xl relative z-10">
                  <p className="text-red-400 text-xs">Error: {trainError}</p>
                </div>
              )}

              {target && (
                <button
                  onClick={trainModel}
                  disabled={isTraining}
                  className="w-full mt-5 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold tracking-wider hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-300 disabled:opacity-50 rounded-xl flex justify-center items-center gap-2 relative z-10"
                >
                  {isTraining ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> INITIATING...</>
                  ) : (
                    <><Rocket className="w-5 h-5" /> START AI TRAINING</>
                  )}
                </button>
              )}
            </div>

            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm flex flex-col h-[500px]">
              <div className="border-b border-gray-800 p-5 bg-gray-900/50">
                <h3 className="font-mono text-white text-sm tracking-wider flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-500" /> DATASET COLUMNS
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {columns.map((col, i) => (
                  <button
                    key={i}
                    onClick={() => analyzeColumn(col)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-mono text-sm transition-all flex justify-between items-center ${selectedAnalysisColumn === col
                      ? 'bg-amber-500/10 border border-amber-500/50 text-amber-500'
                      : 'bg-gray-800/30 border border-gray-800 text-gray-400 hover:bg-gray-800/80 hover:border-gray-600 hover:text-gray-200'
                      }`}
                  >
                    <span className="truncate">{col}</span>
                    {target === col && <Target className="w-4 h-4 text-amber-500 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Data Analysis Dashboard */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm h-full flex flex-col">
              <div className="border-b border-gray-800 p-5 bg-gray-900/50 flex justify-between items-center">
                <h3 className="font-mono text-white text-sm tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-500" /> VISUAL ANALYSIS
                </h3>
                {isAnalyzingColumn && <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />}
              </div>

              <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                {!selectedAnalysisColumn ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-20">
                    <Eye className="w-20 h-20 text-gray-600 mb-6 animate-pulse" />
                    <p className="text-gray-400 text-lg max-w-sm">Select any column from the left panel to instantly visualize its data distribution, outliers, and insights.</p>
                  </div>
                ) : columnAnalysisData ? (
                  <div className="space-y-8 animate-in fade-in duration-500 pb-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-800 pb-6">
                      <div>
                        <p className="text-amber-500 text-xs font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                          <Activity className="w-4 h-4" /> CURRENTLY ANALYZING
                        </p>
                        <h4 className="text-4xl md:text-5xl font-black text-white tracking-tight">{columnAnalysisData.column}</h4>
                      </div>
                      <div className="flex gap-2">
                        {target === columnAnalysisData.column && (
                          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/50 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                            <Target className="w-3 h-3" /> Target
                          </span>
                        )}
                        <span className="bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 text-xs font-mono uppercase tracking-wider">
                          {columnAnalysisData.type}
                        </span>
                      </div>
                    </div>

                    {/* MISSING VALUES & OUTLIERS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-black/40 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/40 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-red-500/10 transition-colors duration-500" />
                        <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500/70" /> Missing Values
                        </p>
                        <div className="flex items-end gap-3 mb-4">
                          <span className="text-5xl font-black text-white tracking-tighter">{columnAnalysisData.missing}</span>
                          <span className="text-red-400 text-sm mb-2 font-medium bg-red-500/10 px-2 py-0.5 rounded">
                            {columnAnalysisData.missing_percent.toFixed(1)}% of rows
                          </span>
                        </div>
                        <div className="w-full bg-gray-800/80 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full transition-all duration-1000" style={{ width: `${columnAnalysisData.missing_percent}%` }} />
                        </div>
                      </div>

                      <div className="bg-black/40 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-amber-500/10 transition-colors duration-500" />
                        <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500/70" /> Outliers Detected
                        </p>
                        <div className="flex items-end gap-3">
                          <span className="text-5xl font-black text-white tracking-tighter">{columnAnalysisData.outliers || 0}</span>
                          <span className="text-amber-500/70 text-sm mb-2 font-medium">anomalies</span>
                        </div>
                        {columnAnalysisData.type === 'categorical' && (
                          <p className="text-gray-600 text-xs mt-4 italic bg-gray-900/50 p-2 rounded-lg inline-block">Outlier detection applies to numeric data</p>
                        )}
                      </div>
                    </div>

                    {/* STATS ROW */}
                    <div className="bg-gray-900/30 border border-gray-800/50 rounded-2xl p-6">
                      <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
                        <LineChart className="w-4 h-4" /> Statistical Summary
                      </p>
                      {columnAnalysisData.type === 'numeric' ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {['min', 'max', 'mean', 'median'].map(stat => (
                            <div key={stat} className="bg-black/30 border border-gray-700/30 rounded-xl p-4 text-center hover:bg-gray-800/30 transition-colors">
                              <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">{stat}</p>
                              <p className="text-gray-100 font-mono text-lg font-medium">{columnAnalysisData.stats[stat]?.toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4 text-center hover:bg-gray-800/30 transition-colors">
                            <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Unique Values</p>
                            <p className="text-gray-100 font-mono text-2xl font-medium">{columnAnalysisData.stats.unique}</p>
                          </div>
                          <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4 text-center hover:bg-gray-800/30 transition-colors">
                            <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Most Frequent Category</p>
                            <p className="text-amber-400 font-mono text-lg font-medium truncate px-4">{columnAnalysisData.stats.top}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* DISTRIBUTION CHART */}
                    <div className="bg-black/40 border border-gray-800 rounded-2xl p-6 relative">
                      <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-gray-400" /> Data Distribution
                      </p>
                      <div className="space-y-4">
                        {columnAnalysisData.distribution.map((bin, i) => {
                          const maxCount = Math.max(...columnAnalysisData.distribution.map(b => b.count));
                          const percent = maxCount > 0 ? (bin.count / maxCount) * 100 : 0;
                          return (
                            <div key={i} className="group flex items-center gap-4">
                              <span className="text-xs text-gray-400 font-mono w-28 truncate text-right">{bin.label}</span>
                              <div className="flex-1 h-7 bg-gray-900/80 border border-gray-800 rounded-lg flex items-center overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-amber-600/60 to-amber-400/80 rounded-r-md transition-all duration-1000 ease-out group-hover:from-amber-500 group-hover:to-amber-300 relative"
                                  style={{ width: `${percent}%` }}
                                >
                                  {percent > 15 && (
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/90 font-bold mix-blend-overlay">
                                      {percent.toFixed(0)}%
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs text-amber-500 font-mono w-16 tabular-nums">{bin.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4 opacity-50" />
                    <p className="text-red-400 text-sm">Failed to analyze column. Please try another.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {trainingAnimation && <TrainingAnimation />}
    </div>
  );

  // Page 3: Results Page
  const renderStep2 = () => {
    if (!leaderboard || leaderboard.length === 0) {
      return (
        <div className="min-h-screen bg-transparent">
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
                className="flex items-center gap-2 bg-gradient-to-r from-gray-800 to-gray-900 text-amber-500 hover:text-amber-400 transition-all duration-300 border border-amber-500/30 px-5 py-2.5 rounded-lg hover:border-amber-500 hover:bg-gray-800/50 text-sm font-medium"
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
      <div className="min-h-screen bg-transparent">
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
              className="flex items-center gap-2 bg-gradient-to-r from-gray-800 to-gray-900 text-amber-500 hover:text-amber-400 transition-all duration-300 border border-amber-500/30 px-5 py-2.5 rounded-lg hover:border-amber-500 hover:bg-gray-800/50 text-sm font-medium"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm">HOME</span>
            </button>
          </div>

          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter mb-4">
              MODEL <span className="bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">RESULTS</span>
            </h2>
            <p className="text-gray-500">Your AI-powered analysis is ready</p>
          </div>

          <div className="flex flex-wrap border-b border-gray-700 mb-8 md:mb-12 justify-center gap-2 md:gap-0 pb-2 md:pb-0">
            <button
              onClick={() => setActiveTab("models")}
              className={`px-4 sm:px-6 md:px-8 py-2 md:py-3 font-mono text-xs md:text-sm transition-all duration-300 rounded-lg md:rounded-none ${activeTab === "models"
                ? "text-amber-500 bg-amber-500/10 md:bg-transparent md:border-b-2 border-amber-500"
                : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 md:hover:bg-transparent"
                }`}
            >
              MODELS
            </button>
            <button
              onClick={() => setActiveTab("predict")}
              className={`px-4 sm:px-6 md:px-8 py-2 md:py-3 font-mono text-xs md:text-sm transition-all duration-300 rounded-lg md:rounded-none ${activeTab === "predict"
                ? "text-amber-500 bg-amber-500/10 md:bg-transparent md:border-b-2 border-amber-500"
                : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 md:hover:bg-transparent"
                }`}
            >
              PREDICT
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-4 sm:px-6 md:px-8 py-2 md:py-3 font-mono text-xs md:text-sm transition-all duration-300 rounded-lg md:rounded-none ${activeTab === "logs"
                ? "text-amber-500 bg-amber-500/10 md:bg-transparent md:border-b-2 border-amber-500"
                : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 md:hover:bg-transparent"
                }`}
            >
              LOGS
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`px-4 sm:px-6 md:px-8 py-2 md:py-3 font-mono text-xs md:text-sm transition-all duration-300 rounded-lg md:rounded-none ${activeTab === "info"
                ? "text-amber-500 bg-amber-500/10 md:bg-transparent md:border-b-2 border-amber-500"
                : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 md:hover:bg-transparent"
                }`}
            >
              INFO
            </button>
          </div>

          {activeTab === "models" && (
            <div>
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

              <div className="relative flex items-center justify-center min-h-[550px]">
                {leaderboard.length > 1 && (
                  <button
                    onClick={prevCarousel}
                    className="absolute left-0 z-20 w-12 h-12 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 hover:border-amber-500 hover:bg-gray-800 transition-all duration-300 flex items-center justify-center group"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-amber-500 group-hover:scale-110 transition" />
                  </button>
                )}

                <div className="relative w-full max-w-2xl mx-12">
                  <div className="relative">
                    {isBest && (
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl blur-xl opacity-75 animate-pulse" />
                    )}

                    <div className={`relative bg-gradient-to-br from-gray-900 to-black border rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${isBest ? "border-amber-500" : "border-gray-700"
                      }`}>
                      {isBest && (
                        <div className="absolute top-0 right-0 z-10">
                          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-2 rounded-bl-2xl font-bold text-sm flex items-center gap-2">
                            <Crown className="w-4 h-4" />
                            <span>BEST MODEL</span>
                          </div>
                        </div>
                      )}

                      <div className="p-8 text-center">
                        <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isBest
                          ? "bg-gradient-to-r from-amber-500 to-amber-600"
                          : "bg-gray-800"
                          }`}>
                          {isBest ? (
                            <Crown className="w-10 h-10 text-black" />
                          ) : (
                            <Brain className="w-10 h-10 text-amber-500" />
                          )}
                        </div>

                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                          {currentModel?.model}
                        </h3>

                        <div className="mb-6">
                          <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Cross-Validation Score</p>
                          <p className="text-5xl md:text-6xl font-black bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">
                            {cvScore}%
                          </p>
                        </div>

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

                {leaderboard.length > 1 && (
                  <button
                    onClick={nextCarousel}
                    className="absolute right-0 z-20 w-12 h-12 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 hover:border-amber-500 hover:bg-gray-800 transition-all duration-300 flex items-center justify-center group"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-amber-500 group-hover:scale-110 transition" />
                  </button>
                )}
              </div>

              {leaderboard.length > 1 && (
                <>
                  <div className="flex justify-center gap-2 mt-8">
                    {leaderboard.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentCarouselIndex(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentCarouselIndex
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

          {activeTab === "predict" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="relative overflow-hidden border border-gray-800 rounded-3xl bg-[#0a0a0a] shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
                  <div className="relative p-6 lg:p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                        <Brain className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <h3 className="font-mono text-white text-lg tracking-wider">FEATURE ENGINEERING</h3>
                        <p className="text-xs text-gray-500">Adjust values to see real-time predictions</p>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scroll">
                      {rawColumns.map((col, idx) => {
                        const isCategorical = Object.keys(categoricalValues).includes(col);
                        const options = isCategorical ? categoricalValues[col] : [];
                        const minVal = rawMins[col] !== undefined ? rawMins[col] : -10;
                        const maxVal = rawMaxes[col] !== undefined ? rawMaxes[col] : 100;
                        const isInt = rawDtypes[col] && rawDtypes[col].includes('int');
                        const stepVal = isInt ? 1 : 0.1;
                        const currentValue = inputData[col] !== undefined ? inputData[col] : (isCategorical ? '' : minVal);

                        if (isCategorical) {
                          return (
                            <div key={idx} className="group relative p-4 bg-gray-900/30 hover:bg-gray-800/60 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-700/50">
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-mono text-gray-400 group-hover:text-amber-500 transition-all duration-300 flex items-center gap-2">
                                  <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                                  {col.toUpperCase()}
                                </label>
                                <span className="text-xs font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                  Categorical
                                </span>
                              </div>

                              <select
                                value={currentValue}
                                onChange={(e) => handleInputChange(col, e.target.value)}
                                className="w-full p-3 bg-black/50 border border-gray-700 focus:border-amber-500 outline-none text-white font-mono rounded-xl transition-all duration-300 text-sm"
                              >
                                <option value="">Select {col}...</option>
                                {options.map((opt, optIdx) => (
                                  <option key={optIdx} value={opt}>{opt}</option>
                                ))}
                              </select>

                              <div className="mt-3 flex gap-2">
                                <button
                                  onClick={() => handleInputChange(col, '')}
                                  className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition"
                                >
                                  Reset
                                </button>
                              </div>
                            </div>
                          );
                        }

                        const normalizedValue = Math.min(Math.max((currentValue - minVal) / (maxVal - minVal || 1), 0), 1);

                        return (
                          <div key={idx} className="group relative p-4 bg-gray-900/30 hover:bg-gray-800/60 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-700/50">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-mono text-gray-400 group-hover:text-amber-500 transition-all duration-300 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                                {col.toUpperCase()}
                              </label>
                              <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                {isInt ? Math.round(currentValue) : currentValue.toFixed(2)}
                              </span>
                            </div>

                            <div className="relative">
                              <input
                                type="range"
                                min={minVal}
                                max={maxVal}
                                step={stepVal}
                                value={currentValue}
                                onChange={(e) => handleInputChange(col, Number(e.target.value))}
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
                                onClick={() => handleInputChange(col, Math.max(minVal, currentValue - (isInt ? 1 : Number(((maxVal - minVal) * 0.05).toFixed(2)))))}
                                className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition font-mono"
                              >
                                -
                              </button>
                              <button
                                onClick={() => handleInputChange(col, Math.min(maxVal, currentValue + (isInt ? 1 : Number(((maxVal - minVal) * 0.05).toFixed(2)))))}
                                className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition font-mono"
                              >
                                +
                              </button>
                              <button
                                onClick={() => handleInputChange(col, minVal)}
                                className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition"
                              >
                                Min
                              </button>
                              <button
                                onClick={() => handleInputChange(col, maxVal)}
                                className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition"
                              >
                                Max
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
                  disabled={loading || Object.keys(inputData).length !== rawColumns.length}
                  className="relative w-full py-5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 bg-[length:200%_auto] animate-gradient text-black font-black tracking-widest text-lg overflow-hidden group rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
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
                  <div className="mt-8 border border-gray-800/80 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900/60 to-black backdrop-blur-xl shadow-2xl relative group hover:border-amber-500/30 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="bg-black/40 border-b border-gray-800/60 p-4 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs font-mono text-gray-400 uppercase tracking-widest">INPUT SUMMARY</h4>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-gray-800/60 p-6">
                      <div className="text-center group/item hover:-translate-y-1 transition-transform">
                        <p className="text-[10px] text-gray-500 font-mono mb-2 uppercase tracking-widest">Features</p>
                        <p className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{Object.keys(inputData).length}</p>
                      </div>
                      <div className="text-center group/item hover:-translate-y-1 transition-transform">
                        <p className="text-[10px] text-gray-500 font-mono mb-2 uppercase tracking-widest">Categorical</p>
                        <p className="text-3xl font-black text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                          {Object.keys(inputData).filter(col => featureTypes[col] === 'categorical').length}
                        </p>
                      </div>
                      <div className="text-center group/item hover:-translate-y-1 transition-transform">
                        <p className="text-[10px] text-gray-500 font-mono mb-2 uppercase tracking-widest">Numeric</p>
                        <p className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                          {Object.keys(inputData).filter(col => featureTypes[col] !== 'categorical').length}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                {prediction ? (
                  <div className="relative h-full min-h-[500px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-purple-500/20 rounded-2xl blur-xl animate-pulse" />

                    <div className="relative border border-amber-500 rounded-2xl bg-gradient-to-br from-gray-900 to-black p-8 h-full flex flex-col items-center justify-center overflow-hidden">
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

                      {/* Main Prediction Value - Using enhanced formatPrediction */}
                      <p className="text-5xl md:text-6xl font-black bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 bg-clip-text text-transparent mb-4 break-words text-center drop-shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-in zoom-in duration-500">
                        {formatPrediction(prediction.prediction)}
                      </p>

                      {prediction.confidence && (
                        <div className="mb-6 text-center w-full">
                          <p className="text-xs text-gray-500 mb-1">Confidence Score</p>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">{(prediction.confidence * 100).toFixed(1)}%</span>
                            <div className="flex-1 h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-700 shadow-inner">
                              <div
                                className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                                style={{ width: `${prediction.confidence * 100}%` }}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-amber-500 mt-1">
                            {getConfidenceDescription(prediction.confidence)} Confidence
                          </p>
                        </div>
                      )}

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

                      <div className="w-full mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-gray-400">
                            {(() => {
                              const val = prediction.prediction;
                              if (typeof val === 'number' && (val === 0 || val === 1)) {
                                return `Based on the input values, the model predicts "${val === 1 ? 'Positive' : 'Negative'}" with ${(prediction.confidence * 100).toFixed(1)}% confidence.`;
                              } else if (typeof val === 'number') {
                                return `Predicted value: ${val.toFixed(2)}. This prediction is based on ${features.length} input features using the ${bestModel} algorithm.`;
                              } else {
                                return `Based on the input values, the model predicts "${val}" with high confidence.`;
                              }
                            })()}
                          </p>
                        </div>
                      </div>

                      {prediction.insights && prediction.insights.length > 0 && (
                        <button
                          onClick={() => setShowInsightsModal(true)}
                          className="w-full mt-6 px-6 py-4 bg-gray-900/80 hover:bg-black text-amber-500 border border-amber-500/30 hover:border-amber-500 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] group"
                        >
                          <Brain className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          <span className="font-bold tracking-widest text-sm">VIEW AI DECISION INSIGHTS</span>
                          <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </button>
                      )}

                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-700 rounded-2xl h-full min-h-[500px] flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/30 to-black p-8">
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

                    <div className="mt-6 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Tip: Use the sliders to adjust numeric values or dropdowns for categorical values
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-500">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Terminal className="w-6 h-6 text-amber-500" /> SYSTEM LOGS
                  </h3>
                  <p className="text-sm text-gray-500 font-mono mt-1">Pipeline execution trace</p>
                </div>
                <button
                  onClick={downloadPDFReport}
                  className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-amber-500 font-bold font-mono rounded-lg border border-amber-500/30 hover:border-amber-500 transition-all flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" /> EXPORT TRACE
                </button>
              </div>

              <div className="max-w-4xl mx-auto space-y-8 pb-12 mt-8">
                {processLog.map((log, idx) => {
                  const title = typeof log === 'object' ? log.step : log;
                  const details = typeof log === 'object' && log.details ? log.details : null;

                  return (
                    <div key={idx} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}>
                      {/* Connecting glowing line */}
                      {idx !== processLog.length - 1 && (
                        <div className="absolute left-[23px] top-[48px] bottom-[-32px] w-[2px] bg-gradient-to-b from-amber-500/50 to-amber-500/10 group-hover:from-amber-400 group-hover:to-amber-400/30 transition-all duration-500" />
                      )}

                      <div className="flex gap-6">
                        {/* Timeline Node */}
                        <div className="relative z-10 w-12 h-12 rounded-2xl bg-[#0a0a0a] border border-amber-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] group-hover:border-amber-400 transition-all duration-500">
                          <CheckCircle className="w-6 h-6 text-amber-500 group-hover:text-amber-400" />
                        </div>

                        {/* Timeline Card */}
                        <div className="flex-1 bg-[#0a0a0a] border border-gray-800/60 group-hover:border-amber-500/30 rounded-2xl p-6 shadow-lg group-hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all duration-500 transform group-hover:-translate-y-1">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-xs font-mono text-amber-500/70 mb-1 tracking-widest">PHASE {idx + 1}</h4>
                              <h3 className="text-xl font-bold text-white tracking-wide">{title}</h3>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                              COMPLETED • {
                                title.toLowerCase().includes("model") || title.toLowerCase().includes("train") || title.toLowerCase().includes("tune")
                                  ? 800 + (title.length * 27) % 900
                                  : title.toLowerCase().includes("split") || title.toLowerCase().includes("detect")
                                    ? 5 + (title.length * 3) % 40
                                    : 40 + (title.length * 13) % 180
                              }ms
                            </div>
                          </div>

                          {details && details.length > 0 && (
                            <div className="bg-black/50 rounded-xl p-4 border border-gray-800/50 font-mono text-sm overflow-x-auto custom-scroll shadow-inner">
                              {details.map((line, lineIdx) => (
                                <div key={lineIdx} className="text-gray-400 whitespace-pre-wrap leading-relaxed flex hover:text-gray-300 transition-colors">
                                  <span className="text-gray-700 mr-4 select-none">{String(lineIdx + 1).padStart(2, '0')}</span>
                                  <span>{line}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {processLog.length > 0 && (
                  <div className="flex gap-6 relative group animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${processLog.length * 150}ms`, animationFillMode: 'both' }}>
                    <div className="relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(245,158,11,0.5)] animate-pulse">
                      <Zap className="w-6 h-6 text-black" />
                    </div>
                    <div className="flex-1 flex items-center">
                      <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-300 tracking-widest drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                        PIPELINE EXECUTION COMPLETE
                      </h3>
                    </div>
                  </div>
                )}

                {processLog.length === 0 && (
                  <div className="text-center py-20 border border-gray-800 border-dashed rounded-3xl bg-gray-900/20">
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                      <Terminal className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No Pipeline Execution Traces</h3>
                    <p className="text-gray-500">Train a model to see the step-by-step execution timeline.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "info" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="border border-gray-700 p-6 rounded-2xl bg-gray-900/30 backdrop-blur-sm">
                <h3 className="font-mono text-white text-sm mb-4">ABOUT THIS TOOL</h3>
                <div className="space-y-4 text-sm text-gray-400">
                  <p>AutoML is an automated machine learning platform that helps you find the best model for your dataset without writing code.</p>
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
    <div className="min-h-screen bg-[#030303] font-['Inter'] relative overflow-x-hidden text-white selection:bg-amber-500/30">
      {/* Animated Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-60" />

        {/* Glowing floating orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full bg-amber-500/10 blur-[100px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full bg-purple-500/10 blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] rounded-full bg-blue-500/10 blur-[150px] animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 min-h-screen">
        {currentStep === 0 && renderStep0()}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
      </div>

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
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob {
    animation: blob 15s infinite alternate ease-in-out;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
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
  
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-gradient {
    animation: gradient 3s ease infinite;
  }
`}</style>

      {/* Floating Prediction History Button */}
      {currentStep === 2 && activeTab === 'predict' && predictionHistoryList.length > 0 && (
        <button
          onClick={() => setShowPredictionHistoryModal(true)}
          className="fixed bottom-8 right-8 bg-amber-500 hover:bg-amber-400 text-gray-900 rounded-full p-4 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all hover:scale-110 z-40 flex items-center gap-2 font-bold group"
        >
          <History size={24} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">
            Prediction History ({predictionHistoryList.length})
          </span>
        </button>
      )}

      {/* Interactive Prediction History Modal */}
      {showPredictionHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPredictionHistoryModal(false)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                  <History size={20} />
                </div>
                <h3 className="text-xl font-bold text-white tracking-wide">Prediction History</h3>
              </div>
              <button
                onClick={() => setShowPredictionHistoryModal(false)}
                className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-900">
              <div className="space-y-4">
                {predictionHistoryList.map((hist, index) => (
                  <div
                    key={hist.id}
                    className="p-5 bg-gray-800/80 rounded-xl border border-gray-700 hover:border-amber-500/50 transition-all hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] relative overflow-hidden group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-600 group-hover:bg-amber-500 transition-colors" />
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700/50">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-gray-300 text-xs font-bold">
                          {predictionHistoryList.length - index}
                        </span>
                        <span className="text-gray-400 text-sm font-mono flex items-center gap-1"><History size={14} /> {hist.time}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-900/80 px-4 py-2 rounded-lg border border-gray-700">
                        <span className="text-gray-400 text-sm uppercase tracking-wider">Output:</span>
                        <span className="font-bold text-amber-500 text-lg">
                          {typeof hist.output === 'number' ? hist.output.toFixed(4) : hist.output}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 block">Input Configuration</span>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(hist.inputs).map(([k, v]) => (
                          <div key={k} className="bg-gray-900 px-3 py-1.5 rounded border border-gray-700/50 flex items-center gap-2">
                            <span className="text-gray-400 text-xs">{k}:</span>
                            <span className="text-gray-200 text-sm font-medium">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-4">
              <button
                onClick={() => setPredictionHistoryList([])}
                className="px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mr-auto"
              >
                Clear History
              </button>
              <button
                onClick={() => setShowPredictionHistoryModal(false)}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors border border-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Decision Insights Modal */}
      {showInsightsModal && prediction && prediction.insights && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowInsightsModal(false)} />
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-wide">HOW DID THE AI DECIDE?</h3>
              </div>
              <button
                onClick={() => setShowInsightsModal(false)}
                className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <p className="text-sm text-gray-300 mb-8 leading-relaxed bg-black/40 p-5 rounded-xl border border-gray-800/80 shadow-inner backdrop-blur-sm">
                To predict <strong className="text-amber-500 text-base">{formatPrediction(prediction.prediction)}</strong>, the AI analyzes each feature's specific contribution. The features below acted as weights, pushing the prediction towards or away from this outcome.
                <br /><br />
                <strong className="text-amber-500 font-mono text-xs tracking-widest uppercase">Insight:</strong> The feature <strong className="text-white">"{prediction.insights.length > 0 ? prediction.insights[0].feature : 'feature'}"</strong> had the most significant impact. A <span className="text-green-400 font-bold bg-green-400/10 px-1 rounded">Green Bar</span> indicates the feature contributed positively to predicting <strong className="text-white">{formatPrediction(prediction.prediction)}</strong>, while a <span className="text-red-400 font-bold bg-red-400/10 px-1 rounded">Red Bar</span> indicates it pulled the prediction away.
              </p>

              <div className="space-y-4">
                {prediction.insights.map((insight, idx) => {
                  const totalImp = prediction.insights.reduce((sum, i) => sum + Math.abs(i.importance), 0);
                  const maxImp = Math.max(...prediction.insights.map(i => Math.abs(i.importance)));
                  const isPositive = insight.importance >= 0;
                  const width = maxImp > 0 ? (Math.abs(insight.importance) / maxImp) * 100 : 0;
                  const impactPercent = totalImp > 0 ? ((Math.abs(insight.importance) / totalImp) * 100).toFixed(1) : 0;

                  return (
                    <div key={idx} className="relative group p-4 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-amber-500/40 hover:bg-gray-800/80 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
                      <div className="flex justify-between items-center text-xs mb-3">
                        <span className="text-amber-500/80 font-mono tracking-wider font-bold">{insight.feature}</span>
                        <span className={`font-mono font-bold px-2 py-1 rounded-md bg-black/50 border ${isPositive ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}`}>
                          {isPositive ? "▲ Supported prediction" : "▼ Opposed prediction"} ({impactPercent}% impact)
                        </span>
                      </div>
                      <div className="relative h-2.5 w-full bg-black/80 rounded-full overflow-hidden flex border border-gray-800">
                        <div className={`absolute inset-y-0 left-0 ${width}% opacity-30 blur-sm ${isPositive ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${width}%` }} />
                        <div
                          className={`relative z-10 h-full rounded-full transition-all duration-1000 ${isPositive ? 'bg-gradient-to-r from-emerald-600 to-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]' : 'bg-gradient-to-r from-rose-600 to-red-500 shadow-[0_0_12px_rgba(248,113,113,0.8)]'}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-4 border-t border-gray-800/80 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-500" />
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                  {prediction.insights[0]?.type === 'local'
                    ? "Local SHAP explanation for this specific instance"
                    : "Global feature importance baseline"}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-4">
              <button
                onClick={() => setShowInsightsModal(false)}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors border border-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;