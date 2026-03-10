---
name: code-review-excellence
description: Advanced code review methodology for evaluating pull requests or new code. Focuses on architecture, security, performance, and maintainability.
---

# Code Review Excellence

## Trigger
Use this skill when the user asks you to "review this code", "check for issues", or when evaluating a significant refactor.

## Review Process

### Phase 1: Context Gathering (2-3 minutes)
Understand *why* the code was written. What problem does it solve? If it's a bug fix, did it fix the root cause?

### Phase 2: High-Level Review (Architecture & Design)
- Does the code belong in this file/component?
- Are there duplicate patterns that should be abstracted?
- Is state managed at the correct level? (e.g., Zustand vs React local state).

### Phase 3: Line-by-Line Review
Look for:
- **Performance**: Unnecessary re-renders, missing `useMemo`/`useCallback` (only where actually needed), unoptimized loops.
- **Security**: Unsanitized inputs, exposed secrets, unchecked user permissions.
- **Readability**: Are variable names descriptive? Are magic numbers extracted to constants?
- **Edge Cases**: What happens if an array is empty? If an API fails?

### Phase 4: Feedback Delivery
Use the **Question Approach**: Instead of saying "Change X to Y", say "Have you considered using Y here to improve performance?"

## Review Checklist
- [] No console.logs or commented-out code.
- [] Types are strictly defined (no `any`).
- [] Complex logic has comments explaining *why*, not just *what*.
