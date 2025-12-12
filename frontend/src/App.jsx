import TicTacToeGame from "./components/TicTacToeGame"

export default function App() {
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Animated background bubbles */}
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="bubble animate-bubble"
          style={{
            width: `${20 + Math.random() * 60}px`,
            height: `${20 + Math.random() * 60}px`,
            left: `${Math.random() * 100}vw`,
            top: `${100 + Math.random() * 40}vh`,
            animationDuration: `${8 + Math.random() * 12}s`,
            animationDelay: `${Math.random() * 6}s`,
          }}
        />
      ))}

      <TicTacToeGame />
    </div>
  )
}
