export interface TimeBlock {
  startTime: string;
  endTime: string;
  courseCode: string;
  section: string;
}

export interface RoomAvailability {
  roomNumber: string;
  building: string;
  floor: string;
  availableFrom?: string;
  availableUntil?: string;
  continuousMinutesAvailable: number;
  busyPeriods: TimeBlock[];
  freePeriods: TimeBlock[];
}
