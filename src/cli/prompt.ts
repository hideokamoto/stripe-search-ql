import { createInterface } from "node:readline";

/**
 * Prompt the user for Y/N confirmation.
 * Returns true if the user answers 'y' or 'yes' (case-insensitive).
 */
export async function confirm(message: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().startsWith("y"));
    });
  });
}
