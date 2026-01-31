export interface CourseSearchItem {
  courseCode: string;
  courseName: string;
}

export interface CartItem {
  courseCode: string;
  section: string;
}

export interface SeatResult {
  course: string;
  courseName: string;
  section: string;
  hasSeats: boolean;
  seatsLeft: number;
  instructor: string;
}
