import { useState, useCallback, useEffect } from 'react';
import type { GenerateRequest } from '@/types/generate';

const DAYS_OF_WEEK = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

const REQUEST_STORAGE_KEY = 'scheds-generate-request';

const defaultRequest: GenerateRequest = {
  selectedDays: [true, true, true, true, true, true],
  daysStart: '10:30',
  daysEnd: '18:30',
  minimumNumberOfItemsPerDay: 0,
  largestAllowedGap: 0,
  numberOfDays: 5,
  maxNumberOfGeneratedSchedules: 15,
  useLiveData: true,
  considerZeroSeats: true,
  isNumberOfDaysSelected: true,
  isEngineering: false,
  selectedItems: [],
  customSelectedItems: [],
};

interface StoredRequest {
  selectedDays?: boolean[];
  daysStart?: string;
  daysEnd?: string;
  minimumNumberOfItemsPerDay?: number;
  largestAllowedGap?: number;
  numberOfDays?: number;
  maxNumberOfGeneratedSchedules?: number;
  useLiveData?: boolean;
  considerZeroSeats?: boolean;
  isNumberOfDaysSelected?: boolean;
  isEngineering?: boolean;
}

function loadRequestFromStorage(): GenerateRequest {
  try {
    const raw = localStorage.getItem(REQUEST_STORAGE_KEY);
    if (!raw) return defaultRequest;
    const data: StoredRequest | null = JSON.parse(raw);
    if (!data) return defaultRequest;
    return {
      ...defaultRequest,
      selectedDays:
        Array.isArray(data.selectedDays) && data.selectedDays.length === 6
          ? data.selectedDays
          : defaultRequest.selectedDays,
      daysStart: data.daysStart ?? defaultRequest.daysStart,
      daysEnd: data.daysEnd ?? defaultRequest.daysEnd,
      minimumNumberOfItemsPerDay: data.minimumNumberOfItemsPerDay ?? 0,
      largestAllowedGap: data.largestAllowedGap ?? 0,
      numberOfDays: data.numberOfDays ?? 5,
      maxNumberOfGeneratedSchedules: data.maxNumberOfGeneratedSchedules ?? 15,
      useLiveData: data.useLiveData ?? true,
      considerZeroSeats: data.considerZeroSeats ?? true,
      isNumberOfDaysSelected: data.isNumberOfDaysSelected ?? true,
      isEngineering: data.isEngineering ?? false,
    };
  } catch {
    return defaultRequest;
  }
}

function saveRequestToStorage(req: GenerateRequest) {
  try {
    const prefs: StoredRequest = {
      selectedDays: req.selectedDays,
      daysStart: req.daysStart,
      daysEnd: req.daysEnd,
      minimumNumberOfItemsPerDay: req.minimumNumberOfItemsPerDay,
      largestAllowedGap: req.largestAllowedGap,
      numberOfDays: req.numberOfDays,
      maxNumberOfGeneratedSchedules: req.maxNumberOfGeneratedSchedules,
      useLiveData: req.useLiveData,
      considerZeroSeats: req.considerZeroSeats,
      isNumberOfDaysSelected: req.isNumberOfDaysSelected,
      isEngineering: req.isEngineering,
    };
    localStorage.setItem(REQUEST_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function useGenerateRequest() {
  const [request, setRequest] = useState<GenerateRequest>(loadRequestFromStorage);

  useEffect(() => {
    saveRequestToStorage(request);
  }, [request]);

  const saveRequest = useCallback((req: GenerateRequest) => {
    setRequest(req);
  }, []);

  const updateRequest = useCallback((updates: Partial<GenerateRequest>) => {
    setRequest((prev) => ({ ...prev, ...updates }));
  }, []);

  return { request, saveRequest, updateRequest, DAYS_OF_WEEK };
}
