import { Schema, model, Types, Document } from 'mongoose';

export interface IEnrollment extends Document {
  tenantId: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  enrolledAt: Date;
  rating?: number;
  completedLessons: Types.ObjectId[];
  quizAttempts: {
    quizId: Types.ObjectId;
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
  tenantId: { type: Schema.Types.ObjectId, required: true },
  studentId: { type: Schema.Types.ObjectId, required: true }, // link to User/Student
  courseId: { type: Schema.Types.ObjectId, required: true }, // link to Course
  enrolledAt: { type: Date, default: Date.now },
  rating: { type: Number, min: 1, max: 5 }, // optional rating
  completedLessons: [{ type: Types.ObjectId }], // track lesson IDs
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
