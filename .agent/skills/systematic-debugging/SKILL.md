---
name: systematic-debugging
description: A rigorous methodology for identifying and fixing bugs without guesswork. Enforces a 4-phase investigation and testing process.
---

# Systematic Debugging

## Trigger
Use this skill when the user asks you to fix a bug, investigate an error, or when you encounter unexpected behavior during development.

## The Iron Law
**NEVER GUESS. NEVER IMPLEMENT A FIX WITHOUT VERIFYING THE ROOT CAUSE FIRST.**

## The Four Phases of Systematic Debugging

### Phase 1: Root Cause Investigation
1. Gather all logs, error messages, and stack traces.
2. Formulate a hypothesis about *why* the bug is occurring.
3. Add `console.log`, temporary asserts, or use a debugger to confirm the exact state causing the issue.
4. **DO NOT write the fix yet.**

### Phase 2: Hypothesis and Testing
1. Propose the minimal change required to fix the root cause.
2. Explain to the user why this specific change addresses the verified root cause.

### Phase 3: Implementation
1. Write the code for the fix.
2. Ensure no unintended side effects are introduced (check adjacent logic).

### Phase 4: Verification
1. Run the code or write a test to prove the bug is gone.
2. Clean up any debugging statements (`console.log`) added in Phase 1.

## Red Flags - STOP and Follow Process
- If you find yourself saying "This might fix it" -> STOP. Go back to Phase 1.
- If you run the fix and a new, unrelated error appears -> STOP. Re-evaluate the hypothesis.
