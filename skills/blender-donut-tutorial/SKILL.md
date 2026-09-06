---
name: blender-donut-tutorial
description: Comprehensive 3D modeling, texturing, geometry nodes, shading, and rendering guide based on Andrew Price's Blender Donut Tutorial series (2025/2026 for Blender 5.0). Use when building 3D assets, learning Blender workflows, organic modeling, material nodes, UV unwrapping, Geometry Nodes scattering, and Cycles/EEVEE rendering.
source: https://youtube.com/playlist?list=PLjEaoINr3zgGUwGwXlj9kBe7TrVWNjkyv
---

# Blender Donut Tutorial (Blender 5.0 / 2025-2026 Edition)

A complete, structured 3D production pipeline guide synthesized from Andrew Price's (Blender Guru) famous 8-part beginner series updated for modern Blender (Blender 4.x / 5.0+).

---

## 🛠️ Quick Reference: Key Shortcuts & Hotkeys

| Category | Shortcut | Action |
| :--- | :--- | :--- |
| **Navigation** | `MMB` (Middle Mouse) | Orbit viewport |
| | `Shift + MMB` | Pan viewport |
| | `Wheel` / `Ctrl + MMB` | Zoom in / out |
| | `Numpad .` | Focus on selected object |
| | `Numpad 1 / 3 / 7` | Front / Right / Top orthographic view |
| | `Numpad 0` | Toggle Camera View |
| | `~` (Tilde) | View Navigation Pie Menu |
| **Transform** | `G` / `R` / `S` | Grab (Move) / Rotate / Scale |
| | `G + X/Y/Z` | Constrain transform to specific axis |
| | `Shift + Z` (while G/S) | Exclude Z axis (move/scale on XY plane only) |
| | `Alt + G / R / S` | Clear transform (Reset location/rotation/scale) |
| | `Ctrl + A` | **Apply Transform** (Apply Scale/Rotation to geometry) |
| **Modes** | `Tab` | Toggle Object Mode / Edit Mode |
| | `Ctrl + Tab` | Mode Selection Pie Menu (Object, Edit, Sculpt, Texture Paint, Weight Paint) |
| | `Z` | Shading Pie Menu (Wireframe, Solid, Material Preview, Rendered) |
| **Modeling** | `1 / 2 / 3` (Edit Mode) | Select Vertex / Edge / Face mode |
| | `Alt + Click` | Loop Select (Edge loop or face loop) |
| | `Shift + A` | Add Menu (Mesh, Light, Camera, Curve) |
| | `E` | Extrude region |
| | `I` | Inset faces |
| | `K` | Knife Tool |
| | `Ctrl + R` | Loop Cut & Slide |
| | `Ctrl + B` | Bevel edges / vertices |
| | `P` | Separate selected mesh into new object |
| | `Alt + M` / `M` | Merge vertices (At Center, By Distance) |
| | `O` | Toggle **Proportional Editing** |
| **Modifiers** | `Ctrl + 1 / 2 / 3` | Add Subdivision Surface Modifier (Levels 1, 2, or 3) |
| | `Right Click` -> `Shade Smooth` | Enable smooth shading on faces |

---

## 🧩 Module 1: Interface, Base Geometry & Modifiers (Part 1)

### 1.1 Project Setup & Units
* **Startup Cleanup**: Select default cube (`A` -> `X` -> `Delete`).
* **Add Base Geometry**: Press `Shift + A` -> **Mesh** -> **Torus**.
* **Adjust Primitive Settings** (immediately via operator panel bottom-left before moving):
  * **Major Radius**: `0.05m` (~5cm outer radius).
  * **Minor Radius**: `0.025m` (~2.5cm thickness).
  * **Major Segments**: Reduce to `28` (prevents dense, unmanageable geometry early on).
  * **Minor Segments**: Reduce to `12`.

### 1.2 Viewport Navigation & Shading
* Use `Numpad 1` for Front Orthographic View to ensure the donut sits flat on the grid origin.
* **Shade Smooth**: Right-click the Torus in Object Mode and select **Shade Smooth**.
* **Subdivision Surface Modifier**:
  * Non-destructive modifier that sub-divides faces dynamically without altering underlying base mesh.
  * Press `Ctrl + 2` to add a Subdivision Surface modifier with Viewport Level `2` and Render Level `2`.
  * Ensure the modifier stack order keeps Subdivision Surface near the end.

