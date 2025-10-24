# Ez Exhaust 2024
Automates and tracks **5E 2024 exhaustion effects** for GMs and players in Roll20.

## 1. What does this do?
Provides automated exhaustion handling across six levels.  
- Applies the **sleepy icon** with the current exhaustion level.  
- Applies **-2 × exhaustion level** to all ability checks and saving throws.  
- **Whispers** the player controllers their current movement speed reduction.  
- Automatically sets **0 HP** and applies the **death icon** at exhaustion level 6.

## 2. What are some other features?
- Exhaustion level is **capped at 6** (any value above is clamped).  
- Reducing exhaustion from 6 cleanly **removes death effects**.  
- Exhaustion can be **fully cleared** with a command.  
- **Fuzzy search** is used for player names, allowing quick targeting.

## 3. What are all the commands?
!exh — Displays basic exhaustion info
!exh playername # — Applies exhaustion level (# = 1–6)
!exh playername clear — Clears exhaustion effects
!exh config — Displays configuration options

## 4. Is this configurable for 2014 rules?
Yes. The code is commented — a few variable changes can adapt it for **5E 2014** exhaustion rules.