import React, { useEffect, useState, useRef } from "react";

export default function TicTacToeGame() {
  const emptyBoard = Array(9).fill(null);
  const [board, setBoard] = useState([...emptyBoard]);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [promoCode, setPromoCode] = useState(null);

  // Confetti canvas ref
  const confettiRef = useRef(null);

  // ========= GAME LOGIC ========= //

  useEffect(() => {
    const w = calculateWinner(board);
    if (w) {
      setWinner(w);
      handleEnd(w);
      triggerConfetti();
      return;
    }

    if (!board.includes(null)) {
      setWinner("draw");
      handleEnd("draw");
      return;
    }

    if (!playerTurn) {
      const t = setTimeout(() => computerMove(board), 350);
      return () => clearTimeout(t);
    }
  }, [board, playerTurn]);

  function calculateWinner(b) {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (let [a, b1, c] of lines) {
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    }
    return null;
  }

  function handleEnd(result) {
    if (result === "X") {
      const code = generatePromoCode();
      setPromoCode(code);
      sendTelegram(`Победа! Промокод: ${code}`);
    } else {
      sendTelegram("Проигрыш");
    }
    setShowModal(true);
  }

  function generatePromoCode() {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  async function sendTelegram(text) {
    try {
      await fetch("https://tic-tac-toe-backend-z18s.onrender.com/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
    } catch (e) {
      console.error("Backend error:", e);
    }
  }

  function handleCellClick(i) {
    if (board[i] || winner || !playerTurn) return;
    const newBoard = [...board];
    newBoard[i] = "X";
    setBoard(newBoard);
    setPlayerTurn(false);
  }

  function computerMove(b) {
    const available = b
      .map((v, i) => (v === null ? i : null))
      .filter((v) => v !== null);

    if (!available.length) return;

    const tryMove = (boardArr, idx, mark) => {
      const copy = [...boardArr];
      copy[idx] = mark;
      return calculateWinner(copy) === mark;
    };

    for (let i of available)
      if (tryMove(b, i, "O")) return makeMove(i);

    for (let i of available)
      if (tryMove(b, i, "X")) return makeMove(i);

    if (available.includes(4)) return makeMove(4);

    const corners = [0, 2, 6, 8].filter((i) => available.includes(i));
    if (corners.length) return makeMove(corners[Math.floor(Math.random() * corners.length)]);

    return makeMove(available[Math.floor(Math.random() * available.length)]);
  }

  function makeMove(i) {
    const newBoard = [...board];
    newBoard[i] = "O";
    setBoard(newBoard);
    setPlayerTurn(true);
  }

  function resetGame() {
    setBoard([...emptyBoard]);
    setPlayerTurn(true);
    setWinner(null);
    setPromoCode(null);
    setShowModal(false);
  }

  // ========= CONFETTI EFFECT ========= //

  function triggerConfetti() {
    if (winner !== "X") return;

    const canvas = confettiRef.current;
    const ctx = canvas.getContext("2d");
    const confetti = [];

    for (let i = 0; i < 150; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        size: Math.random() * 6 + 3,
        speed: Math.random() * 3 + 2,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confetti.forEach((p) => {
        p.y += p.speed;
        ctx.fillStyle = "rgba(255, 120, 160, 0.8)";
        ctx.fillRect(p.x, p.y, p.size, p.size);

        if (p.y > canvas.height) p.y = -20;
      });

      requestAnimationFrame(draw);
    }

    draw();
  }

  useEffect(() => {
    const canvas = confettiRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }, []);

  // ========= UI ========= //

  return (
    <div className="relative flex items-center justify-center min-h-screen px-5 py-10">

      {/* Confetti Layer */}
      <canvas
        ref={confettiRef}
        className="pointer-events-none fixed inset-0 z-40"
      />

      {/* Game Wrapper */}
      <div className="relative z-20 max-w-md w-full bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-pink-100">

        <h1 className="text-3xl font-semibold text-pink-600 mb-3 animate-fadeIn">
          Крестики — Нолики
        </h1>

        <p className="text-sm text-gray-600 mb-6">
          Лёгкая, стильная игра для самых привлекательных девуек ✨
        </p>

        {/* Game Grid */}
        <div className="grid grid-cols-3 gap-3 select-none">
          {board.map((cell, i) => (
            <button
              key={i}
              onClick={() => handleCellClick(i)}
              className="aspect-square rounded-xl text-4xl font-extrabold shadow-md bg-white
                       flex items-center justify-center transition-all duration-200
                       hover:scale-105 hover:shadow-pink-200/50"

              style={{
                background: "linear-gradient(180deg, #fff 0%, #fff5f8 100%)",
              }}
            >
              {cell === "X" && (
                <span className="text-pink-600 animate-[fadeIn_0.3s_ease]">✕</span>
              )}

              {cell === "O" && (
                <span className="text-gray-500 animate-[fadeIn_0.3s_ease]">○</span>
              )}
            </button>
          ))}
        </div>

        {/* Status + Reset */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-gray-700">
            {!winner ? (
              playerTurn ? "Ваш ход" : "Ход компьютера…"
            ) : winner === "X" ? (
              "Вы выиграли! 🎉"
            ) : winner === "O" ? (
              "Не везет в игре? Повезет в любви!"
            ) : (
              "Ничья"
            )}
          </div>

          <button
            onClick={resetGame}
            className="px-4 py-2 text-sm rounded-full border border-pink-300 text-pink-600 hover:bg-pink-50 transition"
          >
            Сбросить
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            {winner === "X" ? (
              <>
                <h2 className="text-xl font-semibold text-pink-600">Победа! 🎉</h2>
                <p className="mt-2 text-gray-600">Ваш промокод:</p>
                <div className="mt-3 px-4 py-2 bg-pink-50 rounded-md text-center font-mono text-lg tracking-widest">
                  {promoCode}
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-full border"
                  >
                    Закрыть
                  </button>
                  <button
                    onClick={resetGame}
                    className="px-4 py-2 rounded-full bg-pink-600 text-white"
                  >
                    Сыграть ещё
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-700">
                  Не везет в игре? Повезет в любви!
                </h2>
                <p className="mt-2 text-gray-600">Попробуйте ещё раз!</p>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-full border"
                  >
                    Закрыть
                  </button>
                  <button
                    onClick={resetGame}
                    className="px-4 py-2 rounded-full bg-pink-600 text-white"
                  >
                    Сыграть ещё
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