---

## 🎨 Module 2: Hard-Surface Modeling & Icing Layer (Part 2)

### 2.1 Extracting the Icing Base
1. Enter **Edit Mode** (`Tab`).
2. Switch to **Face Select Mode** (`3`).
3. Turn on **X-Ray / Toggle Transparency** (`Alt + Z`) to select through the model.
4. Select the top half of the torus faces (representing the icing area).
5. **Duplicate Mesh**: Press `Shift + D`, then press `Right Click` / `Esc` to keep in place.
6. **Separate Object**: Press `P` -> **Selection**.
7. Exit to Object Mode (`Tab`), select the newly created top mesh, and rename it to `Icing`. Rename base torus to `Donut_Dough`.

### 2.2 Adding Thickness & Realistic Flow
1. **Solidify Modifier**:
   * Add a **Solidify** modifier to the `Icing` object.
   * Set **Thickness** to `0.002m` (2mm).
   * Drag Solidify modifier ABOVE Subdivision Surface in the modifier stack so thickness is smoothly subdivided.
   * Enable **Offset**: `1.0` (pushes icing outward from dough surface).
2. **Proportional Editing (`O`)**:
   * Enter Edit Mode on `Icing`.
   * Enable Proportional Editing (`O`). Set falloff to **Smooth** or **Random**.
   * Adjust influence radius using `Mouse Scroll Wheel`.
   * Pull individual bottom vertices down using `G` -> `Z` to create dripping effects.
3. **Face Snapping (Preventing Mesh Intersection)**:
   * Turn on **Snap** (`Shift + Tab`), set Snap Target to **Face Project**.
   * Enable **Project Individual Elements** or **Snap to Nearest Surface**.
   * Moving icing vertices will now snap directly onto the surface of the underlying `Donut_Dough`.

---

## 🗿 Module 3: Organic Sculpting & Drip Details (Part 3)

### 3.1 Preparing for Sculpt Mode
1. Select the `Icing` object in Object Mode.
2. Switch to the **Sculpting** workspace or use `Ctrl + Tab` -> **Sculpt Mode**.
3. Apply modifiers if full geometry resolution is required for fine sculpting (`Ctrl + A` over modifier in panel), or sculpt directly over base mesh if using Multiresolution/Subdivision.

### 3.2 Key Sculpting Brushes & Techniques
* **Grab Brush (`G`)**: Used to stretch, shape, and pull thick drips downward along gravity paths.
* **Inflate Brush (`I`)**: Adds volumetric weight to the tips of drips where liquid icing pools due to surface tension.
* **Smooth Brush (`Shift + Drag`)**: Blends harsh pinches or jagged geometry.
* **Elastic Deform**: Organic distortion that preserves volume better than the basic Grab brush.
* **Layer Brush**: Builds up subtle pooling boundaries along the upper edge of the icing.

### 3.3 Artistic Rules for Realism
* Avoid uniform drip length; vary drip spacing and sizes (short drops, long drips, merged drips).
* Ensure drips curve slightly around the geometry rather than falling in perfect straight lines.

---

## 🧪 Module 4: Shading & Material Nodes (Part 4)

### 4.1 Shader Editor Setup
1. Switch to the **Shading** workspace.
2. Set Viewport Shading to **Material Preview** or **Rendered** (`Z`).
3. Select `Donut_Dough`, create a new Material named `M_Dough`.
4. Select `Icing`, create a new Material named `M_Icing`.

### 4.2 Material Parameter Calibration

#### Dough Material (`M_Dough`):
* **Base Color**: Warm golden-tan hex `#E0A868` / HSV (`0.09`, `0.55`, `0.88`).
* **Roughness**: Increased to `0.65` (matte, baked bread surface).
* **Subsurface Scattering (SSS)**:
  * **Subsurface Weight**: `0.15` - `0.25` (gives soft translucency around thin edges).
  * **Subsurface Radius**: `[1.0, 0.4, 0.2]` (Red light penetrates deeper, giving warm undertones).
  * **Subsurface Color**: Warm reddish-orange `#FF6A38`.

