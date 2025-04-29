# Camera-Controler

# Sử dụng cho file python

import cv2
import threading
import os
import time
import json
import random
import shutil
import base64
hkhkjhkjhkjhk
from roboflow import Roboflow
from flask import Flask, jsonify, Response, send_from_directory,request
from pypylon import pylon
from flask_cors import CORS
from flask import send_from_directory
from flasgger import Swagger
from ultralytics import YOLO

# Cài đặt thư viện

pip install opencv-python flask flask-cors numpy
pip install flask pypylon opencv-python-headless
pip install opencv-python opencv-python-headless flask

# Roboflow

pip install roboflow  
Sửa tại đường dẫn C:\Users\tranh\AppData\Roaming\Ultralytics\settings.json

# Electron

npm init -y
npm install electron

# Khi tải về từ github cần cài lại file electron.exe. Kiểm tra tại C:\\AHSO\\RESTFUL-API\\Camera-Controler\\node_modules\\electron\\dist\\electron.exe

# Các bước thực hiện

# Bước 1: Xóa thư mục node_modules và file package-lock.json

rm -rf node_modules package-lock.json

# Bước 2: Sau đó, cài đặt lại toàn bộ phụ thuộc.

npm install

# Bước 3: Chạy test thử

npm install

# Việc đóng gói sẽ cần thay đổi những file

1. package.json: Chọn những fil cần đóng gói
2. main.js: Thay đổi đường dẫn đến file py.exe để chạy khi mở electron
3. kiểm tra lại các file sử dụng đường dẫn cố định đến backend, vì đường dẫn sẽ thay đổi.

# ============== Đóng gói 1 ==============

# Bước 1: Đóng gói backend

Cài đặt PyInstaller: pip install pyinstaller
Đóng gói backend: pyinstaller --onefile backend.py ( Hạn chế là khời động file exe quá lâu )

# Bước 2: Để file backend.exe cùng cấp với folder runs

# Bước 3: Đóng gói electron

Chạy file backend.exe khi bắt đầu chạy ứng dụng
Thêm cwd để đóng gói các file phụ thuộc của backend.exe
Sửa file package.json của electron:
Sửa file main.js để backend khởi động cùng với electron
Đóng gói backend: npm run build
=> Backend khởi đọng quá lâu nhưng đảm bảo đầy đủ môi trường

# ============== Đóng gói cách 2 ==============

# Bước 1: Đóng gói backend

Cài đặt PyInstaller: pip install pyinstaller
Đóng gói backend: pyinstaller backend.py

# Bước 2: Để file runs vào folder CameraController

# Bước 3: Đóng gói electron

Chạy file backend.exe khi bắt đầu chạy ứng dụng
Thêm cwd để đóng gói các file phụ thuộc của backend.exe
Sửa file package.json của electron:
Sửa file main.js để backend khởi động cùng với electron
Đóng gói backend: npm run build
=> Backend khởi đọng nhanh hơn. Nhưng hạn chế về những đường dẫn trong electron và không đầy đủ file backend.

# ============== Cách đóng gói hiện tại ==============

# Bước 1: Đóng gói BE

- pyinstaller --onefile backend.py

# Bước 2: Kiểm tra lại main.js

- Để BE khởi động khi mở app thì đường dẫn ở getBackendPath
  function getBackendPath() {
  const isPackaged = app.isPackaged; // Kiểm tra ứng dụng đã đóng gói hay chưa
  const backendPath = isPackaged
  ? path.join(process.resourcesPath, "backend.exe") // Đường dẫn khi đóng gói
  : path.join(\_\_dirname, "backend", "backend.exe"); // Đường dẫn khi phát triển
  return backendPath;
  }

# Bước 3: Kiểm tra package.json

- asar: true để cho ẩn hết các file code
- Kiểm tra lại files đã đầy đủ các file cần đóng gói với electron

# Bước 4: Đóng gói electron

- npm run build
- Chạy file setup.exe
- Copy file backend.exe và folder runs
- Sau khi chạy xong file exe mở location của app, vào folder resources
- Paste backend.exe và runs vào

# Bước 5: Chạy lại app và chờ backend khởi động.

# ============== Setup trên một máy khác ==============

Những file và folder cần

- electron setup.exe
- folder runs
- backend.exe

# Bước 1: Chạy file electron setup.exe

# Bước 2: Sau khi cài xong app electron, mở location của app, vào resources

# Bước 3: Paste folder runs và backend.exe

# Bước 4: Mở lại ứng dụng
