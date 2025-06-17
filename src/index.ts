import "dotenv/config";
import { Effect } from "effect";
import { runtime } from "./services/runtime";
import { WebSearch } from "./services/WebSearch";

const foo = Effect.gen(function* () {
	const { searchWeb } = yield* WebSearch;
	const res = yield* searchWeb('When is the next season of Mobland ?')

	yield* Effect.log(res)

	return res

})


const main = async () => {
	runtime.runPromise(foo)
}

main()
