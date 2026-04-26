"use client";

import * as React from "react";
import { motion } from "motion/react";
import { CheckCircle, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SuccessScreenProps {
  fileName: string;
  domainsUpdated: string[];
  totalKpis: number;
  onNewIngestion: () => void;
  institutionId: string;
}

export function SuccessScreen({
  fileName,
  domainsUpdated,
  totalKpis,
  onNewIngestion,
  institutionId,
}: SuccessScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-12"
    >
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 rounded-full bg-green-100 animate-pulse" />
        <CheckCircle className="relative w-24 h-24 text-green-500" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-2xl font-bold text-[#0D2B3E] mb-2 text-center"
      >
        Data Successfully Ingested!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-gray-600 mb-8 text-center max-w-md"
      >
        Your data has been processed and synchronized with the database. The
        executive dashboard will reflect these updates immediately.
      </motion.p>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 mb-8"
      >
        <h3 className="text-sm font-semibold text-[#0D2B3E] mb-4">
          Ingestion Summary
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Source File</span>
            <span className="text-sm font-medium text-[#0D2B3E] truncate max-w-[200px]">
              {fileName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total KPIs</span>
            <span className="text-sm font-medium text-[#0D2B3E]">
              {totalKpis}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Domains Updated</span>
            <div className="flex gap-1 flex-wrap justify-end">
              {domainsUpdated.map((domain) => (
                <span
                  key={domain}
                  className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#1B4F6B]/10 text-[#1B4F6B] capitalize"
                >
                  {domain === "hr"
                    ? "HR"
                    : domain === "esg"
                    ? "ESG"
                    : domain}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <span className="flex items-center gap-1 text-sm font-medium text-green-600">
              <CheckCircle className="w-4 h-4" />
              Synchronized
            </span>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="flex gap-4"
      >
        <Button
          onClick={onNewIngestion}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          New Ingestion
        </Button>

        <Link href={`/ucar/dashboard?institution=${institutionId}`}>
          <Button className="gap-2 bg-[#1B4F6B] hover:bg-[#153e54]">
            View Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}