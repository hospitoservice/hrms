import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appData from '../data/appData.json';
import PayrollServiceInstance from '../service/PayrollService.js';
import AuthService from '../service/AuthService.js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PayslipSummary {
  month:    string;
  paidDate: string;
  netPay:   string;
}

interface CompensationItem {
  label: string;
  value: string;
}

interface PayslipHistoryItem {
  month:  string;
  paid:   string;
  amount: string;
}

interface PayrollData {
  latestPayslip:       PayslipSummary;
  compensationPackage: CompensationItem[];
  annualSalary:        string;
  payslipHistory:      PayslipHistoryItem[];
}

// ─── JSON fallback ────────────────────────────────────────────────────────────
// Seed state with local data so the screen is always immediately usable,
// even before the network call completes or if it fails entirely.

const jsonFallback: PayrollData = {
  latestPayslip:       appData.payroll.latestPayslip,
  compensationPackage: appData.payroll.compensationPackage,
  annualSalary:        appData.payroll.annualSalary,
  payslipHistory:      appData.payroll.payslipHistory,
};


// ─── Component ────────────────────────────────────────────────────────────────

const Payroll = () => {
  const navigate = useNavigate();

  // Start with JSON data — screen renders instantly on every load.
  const [payroll, setPayroll]       = useState<PayrollData>(jsonFallback);
  const [dataSource, setDataSource] = useState<'api' | 'local'>('local');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadPayroll = async () => {
      try {
        // Attempt to fetch live data from the payroll microservice.
        const apiData: PayrollData = await PayrollServiceInstance.getPayrollData(
          AuthService.getEmployeeId()
        );
        setPayroll(apiData);
        setDataSource('api');
      } catch (error) {
        // Network failure, non-2xx response, or any other runtime error.
        // State is already seeded with JSON data — screen stays fully functional.
        console.warn(
          '[Payroll] Could not load payroll data from payroll microservice.',
          'Falling back to local JSON data.',
          error
        );
        // dataSource stays 'local' — no setPayroll needed.
      }
    };

    void loadPayroll();
  }, []); // run once on mount

  // ── Derived state ──────────────────────────────────────────────────────────

  // Filter history list by search query (case-insensitive match on month or year).
  const filteredHistory = searchQuery.trim()
    ? payroll.payslipHistory.filter(
        (item) =>
          item.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.paid.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : payroll.payslipHistory;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background-light dark:bg-background-dark">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full text-text-main-light dark:text-text-main-dark"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">Payroll</h1>
        <div className="w-10"></div>
      </div>

      <div className="px-4">

        {/* ── Profile Header ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm mb-4">
          <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-gray-400 text-2xl">person</span>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-text-main-light dark:text-text-main-dark">
              {AuthService.getName()}
            </h2>
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark">
              Staff ID: {AuthService.getEmployeeId()}
            </p>
          </div>
          {/* Data-source badge — helpful during development / QA */}
          {dataSource === 'api' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 self-start mt-1">
              Live data
            </span>
          )}
        </div>

        {/* ── Latest Payslip ──────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm p-6 mb-4 text-center border border-gray-100 dark:border-border-dark">
          <div className="flex justify-between text-sm text-text-sub-light dark:text-text-sub-dark mb-4">
            <span>Latest Payslip: {payroll.latestPayslip.month}</span>
            <span>Paid: {payroll.latestPayslip.paidDate}</span>
          </div>
          <p className="text-text-sub-light dark:text-text-sub-dark mb-1">Net Pay</p>
          <h2 className="text-4xl font-bold text-green-600 dark:text-green-500 tracking-tight mb-4">
            {payroll.latestPayslip.netPay}
          </h2>
          <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors w-full sm:w-auto">
            View / Download Payslip
          </button>
        </div>

        {/* ── Compensation Package Accordion ──────────────────────────────── */}
        <details className="group bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark mb-6 overflow-hidden">
          <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none">
            <span className="font-medium text-text-main-light dark:text-text-main-dark">
              View Compensation Package
            </span>
            <span className="material-symbols-outlined text-text-sub-light dark:text-text-sub-dark transition-transform group-open:rotate-180">
              expand_more
            </span>
          </summary>
          <div className="px-4 pb-4 border-t border-gray-100 dark:border-border-dark pt-3 text-sm space-y-2">
            {payroll.compensationPackage.map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between text-text-sub-light dark:text-text-sub-dark"
              >
                <span>{label}:</span>
                <span className="font-medium text-text-main-light dark:text-text-main-dark">
                  {value}
                </span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-border-dark font-bold text-text-main-light dark:text-text-main-dark mt-2">
              <span>Annual Salary:</span>
              <span>{payroll.annualSalary}</span>
            </div>
          </div>
        </details>

        {/* ── Payslip History ─────────────────────────────────────────────── */}
        <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-3">
          Payslip History
        </h3>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by month or year..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary/50 outline-none"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-sub-light dark:text-text-sub-dark">
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

        {/* History List */}
        <div className="flex flex-col rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark overflow-hidden divide-y divide-gray-100 dark:divide-border-dark">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item) => (
              <div
                key={item.month}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-medium text-text-main-light dark:text-text-main-dark">
                    {item.month}
                  </p>
                  <p className="text-xs text-text-sub-light dark:text-text-sub-dark mt-0.5">
                    Paid on: {item.paid}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-main-light dark:text-text-main-dark">
                    {item.amount}
                  </span>
                  <span className="material-symbols-outlined text-text-sub-light dark:text-text-sub-dark text-lg">
                    chevron_right
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="p-6 text-center text-sm text-text-sub-light dark:text-text-sub-dark">
              No payslips found for "{searchQuery}".
            </p>
          )}
        </div>

        <p className="text-center text-xs text-text-sub-light dark:text-text-sub-dark mt-8 px-4 opacity-70">
          {appData.payroll.confidentialityNote}
        </p>

      </div>
    </div>
  );
};

export default Payroll;
