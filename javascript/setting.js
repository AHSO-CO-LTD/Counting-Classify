// =========== Open window setting call get camera setting ===========
// ========= Menu =========
function selectMenu(menu) {
  const menuItems = ["ccd", "connect-camera", "history", "vision"];
  menuItems.forEach((item) => {
    document.getElementById(item).classList.remove("active");
    document.getElementById(`${item}-content`).classList.remove("active");
  });
  document.getElementById(menu).classList.add("active");
  document.getElementById(`${menu}-content`).classList.add("active");
}
// ========= Get value model =========
const nameModelSetting = document.getElementById("name-model");
document.addEventListener("DOMContentLoaded", async () => {
  const selectedModel = localStorage.getItem("selectedModel");

  if (selectedModel) {
    nameModelSetting.textContent = selectedModel;
    // Sử dụng tên model ở đây
  } else {
    console.log("No model selected.");
  }
  try {
    // Truyền tên file json cần đọc cho api
    const response = await window.api.readModel(nameModelSetting.textContent);
    // Kiểm tra dữ liệu trả về
    if (!response) {
      console.error("Unable to receive response from API.");
    } else if (!response.file_path) {
      console.error("The returned data is invalid.");
    } else {
      const modelData = response.data;
      // CCD
      document.getElementById("width").value = modelData.ImageSettings.Width;
      document.getElementById("height").value = modelData.ImageSettings.Height;
      document.getElementById("offsetX").value =
        modelData.ImageSettings.OffsetX;
      document.getElementById("offsetY").value =
        modelData.ImageSettings.OffsetY;
      document.getElementById("gain").value =
        modelData.AcquisitionSettings.Gain.Value;
      document.getElementById("exposure").value =
        modelData.AcquisitionSettings.ExposureTime.Value;
      // Camera
      document.getElementById("camera-select").value =
        modelData.DeviceInformation.DeviceName;
    }
  } catch (error) {
    console.error("Error reading JSON file:", error);
  }
  // const filePath = `../backend/models/${nameModelSetting.textContent}`; // Đường dẫn đến file JSON
  // // Truy xuất file JSON
  // fetch(filePath)
  //   .then((response) => {
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch JSON file");
  //     }
  //     return response.json();
  //   })
  //   .then((data) => {
  //     console.log(data);
  //     // Hiển thị dữ liệu JSON lên giao diện
  //     // CCD
  //     document.getElementById("width").value = data.ImageSettings.Width;
  //     document.getElementById("height").value = data.ImageSettings.Height;
  //     document.getElementById("offsetX").value = data.ImageSettings.OffsetX;
  //     document.getElementById("offsetY").value = data.ImageSettings.OffsetY;
  //     document.getElementById("gain").value =
  //       data.AcquisitionSettings.Gain.Value;
  //     document.getElementById("exposure").value =
  //       data.AcquisitionSettings.ExposureTime.Value;
  //     // Camera
  //     document.getElementById("name-camera").textContent =
  //       data.DeviceInformation.DeviceName;
  //   })
  //   .catch((error) => {
  //     console.error("Error loading JSON file:", error);
  //   });
});

// ====== CCD ======
const statusCCD = document.getElementById("status-para-response");
const applySettingsButton = document.getElementById("set-data-ccd");
applySettingsButton.addEventListener("click", async () => {
  // Gọi luôn api saveCameraSetting khi cài đặt thông số camera
  const nameModel = nameModelSetting.textContent;
  await window.api.saveCameraSetting(nameModel);

  const width = document.getElementById("width").value;
  const height = document.getElementById("height").value;
  const offsetX = document.getElementById("offsetX").value;
  const offsetY = document.getElementById("offsetY").value;
  const gain = document.getElementById("gain").value;
  const exposure = document.getElementById("exposure").value;

  const settings = { width, height, offsetX, offsetY, gain, exposure };
  const response = await window.api.setCameraSettings(settings);
  document.getElementById("width").value = " ";
  document.getElementById("height").value = " ";
  document.getElementById("offsetX").value = " ";
  document.getElementById("offsetY").value = " ";
  document.getElementById("gain").value = " ";
  document.getElementById("exposure").value = " ";
  statusCCD.textContent = response.message;
});

// ===================== Camera =====================
// Connect camera
document
  .getElementById("connect-camera-btn")
  .addEventListener("click", async () => {
    await window.api.connectCamera();
    // await window.api.getCameraSettings();
  });
// Disconnect camera
document
  .getElementById("disconnect-camera-btn")
  .addEventListener("click", async () => {
    const response = await window.api.disconnectCamera();
    console.log(response.message);
  });
