import React from 'react';
import { Brain, MessageCircle, TrendingUp, Target, Activity, Lightbulb } from 'lucide-react';

const AIHealthAssistant = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">AI Health Assistant</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Online</span>
          </div>
        </div>
        
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-300 mb-2">AI-Powered Health Insights</h4>
          <p className="text-gray-400 mb-6">Get personalized health recommendations and answers to your questions</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Lightbulb className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h5 className="font-semibold text-white mb-2">Health Tips</h5>
              <p className="text-sm text-gray-400">Personalized recommendations based on your health data</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h5 className="font-semibold text-white mb-2">Trend Analysis</h5>
              <p className="text-sm text-gray-400">Track your health progress over time</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Target className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h5 className="font-semibold text-white mb-2">Goal Setting</h5>
              <p className="text-sm text-gray-400">Set and achieve your health goals</p>
            </div>
          </div>

          <button className="bg-gradient-to-r from-purple-400 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
            <MessageCircle className="w-5 h-5 inline mr-2" />
            Start Chat with AI Assistant
          </button>
        </div>
      </div>

      {/* Quick Health Insights */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h4 className="text-xl font-semibold mb-6">Your Health Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center mb-3">
              <Activity className="w-6 h-6 text-blue-400 mr-3" />
              <h5 className="font-semibold text-white">Health Score</h5>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">85/100</div>
            <p className="text-sm text-gray-400">Your overall health is looking good! Keep up the great work with your medications and regular check-ups.</p>
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
            <div className="flex items-center mb-3">
              <Target className="w-6 h-6 text-green-400 mr-3" />
              <h5 className="font-semibold text-white">Next Goal</h5>
            </div>
            <div className="text-lg font-bold text-green-400 mb-2">Regular Exercise</div>
            <p className="text-sm text-gray-400">Consider adding 30 minutes of walking to your daily routine to improve cardiovascular health.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIHealthAssistant;