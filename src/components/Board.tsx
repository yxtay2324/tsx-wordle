import { useEffect, useState } from "react";
import wordListTxt from "/words.txt";
import ResetButton from "./ResetButton";
import InvalidWordError from "./InvalidWordError";

const MAX_LENGTH = 6;
const MAX_ATTEMPTS = 6;
const KEYBOARD_LETTERS = new Map([
  ["Q", "unguessed"],
  ["W", "unguessed"],
  ["E", "unguessed"],
  ["R", "unguessed"],
  ["T", "unguessed"],
  ["Y", "unguessed"],
  ["U", "unguessed"],
  ["I", "unguessed"],
  ["O", "unguessed"],
  ["P", "unguessed"],
  ["A", "unguessed"],
  ["S", "unguessed"],
  ["D", "unguessed"],
  ["F", "unguessed"],
  ["G", "unguessed"],
  ["H", "unguessed"],
  ["J", "unguessed"],
  ["K", "unguessed"],
  ["L", "unguessed"],
  ["Z", "unguessed"],
  ["X", "unguessed"],
  ["C", "unguessed"],
  ["V", "unguessed"],
  ["B", "unguessed"],
  ["N", "unguessed"],
  ["M", "unguessed"],
]);

function Board() {
  const [attempts, setAttempts] = useState(Array(MAX_ATTEMPTS).fill(""));
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [gameStart, setGameStart] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");
  const [targetWord, setTargetWord] = useState<string>("");
  const [allWords, setAllWords] = useState(Array);
  const [invalidWord, setInvalidWord] = useState(false);
  const [keyboard, setKeyboard] = useState(KEYBOARD_LETTERS);
  const [attemptValidation, setAttemptValidation] = useState(
    Array.from(Array(MAX_LENGTH), () => new Array(MAX_LENGTH))
  );

  useEffect(() => {
    if (gameOver || !gameStart) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      const keyPress = event["key"];

      if (
        keyPress.toUpperCase() === "ENTER" &&
        attempts[currentAttempt].length === MAX_LENGTH
      ) {
        if (allWords.includes(attempts[currentAttempt])) {
          validateAttempt(attempts[currentAttempt]);
          if (attempts[currentAttempt] === targetWord) {
            setCurrentAttempt((previousAttempt) => previousAttempt + 1);
            setGameOver(true);
            setGameOverMessage("Congratulations, you guess the word!");
          } else if (currentAttempt < MAX_ATTEMPTS - 1) {
            setCurrentAttempt((previousAttempt) => previousAttempt + 1);
          } else {
            setCurrentAttempt((previousAttempt) => previousAttempt + 1);
            setGameOver(true);
            setGameOverMessage("Oh no! The word is " + targetWord);
          }
        } else {
          handleInvalidWord();
        }
      } else if (keyPress.toUpperCase() === "BACKSPACE") {
        setAttempts((previousAttemps) => {
          const newAttempts = [...previousAttemps];
          newAttempts[currentAttempt] = newAttempts[currentAttempt].slice(
            0,
            -1
          );
          return newAttempts;
        });
      } else if (
        /^[A-Z]$/.test(keyPress.toUpperCase()) &&
        attempts[currentAttempt].length < MAX_LENGTH
      ) {
        setAttempts((previousAttempts) => {
          const newAttempts = [...previousAttempts];
          newAttempts[currentAttempt] += keyPress;
          return newAttempts;
        });
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  });

  const startGame = () => {
    retrieveRandomWord();
    retrieveAllWords();
    setGameStart(true);
  };

  function handleInvalidWord() {
    setInvalidWord(true);
    setTimeout(() => {
      setInvalidWord(false);
    }, 3000);
  }

  function validateAttempt(attempt: string) {
    const newAttemptValidation = [...attemptValidation];

    const targetWordIndexMap = new Map<string, number[]>();
    Array.from(targetWord).map((letter, index) => {
      const existingMap = targetWordIndexMap.get(letter);
      if (existingMap !== undefined) {
        existingMap.push(index);
      } else {
        targetWordIndexMap.set(letter, [index]);
      }
    });

    const attemptIndexMap = new Map<string, number[]>();
    Array.from(attempt).map((letter, index) => {
      const existingMap = attemptIndexMap.get(letter);
      if (existingMap !== undefined) {
        existingMap.push(index);
        attemptIndexMap.set(letter, existingMap);
      } else {
        attemptIndexMap.set(letter, [index]);
      }
    });

    const newKeyboard = new Map(keyboard);

    attemptIndexMap.forEach((indexArr, mapKey) => {
      const targetIndexArr = targetWordIndexMap.get(mapKey);
      if (targetIndexArr === undefined) {
        newKeyboard.set(mapKey.toUpperCase(), "missing");
      } else if (
        targetIndexArr!.every((item) => {
          return indexArr.includes(item);
        }) === true
      ) {
        indexArr.forEach((index) => {
          if (targetIndexArr?.includes(index)) {
            newAttemptValidation[currentAttempt][index] = "correct";
            newKeyboard.set(attempt[index].toUpperCase(), "correct");
          } else {
            newAttemptValidation[currentAttempt][index] = "missing";
            if (newKeyboard.get(attempt[index].toUpperCase()) !== "correct") {
              newKeyboard.set(attempt[index].toUpperCase(), "missing");
            }
          }
        });
      } else {
        indexArr.forEach((index) => {
          if (newKeyboard.get(attempt[index].toUpperCase()) !== "correct") {
            newKeyboard.set(attempt[index].toUpperCase(), "present");
          }
          newAttemptValidation[currentAttempt][index] = "present";
        });
      }
    });

    setAttemptValidation(newAttemptValidation);
    setKeyboard(newKeyboard);
  }

  const renderRow = (attempt: string, attemptIndex: number) => {
    return (
      <div key={attemptIndex} className="row">
        {Array.from({ length: MAX_LENGTH }).map((_, letterIndex) =>
          renderCell(
            attempt[letterIndex],
            letterIndex,
            attemptIndex,
            attemptValidation[attemptIndex][letterIndex]
          )
        )}
      </div>
    );
  };

  const renderCell = (
    letter: string,
    index: number,
    attemptIndex: number,
    validation: string
  ) => {
    let className = "cell";
    // const newKeyboard = { ...keyboard };

    if (currentAttempt > attemptIndex) {
      if (validation === "correct") {
        className += " correct";
      } else if (validation === "present") {
        className += " present";
      } else {
        className += " missing";
      }
    }

    return (
      <div key={index} className={className}>
        {letter}
      </div>
    );
  };

  const renderCellColour = (letter: string, letterStatus: string) => {
    let className = "cell";

    if (letterStatus === "correct") {
      className += " correct";
    } else if (letterStatus === "present") {
      className += " present";
    } else if (letterStatus === "missing") {
      className += " missing";
    } else {
      className += " unguessed";
    }

    return <div className={className}>{letter}</div>;
  };

  const retrieveRandomWord = () => {
    fetch(wordListTxt)
      .then((response) => response.text())
      .then((text) => {
        const lines = text.split("\r\n");
        let wordIndex = Math.floor(Math.random() * lines.length);
        setTargetWord(lines[wordIndex]);
      });
  };

  function retrieveAllWords() {
    fetch(wordListTxt)
      .then((response) => response.text())
      .then((text) => {
        setAllWords(text.split("\r\n"));
      });
  }

  const resetBoard = () => {
    setAttempts(Array(MAX_LENGTH).fill(""));
    setCurrentAttempt(0);
    setGameOver(false);
    setGameOverMessage("");
    retrieveRandomWord();
    setKeyboard(KEYBOARD_LETTERS);
    setAttemptValidation(
      Array.from(Array(MAX_LENGTH), () => new Array(MAX_LENGTH))
    );
  };

  return (
    <>
      <div className="board">
        <h1>TSX-WORDLE</h1>
        {!gameStart ? (
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={startGame}
          >
            Start Game
          </button>
        ) : (
          attempts.map((attempt, attemptIndex) =>
            renderRow(attempt, attemptIndex)
          )
        )}
        {invalidWord && <InvalidWordError />}
        {gameStart && (
          <>
            <div className="keyboard">
              <div className="row">
                {Array.from(keyboard)
                  .slice(0, 10)
                  .map(([letterKey, letterStatus]) =>
                    renderCellColour(letterKey, letterStatus)
                  )}
              </div>
              <div className="row">
                {Array.from(keyboard)
                  .slice(10, 19)
                  .map(([letterKey, letterStatus]) =>
                    renderCellColour(letterKey, letterStatus)
                  )}
              </div>
              <div className="row">
                {Array.from(keyboard)
                  .slice(19, 26)
                  .map(([letterKey, letterStatus]) =>
                    renderCellColour(letterKey, letterStatus)
                  )}
              </div>
            </div>
            <div>
              <ResetButton onClick={resetBoard} />
            </div>
          </>
        )}
      </div>
      {gameOver && <h2>{gameOverMessage}</h2>}
    </>
  );
}

export default Board;
