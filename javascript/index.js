// ======================================= Element =======================================
const connectCameraBtn = document.getElementById("connect-camera-btn");
const triggerBtn = document.getElementById("trigger-btn");
const continuousBtn = document.getElementById("continuous-btn");
const resetBtn = document.getElementById("reset-btn");
const imageProcessed = document.getElementById("processed-image");
const circleTime = document.getElementById("circle-time");
const expectedChotGo = document.getElementById("expected-chotgo");
const expectedBulon = document.getElementById("expected-bulon");
const expectedVitxoan = document.getElementById("expected-vitxoan");
const chotGoResult = document.getElementById("chotgo-result");
const bulonResult = document.getElementById("bulon-result");
const vitXoanResult = document.getElementById("vitxoan-result");
const totalCountable = document.getElementById("total-countable");
const counterQuantity = document.getElementById("counter-quantity");

let colorOk = "rgb(17, 240, 17)";
let colorNG = "red";
let response,
  stopTime,
  isLive = false,
  isGrabbing = false;

// document.addEventListener("DOMContentLoaded", async () => {
//   await window.api.initialPython();
//   checkBackendContinuously();
// });
// Lắng nghe sự kiện "model-closed" từ tiến trình chính
window.api.receive("model-closed", () => {
  loadValueModel();
});
let isCameraConnected = false;

// ======================================= Connect / Disconnect camera =======================================
connectCameraBtn.addEventListener("click", async () => {
  const icon = connectCameraBtn.querySelector("i");

  if (!isCameraConnected) {
    // Gọi kết nối camera
    const response = await window.api.connectCamera();
    console.log(response);

    if (response.message === "Camera connected successfully") {
      isCameraConnected = true;
      connectCameraBtn.innerHTML = '<i class="fas fa-unlink"></i> Disconnect';
      connectCameraBtn.style.backgroundColor = "rgb(228, 228, 77)";
      // Bật hai 2 button triggert
      triggerBtn.disabled = false;
      continuousBtn.disabled = false;
    } else {
      alert("Không thể kết nối camera!");
    }
  } else {
    // Gọi ngắt kết nối camera
    const response = await window.api.disconnectCamera();
    console.log(response);

    if (response.message === "Camera disconnected successfully") {
      isCameraConnected = false;
      connectCameraBtn.innerHTML =
        '<i class="fas fa-video"></i> Connect Camera';
      connectCameraBtn.style.backgroundColor = ""; // về màu mặc định
      // Tắt hai 2 button triggert
      triggerBtn.disabled = true;
      continuousBtn.disabled = true;
    } else {
      alert("Không thể ngắt kết nối camera!");
    }
  }
});

// ======================================= Kiểm tra backend =======================================
// async function checkBackendContinuously() {
//   const interval = 3000;
//   const checkInterval = setInterval(async () => {
//     try {
//       response = await window.api.checkBackend();
//       if (response.message === "Check backend finish") {
//         elements.showStatus.textContent =
//           "Backend is ready: " + response.message;
//         clearInterval(checkInterval);
//         elements.loading.style.display = "none";
//         response = await window.api.connectCamera();
//         elements.showStatus.textContent = response.message;
//       } else {
//         console.log("Still checking backend...");
//       }
//     } catch (error) {
//       console.error("Error checking backend:", error);
//     }
//   }, interval);
// }

// ======================================= Trigger =======================================

triggerBtn.addEventListener("click", async () => {
  const response = await window.api.trigger();
  const { processed_image_url, detections, cycle_time, message } = response;

  // Reset giá trị ban đầu
  chotGoResult.textContent = 0;
  bulonResult.textContent = 0;
  vitXoanResult.textContent = 0;

  // Đếm số lượng từng loại
  let chotGoCount = 0;
  let bulonCount = 0;
  let vitxoanCount = 0;

  detections.forEach((detection) => {
    const label = detection.label.toLowerCase(); // xử lý chữ thường để so sánh
    if (label.includes("chot go")) chotGoCount++;
    else if (label.includes("bulon")) bulonCount++;
    else if (label.includes("vit xoan")) vitxoanCount++;
  });

  // Gán vào DOM
  chotGoResult.textContent = chotGoCount;
  bulonResult.textContent = bulonCount;
  vitXoanResult.textContent = vitxoanCount;

  // Gán hình ảnh và thời gian
  imageProcessed.src = processed_image_url;
  circleTime.value = cycle_time;
});

