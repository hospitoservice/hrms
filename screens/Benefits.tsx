import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Benefits = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Insurance', 'Professional', 'Wellness'];

  const benefits = [
    {
      id: 1,
      type: 'Insurance',
      title: 'Professional Indemnity Insurance',
      subtitle: 'Coverage up to $5M',
      icon: 'gavel',
      status: 'Active',
      statusColor: 'bg-green-500',
      statusText: 'text-green-600 dark:text-green-400'
    },
    {
      id: 2,
      type: 'Insurance',
      title: 'Specialized Health Insurance',
      subtitle: 'Premium Plan with MedLife',
      icon: 'health_and_safety',
      status: 'Enrolled',
      statusColor: 'bg-green-500',
      statusText: 'text-green-600 dark:text-green-400'
    },
    {
      id: 3,
      type: 'Professional',
      title: 'Continuing Medical Education',
      subtitle: '$2,000 annual allowance',
      icon: 'school',
      status: 'Claim Pending',
      statusColor: 'bg-yellow-500',
      statusText: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      id: 4,
      type: 'Wellness',
      title: 'Wellness & Mental Health Support',
      subtitle: 'Confidential EAP access',
      icon: 'self_improvement',
      status: 'Not Utilized',
      statusColor: 'bg-gray-400',
      statusText: 'text-gray-500 dark:text-gray-400'
    }
  ];

  const filteredBenefits = filter === 'All' ? benefits : benefits.filter(b => b.type === filter);

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-border-dark">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <span className="material-symbols-outlined text-text-main-light dark:text-text-main-dark">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">My Benefits</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search benefits..." 
            className="w-full h-12 pl-10 pr-4 rounded-xl border-none bg-white dark:bg-card-dark text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary shadow-sm"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === cat 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white dark:bg-card-dark text-text-main-light dark:text-text-main-dark border border-gray-200 dark:border-border-dark'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Benefits List */}
        <div className="space-y-4 pb-24">
          {filteredBenefits.map(item => (
            <div key={item.id} className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-border-dark">
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                   <span className="material-symbols-outlined">{item.icon}</span>
                 </div>
                 <div className="flex-1 min-w-0">
                   <h3 className="font-semibold text-text-main-light dark:text-text-main-dark truncate">{item.title}</h3>
                   <p className="text-sm text-text-sub-light dark:text-text-sub-dark truncate">{item.subtitle}</p>
                 </div>
                 <button className="text-gray-400 hover:text-primary">
                   <span className="material-symbols-outlined">chevron_right</span>
                 </button>
              </div>
              <div className="h-px w-full bg-gray-100 dark:bg-gray-800 my-4"></div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.statusColor}`}></div>
                <span className={`text-sm font-medium ${item.statusText}`}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Support FAB */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-dark transition-colors z-20">
        <span className="material-symbols-outlined text-2xl">support_agent</span>
      </button>
    </div>
  );
};

export default Benefits;