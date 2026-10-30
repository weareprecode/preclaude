// Local OCR for the film text gate (Apple Vision, runs on this Mac only; nothing is uploaded).
// Build once:  swiftc -O ocr.swift -o ocr      (ocr_gate.sh does this for you)
// Usage:       ocr <image.png> ...
// Prints one line per text observation: file<TAB>confidence<TAB>text<TAB>x y w h (fractions, origin top-left).
// Settings: accurate mode, NO language correction (so gibberish is reported as gibberish, not "corrected" into words),
// minimum text height 0.008 of the image.
import Foundation
import Vision
import AppKit

let args = CommandLine.arguments.dropFirst()
if args.isEmpty || args.first == "--help" || args.first == "-h" {
    print("usage: ocr <image> ...   prints file<TAB>confidence<TAB>text<TAB>box")
    exit(0)
}
for path in args {
    guard let img = NSImage(contentsOfFile: path),
          let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { continue }
    let req = VNRecognizeTextRequest()
    req.recognitionLevel = .accurate
    req.usesLanguageCorrection = false
    req.minimumTextHeight = 0.008
    try? VNImageRequestHandler(cgImage: cg, options: [:]).perform([req])
    for obs in (req.results ?? []) {
        if let c = obs.topCandidates(1).first {
            let b = obs.boundingBox
            print("\((path as NSString).lastPathComponent)\t\(String(format: "%.2f", c.confidence))\t\(c.string)\t\(String(format: "x%.2f y%.2f w%.2f h%.2f", b.minX, 1 - b.maxY, b.width, b.height))")
        }
    }
}
