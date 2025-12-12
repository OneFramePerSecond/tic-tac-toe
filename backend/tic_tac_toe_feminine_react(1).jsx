import React, { useEffect, useState } from "react";

export default function TicTacToeGame({ telegram = { token: "REPLACE_BOT_TOKEN", chatId: "REPLACE_CHAT_ID" } }) {
  // Bubble configs are generated once and persist across re-renders and game rounds
  const [bubbleConfigs] = useState(() =>
    Array.from({ length: 40 }).map((_, i) => ({
      left: Math.round(Math.random() * 95),
      top: Math.round(Math.random() * 95),
      size: 20 + Math.round(Math.random() * 60),
      delay: (Math.random() * 6).toFixed(2) + "s",
      duration: 10 + Math.round(Math.random() * 12),
      hue: 320 + Math.round(Math.random() * 30)
    }))
  );

  const emptyBoard = Array(9).fill(null);
  const [board, setBoard] = useState(() => [...emptyBoard]);
  const [playerTurn, setPlayerTurn] = useState(true); // player = X, computer = O
  const [winner, setWinner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [promoCode, setPromoCode] = useState(null);
  const [messageSending, setMessageSending] = useState(false);

  useEffect(() => {
    const w = calculateWinner(board);
    if (w) {
      setWinner(w);
      handleEnd(w);
      return;
    }
    if (!board.includes(null)) {
      setWinner("draw");
      handleEnd("draw");
      return;
    }
    if (!playerTurn) {
      // small delay for better UX
      const t = setTimeout(() => computerMove(board), 350);
      return () => clearTimeout(t);
    }
  }, [board, playerTurn]);

  function calculateWinner(b) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b1, c] = lines[i];
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    }
    return null;
  }

  function handleEnd(result) {
    if (result === "X") {
      // player won
      const code = generatePromoCode();
      setPromoCode(code);
      setShowModal(true);
      sendTelegramMessage(`Победа! Промокод выдан: ${code}`);
    } else if (result === "O") {
      // player lost
      setShowModal(true);
      sendTelegramMessage("Проигрыш");
    } else if (result === "draw") {
      setShowModal(true);
      sendTelegramMessage("Проигрыш"); // treat draw as non-win per spec
    }
  }

  function generatePromoCode() {
    // 5-digit numeric promo code
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    return code;
  }

  // sendTelegramMessage now handles messageSending state and posts to backend proxy.
  async function sendTelegramMessage(text) {
    setMessageSending(true);
    try {
      // Prefer backend proxy for security. Change URL if your server runs elsewhere.
      const res = await fetch("http://localhost:4000/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      // optional: check response
      // const json = await res.json();
    } catch (err) {
      console.error("Failed to send to backend", err);
    } finally {
      setMessageSending(false);
    }
  }

  function handleCellClick(idx) {
    if (board[idx] || winner || !playerTurn) return;
    const newBoard = [...board];
    newBoard[idx] = "X";
    setBoard(newBoard);
    setPlayerTurn(false);
  }

  function computerMove(currentBoard) {
    const available = currentBoard
      .map((v, i) => (v === null ? i : null))
      .filter((v) => v !== null);

    if (available.length === 0) return;

    function tryMove(boardArr, idx, mark) {
      const copy = [...boardArr];
      copy[idx] = mark;
      return calculateWinner(copy) === mark;
    }

    // try to win
    for (let i = 0; i < available.length; i++) {
      const idx = available[i];
      if (tryMove(currentBoard, idx, "O")) {
        makeComputerMove(idx);
        return;
      }
    }

    // try to block player
    for (let i = 0; i < available.length; i++) {
      const idx = available[i];
      if (tryMove(currentBoard, idx, "X")) {
        makeComputerMove(idx);
        return;
      }
    }

    // otherwise pick center, corners, then sides
    if (available.includes(4)) {
      makeComputerMove(4);
      return;
    }
    const corners = [0, 2, 6, 8].filter((i) => available.includes(i));
    if (corners.length) {
      makeComputerMove(corners[Math.floor(Math.random() * corners.length)]);
      return;
    }
    const choice = available[Math.floor(Math.random() * available.length)];
    makeComputerMove(choice);
  }

  function makeComputerMove(i) {
    const newBoard = [...board];
    newBoard[i] = "O";
    setBoard(newBoard);
    setPlayerTurn(true);
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setPlayerTurn(true);
    setWinner(null);
    setShowModal(false);
    setPromoCode(null);
  }

  // --- UI ---
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(circle_at_top,#ffe6f2,white)]">
      {/* Local styles for keyframes and small helpers */}
      <style>{`
        @keyframes float { 0% { transform: translateY(0) translateX(0) scale(1);} 50% { transform: translateY(-20px) translateX(8px) scale(1.05);} 100% { transform: translateY(0) translateX(0) scale(1);} }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98);} to { opacity: 1; transform: scale(1);} }
        @keyframes confetti { 0% { opacity: 0; transform: translateY(-10px) scale(0.9);} 30% { opacity: 1; transform: translateY(0) scale(1);} 100% { opacity: 0; transform: translateY(40px) scale(0.9);} }
        @keyframes bubblePulse { 0% { transform: scale(1);} 50% { transform: scale(1.08);} 100% { transform: scale(1);} }
        .bubble { position: absolute; border-radius: 9999px; opacity: 0.7; background: radial-gradient(circle at 30% 30%, #ffd6e8, #ffc0dc); mix-blend-mode: screen; box-shadow: 0 0 12px rgba(255,150,200,0.55), 0 0 22px rgba(255,160,210,0.35); }
        .bubble.float { animation: float 12s ease-in-out infinite; }
        .symbol { animation: fadeIn 0.35s ease-in-out; }
        .confetti-piece { position: absolute; width: 10px; height: 6px; background: linear-gradient(90deg,#ff9fcf,#ff6fb1); opacity: 0.95; transform-origin: center; animation: confetti 1.4s ease-out forwards; }
        .glass { backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
      `}</style>

      {/* Animated bubbles (stable configs) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {bubbleConfigs.map((b, i) => (
          <div
            key={i}
            className="bubble float"
            style={{
              left: `${b.left}%`,
              top: `${b.top}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              animationDelay: b.delay,
              animationDuration: `${b.duration}s`,
              zIndex: 1
            }}
          />
        ))}
      </div>

      <div className="max-w-md w-full bg-white/70 glass rounded-3xl shadow-2xl border border-pink-100 p-6 relative z-10">
        <h1 className="text-2xl font-semibold text-pink-600 mb-2">Крестики — Нолики</h1>
        <p className="text-sm text-gray-600 mb-4">Играй против компьютера — лёгкая, стильная версия для женщин 25–40 лет.</p>

        <div className="grid grid-cols-3 gap-4 p-5 bg-white rounded-2xl shadow-inner border border-pink-200 relative z-20">
          {board.map((cell, idx) => (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              className={`aspect-square bg-white border border-pink-300 relative z-30 rounded-2xl flex items-center justify-center text-4xl font-extrabold shadow-lg transform transition-all hover:scale-105 active:scale-95 ${
                cell === 'X' ? 'text-pink-700' : cell === 'O' ? 'text-gray-500' : 'text-pink-300'
              }`}
              style={{
                background: 'linear-gradient(180deg,#ffffff 0%, #fff6f9 100%)',
                boxShadow: '0 6px 20px rgba(16,24,40,0.06)'
              }}
              aria-label={`Cell ${idx + 1}`}>
              <span className="symbol">{cell === 'X' ? '✕' : cell === 'O' ? '○' : ''}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {winner ? (winner === 'X' ? 'Вы выиграли!' : winner === 'O' ? 'Вы проиграли' : 'Ничья') : playerTurn ? 'Ваш ход' : 'Ход компьютера'}
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={resetGame} className="text-sm px-3 py-1 rounded-full border border-pink-200 text-pink-600">Сбросить</button>
            <button onClick={() => { setBoard(Array(9).fill(null)); setPlayerTurn(true); setWinner(null); }} className="text-sm px-3 py-1 rounded-full bg-pink-600 text-white">Новая игра</button>
          </div>
        </div>

        {/* Visual confetti when player wins (rendered separately so JSX stays valid) */}
        {winner && winner === 'X' && (
          <div className="pointer-events-none fixed inset-0 z-40">
            {Array.from({ length: 30 }).map((_, i) => {
              const left = Math.round(Math.random() * 90);
              const top = -10 - Math.round(Math.random() * 40);
              const rotate = Math.round(Math.random() * 360);
              const delay = (Math.random() * 0.3).toFixed(2) + 's';
              const hue = 320 + Math.round(Math.random() * 30);
              return (
                <div
                  key={i}
                  className="confetti-piece"
                  style={{
                    left: `${left}%`,
                    top: `${top}px`,
                    transform: `rotate(${rotate}deg)`,
                    background: `linear-gradient(90deg,hsl(${hue} 85% 70%), hsl(${hue - 12} 75% 60%))`,
                    animationDelay: delay,
                    zIndex: 50 + i
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl z-60">
              {winner === 'X' ? (
                <>
                  <h2 className="text-xl font-semibold text-pink-600">Поздравляем — Вы выиграли!</h2>
                  <p className="mt-2 text-gray-600">Ваш промокод:</p>
                  <div className="mt-3 px-4 py-2 bg-pink-50 rounded-md text-center font-mono text-lg tracking-widest">{promoCode}</div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-full border">Закрыть</button>
                    <button onClick={() => { resetGame(); setShowModal(false); }} className="px-4 py-2 rounded-full bg-pink-600 text-white">Сыграть ещё</button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-700">Ох...</h2>
                  <p className="mt-2 text-gray-600">Кажется, на этот раз повезло не вам.</p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-full border">Закрыть</button>
                    <button onClick={() => { resetGame(); setShowModal(false); }} className="px-4 py-2 rounded-full bg-pink-600 text-white">Сыграть ещё</button>
                  </div>
                </>
              )}
              <div className="mt-3 text-xs text-gray-400">{messageSending ? 'Отправляем сообщение в Telegram...' : ''}</div>
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-400">
          По результатам игры <span className="font-mono"> вам будет выслано сообщение </span> в <span className="font-mono">Telegram</span>
        </div>
      </div>
    </div>
  );
}
