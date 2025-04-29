const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Hàm mở cửa sổ settings từ index.html
  openCrop: () => ipcRenderer.send("open-crop"),
  // Hàm mở cửa sổ settings từ index.html
  openSettings: () => ipcRenderer.send("open-settings"),
  // Hàm mở cửa sổ model từ index.html
  openModel: () => ipcRenderer.send("open-model"),
  // Nghe sự kiện từ main process
  on: (channel, callback) => ipcRenderer.on(channel, callback),

  // Gửi dữ liệu từ renderer đến main process
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },

  initialPython: async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/bee/InitialPython"
      );
      if (!response.ok) throw new Error("Faild to scan camera.");
      return response.json();
    } catch (error) {
      console.error("Error scan camera: ", error);
      return { message: "Error scan camera ", error: error.message };
    }
  },
  scanCam: async () => {
    try {
      const response = await fetch("http://localhost:8080/api/bee/ScanCam");
      if (!response.ok) throw new Error("Fail to grab check");
      return response.json();
    } catch (error) {
      console.error("Error grab check: ", error);
      return { message: "Error grab check ", error: error.message };
    }
  },
  connectCamera: async () => {
    try {
      const response = await fetch("http://localhost:5000/api/connect_camera", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to connect camera");
      return response.json();
    } catch (error) {
      console.error("Error in connectCamera:", error);
      return { message: "Error connecting camera", error: error.message };
    }
  },
  disconnectCamera: async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/disconnect_camera",
        { method: "POST" }
      );
      if (!response.ok) throw new Error("Failed to disconnect camera");
      return response.json();
    } catch (error) {
      console.error("Error in disconnectCamera:", error);
      return { message: "Error disconnecting camera", error: error.message };
    }
  },
  checkBackend: async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/check_backend_ready",
        {
          method: "GET",
        }
      );
      if (!response.ok) throw new Error("Faild to check backend.");
      return response.json();
    } catch (error) {
      return { message: "Error check backend", error: error.message };
    }
  },
  setCameraSettings: async (settings) => {
    try {
      const response = await fetch("http://localhost:5000/api/set_settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error("Failed to set camera settings");
      return response.json();
    } catch (error) {
      console.error("Error in setCameraSettings:", error);
      return { message: "Error setting camera settings", error: error.message };
    }
  },
  getCameraSettings: async () => {
    try {
      const reponse = await fetch("http://localhost:5000/api/get_settings");
      const data = await reponse.json();

      if (reponse.ok) {
        console.log("Camera settings: ", data.settings);
        // Hiển thị thông số lên giao diện
        // CCD
        document.getElementById("width").value = data.settings.width;
        document.getElementById("height").value = data.settings.height;
        document.getElementById("offsetX").value = data.settings.offsetX;
        document.getElementById("offsetY").value = data.settings.offsetY;
        document.getElementById("gain").value = data.settings.gain;
        document.getElementById("exposure").value = data.settings.exposure;
      } else {
        console.error("Error fetching settings:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  },

  trigger: async () => {
    try {
      const response = await fetch("http://localhost:5000/api/trigger", {
        method: "POST",
      });

      // Kiểm tra nếu không thành công
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error occurred while triggering");
      }
    
      // Trả về dữ liệu JSON
      return await response.json();
    } catch (error) {
      console.error("Trigger error:", error.message);
      return { success: false, message: error.message };
    }
  },

  getLiveUrl: () => "http://localhost:5000/api/live",
  stopLive: async () => {
    try {
      const response = await fetch("http://localhost:5000/api/stop_live", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to stop live");
      return response.json();
    } catch (error) {
      console.error("Error stop live:", error);
      return { message: "Error stop live", error: error.message };
    }
  },
  grabCheck: async () => {
    const response = await fetch("http://localhost:5000/api/grab_check", {
      method: "POST",
    });
    return response.json();
  },

  // ============================ Run ============================
  startGrab: async () => {
    try {
      const reponse = await fetch("http://localhost:5000/api/start_grab", {
        method: "POST",
      });
      // Kiểm tra nếu không thành công
      if (!reponse.ok) {
        const errorData = await reponse.json();
        throw new Error(errorData.message || "Error occurred while start grab");
      }
      // Trả về dữ liệu JSON
      return await reponse.json();
    } catch (error) {
      console.error("Grab error:", error.message);
      return { success: false, message: error.message };
    }
  },

  stopGrab: async () => {
    try {
      const response = await fetch("http://localhost:5000/api/stop_grab", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to stop grabbing images");
      }
      const data = await response.json(); // Xử lý dữ liệu trả về từ server
    } catch (error) {
      console.error("Error:", error.message); // In ra lỗi nếu có
    }
  },
  // ============================ Save Image Pass ============================
  imagePass: async () => {
    try {
      const response = await fetch("http://localhost:5000/api/image_pass", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to save image pass.");
      return await response.json();
    } catch (error) {
      console.error("Error save image: ", error);
    }
  },
  imageError: async () => {
    try {
      const response = await fetch("http://localhost:5000/api/image_error", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Faild to save image error.");
      return await response.json();
    } catch (error) {
      console.Error("Error save image: ", error);
    }
  },
  // ============================ Model ============================
  createModel: async (nameModel) => {
    try {
      const response = await fetch("http://localhost:5000/api/create_model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_name: nameModel }),
      });
      if (!response.ok) throw new Error("Failt to create model.");
      return response.json();
    } catch (error) {
      console.error("Error in createModel:", error);
      return { message: "Error create model ", error: error.message };
    }
  },
  listModel: async () => {
    const listModels = document.getElementById("list-model");
    const nameModel = document.getElementById("name-model");

    try {
      // Xóa toàn bộ nội dung cũ trong list-model trước khi thêm các phần tử mới
      listModels.innerHTML = "";
      const response = await fetch("http://localhost:5000/api/list_models", {
        method: "GET",
      });
      if (!response.ok) throw new Error("Failed to list models");
      const data = await response.json();
      if (data.files && data.files.length > 0) {
        data.files.forEach((file) => {
          const modelItem = document.createElement("div");
          modelItem.className = "model-item";
          modelItem.textContent = file;
          listModels.appendChild(modelItem);
          // Thêm sự kiện click cho mỗi item
          modelItem.addEventListener("click", async () => {
            nameModel.value = file;
            // Lưu tên file vào localStorage
            localStorage.setItem("selectedModel", file);
          });
        });
      } else {
        listModels.textContent = "No files found in folder 'models'";
      }
    } catch (error) {
      console.error("Error fetching model list:", error);
      listModels.textContent = "Error loading list model.";
    }
  },
  loadModel: async (nameModel) => {
    if (!nameModel) {
      return;
    }
    const beltStandard = document.getElementById("belt-standard");
    const beltSize = document.getElementById("belt-size");
    const width = document.getElementById("width");
    const height = document.getElementById("height");
    const offsetX = document.getElementById("offsetX");
    const offsetY = document.getElementById("offsetY");
    const exposure = document.getElementById("exposure");
    const gain = document.getElementById("gain");

    try {
      const response = await fetch(
        `http://localhost:5000/api/load_model?file=${nameModel}`,
        {
          method: "GET",
        }
      );
      if (!response.ok) throw new Error("Failed to load model details");
      const data = await response.json();

      // Lấy giá trị từ json
      // Hiển thị thông tin chi tiết của file JSON
      beltStandard.value = data.SpinningCount.StandardBelt;
      beltSize.value = data.SpinningCount.SizeBelt;
      width.value = data.ImageSettings.Width;
      height.value = data.ImageSettings.Height;
      offsetX.value = data.ImageSettings.OffsetX;
      offsetY.value = data.ImageSettings.OffsetY;
      exposure.value = data.AcquisitionSettings.ExposureTime.Value;
      gain.value = data.AcquisitionSettings.Gain.Value;

      // detailsContent.textContent = JSON.stringify(data, null, 4); // Hiển thị toàn bộ thông tin JSON đẹp hơn
    } catch (error) {
      console.error("Error loading model details:", error);
    }
  },
  saveModel: async (nameModel) => {
    if (!nameModel) {
      console.error("Model name is required.");
      return;
    }

    // Thu thập giá trị từ các trường input
    const beltStandard = document.getElementById("belt-standard").value;
    const beltSize = document.getElementById("belt-size").value;
    const width = document.getElementById("width").value;
    const height = document.getElementById("height").value;
    const offsetX = document.getElementById("offsetX").value;
    const offsetY = document.getElementById("offsetY").value;
    const exposure = document.getElementById("exposure").value;
    const gain = document.getElementById("gain").value;
    const statusContext = document.getElementById("status");
    if (!width || !height || !offsetX || !offsetY || !exposure || !gain) {
      statusContext.textContent =
        "All fields are required. Please fill in all fields.";
      return;
    }
    // Đối tượng chứa các cập nhật
    const updates = {
      "SpinningCount.StandardBelt": parseInt(beltStandard, 10),
      "SpinningCount.SizeBelt": parseFloat(beltSize),
      "ImageSettings.Width": parseInt(width, 10),
      "ImageSettings.Height": parseInt(height, 10),
      "ImageSettings.OffsetX": parseInt(offsetX, 10),
      "ImageSettings.OffsetY": parseInt(offsetY, 10),
      "AcquisitionSettings.ExposureTime.Value": parseInt(exposure, 10),
      "AcquisitionSettings.Gain.Value": parseInt(gain, 10),
    };
    try {
      // Gửi yêu cầu đến API
      const response = await fetch("http://localhost:5000/api/update_model", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_name: nameModel, // Tên file model
          updates: updates, // Giá trị cập nhật
        }),
      });

      if (!response.ok) throw new Error("Fail to save model");

      return await response.json();
    } catch (error) {
      console.error("Error saving model: ", error);
    }
  },
  saveCameraSetting: async (nameModel) => {
    if (!nameModel) {
      console.error("Model name is required.");
      return;
    }

    // Thu thập giá trị từ các trường input
    const width = document.getElementById("width").value;
    const height = document.getElementById("height").value;
    const offsetX = document.getElementById("offsetX").value;
    const offsetY = document.getElementById("offsetY").value;
    const exposure = document.getElementById("exposure").value;
    const gain = document.getElementById("gain").value;
    const statusContext = document.getElementById("status-para-response");
    if (!width || !height || !offsetX || !offsetY || !exposure || !gain) {
      statusContext.textContent =
        "All fields are required. Please fill in all fields.";
      return;
    }
    // Đối tượng chứa các cập nhật
    const updates = {
      "ImageSettings.Width": parseInt(width, 10),
      "ImageSettings.Height": parseInt(height, 10),
      "ImageSettings.OffsetX": parseInt(offsetX, 10),
      "ImageSettings.OffsetY": parseInt(offsetY, 10),
      "AcquisitionSettings.ExposureTime.Value": parseInt(exposure, 10),
      "AcquisitionSettings.Gain.Value": parseInt(gain, 10),
    };
    try {
      // Gửi yêu cầu đến API
      const response = await fetch("http://localhost:5000/api/update_model", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_name: nameModel, // Tên file model
          updates: updates, // Giá trị cập nhật
        }),
      });

      if (!response.ok) throw new Error("Fail to save model");

      return await response.json();
    } catch (error) {
      console.error("Error saving model: ", error);
    }
  },
  readModel: async (nameModelSetting) => {
    if (!nameModelSetting) {
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/read_model?file=${nameModelSetting}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) throw new Error("Failt to reading file json");
      return response.json();
    } catch (error) {
      console.error("Error reading file json: ", error);
      return { message: "Error reading file json ", error: error.message };
    }
  },
  readJSON: async () => {
    const nameModelSetting = "resultData.json";
    try {
      const response = await fetch(
        `http://localhost:5000/api/read_json?file=${nameModelSetting}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData); // Log lỗi từ API
        throw new Error(errorData.message || "Failed to read file json");
      }

      return await response.json(); // Trả về dữ liệu JSON nếu thành công
    } catch (error) {
      console.error("Error reading file json: ", error);
      return { message: "Error reading file json", error: error.message };
    }
  },
});
