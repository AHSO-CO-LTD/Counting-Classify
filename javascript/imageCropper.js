let img = new Image();
let startX, startY, endX, endY;
let isDrawing = false;
let isCropping = false;
let cropMode = "";
let rotationAngle = 0;
let isRotating = false;
let isDragging = false;

const input = document.getElementById("image-upload");
const cropRectangleBtn = document.getElementById("crop-rectangle");
const cropCircleBtn = document.getElementById("crop-circle");
const cropTriangle = document.getElementById("crop-triangle");
const cropAnnulus = document.getElementById("crop-annulus");
const confirmCropBtn = document.getElementById("confirm-crop");
const saveButton = document.getElementById("save-button");
const rotateBtn = document.getElementById("rotate-button");
const canvasInput = document.getElementById("canvas-input");
const canvasOutput = document.getElementById("canvas-output");
const ctxInput = canvasInput.getContext("2d");
const ctxOutput = canvasOutput.getContext("2d");

input.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

img.onload = function () {
  canvasInput.width = img.width / 2;
  canvasInput.height = img.height / 2;
  drawImageWithRotation();
};
// Hàm vẽ ảnh với góc xoay hiện tại
// function drawImageWithRotation() {
//   ctxInput.clearRect(0, 0, canvasInput.width, canvasInput.height);
//   ctxInput.save();
//   ctxInput.translate(canvasInput.width / 2, canvasInput.height / 2);
//   ctxInput.rotate((rotationAngle * Math.PI) / 180);
//   ctxInput.drawImage(
//     img,
//     -canvasInput.width / 2,
//     -canvasInput.height / 2,
//     canvasInput.width,
//     canvasInput.height
//   );
//   ctxInput.restore();
// }

function drawImageWithRotation() {
  const imgWidth = img.width;
  const imgHeight = img.height;

  // Tính toán kích thước tối đa cần thiết để không bị mất góc
  const maxSize = Math.ceil(Math.hypot(imgWidth, imgHeight));

  // Giữ nguyên kích thước ảnh gốc
  canvasInput.width = imgWidth;
  canvasInput.height = imgHeight;

  // Xóa canvas và lưu trạng thái
  ctxInput.clearRect(0, 0, canvasInput.width, canvasInput.height);
  ctxInput.save();

  // Tính tỷ lệ co để ảnh không bị phóng to
  const scale = Math.min(
    canvasInput.width / maxSize,
    canvasInput.height / maxSize
  );
  ctxInput.scale(scale, scale);

  // Dịch tâm về giữa canvas
  ctxInput.translate(imgWidth / 2 / scale, imgHeight / 2 / scale);

  // Xoay ảnh
  ctxInput.rotate((rotationAngle * Math.PI) / 180);

  // Vẽ ảnh đúng vị trí mà không bị phóng to
  ctxInput.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);

  // Khôi phục trạng thái canvas
  ctxInput.restore();
}

// Nhấn nút Rotate để bật/tắt xoay ảnh
rotateBtn.addEventListener("click", () => {
  isRotating = !isRotating;
  rotateBtn.innerText = isRotating ? "Stop Rotating" : "Rotate Image";
});
let innerRatio = 0.5; // Tỷ lệ ban đầu giữa vòng trong và vòng ngoài

canvasInput.addEventListener("wheel", (e) => {
  if (cropMode === "annulus") {
    e.preventDefault(); // Ngăn chặn cuộn trang mặc định
    innerRatio += e.deltaY > 0 ? -0.05 : 0.05; // Cuộn xuống thì giảm, cuộn lên thì tăng

    // Giới hạn tỷ lệ vòng tròn bên trong
    innerRatio = Math.max(0.1, Math.min(innerRatio, 0.9));

    drawImageWithRotation(); // Vẽ lại ảnh
    drawAnnulus(startX, startY, endX, endY);
  } else {
    if (e.deltaY > 0) {
      e.preventDefault();
      cropRotationAngle += 5; // Lăn xuống để xoay phải
    } else {
      cropRotationAngle -= 5; // Lăn lên để xoay trái
    }
    drawRotatedCrop();
  }
});

