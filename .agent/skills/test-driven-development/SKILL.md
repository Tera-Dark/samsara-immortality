---
name: test-driven-development
description: Enforces the Red-Green-Refactor cycle for writing robust code. Use when adding complex core logic or requested by the user.
---

# Test-Driven Development (TDD)

## Trigger
Use this skill when implementing core engine logic, complex algorithms, or when the user explicitly requests TDD.

## The Iron Law
**You may not write production code unless you first have a failing automated test.**

## The Cycle: Red-Green-Refactor

### 🔴 RED: Write a Failing Test
1. Write a test for the specific behavior you want to implement.
2. Run the test and verify that it FAILS. (If it passes, either the feature already exists, or the test is broken).

### 🟢 GREEN: Make It Pass
1. Write the **absolute minimum** amount of production code required to make the test pass.
2. Do not worry about elegance or architecture at this exact moment. Just make the test turn green.

### 🟡 REFACTOR: Clean It Up
1. Now that the test is green, refactor the code to meet quality standards (extract functions, rename variables, remove duplication).
2. The tests provide a safety net ensuring your refactoring didn't break the logic.

## Best Practices
- **Test Behavior, Not Implementation**: Tests should not break if you refactor internal variables.
- One assertion per test concept.
- Setup -> Execute -> Assert (Given/When/Then).
