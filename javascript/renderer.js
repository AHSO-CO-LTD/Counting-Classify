const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const img = new Image();
let cropRect = {
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  rotation: 0,
};
let resizing = false;
let rotating = false;
let startX, startY, startWidth, startHeight, startAngle;

document
  .getElementById("fileInput")
  .addEventListener("change", handleFileSelect);

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      img.src = e.target.result;
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0); // Vẽ hình ảnh lên canvas
        drawCropRect();
      };
    };
    reader.readAsDataURL(file);
  }
}

function drawCropRect() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Xóa canvas trước khi vẽ lại
  ctx.drawImage(img, 0, 0); // Vẽ lại hình ảnh mỗi lần

  // Vẽ khung cắt
  ctx.save();
  ctx.translate(
    cropRect.x + cropRect.width / 2,
    cropRect.y + cropRect.height / 2
  );
  ctx.rotate(cropRect.rotation);
  ctx.translate(
    -(cropRect.x + cropRect.width / 2),
    -(cropRect.y + cropRect.height / 2)
  );
  ctx.beginPath();
  ctx.rect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "red";
  ctx.stroke();
  ctx.restore();

  drawResizeHandles();
}

function drawResizeHandles() {
  const size = 8;
  const { x, y, width, height } = cropRect;

  ctx.fillStyle = "blue";
  // Corner handles
  ctx.fillRect(x - size / 2, y - size / 2, size, size); // Top-left
  ctx.fillRect(x + width - size / 2, y - size / 2, size, size); // Top-right
  ctx.fillRect(x - size / 2, y + height - size / 2, size, size); // Bottom-left
  ctx.fillRect(x + width - size / 2, y + height - size / 2, size, size); // Bottom-right
  // Mid-point handles
  ctx.fillRect(x + width / 2 - size / 2, y - size / 2, size, size); // Top-center
  ctx.fillRect(x + width / 2 - size / 2, y + height - size / 2, size, size); // Bottom-center
  ctx.fillRect(x - size / 2, y + height / 2 - size / 2, size, size); // Left-center
  ctx.fillRect(x + width - size / 2, y + height / 2 - size / 2, size, size); // Right-center
}

canvas.addEventListener("mousedown", (e) => {
  const { offsetX, offsetY } = e;
  const { x, y, width, height } = cropRect;
  const size = 8;

  // Check for resize handle
  if (isInArea(offsetX, offsetY, x - size / 2, y - size / 2, size, size)) {
    resizing = "top-left";
  } else if (
    isInArea(offsetX, offsetY, x + width - size / 2, y - size / 2, size, size)
  ) {
    resizing = "top-right";
  } else if (
    isInArea(offsetX, offsetY, x - size / 2, y + height - size / 2, size, size)
  ) {
    resizing = "bottom-left";
  } else if (
    isInArea(
      offsetX,
      offsetY,
      x + width - size / 2,
      y + height - size / 2,
      size,
      size
    )
  ) {
    resizing = "bottom-right";
  } else if (
    isInArea(
      offsetX,
      offsetY,
      x + width / 2 - size / 2,
      y - size / 2,
      size,
      size
    )
  ) {
    resizing = "top-center";
  } else if (
    isInArea(
      offsetX,
      offsetY,
      x + width / 2 - size / 2,
      y + height - size / 2,
      size,
      size
    )
  ) {
    resizing = "bottom-center";
  } else if (
    isInArea(
      offsetX,
      offsetY,
      x - size / 2,
      y + height / 2 - size / 2,
      size,
      size
    )
  ) {
    resizing = "left-center";
  } else if (
    isInArea(
      offsetX,
      offsetY,
      x + width - size / 2,
      y + height / 2 - size / 2,
      size,
      size
    )
  ) {
    resizing = "right-center";
  } else {
    rotating = isInArea(
      offsetX,
      offsetY,
      x + width / 2,
      y + height / 2,
      50,
      50
    ); // Check if clicking near center for rotating
  }

  startX = offsetX;
  startY = offsetY;
  startWidth = cropRect.width;
  startHeight = cropRect.height;
  startAngle = cropRect.rotation;
});

canvas.addEventListener("mousemove", (e) => {
  if (resizing) {
    const { offsetX, offsetY } = e;
    resizeCropRect(offsetX, offsetY);
  } else if (rotating) {
    const { offsetX, offsetY } = e;
    rotateCropRect(offsetX, offsetY);
  }
  drawCropRect();
});

canvas.addEventListener("mouseup", () => {
  resizing = false;
  rotating = false;
});

function isInArea(x, y, rectX, rectY, width, height) {
  return x >= rectX && x <= rectX + width && y >= rectY && y <= rectY + height;
}

function resizeCropRect(offsetX, offsetY) {
  const { x, y, width, height } = cropRect;

  if (resizing === "top-left") {
    cropRect.width = x + width - offsetX;
    cropRect.height = y + height - offsetY;
    cropRect.x = offsetX;
    cropRect.y = offsetY;
  } else if (resizing === "top-right") {
    cropRect.width = offsetX - x;
    cropRect.height = y + height - offsetY;
    cropRect.y = offsetY;
  } else if (resizing === "bottom-left") {
    cropRect.width = x + width - offsetX;
    cropRect.height = offsetY - y;
    cropRect.x = offsetX;
  } else if (resizing === "bottom-right") {
    cropRect.width = offsetX - x;
    cropRect.height = offsetY - y;
  } else if (resizing === "top-center") {
    cropRect.height = y + height - offsetY;
    cropRect.y = offsetY;
  } else if (resizing === "bottom-center") {
    cropRect.height = offsetY - y;
  } else if (resizing === "left-center") {
    cropRect.width = x + width - offsetX;
    cropRect.x = offsetX;
  } else if (resizing === "right-center") {
    cropRect.width = offsetX - x;
  }
}

function rotateCropRect(offsetX, offsetY) {
  const centerX = cropRect.x + cropRect.width / 2;
  const centerY = cropRect.y + cropRect.height / 2;
  const angle = Math.atan2(offsetY - centerY, offsetX - centerX);
  cropRect.rotation = angle - Math.PI / 2; // Offset by 90 degrees
}