#### Icing Material (`M_Icing`):
* **Base Color**: Creamy pink glaze `#F46091` or chocolate brown `#3D2014`.
* **Roughness**: Low `0.18` - `0.25` (glossy, reflective liquid glaze).
* **Subsurface Weight**: `0.35` (sugar glaze translucency).
* **IOR (Index of Refraction)**: `1.45` (standard sugar syrup / liquid IOR).

---

## 🖌️ Module 5: Texturing & Texture Painting (Part 5)

### 5.1 Setting Up Paint Canvas
1. In the **Shader Editor** for `Donut_Dough`, add an **Image Texture** node (`Shift + A` -> **Texture** -> **Image Texture**).
2. Click **New**:
   * Name: `Tex_Dough_BaseColor`.
   * Resolution: `2048 x 2048`.
   * Color: Warm base tan color.
   * Color Space: **sRGB**.
3. Connect `Color` output of Image Texture to `Base Color` of Principled BSDF.

### 5.2 Texture Paint Mode Workflow
1. Switch to **Texture Paint** workspace.
2. Select **Brush** tool (`F` to adjust radius, `Shift + F` to adjust strength).
3. **Fried Ring / waist Line**:
   * Real donuts have a lighter, pale stripe around the center waist where the dough floats above oil during frying.
   * Sample pale off-white color (`#FBE6CD`).
   * Soft brush falloff, low strength (`0.2`). Paint around the outer and inner equator of the dough mesh.
4. **Deep Baked Top & Bottom**:
   * Sample darker golden-brown color (`#8B4614`).
   * Paint top and bottom faces to simulate direct heat browning.
5. **Save Image**: In Image Editor, menu `Image` -> **Save As** (`Alt + S`) to persist `Tex_Dough_BaseColor.png` to disk.

---

## 🗺️ Module 6: UV Unwrapping (Part 6)

### 6.1 Mark Seams
1. Select `Donut_Dough`, enter **Edit Mode** (`Tab`).
2. Switch to **Edge Select Mode** (`2`).
3. Select a single continuous edge loop along the inside inner ring of the torus (`Alt + Click` edge).
4. Select a second edge loop along the bottom underside (hidden from camera).
5. Press `Ctrl + E` -> **Mark Seam** (selected edges turn dark red).

### 6.2 Unwrapping & UV Layout Optimization
1. Select all faces (`A`).
2. Press `U` -> **Unwrap**.
3. Open the **UV Editor** window side-by-side.
4. Check for stretching: Enable **Display UV Stretch** overlay in UV Editor (blue = zero stretch, green/yellow/red = high stretch).
5. **Pack Islands**: `UV` menu -> `Pack Islands` (`Ctrl + P`) with margin `0.02` to prevent border bleeding during texture filtering.

---

## 🌾 Module 7: Geometry Nodes & Sprinkle Scattering (Part 7)

### 7.1 Creating Sprinkle Primitives
1. Create a new collection named `C_Sprinkles`.
2. Add base sprinkle mesh geometries inside `C_Sprinkles`:
   * **Cylinder Sprinkle**: Cylinder primitive (Vertices: `8`, Radius: `0.0015m`, Depth: `0.012m`). Bevel ends (`Ctrl + B`).
   * **Ball Sprinkle (Nonpareil)**: UV Sphere (Segments: `12`, Rings: `8`, Radius: `0.002m`).
   * **Pill Sprinkle**: Cylinder with rounded cap hemispheres.
3. Assign vibrant, glossy materials (`M_Sprinkle_Red`, `M_Sprinkle_Blue`, `M_Sprinkle_Yellow`, `M_Sprinkle_White`) with low Roughness (`0.15`).

### 7.2 Geometry Nodes Graph Setup (Blender 5.0 Node Tree)
1. Select `Icing` object, switch to **Geometry Nodes** workspace.
2. Click **New** to create node tree `GN_Sprinkle_Scatter`.

#### Node Graph Construction:
```
[Group Input (Geometry)] ---> [Join Geometry] ---> [Group Output]
                                   ^
[Distribute Points on Faces]      |
  - Selection: Weight Painted Mask |
  - Distance Min: 0.004m (Poisson) |
        |                          |
        v                          |
[Instance on Points] --------------+
  - Instance: [Collection Info (C_Sprinkles)] (Separate Children, Reset Children)
  - Rotation: [Rotate Euler] (Random Value per point)
  - Scale: [Random Value (Vector)] (Min: 0.85, Max: 1.15)
```

