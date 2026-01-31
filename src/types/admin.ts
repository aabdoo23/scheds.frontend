export interface AdminDashboard {
  usageStatistics: Record<string, number>;
  mostSelectedCourses: string[];
  mostSelectedCustomizations: string[];
  dailyStats: DailyStat[];
  recentGenerations: RecentGeneration[];
  monthlyStats: MonthlyStats;
}

export interface CourseWithCount {
  label: string;
  count: number;
}

export interface CustomizationWithCount {
  label: string;
  count: number;
}

export interface AnalyticsData {
  usageStatistics: Record<string, number>;
  mostSelectedCourses: string[];
  mostSelectedCustomizations: string[];
  mostSelectedCoursesWithCounts: CourseWithCount[];
  mostSelectedCustomizationsWithCounts: CustomizationWithCount[];
  dailyStats: DailyStat[];
  monthlyStats: MonthlyStats;
}

export interface DailyStat {
  date: string;
  count: number;
  totalSchedulesGenerated: number;
}

export interface RecentGeneration {
  id: number;
  generatedAt: string;
  numberOfSchedulesGenerated: number;
  totalCourses: number;
  usedLiveData: boolean;
  isEngineering: boolean;
}

export interface MonthlyStats {
  currentMonthGenerations: number;
  previousMonthGenerations: number;
  growthPercentage: number;
  currentMonthSchedules: number;
  averageSchedulesPerGeneration: number;
}

export interface GenerationListItem {
  id: number;
  generatedAt: string;
  numberOfSchedulesGenerated: number;
  selectedCoursesCount: number;
  selectedCustomCoursesCount: number;
  usedLiveData: boolean;
  isEngineering: boolean;
}

export interface GenerationDetail {
  id: number;
  generatedAt: string;
  numberOfSchedulesGenerated: number;
  usedLiveData: boolean;
  consideredZeroSeats: boolean;
  isEngineering: boolean;
  minimumNumberOfItemsPerDay: number;
  largestAllowedGap: number;
  numberOfDays: number;
  isNumberOfDaysSelected: boolean;
  daysStart: string;
  daysEnd: string;
  selectedDaysJson: string | null;
  clientIpAddress: string | null;
  userAgent: string | null;
  selectedCourses: { courseCode: string; courseName: string }[];
  selectedCustomCourses: {
    courseCode: string;
    courseName: string;
    customMainSection: string | null;
    customSubSection: string | null;
    customProfessor: string | null;
    customTA: string | null;
  }[];
}