// ======================================= Live =======================================
// const updateLiveButtonState = (state) => {
//   if (state) {
//     elements.liveButtonText.textContent = "STOP";
//     elements.liveButtonIcon.classList.replace("fa-video", "fa-stop");
//     elements.liveButton.style.background = "#FFC107";
//   } else {
//     elements.liveButtonText.textContent = "LIVE";
//     elements.liveButtonIcon.classList.replace("fa-stop", "fa-video");
//     elements.liveButton.style.background = "#1abc9c";
//   }
// };

// ======================================= Run Grab =======================================
// const updateButtonState = () => {
//   if (isGrabbing) {
//     elements.runButtonText.textContent = "STOP";
//     elements.runButtonIcon.classList.replace("fa-play", "fa-stop");
//     elements.runButton.style.background = "#FFC107";
//   } else {
//     elements.runButtonText.textContent = "RUN";
//     elements.runButtonIcon.classList.replace("fa-stop", "fa-play");
//     elements.runButton.style.background = "#1abc9c";
//   }
// };

let chotGoTotal = 0;
let bulunTotal = 0;
let vitXoanTotal = 0;

let counterTotal = 0;

const updateResults = async () => {
  try {
    const response = await window.api.startGrab();
    const { processed_image_url, detections, cycle_time } = response;

    imageProcessed.src = processed_image_url;
    circleTime.value = cycle_time;

    let chotgo = 0;
    let bulon = 0;
    let vitxoan = 0;

    // Đếm từng nhãn trong detection
    detections.forEach((detection) => {
      const label = detection.label.toLowerCase();
      if (label.includes("chot go")) chotgo++;
      else if (label.includes("bulon")) bulon++;
      else if (label.includes("vit xoan")) vitxoan++;
    });

    // Cộng từng sản phẩm đếm được vào tổng
    chotGoTotal += chotgo;
    bulunTotal += bulon;
    vitXoanTotal += vitxoan;

    // Cộng luôn từng sản phẩm đếm được vào tổng số lượng đã đạt
    counterTotal += chotgo + bulon + vitxoan;

    // Reset riêng từng loại nếu đạt expected
    if (chotGoTotal >= Number(expectedChotGo.value)) {
      chotGoTotal = 0;
    }

    if (bulunTotal >= Number(expectedBulon.value)) {
      bulunTotal = 0;
    }

    if (vitXoanTotal >= Number(expectedVitxoan.value)) {
      vitXoanTotal = 0;
    }

    // Cập nhật UI
    
    chotGoResult.textContent = chotGoTotal;
    bulonResult.textContent = bulunTotal;
    vitXoanResult.textContent = vitXoanTotal;
    counterQuantity.value = counterTotal;

    console.log("Tổng sản phẩm đã đạt: ", counterQuantity.value);

    // Kiểm tra đã đạt mục tiêu chưa
    if (counterTotal >= Number(totalCountable.value)) {
      console.log("🎯 Đã đạt tổng số lượng yêu cầu. Dừng lại.");

      isGrabbing = false;
      continuousBtn.innerText = "Start Continuous";
      continuousBtn.style.backgroundColor = "";

      // reset tổng nếu muốn bắt đầu lại lần sau
      counterTotal = 0;

      return;
    }

    if (isGrabbing) {
      setTimeout(updateResults, 10); // tiếp tục sau 10ms
    }
  } catch (error) {
    console.error("Lỗi trong quá trình lấy ảnh:", error);
    isGrabbing = false;
  }
};

continuousBtn.addEventListener("click", async () => {
  isGrabbing = !isGrabbing;

  if (isGrabbing) {
    // Khi bắt đầu
    continuousBtn.innerHTML =
      '<i class="fas fa-pause-circle"></i> Stop Continuous';
    continuousBtn.style.backgroundColor = "rgb(228, 228, 77)";
    updateResults();
  } else {
    // Khi dừng
    continuousBtn.innerHTML =
      '<i class="fas fa-play-circle"></i> Start Continuous';
    continuousBtn.style.backgroundColor = ""; // reset về mặc định
  }
});

resetBtn.addEventListener("click", () => {
  chotGoResult.textContent = 0;
  bulonResult.textContent = 0;
  vitXoanResult.textContent = 0;
  counterQuantity.value = 0;
});
