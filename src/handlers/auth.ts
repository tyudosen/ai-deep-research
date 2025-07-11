import { HttpApiBuilder, HttpServerResponse } from "@effect/platform";
import { env } from "../env.js";
import { Effect, pipe } from "effect";
import { Api } from "../api/index.js";
import { Auth } from "../services/Auth.js";



export const AuthApiGroupLive = HttpApiBuilder.group(Api,
	'AuthApiGroup',
	(handlers) => Effect.gen(function* () {
		const { workos, authenticateWithCode } = yield* Auth;

		return handlers.handle(
			"login",
			() => {
				const authorizationUrl = workos.userManagement.getAuthorizationUrl({
					// Specify that we'd like AuthKit to handle the authentication flow
					provider: 'authkit',

					// The callback endpoint that WorkOS will redirect to after a user authenticates
					redirectUri: 'http://localhost:3007/callback',
					clientId: env.WORKOS_CLIENT_ID,
				});

				// Redirect the user to the AuthKit sign-in page
				return HttpServerResponse.redirect(authorizationUrl)
			}

		)
			.handle(
				"callback",
				({ urlParams }) => {
					// The authorization code returned by AuthKit
					const { code } = urlParams

					if (!code) {
						HttpServerResponse.setStatus(400);
						return HttpServerResponse.text('No code provided');
					}

					pipe(
						code,
						authenticateWithCode,
						Effect.tap(({ user }) => { Effect.log(`Fetched User: ${user}`); console.log(`Fetched user ---: ${user}`) })

					)


					return HttpServerResponse.redirect('/docs')
				}
			)

	}))
