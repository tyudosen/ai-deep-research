import "dotenv/config";
import { Console, Effect } from "effect";
import { Ai } from "./services/Ai";
import { runtime } from "./services/runtime";

const foo = Effect.gen(function* () {
	const { generateTextEffect } = yield* Ai;
	const { text } = yield* generateTextEffect

	yield* Console.log('text', text)

	return text

})


const main = async () => {
	runtime.runPromise(foo)
}

main()
