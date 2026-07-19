import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appData from '../data/appData.json';
import BenefitsServiceInstance from '../service/BenefitsService.js';
import AuthService from '../service/AuthService.js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BenefitItem {
  id:          number | string;
  type:        string;
  title:       string;
  subtitle:    string;
  icon:        string;
  status:      string;
  statusColor: string;
  statusText:  string;
}

interface BenefitsData {
  categories: string[];
  items:      BenefitItem[];
}

// ─── JSON fallback ────────────────────────────────────────────────────────────
// Seed state with local data so the screen is always immediately usable,
// even before the network call completes or if it fails entirely.

const jsonFallback: BenefitsData = {
  categories: appData.benefits.categories,
  items:      appData.benefits.items,
};

// ─── Component ────────────────────────────────────────────────────────────────

const Benefits = () => {
  const navigate = useNavigate();

  // Start with JSON data — screen renders instantly on every load.
  const [benefitsData, setBenefitsData] = useState<BenefitsData>(jsonFallback);
  const [dataSource, setDataSource]     = useState<'api' | 'local'>('local');
  const [filter, setFilter]             = useState('All');
  const [searchQuery, setSearchQuery]   = useState('');

  useEffect(() => {
    const loadBenefits = async () => {
      try {
        // Attempt to fetch live data from the employee microservice.
        const apiData: BenefitsData = await BenefitsServiceInstance.getBenefits(
          AuthService.getEmployeeId()
        );
        setBenefitsData(apiData);
        setDataSource('api');

        // Reset the active filter to 'All' if the current filter category
        // no longer exists in the freshly-fetched categories list.
        setFilter((prev) =>
          apiData.categories.includes(prev) ? prev : 'All'
        );
      } catch (error) {
        // Network failure, non-2xx response, or any other runtime error.
        // State is already seeded with JSON data — screen stays fully functional.
        console.warn(
          '[Benefits] Could not load benefits from employee microservice.',
          'Falling back to local JSON data.',
          error
        );
        // dataSource stays 'local' — no setBenefitsData needed.
      }
    };

    void loadBenefits();
  }, []); // run once on mount

  // ── Derived state ──────────────────────────────────────────────────────────

  const filteredItems = benefitsData.items
    .filter((b) => filter === 'All' || b.type === filter)
    .filter((b) =>
      searchQuery.trim() === '' ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-border-dark">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <span className="material-symbols-outlined text-text-main-light dark:text-text-main-dark">
            arrow_back
          </span>
        </button>

        <div className="text-center">
          <h1 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">
            My Benefits
          </h1>
          {/* Data-source badge — helpful during development / QA */}
          {dataSource === 'api' && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Live data
            </span>
          )}
        </div>

        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-4">

        {/* ── Search ──────────────────────────────────────────────────────── */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search benefits..."
            className="w-full h-12 pl-10 pr-10 rounded-xl border-none bg-white dark:bg-card-dark text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary shadow-sm"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          {searchQuery.length > 0 && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-sub-light dark:text-text-sub-dark hover:text-text-main-light dark:hover:text-text-main-dark"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>

        {/* ── Category Filter Chips ────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {benefitsData.categories.map((cat) => (
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

        {/* ── Benefits List ────────────────────────────────────────────────── */}
        <div className="space-y-4 pb-24">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-sub-light dark:text-text-sub-dark">
              <span className="material-symbols-outlined text-5xl mb-3 opacity-40">
                search_off
              </span>
              <p className="text-sm font-medium">
                {searchQuery.trim()
                  ? `No benefits found for "${searchQuery}".`
                  : 'No benefits available in this category.'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-border-dark"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-main-light dark:text-text-main-dark truncate">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-sub-light dark:text-text-sub-dark truncate">
                      {item.subtitle}
                    </p>
                  </div>
                  <button className="text-gray-400 hover:text-primary shrink-0">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>

                <div className="h-px w-full bg-gray-100 dark:bg-gray-800 my-4"></div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.statusColor}`}></div>
                  <span className={`text-sm font-medium ${item.statusText}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* ── Support FAB ─────────────────────────────────────────────────────── */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-dark transition-colors z-20">
        <span className="material-symbols-outlined text-2xl">support_agent</span>
      </button>

    </div>
  );
};

export default Benefits;
