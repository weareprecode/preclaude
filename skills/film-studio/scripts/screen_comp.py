#!/usr/bin/env python3
"""Put a REAL screen capture onto a blank screen in a plate (made or filmed). Nothing on the screen is generated.

Standalone:
  screen_comp.py <plate.mp4> <capture.mp4> <out.mp4> --quad x,y x,y x,y x,y [--ref-frame 0]
                 [--track lk|edges|keys] [--keys keys.json] [--capture-in 0] [--glass-aspect 0.4615]
                 [--gain 0.85] [--black-lift 4] [--reflect 0.6] [--defocus 0.5] [--occ-luma 0] [--fps 30]
                 [--max-growth 2.0] [--force]
  The quad is the glass (TL TR BR BL, plate pixels) on --ref-frame. Also importable: grade_match.py uses
  ScreenComp(spec, clip).apply(k, frame) with the same keys in a "screen" spec dict.

Tracking modes:
  lk     (default) pyramidal Lucas-Kanade on corners in a ring around the screen (the glass itself is masked out,
         its reflections move), forward-backward check under 0.6 px, homography by RANSAC at 1.2 px solved from the
         reference frame each step (no drift), light 3-tap smoothing that keeps the mount's real micro-jitter.
         For dark night cabins where features starve, use edges or keys.
  edges  the glass is a dark flat quad inside a lighter bezel: each frame the four edges are found by a gradient
         search near the previous quad and the reference quad is scaled and moved; 5-frame smoothing.
  keys   corner keyframes in keys.json: [{"frame": 0, "quad": [[x,y],[x,y],[x,y],[x,y]]}, ...], linear between keys.

Look, relative to the plate (in-car and scenes comps, Oct 2026):
  - capture fitted at its TRUE aspect inside the glass, never stretched (v2 stretched phones 0.90 to 1.08 and an
    examiner flagged it); padded with the capture's own background colour.
  - day: UI whites about 85 % of the plate's exterior white, black lift about 4 to 5 levels for veiling glare.
    night: dark-mode UI, peak about 0.42 to 0.46 of white, small lift. A night screen must never glow like a lightbox.
  - the plate's own glass reflections screen-blended back over the content (1.0 by day, about 0.45 at night).
  - light defocus into the plate's depth of field: a screen sharper than its surroundings is a forensic tell.
  - occlusion key: with --occ-luma N, anything inside the quad brighter than N (a hand, a sleeve) stays in front.
  - never stabilise after the comp. Then run frame_qa.py --box to check screen noise against its surround.

Hard rules this tool enforces or reminds:
  - glass growth over --max-growth % (default 2) across the take means the camera pushes into the device; the comp
    is refused unless --force (keep that screen black instead). One plate grew 12 %, another 0.9 % and passed.
  - the capture must be real, recorded at a clock time that matches the scene's light, and its map must agree with
    the road in the plate (screen_road_match.py). Use a different capture window for every made clip: one reused
    turn card across all cuts was the number one panel-level tell.
Needs numpy and opencv-python; ffmpeg/ffprobe on PATH.
"""
import argparse
import json
import subprocess
import sys


def _deps():
    try:
        import cv2
        import numpy as np
        return cv2, np
    except ImportError:
        sys.exit("needs numpy and opencv-python (pip install numpy opencv-python)")


def read_video(path):
    cv2, np = _deps()
    w, h = [int(v) for v in subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries",
                                            "stream=width,height", "-of", "csv=p=0", path],
                                           capture_output=True, text=True, check=True).stdout.strip().split(",")]
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-fps_mode", "passthrough", "-f", "rawvideo",
                          "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)