// Hàm vẽ annulus với innerRatio động
function drawAnnulus(x1, y1, x2, y2) {
  const outerRadius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const innerRadius = outerRadius * innerRatio; // Bán kính trong theo tỷ lệ

  ctxInput.strokeStyle = "red";
  ctxInput.beginPath();
  ctxInput.arc(x1, y1, outerRadius, 0, 2 * Math.PI);
  ctxInput.moveTo(x1 + innerRadius, y1);
  ctxInput.arc(x1, y1, innerRadius, 0, 2 * Math.PI, true);
  ctxInput.stroke();
}
// Khi giữ chuột và kéo, ảnh sẽ xoay
canvasInput.addEventListener("mousedown", (e) => {
  if (isRotating) {
    isDragging = true;
    startX = e.clientX;
  } else if (isCropping) {
    isDrawing = true;
    const rect = canvasInput.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
  }
});

canvasInput.addEventListener("mousemove", (e) => {
  if (isDragging && isRotating) {
    const deltaX = e.clientX - startX;
    rotationAngle += deltaX * 0.5;
    startX = e.clientX;
    drawImageWithRotation();
  } else if (isDrawing && isCropping) {
    const rect = canvasInput.getBoundingClientRect();
    endX = e.clientX - rect.left;
    endY = e.clientY - rect.top;

    drawImageWithRotation();
    ctxInput.strokeStyle = "red";
    ctxInput.lineWidth = 2;

    if (cropMode === "rectangle") {
      ctxInput.strokeRect(startX, startY, endX - startX, endY - startY);
    } else if (cropMode === "circle") {
      const radius = Math.sqrt(
        Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
      );
      ctxInput.beginPath();
      ctxInput.arc(startX, startY, radius, 0, 2 * Math.PI);
      ctxInput.stroke();
    } else if (cropMode === "triangle") {
      const cneterX = (startX + endX) / 2;
      const topY = Math.min(startY, endY);
      const bottomY = Math.max(startY, endY);
      const baseLeftX = startX;
      const baseRightX = endX;

      ctxInput.beginPath();
      ctxInput.moveTo(cneterX, topY);
      ctxInput.lineTo(baseRightX, bottomY);
      ctxInput.lineTo(baseLeftX, bottomY);
      ctxInput.closePath();
      ctxInput.stroke();
    } else if (isDrawing && isCropping && cropMode === "annulus") {
      // const outerRadius = Math.sqrt(
      //   Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
      // );
      // const innerRadius = outerRadius / 2;
      // ctxInput.beginPath();
      // ctxInput.arc(startX, startY, outerRadius, 0, 2 * Math.PI);
      // ctxInput.moveTo(startX + outerRadius / 2, startY);
      // ctxInput.arc(startX, startY, innerRadius, 0, 2 * Math.PI, true);
      // ctxInput.stroke();
      const rect = canvasInput.getBoundingClientRect();
      endX = e.clientX - rect.left;
      endY = e.clientY - rect.top;

      drawImageWithRotation();
      drawAnnulus(startX, startY, endX, endY);
    }
  }
});

// Khi thả chuột, dừng xoay hoặc kết thúc chọn vùng cắt
canvasInput.addEventListener("mouseup", () => {
  isDragging = false;
  isDrawing = false;
});

// Khi nhấn nút cắt, kích hoạt chế độ cắt ảnh
cropRectangleBtn.addEventListener("click", () => setCropMode("rectangle"));
cropCircleBtn.addEventListener("click", () => setCropMode("circle"));
cropTriangle.addEventListener("click", () => setCropMode("triangle"));
cropAnnulus.addEventListener("click", () => setCropMode("annulus"));

function setCropMode(mode) {
  if (isRotating) return;
  isCropping = true;
  cropMode = mode;
  drawImageWithRotation();
}

