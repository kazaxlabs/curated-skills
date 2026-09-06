---
name: hunyuan3d-2.1
description: Generate high-resolution 3D meshes and PBR textures from a single 2D image using Tencent Hunyuan3D-2.1 AI models.
category: 3d-generation
source: Tencent-Hunyuan
---

# Hunyuan3D-2.1 — Image to High-Resolution 3D Asset

Generates high-quality 3D meshes and detailed texture maps from a single 2D reference image using the **Tencent Hunyuan3D-2.1** DiT Flow-Matching shape pipeline and 6-view Differentiable Texture Painter.

---

## When to Use

Use this skill when:
- Converting an image/photo into a textured 3D asset (.glb, .obj, .gltf)
- Generating high-resolution 3D models with AI shape matching and multi-view paint
- Preparing 3D props/assets for Blender or Three.js workflows

---

## Quick Start (Python API)

```python
import sys
sys.path.insert(0, './hy3dshape')
sys.path.insert(0, './hy3dpaint')

from hy3dshape.pipelines import Hunyuan3DDiTFlowMatchingPipeline
from textureGenPipeline import Hunyuan3DPaintPipeline, Hunyuan3DPaintConfig

# 1. Generate untextured mesh
shape_pipeline = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained('tencent/Hunyuan3D-2.1')
mesh_untextured = shape_pipeline(image='assets/demo.png')[0]
mesh_untextured.export('temp_mesh.obj')

# 2. Paint multi-view textures
paint_pipeline = Hunyuan3DPaintPipeline(Hunyuan3DPaintConfig(max_num_view=6, resolution=512))
mesh_textured = paint_pipeline('temp_mesh.obj', image_path='assets/demo.png')
mesh_textured.export('output/mesh_textured.glb')
```

---

## CLI Usage

```bash
python generate_3d.py --image path/to/reference.png --out output/asset.glb --views 6 --res 512
```

---

## Environment & Dependency Setup

### 1. PyTorch with CUDA 12.4
```bash
pip install torch==2.5.1 torchvision==0.20.1 torchaudio==2.5.1 --index-url https://download.pytorch.org/whl/cu124
```

### 2. Requirements & Custom Extensions
```bash
pip install -r requirements.txt

# Custom Rasterizer
cd hy3dpaint/custom_rasterizer
pip install -e .
cd ../..

# Differentiable Renderer Mesh Painter
cd hy3dpaint/DifferentiableRenderer
bash compile_mesh_painter.sh
cd ../..

# Real-ESRGAN Checkpoint for Super-Resolution
mkdir -p hy3dpaint/ckpt
wget https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth -P hy3dpaint/ckpt
```
