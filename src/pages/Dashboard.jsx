import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Dumbbell, Trophy, ArrowRight } from "lucide-react";
import API from "../config/axios";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if(!token){
      window.location.href = "/";
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get current day name
  const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });

  useEffect(() => {
    const fetchTodayRoutine = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await API.get("/routines/today");
        setRoutine(data);
      } catch (err) {
        console.error("Error fetching routine:", err);
        // If 404 or no routine found, set routine to null
        setRoutine(null);
        if (err.response && err.response.status !== 404) {
          setError(err.response?.data?.message || "Failed to load today's routine");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTodayRoutine();
  }, [dayName]);

  const handleSetChange = (exerciseIdx, setIdx, field, value) => {
    setRoutine(prev => {
        const newExercises = [...prev.exercises];
        const newSets = [...newExercises[exerciseIdx].sets];
        newSets[setIdx] = { ...newSets[setIdx], [field]: Number(value) };
        newExercises[exerciseIdx] = { ...newExercises[exerciseIdx], sets: newSets };
        return { ...prev, exercises: newExercises };
    });
  };

  const toggleWorkout = (index) => {
    setRoutine(prev => {
        const newExercises = [...prev.exercises];
        newExercises[index] = { ...newExercises[index], completed: !newExercises[index].completed };
        return { ...prev, exercises: newExercises };
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 font-outfit">
      {/* Header */}
      <header className="flex justify-between items-center gap-4 mb-8 sm:mb-12">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Welcome back, <span className="text-primary">{user?.name?.split(" ")[0] || "User"}</span>!
          </h1>
          <p className="text-gray-500 mt-1 text-xs sm:text-sm">Track your sets, reps and progress.</p>
        </div>

        {/* Profile Badge */}
        <div className="group relative flex items-center gap-3 cursor-pointer shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-700">{user?.name || "Fitness User"}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.email || "user@example.com"}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg transform transition-transform group-hover:scale-105">
            {getInitials(user?.name)}
          </div>
        </div>
      </header>

      {/* Current Day Section */}
      <section className="mb-12">
        <div className="panel-glass overflow-hidden relative border-none shadow-sm p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full -ml-24 -mb-24 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Today's Focus</h2>
                    <p className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">{formatDate(currentDate)}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {routine?.targetMuscle?.map((muscle, idx) => (
                            <span key={idx} className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                                {muscle}
                            </span>
                        ))}
                    </div>
                </div>
                {routine && (
                  <div className="text-left sm:text-right">
                      <p className="text-sm text-gray-400 font-medium">Daily Progress</p>
                      <div className="flex items-center gap-4 mt-1">
                          <div className="w-32 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                              <div 
                                  className="h-full bg-primary transition-all duration-700" 
                                  style={{ width: `${(routine?.exercises?.filter(e => e.completed).length / routine?.exercises?.length * 100) || 0}%` }}
                              ></div>
                          </div>
                          <span className="text-lg font-bold text-gray-800">
                              {routine?.exercises?.filter(e => e.completed).length || 0}/{routine?.exercises?.length || 0}
                          </span>
                      </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </section>

      {/* Daily Workout Routine */}
      {!routine ? (
        <section className="max-w-5xl py-12 sm:py-20 text-center panel-glass border-none shadow-sm flex flex-col items-center animate-slide-in">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6">
            <Dumbbell className="w-8 h-8 sm:w-10 sm:h-10 text-gray-200" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">No routine created for today</h2>
          <p className="text-gray-400 max-w-sm mb-8 sm:mb-10 text-sm sm:text-base">Rest days are just as important as training days. Or, you can plan a new workout now.</p>
          <Link 
            to="/routine" 
            className="flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all text-sm sm:text-base"
          >
            Go to Routines
            <ArrowRight size={20} />
          </Link>
        </section>
      ) : (
        <section className="max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-outfit">{routine?.RoutineName}</h2>
              <p className="text-gray-500 text-xs sm:text-sm">Tap on weight or reps to edit your performance</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
              <span className="px-4 py-1.5 bg-white rounded-full text-xs font-bold text-primary shadow-sm border border-gray-100 sm:order-last">
                  {dayName}
              </span>
              <button className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all active:translate-y-0 flex-1 sm:flex-none text-sm sm:text-base">
                  Save Progress
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {routine?.exercises?.map((exercise, idx) => (
              <div 
                key={idx} 
                className={`panel-glass !p-0 overflow-hidden transition-all duration-300 border-none shadow-md hover:shadow-xl ${
                  exercise.completed ? "opacity-75 grayscale-[0.5]" : "bg-white"
                }`}
              >
                {/* Exercise Header */}
                <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between bg-white gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl shrink-0 ${
                          exercise.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                      }`}>
                          {idx + 1}
                      </div>
                      <div>
                          <h3 className={`text-lg sm:text-xl font-bold ${exercise.completed ? "text-gray-400 line-through" : "text-gray-800"}`}>
                              {exercise.exerciseId?.name || "Exercise"}
                          </h3>
                          <p className="text-xs text-gray-400 font-medium">{exercise.sets.length} Sets Total</p>
                      </div>
                  </div>
                  
                  <button 
                      onClick={() => toggleWorkout(idx)}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all w-full sm:w-auto ${
                          exercise.completed 
                          ? "bg-green-500 text-white shadow-lg shadow-green-200" 
                          : "bg-gray-50 text-gray-400 hover:bg-primary/10 hover:text-primary"
                      }`}
                  >
                      {exercise.completed ? (
                          <>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Done
                          </>
                      ) : "Mark as Done"}
                  </button>
                </div>

                {/* Sets Table */}
                <div className="bg-gray-50/30 p-3 sm:p-6">
                  <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center mb-4 px-2 sm:px-4">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">Set</span>
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">Weight (kg)</span>
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">Reps</span>
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</span>
                  </div>
                  <div className="space-y-2">
                      {exercise.sets.map((set, sIdx) => (
                          <div key={sIdx} className="grid grid-cols-4 gap-2 sm:gap-4 p-2 sm:p-4 bg-white rounded-xl shadow-sm border border-gray-100 items-center text-center group/set hover:border-primary/30 transition-all">
                              <span className="font-bold text-gray-700 text-sm sm:text-base"># {set.sets}</span>
                              <div className="relative flex justify-center">
                                  <input 
                                      type="number" 
                                      value={set.weight}
                                      onChange={(e) => handleSetChange(idx, sIdx, "weight", e.target.value)}
                                      className="w-full max-w-[3.5rem] sm:max-w-[5rem] text-center bg-gray-50 border border-transparent hover:border-gray-200 focus:border-primary focus:bg-white rounded-lg py-1 font-bold text-primary outline-none transition-all text-sm sm:text-base"
                                  />
                              </div>
                              <div className="relative flex justify-center">
                                  <input 
                                      type="number" 
                                      value={set.reps}
                                      onChange={(e) => handleSetChange(idx, sIdx, "reps", e.target.value)}
                                      className="w-full max-w-[3.5rem] sm:max-w-[5rem] text-center bg-gray-50 border border-transparent hover:border-gray-200 focus:border-primary focus:bg-white rounded-lg py-1 font-bold text-gray-800 outline-none transition-all text-sm sm:text-base"
                                  />
                              </div>
                              <div className="flex justify-center">
                                  <div className={`w-3 h-3 rounded-full transition-all ${exercise.completed ? 'bg-green-500 shadow-sm shadow-green-200' : 'bg-gray-200'}`}></div>
                              </div>
                          </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
