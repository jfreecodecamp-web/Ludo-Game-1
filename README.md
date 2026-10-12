# Ludo — Football Edition

**JavaScript · HTML5 Canvas · CSS · Browser game prototype**

A football-themed Ludo prototype built with vanilla JavaScript and HTML5 Canvas. Choose a colour, roll two dice, and race four tokens home in a local four-player match or against computer opponents.

[Browse source](https://github.com/jfreecodecamp-web/Ludo-Game-1/blob/main/index.html) · [Developer profile](https://github.com/jfreecodecamp-web)

## Preview

![Ludo — Football Edition — game interface](https://github.com/user-attachments/assets/2f47427b-9382-42c7-99fd-40f47f8a9727)

![Ludo — Football Edition — setup and gameplay](https://github.com/user-attachments/assets/516c7fc1-e289-45bc-b5d9-5e542f45399c)

![Ludo — Football Edition — board view](https://github.com/user-attachments/assets/cac8098a-9172-445a-bece-ff45a4f953d6)

## Features

- Four colours and a football-themed board with player tokens.
- Local four-player mode and a human-versus-computer mode.
- Two dice with individual die selection and used-die indicators.
- Token entry on six, captures, barriers, bonus rolls, and home detection.
- Three computer difficulty settings with move heuristics.
- Turn indicators and browser speech feedback for game events.

## Run locally

No package installation or build step is required.

```bash
git clone https://github.com/jfreecodecamp-web/Ludo-Game-1.git
cd Ludo-Game-1
```

Open `index.html` in a current desktop browser. For a local HTTP server, run `python -m http.server 8000` from the project directory and visit **http://localhost:8000**. Python is only needed for the optional local server.

## How to play

1. Choose your colour for a computer match, then select a difficulty; alternatively choose **Play Local Multiplayer (4 Players)**.
2. Click **Roll Dice**, select an unused die, then click a token that can legally move.
3. Roll a six to bring a token onto the board. Captures and barriers affect movement.
4. Bring all four of your tokens home to win.

## Implementation highlights

| Area | Implementation |
| --- | --- |
| Board model | Colour-specific paths translate token progress into board coordinates. |
| Move validation | Checks token entry, path barriers, die use, and exact home movement. |
| Computer opponents | Scores legal moves using progress, captures, token entry, and grouping. |
| Feedback | Canvas animation, turn labels, selectable tokens, and speech synthesis. |

## Repository guide

| File | Purpose |
| --- | --- |
| `index.html` | Active application, including inline styles and JavaScript. |
| `script.js` / `style.css` | Additional source files; the current entry page does not load these files. |
| `071950_dice-rolling-88974.mp3` | Audio asset included in the repository. |

## Project status

This is a local browser prototype with in-memory match state. The implemented rules are a custom two-dice variant rather than a universal Ludo ruleset.

## Planned improvements

- Consolidate the active implementation into dedicated JavaScript and CSS files.
- Add touch and keyboard support.
- Add repeatable tests for captures, barriers, bonus turns, and home entry.

## Author

**Javel Swaby** · [GitHub](https://github.com/jfreecodecamp-web)

Part of a portfolio exploring interactive interfaces, state management, and rule-based JavaScript applications.
