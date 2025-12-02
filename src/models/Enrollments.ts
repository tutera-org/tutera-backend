import { Schema, model, Document, Types } from 'mongoose';

export interface IEnrollment extends Document {
  tenantId: string;
  studentId: string;
  courseId: string;
  enrolledAt: Date;
  rating?: number;
  completedLessons: string[];
  quizAttempts: {
    quizId: string | Types.ObjectId;
    score: number;
    attemptedAt: Date;
    answers: {
      questionIndex: number;
      selectedOptionIndex: number;
      isCorrect: boolean;
    }[];
  }[];
}

const EnrollmentSchema = new Schema<IEnrollment>({
  tenantId: { type: String, required: true },
  studentId: { type: String, required: true }, // link to User/Student
  courseId: { type: String, required: true }, // link to Course
  enrolledAt: { type: Date, default: Date.now },
  rating: { type: Number, min: 1, max: 5 }, // optional rating
  completedLessons: [
    {
      type: String,
    },
  ], // track lesson IDs
  quizAttempts: [
    {
      quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
      score: { type: Number, required: true },
      attemptedAt: { type: Date, default: Date.now },
      answers: [
        {
          questionIndex: Number, // index in quiz.questions[]
          selectedOptionIndex: Number,
          isCorrect: Boolean,
        },
      ],
    },
  ],
});

export default model<IEnrollment>('Enrollments', EnrollmentSchema);
