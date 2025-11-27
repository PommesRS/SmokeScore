import { useState, useRef, useEffect } from "react";
import { Box, IconButton } from "@mui/material";
import { DndContext, useDraggable, PointerSensor, useSensor, useSensors, TouchSensor } from "@dnd-kit/core";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteIcon from '@mui/icons-material/Delete';
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";

export function restrictToContainer(position, containerRef) {
  return ({ transform }) => {
    if (!containerRef.current) return transform;

    const container = containerRef.current;
    const el = container.querySelector("#text");
    if (!el) return transform;

    const containerHeight = container.offsetHeight;
    const elHeight = el.offsetHeight;

    // Berechnete, geplante Position nach dem Drag
    const newY = position.y + transform.y;

    const minY = 0;
    const maxY = containerHeight - elHeight;

    let correctedY = transform.y;

    if (newY < minY) {
      correctedY = minY - position.y;
    }

    if (newY > maxY) {
      correctedY = maxY - position.y;
    }

    return {
      ...transform,
      y: correctedY
    };
  };
}




function DraggableText({ text, setText, position, onDelete, setPosition }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: "text" });
  const textRef = useRef(null)
  const divTextRef = useRef(null)

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

  useEffect(() => {
    divTextRef.current.focus()
  }, [])

  return (
    <Box  style={style}>
      {/* Drag-Handle */}
      <IconButton
        {...listeners}
        {...attributes}
        ref={setNodeRef}
        size="small"
        sx={{ color: "white", p: 0.5, mr: 1, left: 3, position:'absolute', ':focus': {outline: 'none'}, touchAction:'none' }}
      >
        <DragIndicatorIcon fontSize="small" />
      </IconButton>

      {/* ContentEditable Text */}
      <div
        id="text"
        contentEditable
        suppressContentEditableWarning
        ref={divTextRef}
        onInput={(e) => {
          textRef.current = e.currentTarget.textContent;
        }}
        onBlur={() => setText(textRef.current)}
        style={{ color: "white", fontSize: 24, outline: "none", textAlign: 'center', textWrap: 'wrap', maxWidth:'100%', mx: 50, touchAction: 'none'}}
      >
        {text}
      </div>
      <IconButton
        size="small"
        sx={{ color: "white", p: 0.5, mr: 1, right: 3, position:'absolute', ':focus': {outline: 'none'} }}
        onClick={() => {
          setPosition({x: 0, y: 200})
          onDelete()
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default function ImageEditor({ imageUrl, text, position, setText, setPosition, imgRef, onDelete }) {
  const containerRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5
      }
    })
  );

  // const imgElement = document.getElementById("image");
  // const imageWidth = imgElement.offsetWidth;
  // const imageHeight = imgElement.offsetHeight;

  // const textElement = document.getElementById("text");
  // const textWidth = textElement.offsetWidth;
  // const textHeight = textElement.offsetHeight;

  return (
    <Box sx={{ textAlign: "center", maxHeight: '100dvh', width: '100%', mx: "auto", position: 'absolute', left: '50%', transform: 'translate(calc(-50% + 0.6px))', overflow:'hidden' }} display={'flex'} alignItems="center" justifyContent="center">
      <DndContext
        modifiers={[restrictToVerticalAxis, restrictToContainer(position, containerRef)]}
        sensors={sensors}
        onDragEnd={(event) => {
          const { delta } = event;
          setPosition((prev) => ({
            x: prev.x + delta.x,
            y: prev.y + delta.y
          }));
        }}
      >
        <Box ref={containerRef} sx={{ position: "relative", maxWidth: '546px', maxHeight: '100dvh' }}>
          <img className="storyImg" ref={imgRef} id="image" src={imageUrl} alt="preview" />

          <DraggableText
            text={text}
            setText={setText}
            position={position}
            setPosition={setPosition}
            onDelete={onDelete}
          />
        </Box>
      </DndContext>
    </Box>
  );
}