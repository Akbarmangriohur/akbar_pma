
import React, { useEffect, useMemo, useState } from "react";
import { questions } from "./questions/questions";

const TOTAL_QUESTIONS = 50;
const TEST_DURATION = 20 * 60;

function shuffleArray(array) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export default function App() {
  const [testVersion, setTestVersion] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(TEST_DURATION);
  const [showConfirm, setShowConfirm] = useState(false);

  const testQuestions = useMemo(
    () => shuffleArray(questions).slice(0, TOTAL_QUESTIONS),
    [testVersion]
  );

  const total = testQuestions.length;
  const currentQuestion = testQuestions[currentIndex];

  const answeredCount = Object.keys(answers).filter(
    (key) => answers[key] !== undefined
  ).length;

  const correctCount = testQuestions.reduce(
    (count, question, index) =>
      count + (answers[index] === question.answer ? 1 : 0),
    0
  );

  const wrongCount = answeredCount - correctCount;
  const unansweredCount = total - answeredCount;
  const percentage = total
    ? Math.round((correctCount / total) * 100)
    : 0;

  // Timer only runs after Start Test is clicked.
  useEffect(() => {
    if (!started || submitted) return;

    const timer = setInterval(() => {
      setSecondsLeft((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [started, submitted, testVersion]);

  // Automatically submit when the timer reaches zero.
  useEffect(() => {
    if (started && secondsLeft === 0 && !submitted) {
      setSubmitted(true);
      setShowConfirm(false);
    }
  }, [started, secondsLeft, submitted]);

  const startTest = () => {
    setStarted(true);
  };

  const chooseAnswer = (option) => {
    if (!started || submitted) return;

    setAnswers((previous) => ({
      ...previous,
      [currentIndex]: option,
    }));
  };

  const submitTest = () => {
    setSubmitted(true);
    setShowConfirm(false);
  };

  const restartTest = () => {
    setTestVersion((version) => version + 1);
    setStarted(false);
    setSubmitted(false);
    setCurrentIndex(0);
    setAnswers({});
    setSecondsLeft(TEST_DURATION);
    setShowConfirm(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (!questions || questions.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold">Question bank is empty</h1>
          <p className="mt-2 text-slate-500">
            Add MCQs to your questions file to begin.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* Responsive header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-black tracking-tight text-indigo-700 sm:text-2xl">
              AKBAR<span className="text-slate-800">TestPrep</span>
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Developer: Saleh Mangrio.
            </p>
          </div>

          {started && (
            <div
              className={`rounded-xl px-3 py-2 text-center sm:px-5 ${
                secondsLeft <= 60
                  ? "bg-red-100 text-red-700"
                  : "bg-indigo-50 text-indigo-700"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider sm:text-xs">
                Time Remaining
              </p>
              <p className="font-mono text-xl font-extrabold sm:text-2xl">
                {formatTime(secondsLeft)}
              </p>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        {/* START SCREEN */}
        {!started && !submitted && (
          <section className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-white shadow-lg">
            <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 px-6 py-10 text-white sm:px-10 sm:py-14">
              <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest">
                Mock Examination
              </span>

              <h2 className="mt-6 text-3xl font-black leading-tight sm:text-5xl">
                Test your knowledge.
                <br />
                Beat the clock.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
                Challenge yourself with randomly selected questions from your
                general knowledge question bank.
              </p>
            </div>

            <div className="p-6 sm:p-10">
              <h3 className="text-lg font-bold sm:text-xl">
                Test Instructions
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Instruction
                  icon="◷"
                  title="20 Minutes"
                  description="The timer begins when you start."
                />
                <Instruction
                  icon="☷"
                  title={`${testQuestions.length} Questions`}
                  description="Randomly selected from your bank."
                />
                <Instruction
                  icon="✓"
                  title="No Negative Marking"
                  description="One point for each correct answer."
                />
              </div>

              <ul className="mt-7 space-y-3 text-sm leading-6 text-slate-600">
                <li>• Select one answer for each question.</li>
                <li>• Use the question navigator to move between questions.</li>
                <li>• You can change your answers before submission.</li>
                <li>• The test submits automatically when time expires.</li>
              </ul>

              <button
                onClick={startTest}
                className="mt-8 w-full rounded-xl bg-indigo-600 px-6 py-4 font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.99] sm:text-lg"
              >
                Start Test →
              </button>

              <p className="mt-3 text-center text-xs text-slate-400">
                Your timer will not run until you start.
              </p>
            </div>
          </section>
        )}

        {/* ACTIVE TEST */}
        {started && !submitted && currentQuestion && (
          <>
            <section className="mb-5 rounded-2xl bg-gradient-to-r from-indigo-700 to-violet-600 p-5 text-white sm:p-7">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">
                    General Knowledge
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                    Mock Test
                  </h2>
                  <p className="mt-2 text-sm text-indigo-100">
                    Answer every question before time runs out.
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 p-4 sm:min-w-40">
                  <p className="text-sm text-indigo-100">Answered</p>
                  <p className="mt-1 text-2xl font-extrabold">
                    {answeredCount}
                    <span className="text-base text-indigo-200">
                      {" "}/ {total}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${(answeredCount / total) * 100}%` }}
                />
              </div>
            </section>

            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
              {/* Question panel */}
              <section className="min-w-0 rounded-2xl bg-white p-4 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700">
                    Question {currentIndex + 1} / {total}
                  </span>

                  <span className="max-w-full break-words rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 sm:text-sm">
                    {currentQuestion.category}
                  </span>
                </div>

                <h3 className="mt-7 break-words text-xl font-bold leading-relaxed sm:text-2xl">
                  {currentQuestion.question}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Choose the correct option.
                </p>

                <div className="mt-6 space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const selected = answers[currentIndex] === option;

                    return (
                      <button
                        key={`${index}-${option}`}
                        onClick={() => chooseAnswer(option)}
                        className={`flex w-full min-w-0 items-start gap-3 rounded-xl border p-3 text-left transition sm:items-center sm:gap-4 sm:p-4 ${
                          selected
                            ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100"
                            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold sm:h-10 sm:w-10 ${
                            selected
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {["A", "B", "C", "D"][index] ?? index + 1}
                        </span>

                        <span
                          className={`min-w-0 flex-1 break-words text-sm sm:text-base ${
                            selected
                              ? "font-semibold text-indigo-800"
                              : "text-slate-700"
                          }`}
                        >
                          {option}
                        </span>

                        {selected && (
                          <span className="shrink-0 font-bold text-indigo-600">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={() => setCurrentIndex((i) => i - 1)}
                    disabled={currentIndex === 0}
                    className="w-full rounded-xl border border-slate-200 px-5 py-3 font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                  >
                    ← Previous
                  </button>

                  {currentIndex < total - 1 ? (
                    <button
                      onClick={() => setCurrentIndex((i) => i + 1)}
                      className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700 sm:w-auto"
                    >
                      Next Question →
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700 sm:w-auto"
                    >
                      Finish Test
                    </button>
                  )}
                </div>
              </section>

              {/* Navigator: below question on mobile, sidebar on desktop */}
              <aside className="min-w-0 space-y-5">
                <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold">Question Navigator</h3>
                    <span className="text-xs text-slate-500">
                      {answeredCount} answered
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Tap a number to jump to that question.
                  </p>

                  <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-5">
                    {testQuestions.map((_, index) => {
                      const selected = index === currentIndex;
                      const answered = answers[index] !== undefined;

                      return (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          aria-label={`Go to question ${index + 1}`}
                          aria-current={selected ? "step" : undefined}
                          className={`aspect-square min-w-0 rounded-lg text-xs font-bold transition sm:text-sm ${
                            selected
                              ? "bg-indigo-600 text-white ring-2 ring-indigo-200"
                              : answered
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                    <Legend color="bg-indigo-600" label="Current" />
                    <Legend color="bg-emerald-100" label="Answered" />
                    <Legend color="bg-slate-100" label="Unanswered" />
                  </div>
                </section>

                <section className="rounded-2xl bg-white p-5 shadow-sm">
                  <h3 className="font-bold">Test Summary</h3>

                  <div className="mt-4 space-y-3 text-sm">
                    <SummaryRow label="Total questions" value={total} />
                    <SummaryRow label="Answered" value={answeredCount} />
                    <SummaryRow label="Unanswered" value={unansweredCount} />
                  </div>

                  <button
                    onClick={() => setShowConfirm(true)}
                    className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700"
                  >
                    Submit Test
                  </button>
                </section>
              </aside>
            </div>
          </>
        )}

        {/* RESULTS */}
        {submitted && (
          <section className="mx-auto max-w-4xl rounded-2xl bg-white p-5 shadow-sm sm:p-9">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-3xl">
                {percentage >= 50 ? "🏆" : "📝"}
              </div>

              <h2 className="mt-4 text-3xl font-black">Test Completed!</h2>
              <p className="mt-2 text-slate-500">Here is your result.</p>

              <p className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-500">
                Your Score
              </p>
              <p className="mt-2 text-5xl font-black text-indigo-700">
                {correctCount}
                <span className="text-2xl text-slate-400"> / {total}</span>
              </p>
              <p className="mt-2 text-lg font-semibold">{percentage}%</p>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ResultCard label="Total" value={total} />
              <ResultCard label="Correct" value={correctCount} color="text-emerald-600" />
              <ResultCard label="Wrong" value={wrongCount} color="text-red-600" />
              <ResultCard label="Unanswered" value={unansweredCount} color="text-amber-600" />
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={restartTest}
                className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700"
              >
                Take Another Test
              </button>
            </div>

            <h3 className="mt-9 text-xl font-bold">Review Your Answers</h3>

            <div className="mt-4 space-y-4">
              {testQuestions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.answer;

                return (
                  <article
                    key={`${index}-${question.question}`}
                    className="rounded-xl border border-slate-200 p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-indigo-700">
                        Question {index + 1}
                      </p>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                        {question.category}
                      </span>
                    </div>

                    <p className="mt-3 break-words font-semibold">
                      {question.question}
                    </p>

                    <p className="mt-3 break-words text-sm">
                      Your answer:{" "}
                      <span
                        className={
                          isCorrect
                            ? "font-semibold text-emerald-600"
                            : "font-semibold text-red-600"
                        }
                      >
                        {userAnswer ?? "Not answered"}
                      </span>
                    </p>

                    {!isCorrect && (
                      <p className="mt-2 break-words text-sm">
                        Correct answer:{" "}
                        <span className="font-semibold text-emerald-600">
                          {question.answer}
                        </span>
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <footer className="py-7 text-center text-xs text-slate-400">
          ExamPrep · Practice makes progress
        </footer>
      </main>

      {/* Submission confirmation */}
      {showConfirm && started && !submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <h2 id="confirm-title" className="text-2xl font-extrabold">
              Submit your test?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              You have answered {answeredCount} of {total} questions.
              {unansweredCount > 0
                ? ` ${unansweredCount} questions are still unanswered.`
                : " All questions have been answered."}
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold hover:bg-slate-50"
              >
                Go Back
              </button>

              <button
                onClick={submitTest}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-700"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Instruction({ icon, title, description }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <span className="text-2xl text-indigo-600">{icon}</span>
      <h4 className="mt-3 font-bold">{title}</h4>
      <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function ResultCard({ label, value, color = "text-slate-800" }) {
  return (
    <div className="rounded-xl border border-slate-100 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded ${color}`} />
      {label}
    </span>
  );
}