// Xác nhận cắt ảnh
confirmCropBtn.addEventListener("click", () => {
  if (!startX || !startY || !endX || !endY) return;

  const width = endX - startX;
  const height = endY - startY;

  canvasOutput.width = Math.abs(width);
  canvasOutput.height = Math.abs(height);

  const radius = Math.sqrt(
    Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
  );

  ctxOutput.clearRect(0, 0, canvasOutput.width, canvasOutput.height);

  if (cropMode === "rectangle") {
    ctxOutput.drawImage(
      canvasInput,
      startX,
      startY,
      width,
      height,
      0,
      0,
      width,
      height
    );
  } else if (cropMode === "circle" && radius > 0) {
    // Cắt hình tròn
    canvasOutput.width = radius * 2;
    canvasOutput.height = radius * 2;
    ctxOutput.clearRect(0, 0, canvasOutput.width, canvasOutput.height);

    ctxOutput.beginPath();
    ctxOutput.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctxOutput.clip();
    ctxOutput.drawImage(
      canvasInput,
      startX - radius,
      startY - radius,
      radius * 2,
      radius * 2,
      0,
      0,
      radius * 2,
      radius * 2
    );
  } else if (cropMode === "triangle") {
    ctxOutput.beginPath();
    ctxOutput.moveTo(width / 2, 0);
    ctxOutput.lineTo(width, height);
    ctxOutput.lineTo(0, height);
    ctxOutput.closePath();
    ctxOutput.clip();
    ctxOutput.drawImage(
      canvasInput,
      startX,
      startY,
      width,
      height,
      0,
      0,
      width,
      height
    );
  } else if (cropMode === "annulus" && radius > 0) {
    // canvasOutput.width = radius * 2;
    // canvasOutput.height = radius * 2;
    // ctxOutput.clearRect(0, 0, canvasOutput.width, canvasOutput.height);

    // const innerRadius = radius / 2;
    // ctxOutput.beginPath();
    // ctxOutput.arc(radius, radius, radius, 0, 2 * Math.PI);
    // ctxOutput.moveTo(radius + innerRadius, radius);
    // ctxOutput.arc(radius, radius, innerRadius, 0, 2 * Math.PI, true);
    // ctxOutput.clip();
    // ctxOutput.drawImage(
    //   canvasInput,
    //   startX - radius,
    //   startY - radius,
    //   radius * 2,
    //   radius * 2,
    //   0,
    //   0,
    //   radius * 2,
    //   radius * 2
    // );
    const outerRadius = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );
    const innerRadius = outerRadius * innerRatio;

    canvasOutput.width = outerRadius * 2;
    canvasOutput.height = outerRadius * 2;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = outerRadius * 2;
    tempCanvas.height = outerRadius * 2;
    const tempCtx = tempCanvas.getContext("2d");

    // Cắt ảnh từ canvas input
    tempCtx.drawImage(
      canvasInput,
      startX - outerRadius,
      startY - outerRadius,
      outerRadius * 2,
      outerRadius * 2,
      0,
      0,
      outerRadius * 2,
      outerRadius * 2
    );
    tempCtx.globalCompositeOperation = "destination-in";
    tempCtx.beginPath();
    tempCtx.arc(outerRadius, outerRadius, outerRadius, 0, 2 * Math.PI);
    tempCtx.moveTo(outerRadius + innerRadius, outerRadius);
    tempCtx.arc(outerRadius, outerRadius, innerRadius, 0, 2 * Math.PI, true);
    tempCtx.closePath();
    tempCtx.fill();

    ctxOutput.clearRect(0, 0, canvasOutput.width, canvasOutput.height);
    ctxOutput.drawImage(tempCanvas, 0, 0);
  }
});

// Lưu ảnh đã cắt
saveButton.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "cropped-image.png";
  link.href = canvasOutput.toDataURL();
  link.click();
});
