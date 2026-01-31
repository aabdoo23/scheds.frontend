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

export interface CustomCartItem {
  courseCode: string;
  courseName: string;
  excludedMainSections?: string[];
  excludedSubSections?: string[];
  excludedProfessors?: string[];
  excludedTAs?: string[];
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
  considerZeroSeats: boolean;
  isNumberOfDaysSelected: boolean;
  isEngineering: boolean;
  selectedItems: { courseCode: string; courseName: string }[];
  customSelectedItems: CustomCartItem[];
}