#### Detailed Node Configuration:
1. **Poisson Disk Distribution**:
   * Change `Distribute Points on Faces` method from *Random* to **Poisson Disk**.
   * Set **Distance Min** to `0.0035m` (prevents sprinkle mesh clipping/overlap).
   * Set **Density Max** to control overall sprinkle quantity.
2. **Instance Rotation & Alignment**:
   * Connect `Normal` output from *Distribute Points on Faces* to `Align Euler to Vector` (Pivot: `Z`).
   * Combine with `Rotate Euler` node fed by a `Random Value` node (Vector mode, Z-rotation `0` to `2π` / `6.28 rad`) to randomize sprinkle orientations naturally on the icing curve.
3. **Weight Paint Density Masking**:
   * Switch to **Weight Paint** mode on `Icing`.
   * Paint weight `1.0` on top flat icing surfaces; paint weight `0.0` on undersides and drip tips.
   * Name Vertex Group `VG_SprinkleDensity`.
   * Drag `Density Factor` pin to `Group Input` and assign `VG_SprinkleDensity` in the Modifier properties.

---

## 📷 Module 8: Lighting, Composition & Final Render (Donut Finale - Part 8)

### 8.1 Camera Composition & Framing
1. Select Camera (`Numpad 0`).
2. In Camera Properties:
   * **Focal Length**: Increase to `85mm` (portrait lens reduces perspective distortion, making product renders appear sleek and high-end).
   * **Composition Guides**: Enable *Thirds* and *Center*.
   * **Depth of Field (DoF)**:
     * Check **Depth of Field**.
     * Set **Focus on Object** to `Donut_Dough` or `Icing`.
     * Set **F-Stop**: `f/2.8` - `f/4.0` for soft background blur.

### 8.2 Three-Point & Environment Lighting
1. **Key Light**: Area Light (Power: `150W`, Size: `0.5m`, position 45° top-left front).
2. **Fill Light**: Area Light (Power: `40W`, Size: `1.0m`, soft blue tint, position right side).
3. **Rim / Accent Light**: Spot Light or Area Light (Power: `200W`, positioned behind donut pointing toward camera edge to highlight glossy icing rim and translucency).
4. **Environment / HDRI**:
   * World Properties -> Surface -> **Environment Texture**.
   * Load clean studio HDRI (e.g., Poly Haven studio setup). Set Strength to `0.5`.

### 8.3 Render Engine Settings (Cycles)
1. **Render Engine**: **Cycles**.
2. **Feature Set**: Supported | **Device**: GPU Compute.
3. **Sampling**:
   * Render Samples: `512` or `1024`.
   * Enable **Noise Threshold**: `0.01`.
4. **Denoising**:
   * Enable **Render Denoising**.
   * Denoiser: **OpenImageDenoise** (CPU/GPU) or **OptiX** (Nvidia GPUs).
5. **Color Management**:
   * View Transform: **AgX** (Blender 4.0+ default, handles highlight rolloff superiorly) or **Filmic**.
   * Look: **Medium High Contrast**.
   * Exposure: Adjust `0.0` to `+0.5`.

### 8.4 Exporting Final Render
1. Press `F12` to trigger Render Image.
2. After render and denoise pass complete, press `Alt + S` in Render Result window to save image (`PNG`, `16-bit`, RGB/RGBA).

---

## 📋 Checklist for Verification

- [ ] Base dough torus has applied scale (`Ctrl + A` -> `All Transforms`).
- [ ] Solidify modifier is placed **above** Subdivision Surface in stack for icing.
- [ ] Dough material uses Subsurface Scattering (`SSS`) for soft bake translucency.
- [ ] Pale fried ring stripe is painted around dough equator in Texture Paint mode.
- [ ] Image texture is explicitly saved to disk (`Image` -> `Save As`).
- [ ] UV seams are placed along hidden inner loops with minimal stretch.
- [ ] Geometry Nodes uses **Poisson Disk** distribution to prevent sprinkle clipping.
- [ ] Camera focal length is set to `85mm` with active Depth of Field (`f/2.8`).
- [ ] Render uses AgX / Filmic Color Management with OpenImageDenoise.
