// ====================== Elemnet ======================
const statusContext = document.getElementById("status");
// ====================== List Model ======================

// Tải danh  sách trang models thi giao diện model được tải
window.addEventListener("DOMContentLoaded", async () => {
  try {
    await window.api.listModel();
  } catch (error) {
    console.log("Error load list models: ", error);
  }
});
// ====================== Create Model ======================
document
  .getElementById("btn-create-model")
  .addEventListener("click", async () => {
    const nameModel = document.getElementById("name-model").value;
    // Send nameModelto api createModel
    await window.api.createModel(nameModel);
    // Load list model
    await window.api.listModel();
  });
// ====================== Load Model ======================
document
  .getElementById("btn-load-model")
  .addEventListener("click", async () => {
    const nameModel = document.getElementById("name-model").value;
    // Send nameModelto api createModel
    await window.api.loadModel(nameModel);
  });
// ====================== Save Model ======================
document
  .getElementById("btn-save-model")
  .addEventListener("click", async () => {
    const nameModel = document.getElementById("name-model").value;
    const response = await window.api.saveModel(nameModel);
    const message = response.message;
    if (message === "Model updated successfully") {
      document.getElementById("belt-standard").value = " ";
      document.getElementById("belt-size").value = " ";
      document.getElementById("width").value = " ";
      document.getElementById("width").value = " ";
      document.getElementById("height").value = " ";
      document.getElementById("offsetX").value = " ";
      document.getElementById("offsetY").value = " ";
      document.getElementById("gain").value = " ";
      document.getElementById("exposure").value = " ";
      statusContext.textContent = "Save value successfully.";
    }
  });
