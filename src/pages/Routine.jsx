import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, Dumbbell, Save, ChevronRight, CheckCircle2, 
  Clock, List, ArrowLeft, Search, X, ChevronLeft, Target, 
  Calendar, Pencil, Check, Sparkles 
} from "lucide-react";
import API from "../config/axios";

const Routine = () => {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [routineName, setRoutineName] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [targetMuscles, setTargetMuscles] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [fetchingExercises, setFetchingExercises] = useState(false);

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiForm, setAiForm] = useState({
    age: "",
    gender: "Male",
    height: "",
    weight: ""
  });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const musclesList = ["Chest", "Shoulders", "Back", "Legs", "Biceps", "Triceps", "Abs"];

  useEffect(() => {
    fetchRoutines();
  }, []);

  useEffect(() => {
    if (step === 4 && targetMuscles.length > 0) {
      fetchExercisesByMuscles();
    }
  }, [step, targetMuscles]);

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      const data = await API.get("/routines");
      setRoutines(data);
    } catch (error) {
      console.error("Error fetching routines:", error);
      setRoutines([
        { _id: "1", RoutineName: "Morning Push", day: "Monday", targetMuscle: ["Chest", "Triceps"], exercises: [{}, {}] },
        { _id: "2", RoutineName: "Back & Biceps", day: "Tuesday", targetMuscle: ["Back", "Biceps"], exercises: [{}] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExercisesByMuscles = async () => {
    try {
      setFetchingExercises(true);
      const data = await API.get(`/exercises/by-muscle?muscles=${targetMuscles.join(",")}`);
      setAvailableExercises(data);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      setAvailableExercises([
        { _id: "ex1", name: "Bench Press", targetMuscle: "Chest" },
        { _id: "ex2", name: "Push Ups", targetMuscle: "Chest" },
        { _id: "ex3", name: "Shoulder Press", targetMuscle: "Shoulders" },
      ].filter(e => targetMuscles.includes(e.targetMuscle)));
    } finally {
      setFetchingExercises(false);
    }
  };

  const toggleMuscle = (muscle) => {
    if (targetMuscles.includes(muscle)) {
      setTargetMuscles(targetMuscles.filter((m) => m !== muscle));
    } else {
      setTargetMuscles([...targetMuscles, muscle]);
    }
  };

  const addExercise = (template) => {
    if (exercises.some(ex => ex.exerciseId === template._id)) return;
    setExercises([
      ...exercises,
      {
        exerciseId: template._id,
        name: template.name,
        sets: [{ sets: 1, weight: 0, reps: 0 }],
      },
    ]);
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter((ex) => ex.exerciseId !== id));
  };

  const addSet = (exIdx) => {
    const updatedExercises = [...exercises];
    const lastSet = updatedExercises[exIdx].sets[updatedExercises[exIdx].sets.length - 1];
    updatedExercises[exIdx].sets.push({
      sets: updatedExercises[exIdx].sets.length + 1,
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 0,
    });
    setExercises(updatedExercises);
  };

  const handleSetChange = (exIdx, setIdx, field, value) => {
    const updatedExercises = [...exercises];
    updatedExercises[exIdx].sets[setIdx][field] = Number(value);
    setExercises(updatedExercises);
  };

  const handleSaveRoutine = async () => {
    try {
      const routineData = {
        RoutineName: routineName,
        day: selectedDay,
        targetMuscle: targetMuscles,
        exercises: exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets
        }))
      };
      
      if (editingId) {
        await API.put(`/routines/${editingId}`, routineData);
      } else {
        await API.post("/routines", routineData);
      }
      
      fetchRoutines();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving routine:", error);
      alert("Failed to save routine.");
    }
  };

  const handleGenerateAI = async () => {
    try {
      if (!aiForm.age || !aiForm.height || !aiForm.weight) {
        alert("Please fill all fields for AI Generation");
        return;
      }
      setIsGenerating(true);
      await API.post("/routines/generate-ai", aiForm);
      await fetchRoutines();
      setIsAiModalOpen(false);
      setAiForm({ age: "", gender: "Male", height: "", weight: "" });
    } catch (error) {
      console.error("Error generating AI routine:", error);
      alert("Failed to generate routine with AI. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditRoutine = (routine) => {
    setEditingId(routine._id);
    setRoutineName(routine.RoutineName);
    setSelectedDay(routine.day);
    setTargetMuscles(routine.targetMuscle);
    setExercises(routine.exercises.map(ex => ({
      exerciseId: ex.exerciseId?._id || ex.exerciseId,
      name: ex.exerciseId?.name || "Exercise",
      sets: ex.sets
    })));
    setStep(1);
    setIsModalOpen(true);
  };

  const handleDeleteRoutine = async (id) => {
    if (!window.confirm("Are you sure you want to delete this routine?")) return;
    try {
      await API.delete(`/routines/${id}`);
      fetchRoutines();
    } catch (error) {
      console.error("Error deleting routine:", error);
      alert("Failed to delete routine.");
    }
  };

  const resetForm = () => {
    setStep(1);
    setRoutineName("");
    setSelectedDay("");
    setTargetMuscles([]);
    setExercises([]);
    setEditingId(null);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 font-outfit relative">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 sm:mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 font-outfit">Workout Routines</h1>
          <p className="text-gray-500 text-sm sm:font-medium">Your personalized weekly training cycles.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm sm:text-base font-bold rounded-2xl shadow-xl shadow-purple-500/20 hover:-translate-y-1 hover:shadow-2xl transition-all"
          >
            <Sparkles size={18} />
            Generate by AI
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-8 py-3.5 sm:py-4 bg-primary text-white text-sm sm:text-base font-bold rounded-2xl shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-2xl transition-all"
          >
            <Plus size={18} />
            Add Routine
          </button>
        </div>
      </header>

      {/* Routine List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : routines.length === 0 ? (
        <div className="py-20 text-center panel-glass border-none shadow-sm">
          <Dumbbell size={60} className="mx-auto text-gray-200 mb-6" />
          <h3 className="text-xl font-bold text-gray-800">No routines yet</h3>
          <p className="text-gray-400 mt-2">Create your first workout plan to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {routines.map((routine) => (
            <div key={routine._id} className="panel-glass p-6 sm:p-8 border-none shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest border border-primary/10">
                    {routine.day}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditRoutine(routine)}
                      className="p-2 text-gray-300 hover:text-primary transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteRoutine(routine._id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{routine.RoutineName}</h3>
                <div className="flex flex-wrap gap-2 mb-8">
                  {routine.targetMuscle.map((m, i) => (
                    <span key={i} className="text-[10px] font-bold text-gray-500 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
                      {m}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-gray-400">
                    <List size={16} />
                    <span className="text-xs font-bold">{routine.exercises?.length || 0} Exercises</span>
                  </div>
                  <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all shadow-sm">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Multi-step Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-4xl h-full sm:h-auto max-h-[100dvh] sm:max-h-[90vh] rounded-none sm:rounded-[2.5rem] shadow-2xl shadow-gray-900/20 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-4 sm:p-8 pt-[calc(1rem+env(safe-area-inset-top,0px))] border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                  <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Create New Routine</h2>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                    {[1, 2, 3, 4].map((s) => (
                      <div 
                        key={s} 
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          s <= step ? (s === step ? "w-6 sm:w-8 bg-primary" : "w-3 sm:w-4 bg-primary/40") : "w-3 sm:w-4 bg-gray-100"
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-10">
              {step === 1 && (
                <div className="max-w-md mx-auto py-6 sm:py-10 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center mb-6 sm:mb-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 text-primary rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <Pencil className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Routine Name</h3>
                    <p className="text-gray-500 text-sm sm:text-base">Give your workout plan a memorable name.</p>
                  </div>
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Explosive Power Push"
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl px-4 sm:px-6 py-4 sm:py-5 text-lg sm:text-xl font-bold outline-none transition-all text-center placeholder:text-gray-200"
                  />
                </div>
              )}

              {step === 2 && (
                <div className="max-w-2xl mx-auto py-6 sm:py-10 animate-in slide-in-from-right-4 duration-500">
                  <div className="text-center mb-6 sm:mb-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent/10 text-accent rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Select Day</h3>
                    <p className="text-gray-500 text-sm sm:text-base">When do you plan to perform this routine?</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {days.map((day) => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl text-sm font-bold border-2 transition-all flex flex-col items-center gap-2.5 sm:gap-3 ${
                          selectedDay === day
                            ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105"
                            : "bg-white border-gray-100 text-gray-400 hover:border-primary/30"
                        }`}
                      >
                        <Clock size={20} className={selectedDay === day ? "text-white" : "text-gray-200"} />
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="max-w-2xl mx-auto py-6 sm:py-10 animate-in slide-in-from-right-4 duration-500">
                  <div className="text-center mb-6 sm:mb-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 text-green-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <Target className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Target Muscles</h3>
                    <p className="text-gray-500 text-sm sm:text-base">Select the muscle groups you'll be training.</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                    {musclesList.map((muscle) => (
                      <button
                        key={muscle}
                        onClick={() => toggleMuscle(muscle)}
                        className={`px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold border-2 transition-all flex items-center gap-2 sm:gap-3 ${
                          targetMuscles.includes(muscle)
                            ? "bg-green-500 border-green-500 text-white shadow-xl shadow-green-200 scale-105"
                            : "bg-white border-gray-100 text-gray-400 hover:border-green-300"
                        }`}
                      >
                        {targetMuscles.includes(muscle) && <CheckCircle2 size={18} />}
                        {muscle}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 animate-in slide-in-from-right-4 duration-500">
                  {/* Exercise Browser */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gray-50 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 h-full border border-gray-100">
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-gray-400 mb-4 sm:mb-6 flex items-center gap-2">
                            <Search size={16} />
                            Available Exercises
                        </h4>
                        {fetchingExercises ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[300px] lg:max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                {availableExercises.map((ex) => {
                                    const isAdded = exercises.some(e => e.exerciseId === ex._id);
                                    return (
                                        <button
                                            key={ex._id}
                                            onClick={() => addExercise(ex)}
                                            className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all border-2 ${
                                                isAdded 
                                                ? "bg-green-50 border-green-200 text-green-700 opacity-50 cursor-not-allowed" 
                                                : "bg-white border-transparent hover:border-primary shadow-sm hover:shadow-md"
                                            }`}
                                        >
                                            <div className="text-left">
                                                <p className="text-sm font-bold">{ex.name}</p>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-300">{ex.targetMuscle}</p>
                                            </div>
                                            {isAdded ? <Check size={16} /> : <Plus size={16} className="text-primary" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                  </div>

                  {/* Routine Builder */}
                  <div className="lg:col-span-8 space-y-4">
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-gray-400 mb-2 sm:mb-4 px-2">Your Routine Build</h4>
                    {exercises.length === 0 ? (
                        <div className="py-12 sm:py-20 text-center bg-gray-50/50 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
                            <Dumbbell size={40} className="text-gray-100 mb-4" />
                            <p className="text-gray-300 font-bold text-sm sm:text-base">Add exercises from the left</p>
                        </div>
                    ) : (
                        <div className="space-y-4 pr-2 max-h-[400px] lg:max-h-[500px] overflow-y-auto scrollbar-hide">
                            {exercises.map((ex, exIdx) => (
                                <div key={ex.exerciseId} className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-left-4 duration-300">
                                    <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/50 flex justify-between items-center border-b border-gray-50">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-black text-primary shadow-sm border border-gray-100 text-xs">
                                                {exIdx + 1}
                                            </span>
                                            <h5 className="font-bold text-sm sm:text-base text-gray-800">{ex.name}</h5>
                                        </div>
                                        <button 
                                            onClick={() => removeExercise(ex.exerciseId)}
                                            className="text-red-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="p-4 sm:p-6">
                                        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 text-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Set</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Weight (kg)</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Reps</span>
                                        </div>
                                        <div className="space-y-2">
                                            {ex.sets.map((set, sIdx) => (
                                                <div key={sIdx} className="grid grid-cols-3 gap-2 sm:gap-4">
                                                    <div className="bg-gray-50 rounded-xl py-2 sm:py-3 text-center font-bold text-gray-400 text-xs sm:text-sm"># {set.sets}</div>
                                                    <input
                                                        type="number"
                                                        value={set.weight}
                                                        onChange={(e) => handleSetChange(exIdx, sIdx, "weight", e.target.value)}
                                                        className="bg-white border border-gray-100 rounded-xl py-2 sm:py-3 text-center font-bold text-primary focus:border-primary outline-none shadow-sm text-sm sm:text-base w-full no-spinner"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={set.reps}
                                                        onChange={(e) => handleSetChange(exIdx, sIdx, "reps", e.target.value)}
                                                        className="bg-white border border-gray-100 rounded-xl py-2 sm:py-3 text-center font-bold text-gray-800 focus:border-primary outline-none shadow-sm text-sm sm:text-base w-full no-spinner"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <button 
                                            onClick={() => addSet(exIdx)}
                                            className="mt-4 w-full py-2.5 sm:py-3 rounded-xl border-2 border-dashed border-gray-100 text-gray-300 font-bold hover:border-primary/20 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Plus size={14} /> Add Set
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-8 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] border-t border-gray-50 flex justify-between items-center bg-gray-50/30">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-gray-400 font-bold hover:text-gray-600 disabled:opacity-0 transition-all text-sm sm:text-base"
              >
                <ChevronLeft size={18} />
                Back
              </button>
              
              {step < 4 ? (
                <button
                  onClick={nextStep}
                  disabled={(step === 1 && !routineName) || (step === 2 && !selectedDay) || (step === 3 && targetMuscles.length === 0)}
                  className="flex items-center gap-1.5 sm:gap-2 px-6 sm:px-10 py-3 sm:py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none text-sm sm:text-base"
                >
                  Continue
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleSaveRoutine}
                  disabled={exercises.length === 0}
                  className="flex items-center gap-1.5 sm:gap-2 px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-tr from-primary to-accent text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none text-sm sm:text-base"
                >
                  <Save size={18} />
                  Save Routine
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* AI Generation Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => !isGenerating && setIsAiModalOpen(false)}
          ></div>
          
          <div className="relative bg-white w-full max-w-md rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl shadow-purple-900/20 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-4 sm:p-8 border-b border-gray-50 flex justify-between items-center bg-purple-50/50">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">AI Generator</h2>
                </div>
              </div>
              <button 
                onClick={() => !isGenerating && setIsAiModalOpen(false)}
                disabled={isGenerating}
                className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all shadow-sm disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {isGenerating ? (
              <div className="p-10 sm:p-16 flex flex-col items-center justify-center space-y-6 sm:space-y-8 min-h-[300px] sm:min-h-[400px]">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/30 animate-bounce">
                    <Dumbbell className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>
                <div className="text-center space-y-1 sm:space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Building Your Routine</h3>
                  <p className="text-gray-500 text-sm sm:text-base font-medium">Gym AI is analyzing your profile...</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            ) : (
              <>
                <div className="p-5 sm:p-8 space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      placeholder="e.g. 25"
                      value={aiForm.age}
                      onChange={(e) => setAiForm({...aiForm, age: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-xl px-4 py-2.5 sm:py-3 font-bold outline-none transition-all text-sm sm:text-base"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                    <select
                      value={aiForm.gender}
                      onChange={(e) => setAiForm({...aiForm, gender: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-xl px-4 py-2.5 sm:py-3 font-bold outline-none transition-all appearance-none text-sm sm:text-base"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Height (cm)</label>
                      <input
                        type="number"
                        placeholder="e.g. 175"
                        value={aiForm.height}
                        onChange={(e) => setAiForm({...aiForm, height: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-xl px-4 py-2.5 sm:py-3 font-bold outline-none transition-all text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        placeholder="e.g. 70"
                        value={aiForm.weight}
                        onChange={(e) => setAiForm({...aiForm, weight: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-xl px-4 py-2.5 sm:py-3 font-bold outline-none transition-all text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-8 border-t border-gray-50 bg-gray-50/30">
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGenerating || !aiForm.age || !aiForm.height || !aiForm.weight}
                    className="w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none text-sm sm:text-base"
                  >
                    <Sparkles size={20} />
                    Generate Routine
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Routine;
