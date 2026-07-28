import { useState, useCallback, useEffect } from 'react';
import type { GenerateRequest, BusyTime } from '@/types/generate';

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
  requireOpenSeats: true,
  isNumberOfDaysSelected: true,
  isEngineering: false,
  busyTimes: [],
  selectedItems: [],
  customSelectedItems: [],
};

function sanitizeBusyTimes(raw: unknown): BusyTime[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (b): b is BusyTime =>
        b != null &&
        typeof b.day === 'number' &&
        b.day >= 0 &&
        b.day <= 5 &&
        typeof b.startTime === 'string' &&
        typeof b.endTime === 'string' &&
        b.startTime < b.endTime
    )
    .map((b) => ({
      day: b.day,
      startTime: b.startTime,
      endTime: b.endTime,
    }));
}

interface StoredRequest {
  selectedDays?: boolean[];
  daysStart?: string;
  daysEnd?: string;
  minimumNumberOfItemsPerDay?: number;
  largestAllowedGap?: number;
  numberOfDays?: number;
  maxNumberOfGeneratedSchedules?: number;
  useLiveData?: boolean;
  requireOpenSeats?: boolean;
  /** @deprecated legacy key , read for migration only */
  considerZeroSeats?: boolean;
  isNumberOfDaysSelected?: boolean;
  isEngineering?: boolean;
  busyTimes?: BusyTime[];
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
      requireOpenSeats: data.requireOpenSeats ?? data.considerZeroSeats ?? true,
      isNumberOfDaysSelected: data.isNumberOfDaysSelected ?? true,
      isEngineering: data.isEngineering ?? false,
      busyTimes: sanitizeBusyTimes(data.busyTimes),
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
      requireOpenSeats: req.requireOpenSeats,
      isNumberOfDaysSelected: req.isNumberOfDaysSelected,
      isEngineering: req.isEngineering,
      busyTimes: req.busyTimes,
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

  const resetRequest = useCallback(() => {
    setRequest((prev) => ({
      ...defaultRequest,
      // Preserve the cart-derived fields; only constraint prefs reset.
      selectedItems: prev.selectedItems,
      customSelectedItems: prev.customSelectedItems,
    }));
  }, []);

  return { request, saveRequest, updateRequest, resetRequest, DAYS_OF_WEEK };
}
