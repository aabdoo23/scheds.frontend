export interface ScheduleCardItem {
  cardId: string;
  courseCode: string;
  courseName: string;
  instructorName: string;
  section: string;
  credits: number;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  subType: string;
  seatsLeft: number;
}

// Response envelope from POST /api/generate. `schedules` is ranked best-first;
// `explored`/`truncated` describe how much of the combination space was searched.
export interface GenerateResponse {
  schedules: ScheduleCardItem[][];
  explored: number;
  truncated: boolean;
}

export interface CustomCartItem {
  courseCode: string;
  courseName: string;
  excludedMainSections?: string[];
  excludedSubSections?: string[];
  excludedProfessors?: string[];
  excludedTAs?: string[];
  // Soft preference: lecture instructors to favor for this course. Never filters ,
  // schedules taught by one of these rank higher.
  preferredProfessors?: string[];
}

// A block of time the student is unavailable , treated like a fixed phantom
// class the generator schedules around. `day` matches selectedDays: 0=Sat … 5=Thu.
export interface BusyTime {
  day: number;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export interface GenerateRequest {
  selectedDays: boolean[];
  daysStart: string;
  daysEnd: string;
  minimumNumberOfItemsPerDay: number;
  largestAllowedGap: number;
  numberOfDays: number;
  maxNumberOfGeneratedSchedules: number;
  useLiveData: boolean;
  requireOpenSeats: boolean;
  isNumberOfDaysSelected: boolean;
  isEngineering: boolean;
  busyTimes: BusyTime[];
  selectedItems: { courseCode: string; courseName: string }[];
  customSelectedItems: CustomCartItem[];
}
