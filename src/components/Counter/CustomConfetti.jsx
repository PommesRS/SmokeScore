import { createPortal } from "react-dom";
import Confetti from "react-confetti-boom";

function CustomConfetti() {
	return (
		<>
			{createPortal(
				<div
					style={{
						position: "fixed",
						inset: 0,
						zIndex: 99999,
						pointerEvents: "none"
					}}
				>
					<Confetti
						mode="boom"
						fadeOutHeight={1}
						x={0}
						y={0.2}
						deg={0}
					/>
					<Confetti
						mode="boom"
						fadeOutHeight={1}
						x={1}
						y={0.2}
						deg={180}
					/>
				</div>,
				document.body
			)}
		</>
	);
}

export default CustomConfetti