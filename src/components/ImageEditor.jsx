import { useState, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import { DndContext, useDraggable, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
function DraggableText({ text, setText, position, setPosition }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: "text" });
  const textRef = useRef(null)

  const style = {
    position: "absolute",
    left: position.x,
    top: position.y,
    transform: transform
      ? `translate(0px, ${transform.y}px)`
      : "translate(0,0)",
    display: "flex",
    alignItems: "center",
    padding: "2px 4px",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 0,
    userSelect: "text",
    width: '100%',
    justifyContent: 'center'
  };

  return (
    <Box  style={style}>
      {/* Drag-Handle */}
      <IconButton
        {...listeners}
        {...attributes}
        ref={setNodeRef}
        size="small"
        sx={{ color: "white", p: 0.5, mr: 1, left: 3, position:'absolute', ':focus': {outline: 'none'} }}
      >
        <DragIndicatorIcon fontSize="small" />
      </IconButton>

      {/* ContentEditable Text */}
      <div
        id="text"
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => {
          textRef.current = e.currentTarget.textContent;
        }}
        onBlur={() => setText(textRef.current)}
        style={{ color: "white", fontSize: 24, outline: "none", textAlign: 'center', textWrap: 'wrap', maxWidth:'100%', mx: 50}}
      >
        {text}
      </div>
    </Box>
  );
}

export default function ImageEditor({ imageUrl }) {
  const [text, setText] = useState("Mein Text");
  const [position, setPosition] = useState({ x: 0, y: 500 });


  const sensors = useSensors(useSensor(PointerSensor));

  // const imgElement = document.getElementById("image");
  // const imageWidth = imgElement.offsetWidth;
  // const imageHeight = imgElement.offsetHeight;

  // const textElement = document.getElementById("text");
  // const textWidth = textElement.offsetWidth;
  // const textHeight = textElement.offsetHeight;

  return (
    <Box sx={{ textAlign: "center", height: '100%', mx: "auto", position: 'absolute', left: '50%', transform: 'translate(-50%)' }}>
      <DndContext
      modifiers={[restrictToVerticalAxis]}
        sensors={sensors}
        onDragEnd={(event) => {
          const { delta } = event;
          setPosition((prev) => ({
            x: prev.x + delta.x,
            y: prev.y + delta.y
          }));
        }}
      >
        <Box sx={{ position: "relative", width: "100%" }}>
          <img id="image" src={imageUrl} style={{ width: "auto", display: "block", objectFit: 'cover', height:'100vh' }} alt="preview" />

          <DraggableText
            text={text}
            setText={setText}
            position={position}
            setPosition={setPosition}
          />
        </Box>
      </DndContext>
    </Box>
  );
}
