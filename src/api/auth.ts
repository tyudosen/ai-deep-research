import { HttpApiEndpoint, HttpApiGroup, HttpServerResponse } from "@effect/platform";
import { Schema } from "effect";


export class AuthApiGroup extends HttpApiGroup.make("AuthApiGroup")
	.add(
		HttpApiEndpoint
			.get("login", '/login')
			.addSuccess(Schema.Any)
	)
	.add(
		HttpApiEndpoint
			.get("callback", '/callback')
			.setUrlParams(Schema.Struct({
				code: Schema.String
			}))
			.addSuccess(Schema.Any)
	)
{ }

