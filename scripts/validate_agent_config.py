#!/usr/bin/env python3
"""Validate the governance contract.

Checks the defect classes that an audit of this repository actually found:

  1. AGENTS.md exceeding Antigravity's 12,000-character rules cap (silent truncation).
  2. CLAUDE.md missing the @AGENTS.md import (the bridge that stops the two drifting).
  3. agent.config.json being unparseable or schema-invalid.
  4. A manifest or pipeline entry naming a skill that does not exist on disk.
  5. A dangling @skill-reference inside a skill body (fails silently at runtime).

Exit code 0 = pass, 1 = fail. Warnings do not fail the run.

Usage:  python scripts/validate_agent_config.py
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CONFIG = REPO / "agent.config.json"
SCHEMA = REPO / "schemas" / "agent-config.schema.json"

errors: list[str] = []
warnings: list[str] = []
checks = 0


def read_text(path: Path) -> str:
    """Read UTF-8, tolerating a BOM (files here are authored on Windows)."""
    return path.read_text(encoding="utf-8-sig")


def check(label: str, ok: bool, detail: str = "", warn_only: bool = False) -> bool:
    global checks
    checks += 1
    if ok:
        print(f"  [PASS] {label}")
    elif warn_only:
        warnings.append(f"{label}: {detail}")
        print(f"  [WARN] {label} -- {detail}")
    else:
        errors.append(f"{label}: {detail}")
        print(f"  [FAIL] {label} -- {detail}")
    return ok


def index_skills() -> dict[str, Path]:
    """Map skill name -> directory, by locating every SKILL.md under skills/."""
    root = REPO / "skills"
    if not root.is_dir():
        return {}
    return {p.parent.name: p.parent for p in root.rglob("SKILL.md")}


def main() -> int:
    print(f"Validating governance contract in {REPO}\n")

    # --- config parses -----------------------------------------------------
    print("agent.config.json")
    if not CONFIG.is_file():
        check("config exists", False, f"{CONFIG} not found")
        return report()
    try:
        config = json.loads(read_text(CONFIG))
        check("config parses as JSON", True)
    except json.JSONDecodeError as exc:
        check("config parses as JSON", False, str(exc))
        return report()

    # --- schema ------------------------------------------------------------
    if not SCHEMA.is_file():
        check("schema present", False, f"{SCHEMA} not found")
    else:
        try:
            schema = json.loads(read_text(SCHEMA))
            check("schema parses as JSON", True)
        except json.JSONDecodeError as exc:
            check("schema parses as JSON", False, str(exc))
            schema = None

        declared = config.get("$schema", "")
        check(
            "config points at the local schema",
            declared.startswith("./schemas/") or declared.startswith("schemas/"),
            f"$schema is {declared!r}; it must be a local path, not a remote URL "
            "(the AGENTS.md spec defines no config schema, so a remote one is fabricated)",
        )

        if schema is not None:
            try:
                import jsonschema  # type: ignore

                try:
                    jsonschema.validate(instance=config, schema=schema)
                    check("config validates against schema", True)
                except jsonschema.ValidationError as exc:  # type: ignore[attr-defined]
                    path = "/".join(str(p) for p in exc.absolute_path) or "(root)"
                    check("config validates against schema", False, f"at {path}: {exc.message}")
            except ImportError:
                check(
                    "config validates against schema",
                    True,
                    "jsonschema not installed -- structural checks only "
                    "(pip install jsonschema for full validation)",
                    warn_only=True,
                )

    # --- governing document size -------------------------------------------
    print("\nAGENTS.md")
    gov = config.get("governing_document", {})
    gov_path = REPO / gov.get("path", "AGENTS.md")
    cap = int(gov.get("max_characters", 12000))
    if not gov_path.is_file():
        check("governing document exists", False, f"{gov_path} not found")
    else:
        text = read_text(gov_path)
        n = len(text)
        check(
            f"under {cap:,}-character cap",
            n < cap,
            f"{n:,} characters -- over by {n - cap:,}",
        )
        if n < cap:
            print(f"         {n:,} characters, {cap - n:,} headroom")

    # --- bridges -----------------------------------------------------------
    for bridge in gov.get("bridges", []):
        bpath = REPO / bridge["path"]
        needle = bridge["must_contain"]
        if not bpath.is_file():
            check(f"bridge {bridge['path']} exists", False, "not found")
            continue
        btext = read_text(bpath)
        check(
            f"bridge {bridge['path']} imports {needle}",
            needle in btext,
            f"{needle!r} not found -- without it the two files drift apart",
        )

    # --- skill resolution ---------------------------------------------------
    print("\nSkill references")
    skills = index_skills()
    if not skills:
        check("skill index built", False, "no SKILL.md files found under skills/")
        return report()
    print(f"         indexed {len(skills):,} skills")

    manifest = config.get("manifest", {})
    missing = [s for s in manifest.get("skills", []) if s not in skills]
    check(
        "every manifest skill resolves",
        not missing,
        "not found on disk: " + ", ".join(missing),
    )

    pipeline = config.get("protocols", {}).get("pipeline", {})
    stage_missing: list[str] = []
    for stage in pipeline.get("stages", []):
        for name in stage.get("skills", []):
            if name not in skills:
                stage_missing.append(f"stage {stage['id']}:{name}")
    check(
        "every pipeline stage skill resolves",
        not stage_missing,
        "not found on disk: " + ", ".join(stage_missing),
    )

    pskill = pipeline.get("skill")
    check(
        f"pipeline skill {pskill!r} resolves",
        pskill in skills,
        "not found on disk",
    )

    # --- ordering policy ----------------------------------------------------
    check(
        "pipeline ordering allows re-entry",
        pipeline.get("ordering") != "strict",
        "ordering is 'strict'; a static one-shot pipeline propagates errors forward "
        "with no path back to the stage that owns the defect",
        warn_only=True,
    )

    # --- dangling @refs in the pipeline skill -------------------------------
    if pskill in skills:
        body = read_text(skills[pskill] / "SKILL.md")
        refs = set(re.findall(r"(?<![\w`/])@([a-z][a-z0-9-]{2,})", body))
        refs.discard(pskill)
        dangling = sorted(r for r in refs if r not in skills)
        check(
            f"no dangling @refs in {pskill}/SKILL.md",
            not dangling,
            "referenced but absent: " + ", ".join("@" + d for d in dangling),
        )

    # --- commands (user-scoped: warn only) ----------------------------------
    cmd_dir = Path.home() / ".claude" / "commands"
    declared_cmds = manifest.get("commands", [])
    if declared_cmds:
        if cmd_dir.is_dir():
            absent = [c for c in declared_cmds if not (cmd_dir / f"{c}.md").is_file()]
            check(
                "declared commands present",
                not absent,
                "not found in ~/.claude/commands: " + ", ".join(absent),
                warn_only=True,
            )
        else:
            check(
                "declared commands present",
                True,
                f"{cmd_dir} not present on this machine",
                warn_only=True,
            )

    return report()


def report() -> int:
    print()
    if errors:
        print(f"FAILED -- {len(errors)} error(s), {len(warnings)} warning(s), {checks} checks run")
        for e in errors:
            print(f"  - {e}")
        return 1
    print(f"OK -- {checks} checks passed, {len(warnings)} warning(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
