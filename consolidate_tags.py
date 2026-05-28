#!/usr/bin/env python3
"""Consolidate topic_tags into a clean set of ~10 canonical categories."""

import json
from collections import Counter

# Maps original (messy) tags → canonical tag. None = drop entirely.
# Tags not in this map get used as-is (so canonical raw tags keep going through too).
TAG_MAP = {
    # ── Job Displacement ───────────────────────────────────
    "job displacement":     "job-displacement",
    "displacement":          "job-displacement",
    "unemployment":          "job-displacement",
    "post-work":             "job-displacement",

    # ── Job Transformation ─────────────────────────────────
    "job transformation":   "job-transformation",
    "task transformation":   "job-transformation",
    "job complementarity":   "job-transformation",
    "back-office work":      "job-transformation",
    "white-collar work":     "job-transformation",
    "us labor market":       "job-transformation",

    # ── Automation & AI Exposure ────────────────────────────
    "automation":            "automation-ai-exposure",
    "automation-risk":       "automation-ai-exposure",
    "automation exposure":   "automation-ai-exposure",
    "task exposure":         "automation-ai-exposure",

    # ── Productivity & Augmentation ─────────────────────────
    "productivity":           "productivity-augmentation",
    "augmentation":           "productivity-augmentation",
    "human augmentation":     "productivity-augmentation",

    # ── Labor Market Shifts (net employment, wages, inequality) ──
    "job creation":           "job-creation",
    "job-creation":           "job-creation",
    "wages":                  "labor-market-shifts",
    "inequality":             "labor-market-shifts",
    "sectoral-shift":          "labor-market-shifts",
    "global":                  "labor-market-shifts",
    "labor-market":           "labor-market-shifts",

    # ── Skills & Retraining ─────────────────────────────────
    "skills":                 "skills-retraining",
    "skills-gap":             "skills-retraining",
    "upskilling":             "skills-retraining",
    "education / retraining": "skills-retraining",
    "workforce-transformation": "skills-retraining",

    # ── AI Adoption ─────────────────────────────────────────
    "AI adoption":            "ai-adoption",
    "ai-adoption":            "ai-adoption",
    "tech-adoption":          "ai-adoption",
    "business adoption":     "ai-adoption",

    # ── Future of Work & Policy ─────────────────────────────
    "regulation / policy":    "future-work-policy",
    "policy":                 "future-work-policy",
    "decision-making":        "future-work-policy",
    "job quality":            "future-work-policy",
    "historical comparison": "future-work-policy",
    "universal income":       "future-work-policy",
    "future of work":         "future-work-policy",
    "future-of-jobs":         "future-work-policy",

    # ── AGI / Superintelligence ─────────────────────────────
    "AGI / superintelligence implications": "agi-superintelligence",

    # ── Drops (meta/source tags, not topics) ─────────────────
    "wef":                    None,
    "imf":                    None,
    "bls":                    None,
    "2026":                   None,
    "2030":                   None,
    "2023-33":                None,
    "employer-survey":        None,
    "hr-leaders":             None,
    "job-market":             None,
    "ai-jobs":                None,
    "ai-adoption":            "ai-adoption",   # ensure canonical
    "generative-ai":          "automation-ai-exposure",
    "employment-projections": "future-work-policy",
    "occupational-analysis": "future-work-policy",
}

# Keep these raw tags as canonical (they're already clean)
ALLOWED = {
    "job-displacement",
    "job-transformation",
    "automation-ai-exposure",
    "productivity-augmentation",
    "job-creation",
    "labor-market-shifts",
    "skills-retraining",
    "ai-adoption",
    "future-work-policy",
    "global-labor-market",
    "agi-superintelligence",
}

def remap(tags):
    result = []
    for t in tags:
        mapped = TAG_MAP.get(t, t)  # not in map → keep as-is
        if mapped is None:
            continue                # drop meta tags
        if mapped not in result:
            result.append(mapped)
    return result

with open("predictions.json") as f:
    data = json.load(f)

changes = []
for pred in data:
    old = pred.get("topic_tags", [])
    new = remap(old)
    if old != new:
        changes.append((pred["id"], old, new))
    pred["topic_tags"] = new

print(f"Updated {len(changes)} predictions:\n")
for cid, old, new in changes:
    print(f"  {cid}")
    print(f"    before: {old}")
    print(f"    after:  {new}")
    print()

# Rewrite as canonical tag, not raw
SYNONYM_MAP_INVERSE = {v: v for v in ALLOWED}  # canonical → canonical (no-op)
def canonical_tag(tag):
    """Return the canonical key for a tag, or the tag itself if already canonical."""
    return TAG_MAP.get(tag, tag)  # if not remapped, return original

with open("predictions.json", "w") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

all_tags = Counter()
for pred in data:
    for t in pred["topic_tags"]:
        all_tags[t] += 1

print("\nFinal canonical topic tag counts:")
for tag, count in sorted(all_tags.items(), key=lambda x: -x[1]):
    print(f"  {count:4d}  {tag}")

dropped = [k for k, v in TAG_MAP.items() if v is None and k not in ALLOWED]
print(f"\nDropped meta-tags: {dropped}")
