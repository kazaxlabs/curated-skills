"""
Hunyuan3D-2.1 Image-to-3D Mesh & Texture Generation Script.

Usage:
  python generate_3d.py --image assets/demo.png --out output/mesh_textured.glb
"""

import argparse
import os
import sys

# Insert submodules to path
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
if _THIS_DIR not in sys.path:
    sys.path.insert(0, _THIS_DIR)
sys.path.insert(0, os.path.join(_THIS_DIR, 'hy3dshape'))
sys.path.insert(0, os.path.join(_THIS_DIR, 'hy3dpaint'))

try:
    from hy3dshape.pipelines import Hunyuan3DDiTFlowMatchingPipeline
    from textureGenPipeline import Hunyuan3DPaintConfig, Hunyuan3DPaintPipeline
    _HAS_IMPORTS = True
except Exception as e:
    import traceback
    _HAS_IMPORTS = False
    _IMPORT_ERROR_MSG = traceback.format_exc()



def generate_3d(image_path, out_path, num_views=6, resolution=512):
    """Generate untextured 3D shape from image, then paint textures."""
    if not _HAS_IMPORTS:
        print(f"[Hunyuan3D Error] Dependencies not met: {_IMPORT_ERROR_MSG}")
        print("Please install PyTorch with CUDA support and dependencies:")
        print("  pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124")
        print("  pip install -r requirements.txt")
        return None

    print(f"[Hunyuan3D-2.1] Loading shape generation pipeline...")
    shape_pipeline = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained('tencent/Hunyuan3D-2.1')
    
    print(f"[Hunyuan3D-2.1] Generating untextured mesh from: {image_path}")
    mesh_untextured = shape_pipeline(image=image_path)[0]
    
    temp_mesh_path = os.path.join(_THIS_DIR, "temp_untextured.obj")
    mesh_untextured.export(temp_mesh_path)
    print(f"[Hunyuan3D-2.1] Exported untextured mesh to: {temp_mesh_path}")

    print(f"[Hunyuan3D-2.1] Loading texture paint pipeline (views={num_views}, res={resolution})...")
    paint_config = Hunyuan3DPaintConfig(max_num_view=num_views, resolution=resolution)
    paint_pipeline = Hunyuan3DPaintPipeline(paint_config)
    
    print(f"[Hunyuan3D-2.1] Painting textures onto mesh...")
    mesh_textured = paint_pipeline(temp_mesh_path, image_path=image_path)
    
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    mesh_textured.export(out_path)
    print(f"[Hunyuan3D-2.1] Successfully generated textured 3D asset: {out_path}")
    return out_path


def main():
    p = argparse.ArgumentParser(description="Hunyuan3D-2.1 Image-to-3D Generator")
    p.add_argument("--image", required=True, help="Input reference image path")
    p.add_argument("--out", default="output/mesh_textured.glb", help="Output 3D mesh path (.glb, .obj)")
    p.add_argument("--views", type=int, default=6, help="Max paint projection views")
    p.add_argument("--res", type=int, default=512, help="Texture resolution")
    args = p.parse_args()

    generate_3d(args.image, args.out, args.views, args.res)


if __name__ == "__main__":
    main()