class ScreenComp:
    """spec keys: capture (path), quad_ref [[x,y]x4], ref_frame, track (lk|edges|keys), keys, capture_in,
    glass_aspect (w/h), gain, black_lift, reflect, defocus, occ_luma, max_growth, force."""

    def __init__(self, spec, clip):
        cv2, np = _deps()
        self.cv2, self.np = cv2, np
        self.spec = spec
        self.clip = clip
        self.n, self.h, self.w = clip.shape[:3]
        self.q0 = np.array(spec["quad_ref"], np.float32)
        self.ref = int(spec.get("ref_frame", 0))
        self.cap = read_video(spec["capture"])
        self.cap_in = int(spec.get("capture_in", 0))
        self.bg = self.cap[0, 8, 8].astype(np.float32)
        mode = spec.get("track", "lk")
        self.track = {"lk": self._track_lk, "edges": self._track_edges, "keys": self._track_keys}[mode]()
        widths = [float(np.linalg.norm(q[1] - q[0])) for q in self.track]
        growth = 100 * (max(widths) / max(1e-6, min(widths)) - 1)
        self.log = dict(capture=str(spec["capture"]).split("/")[-1], track=mode,
                        capture_frames=[self.cap_in, self.cap_in + self.n - 1],
                        glass_growth_pct=round(growth, 2), occluded_frames=0)
        if growth > spec.get("max_growth", 2.0) and not spec.get("force"):
            raise SystemExit(f"glass grows {growth:.1f} % across the take (a push into the device): keep this screen "
                             f"black, or pass force/--force if you are sure")

    def _track_keys(self):
        np = self.np
        keys = sorted(self.spec["keys"], key=lambda k: k["frame"])
        out = []
        for k in range(self.n):
            if k <= keys[0]["frame"]:
                out.append(np.float32(keys[0]["quad"]))
                continue
            if k >= keys[-1]["frame"]:
                out.append(np.float32(keys[-1]["quad"]))
                continue
            for a, b in zip(keys, keys[1:]):
                if a["frame"] <= k <= b["frame"]:
                    u = (k - a["frame"]) / max(1, b["frame"] - a["frame"])
                    out.append(np.float32(a["quad"]) * (1 - u) + np.float32(b["quad"]) * u)
                    break
        return out

    def _track_lk(self):
        cv2, np = self.cv2, self.np
        gray = [cv2.cvtColor(f, cv2.COLOR_RGB2GRAY) for f in self.clip]
        q0 = self.q0
        ring = np.zeros((self.h, self.w), np.uint8)
        c = q0.mean(0)
        outer = (q0 - c) * 1.6 + c
        cv2.fillConvexPoly(ring, outer.astype(np.int32), 255)
        cv2.fillConvexPoly(ring, ((q0 - c) * 1.05 + c).astype(np.int32), 0)  # glass masked out
        p0 = cv2.goodFeaturesToTrack(gray[self.ref], 400, 0.01, 6, mask=ring)
        if p0 is None or len(p0) < 8:
            raise SystemExit("too few features around the screen for lk tracking: use --track edges or keys")
        lk = dict(winSize=(21, 21), maxLevel=4, criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01))
        Hs = [None] * self.n
        Hs[self.ref] = np.eye(3)
        for direction in (1, -1):
            k = self.ref
            while 0 <= k + direction < self.n:
                nk = k + direction
                p1, st, _ = cv2.calcOpticalFlowPyrLK(gray[self.ref], gray[nk], p0, None, **lk)
                pb, st2, _ = cv2.calcOpticalFlowPyrLK(gray[nk], gray[self.ref], p1, None, **lk)
                good = (st[:, 0] == 1) & (st2[:, 0] == 1) & (np.linalg.norm(p0 - pb, axis=2)[:, 0] < 0.6)
                if good.sum() >= 8:
                    H, _ = cv2.findHomography(p0[good], p1[good], cv2.RANSAC, 1.2)
                    Hs[nk] = H if H is not None else Hs[k]
                else:
                    Hs[nk] = Hs[k]
                k = nk
        quads = [cv2.perspectiveTransform(q0[None], H)[0] for H in Hs]
        Q = np.array(quads)
        S = Q.copy()
        S[1:-1] = (Q[:-2] + 2 * Q[1:-1] + Q[2:]) / 4  # light 3-tap smooth keeps real mount jitter
        return [s.astype(np.float32) for s in S]

    def _track_edges(self):
        cv2, np = self.cv2, self.np
        q0 = self.q0

        def edge(gs, pos, lo, hi, axis, sign, rad=7):
            vals = []
            for s in range(int(lo), int(hi), 2):
                a, b = int(round(pos - rad)), int(round(pos + rad))
                prof = gs[a:b, s] if axis == 0 else gs[s, a:b]
                if len(prof) < 5:
                    continue
                d = np.diff(prof) * sign
                i = int(np.argmax(d))
                if d[i] > 3:
                    vals.append(a + i + 0.5)
            return float(np.median(vals)) if len(vals) >= 3 else None

        top0, bot0 = (q0[0, 1] + q0[1, 1]) / 2, (q0[3, 1] + q0[2, 1]) / 2
        lef0, rig0 = (q0[0, 0] + q0[3, 0]) / 2, (q0[1, 0] + q0[2, 0]) / 2
        cx0, cy0 = (lef0 + rig0) / 2, (top0 + bot0) / 2

        def apply(p):
            sx, sy, tx, ty = p
            q = q0.copy()
            q[:, 0] = (q[:, 0] - cx0) * sx + cx0 + tx
            q[:, 1] = (q[:, 1] - cy0) * sy + cy0 + ty
            return q

        q, P = q0.copy(), []
        for k in range(self.n):
            gs = cv2.GaussianBlur(cv2.cvtColor(self.clip[k], cv2.COLOR_RGB2GRAY).astype(np.float32), (0, 0), 1.0)
            top, bot = (q[0, 1] + q[1, 1]) / 2, (q[3, 1] + q[2, 1]) / 2
            lef, rig = (q[0, 0] + q[3, 0]) / 2, (q[1, 0] + q[2, 0]) / 2
            W, H = rig - lef, bot - top
            t = edge(gs, top, lef + 0.2 * W, lef + 0.8 * W, 0, -1)
            l = edge(gs, lef, top + 0.15 * H, top + 0.6 * H, 1, -1)
            r = edge(gs, rig, top + 0.15 * H, top + 0.6 * H, 1, 1)
            b = edge(gs, bot, lef + 0.2 * W, lef + 0.8 * W, 0, 1)
            t = top if t is None else t
            l = lef if l is None else l
            r = (l + W) if r is None else r
            b = (t + H) if b is None else b
            p = [(r - l) / (rig0 - lef0), (b - t) / (bot0 - top0), (l + r) / 2 - cx0, (t + b) / 2 - cy0]
            P.append(p)
            q = apply(p)
        P = np.array(P)

        def smooth(x, r):
            return np.convolve(np.pad(x, (r, r), mode="edge"), np.ones(2 * r + 1) / (2 * r + 1), mode="valid")
        P[:, 0], P[:, 1] = smooth(P[:, 0], 4), smooth(P[:, 1], 4)
        P[:, 2], P[:, 3] = smooth(P[:, 2], 2), smooth(P[:, 3], 2)
        return [apply(p) for p in P]

    def apply(self, k, frame):
        """frame: float32 HxWx3 (graded plate frame k). Returns the composited float32 frame."""
        cv2, np = self.cv2, self.np
        sp = self.spec
        q = self.track[k]
        src = self.cap[min(self.cap_in + k, len(self.cap) - 1)]
        ga = float(sp.get("glass_aspect") or (np.linalg.norm(q[1] - q[0]) / max(1e-6, np.linalg.norm(q[3] - q[0]))))
        tw = max(8, 2 * int(np.linalg.norm(q[1] - q[0])))
        th = max(8, int(tw / ga))
        canvas = np.empty((th, tw, 3), np.float32)
        canvas[:] = self.bg
        sa = src.shape[1] / src.shape[0]
        if sa >= tw / th:
            cw, ch = tw, int(tw / sa)
        else:
            cw, ch = int(th * sa), th
        small = cv2.resize(src, (cw, ch), interpolation=cv2.INTER_AREA).astype(np.float32)
        y0, x0 = (th - ch) // 2, (tw - cw) // 2
        canvas[y0:y0 + ch, x0:x0 + cw] = small
        Hm = cv2.getPerspectiveTransform(np.float32([[0, 0], [tw, 0], [tw, th], [0, th]]), q.astype(np.float32))
        warped = cv2.warpPerspective(canvas, Hm, (self.w, self.h), flags=cv2.INTER_LINEAR)
        mask = cv2.warpPerspective(np.ones((th, tw), np.float32), Hm, (self.w, self.h), flags=cv2.INTER_LINEAR)
        warped = cv2.GaussianBlur(warped, (0, 0), sp.get("defocus", 0.5))
        scr = sp.get("black_lift", 4.0) + warped * sp.get("gain", 0.85)
        occf = np.zeros(mask.shape, np.float32)
        if sp.get("occ_luma"):
            lum = (self.clip[k].astype(np.float32) * np.array([0.2126, 0.7152, 0.0722], np.float32)).sum(-1)
            occ = (lum > sp["occ_luma"]).astype(np.uint8)
            occ = cv2.morphologyEx(occ, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
            occ = cv2.dilate(cv2.morphologyEx(occ, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)), np.ones((3, 3), np.uint8))
            occf = cv2.GaussianBlur(occ.astype(np.float32), (0, 0), 1.2)
            inner = cv2.erode((mask > 0.5).astype(np.uint8), np.ones((7, 7), np.uint8))
            if (occ * inner).sum() > 30:
                self.log["occluded_frames"] += 1
        a = (mask * (1 - occf))[..., None]
        inside = mask > 0.9
        floor = np.percentile(frame[inside], 4, axis=0) if inside.any() else 0
        refl = np.clip(frame - floor, 0, 255) * sp.get("reflect", 0.6)
        scr = 255 - (255 - scr) * (255 - refl) / 255
        return frame * (1 - a) + scr * a


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter,
                                 epilog=__doc__.split("\n", 2)[2])
    ap.add_argument("plate")
    ap.add_argument("capture", help="REAL screen recording")
    ap.add_argument("out")
    ap.add_argument("--quad", nargs=4, required=True, help="glass corners TL TR BR BL as x,y")
    ap.add_argument("--ref-frame", type=int, default=0)
    ap.add_argument("--track", choices=["lk", "edges", "keys"], default="lk")
    ap.add_argument("--keys", help="keys.json for --track keys")
    ap.add_argument("--capture-in", type=int, default=0, help="first capture frame to use")
    ap.add_argument("--glass-aspect", type=float, help="physical glass width/height (default: from the quad)")
    ap.add_argument("--gain", type=float, default=0.85)
    ap.add_argument("--black-lift", type=float, default=4.0)
    ap.add_argument("--reflect", type=float, default=0.6)
    ap.add_argument("--defocus", type=float, default=0.5)
    ap.add_argument("--occ-luma", type=float, default=0.0, help="key out anything brighter than this inside the glass")
    ap.add_argument("--fps", type=float, default=30.0, help="output rate (one plate frame = one output frame)")
    ap.add_argument("--max-growth", type=float, default=2.0, help="refuse if the glass grows more than this %%")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--crf", type=int, default=14)
    a = ap.parse_args()
    cv2, np = _deps()
    clip = read_video(a.plate)
    spec = dict(capture=a.capture, quad_ref=[[float(v) for v in p.split(",")] for p in a.quad], ref_frame=a.ref_frame,
                track=a.track, keys=json.load(open(a.keys)) if a.keys else None, capture_in=a.capture_in,
                glass_aspect=a.glass_aspect, gain=a.gain, black_lift=a.black_lift, reflect=a.reflect, defocus=a.defocus,
                occ_luma=a.occ_luma, max_growth=a.max_growth, force=a.force)
    sc = ScreenComp(spec, clip)
    h, w = clip.shape[1:3]
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}",
                            "-r", str(a.fps), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", str(a.crf),
                            "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                            "-movflags", "+faststart", "-metadata", "comment=Screen content is a real capture, composited",
                            a.out], stdin=subprocess.PIPE)
    for k in range(len(clip)):
        enc.stdin.write(np.clip(sc.apply(k, clip[k].astype(np.float32)) + 0.5, 0, 255).astype(np.uint8).tobytes())
    enc.stdin.close()
    enc.wait()
    print(json.dumps(sc.log))


if __name__ == "__main__":
    main()
